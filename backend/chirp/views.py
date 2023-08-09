from django.utils import timezone
from django.contrib.auth import authenticate, login, logout

from django.middleware.csrf import (
    get_token
)
from django.db import transaction
from django.utils.decorators import method_decorator
from chirp.paginations import MessagePagination
from chirp.signers import generate_token
from chirp.response import channel_creation_failure, get_channels_failure
from chirp.models import (
    User,
    Channel,
    Conversation,
    Message,
)
from chirp.response import (
    user_already_signup_failure,
    email_already_signup_failure,
    user_registration_failure,
    get_users_failure,
    channel_already_exist_failure,
    channel_creation_failure,
    http_success_response,
    login_failure,
    conversation_creation_failure,
    get_conversations_failure,
    get_channels_failure,
    get_messages_failure,
    unauthorized_failure,
    messages_mark_as_read_failure,
    get_posts_failure,
)
from chirp.serializers import (
    PublicUserSerializer,
    UserRequestSerializer,
    LoginRequestSerializer,
    PublicChannelSerializer,
    CreateConversationRequestSerializer,
    PublicConversationSerializer,
    CreateChannelSerializer,
    PublicMessageSerializer,
    PublicPostSerializer,
)
from rest_framework.exceptions import (
    ValidationError,
)
from rest_framework.views import APIView
from rest_framework import permissions
from django.views.decorators.csrf import ensure_csrf_cookie, csrf_protect


@method_decorator(csrf_protect, name='dispatch')
class LoginView(APIView):
    permission_classes = (permissions.AllowAny, )

    def post(self, request):
        serializer = LoginRequestSerializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
            user = authenticate(
                username=serializer.validated_data.get('username'),
                password=serializer.validated_data.get('password')
            )
            if user is None:
                return login_failure()

            login(request, user)

            return http_success_response({
                'user': PublicUserSerializer(user).data,
            })
        except:
            return login_failure()


@method_decorator(csrf_protect, name='dispatch')
class SignupView(APIView):
    permission_classes = (permissions.AllowAny, )

    def post(self, request):
        serializer = UserRequestSerializer(data=request.data)
        try:
            try:
                serializer.is_valid(raise_exception=True)
            except ValidationError as e:
                if 'username' in e.detail:
                    return user_already_signup_failure(info=e.detail)
                if 'email' in e.detail:
                    return email_already_signup_failure(info=e.detail)

            user = serializer.save()

            general_channel = Channel.get_channel_by_name("General")
            general_channel.users.add(user)

            user.refresh_from_db()

            login(request, user)

            return http_success_response({
                'user': PublicUserSerializer(user).data,
            })
        except Exception as e:
            print(e)
            return user_registration_failure(info=str(e))


class LogoutView(APIView):
    def post(self, request):
        logout(request)
        return http_success_response()


@method_decorator(ensure_csrf_cookie, name='dispatch')
class GetCSRFToken(APIView):
    permission_classes = (permissions.AllowAny, )

    def get(self, request):
        return http_success_response({
            'csrf_token': get_token(request)
        })


class GetAuthToken(APIView):

    def get(self, request):
        return http_success_response({
            'auth_token': generate_token(request.user)
        })


class UsersView(APIView):
    def get(self, request):
        try:
            if request.user.is_superuser:
                users = User.get_all_users()
            else:
                users = User.get_users_by_same_email_domain(request.user.id)

            is_new_conversation = request.query_params.get(
                'is_new_conversation')
            if is_new_conversation is not None and bool(is_new_conversation):
                conversations = Conversation.get_conversations_by_user_id(
                    request.user.id)
                users = users.exclude(conversation__in=conversations)

            users_data = PublicUserSerializer(users, many=True).data

            return http_success_response({
                'users': users_data
            })
        except Exception as e:
            return get_users_failure(info=str(e))


class ConversationView(APIView):
    def post(self, request):
        try:
            serializer = CreateConversationRequestSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)

            receiver_id = serializer.validated_data.get('receiver_id')
            receiver = User.get_user_by_id(receiver_id)
            me_user = User.get_user_by_id(request.user.id)

            with transaction.atomic():
                conversation = Conversation.objects.create()
                conversation.users.add(me_user, receiver)

            context = {'request': request}
            conversation_data = PublicConversationSerializer(
                instance=conversation, context=context).data

            transaction.commit()

            return http_success_response({
                'conversation': conversation_data
            })
        except (ValidationError, User.DoesNotExist) as e:
            return conversation_creation_failure(info=str(e))


class ConversationsView(APIView):
    def get(self, request):
        try:
            if request.user.is_superuser:
                conversations = Conversation.get_all_conversations()
            else:
                conversations = Conversation.get_conversations_by_user_id(
                    request.user.id)

            context = {'request': request}
            conversations_data = PublicConversationSerializer(
                instance=conversations, context=context, many=True).data

            return http_success_response({
                'conversations': conversations_data
            })
        except Exception as e:
            return get_conversations_failure(info=str(e))


class MessagesView(APIView):
    pagination_class = MessagePagination()

    def get(self, request, conversation_id):
        try:
            conversation = Conversation.get_conversation_by_id(conversation_id)
            if not conversation.users.filter(id=request.user.id).exists():
                return unauthorized_failure()

            queryset = Message.objects.all().filter(
                conversation__id=conversation_id).order_by('-created_at')

            # Filter messages by search_term if provided
            search_term = request.GET.get('search_term', None)
            if search_term is not None:
                queryset = queryset.filter(content__icontains=search_term)

            # Return requested message and messages that come before it in the chatroom based on message_id if provided
            message_id = request.GET.get('message_id', None)
            if message_id is not None:
                requested_message = queryset.filter(id=message_id).first()
                if requested_message is not None:
                    queryset = queryset.filter(
                        created_at__gte=requested_message.created_at)

            page = self.pagination_class.paginate_queryset(queryset, request)
            if page is not None:
                messages_serializer = PublicMessageSerializer(page, many=True)
                paginated_data = self.pagination_class.get_paginated_response(
                    messages_serializer.data)
                response_data = {'messages': paginated_data.data}
            else:
                messages_serializer = PublicMessageSerializer(
                    queryset, many=True)
                response_data = {'messages': messages_serializer.data}

            return http_success_response(response_data)
        except Exception as e:
            return get_messages_failure(info=str(e))


class MessagesMarkAsReadView(APIView):
    def post(self, request, conversation_id):
        try:
            with transaction.atomic():
                messages = Message.objects.filter(
                    conversation_id=conversation_id, read_at=None)
                messages = messages.exclude(sender_id=request.user.id)
                messages.update(read_at=timezone.now())

            transaction.commit()

            return http_success_response()
        except (ValidationError, User.DoesNotExist) as e:
            return messages_mark_as_read_failure(info=str(e))


class ChannelView(APIView):
    permission_classes = (permissions.AllowAny, )

    def get(self, request, channel_id):
        try:
            context = {'request': request}
            channel = Channel.objects.get(id=channel_id)
            channel_data = PublicChannelSerializer(
                instance=channel, context=context).data
            return http_success_response({
                'channel': channel_data,
            })
        
        except Exception as e:
            return get_channels_failure(info=str(e))

    def post(self, request):
        try:
            serializer = CreateChannelSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)

            type = serializer.validated_data.get('type')
            if type == 'public' and Channel.check_if_channel_existed(serializer.validated_data.get('name')):
                return channel_already_exist_failure()

            me_user = User.get_user_by_id(request.user.id)

            with transaction.atomic():
                name = serializer.validated_data.get('name')
                description = serializer.validated_data.get('description')
                new_channel = Channel.objects.create(
                    name=name, type=type, description=description, owner=me_user)
                new_channel.users.add(me_user)
                members_id = serializer.validated_data.get('members_id')
                for id in members_id:
                    member_user = User.get_user_by_id(id)
                    new_channel.users.add(member_user)

            context = {'request': request}
            channel_data = PublicChannelSerializer(
                instance=new_channel, context=context).data

            transaction.commit()

            return http_success_response({
                'channel': channel_data,
            })
        except Exception as e:
            return channel_creation_failure(info=str(e))


class JoinChannelView(APIView):
    def post(self, request, channel_id):
        try:
            context = {'request': request}
            channel = Channel.objects.get(id=channel_id)
            me_user = User.get_user_by_id(request.user.id)
            channel.users.add(me_user)
            channel_data = PublicChannelSerializer(
                instance=channel, context=context).data

            return http_success_response({
                'channel': channel_data,
            })

        except Exception as e:
            return get_channels_failure(info=str(e))


class LeaveChannelView(APIView):
    def post(self, request, channel_id):
        try:
            channel = Channel.objects.get(id=channel_id)
            me_user = User.get_user_by_id(request.user.id)
            channel.users.remove(me_user)
            if channel.users.count() == 0:
                channel.delete()
            return http_success_response()

        except Exception as e:
            return get_channels_failure(info=str(e))


class ChannelsView(APIView):
    def get(self, request):
        try:
            channels = Channel.get_channels_by_user_id(request.user.id)
            context = {'request': request}
            channel_data = PublicChannelSerializer(
                instance=channels, context=context, many=True).data
            return http_success_response({
                'channels': channel_data,
            })
        except Exception as e:
            return get_channels_failure(info=str(e))


class PublicChannelsView(APIView):
    def get(self, request):
        try:
            context = {'request': request}
            channels = Channel.get_all_public_channels().exclude(users__id=request.user.id)

            search_term = request.query_params.get('search_term')
            if search_term is not None:
                channels = channels.filter(name__icontains=search_term)
                channel_data = PublicChannelSerializer(
                    instance=channels, context=context, many=True).data

            return http_success_response({
                'channels': channel_data,
            })

        except Exception as e:
            return get_channels_failure(info=str(e))


class PostView(APIView):
    def get(self, request, channel_id):
        try:
            channel = Channel.objects.get(id=channel_id)
            posts = channel.post_set.all().order_by('created_at')
            post_data = PublicPostSerializer(instance=posts, many=True).data
            return http_success_response({
                'posts': post_data,
            })

        except Channel.DoesNotExist:
            return get_posts_failure(info=f'Channel with id {channel_id} does not exist')
        except Exception as e:
            return get_posts_failure(info=str(e))
