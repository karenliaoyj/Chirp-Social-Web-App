import json
from django.utils import timezone
from chirp.models import User
from chirp.serializers import (
    MessageActions,
    MessageRequestSerializer,
    MessageBaseRequestSerializer,
    MessageReadRequestSerializer,
    PublicPostSerializer,
    PostRequestSerializer,
    PostActions
)
from chirp.models import Message, Conversation, Channel, Post, Comment
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async


class ConversationConsumer(AsyncWebsocketConsumer):

    user = None

    async def connect(self):
        self.conversation_id = self.scope['url_route']['kwargs']['conversation_id']

        if not self.scope['user']:
            await self.send_error(f'You must be logged in')
            await self.close()
            return

        self.user = self.scope['user']

        if not self.user.email.endswith("@andrew.cmu.edu"):
            await self.send_error(f'You must be logged with Andrew identity')
            await self.close()
            return

        self.group_id = f'conversation_{self.conversation_id}'
        self.channel_id = f'conversation_{self.conversation_id}_user_{self.user.id}'
        try:
            conversation = await database_sync_to_async(Conversation.get_conversation_by_id)(self.conversation_id)
            if not await database_sync_to_async(conversation.users.filter(id=self.user.id).exists)():
                await self.send_error(f'Unexpected conversation not found')
                await self.close()
                return
        except:
            await self.send_error(f'Unexpected conversation not found')
            await self.close()
            return

        await self.channel_layer.group_add(
            self.group_id,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.group_id,
            self.channel_name
        )

    async def receive(self, text_data):
        serializer = MessageBaseRequestSerializer(data=json.loads(text_data))
        serializer.is_valid(raise_exception=True)

        action = serializer.validated_data.get('action', '').lower()
        if action.lower() == MessageActions.CREATE.value.lower():
            message_serializer = MessageRequestSerializer(
                data=json.loads(text_data))
            message_serializer.is_valid(raise_exception=True)
            await self.received_add(message_serializer)
        elif action.lower() == MessageActions.MARK_AS_READ.value.lower():
            read_serializer = MessageReadRequestSerializer(
                data=json.loads(text_data))
            read_serializer.is_valid(raise_exception=True)
            await self.received_mark_read(read_serializer)
        elif action.lower() == MessageActions.Notify_READ_ALL.value.lower():
            # Note that the action is for notifying purpose only
            # The bulk updates are done using HTTP for performance issue
            await self.received_notify_read_all()
        else:
            await self.send_error(f'Invalid action property: "{action}"')

    async def received_add(self, serializer):
        new_message = Message(
            content=serializer.validated_data.get('message'),
            conversation_id=self.conversation_id,
            sender=self.user
        )

        await database_sync_to_async(new_message.save)()
        await self.group_message(new_message)

    async def received_mark_read(self, serializer):
        message_id = serializer.validated_data.get('message_id')
        try:
            message = await database_sync_to_async(Message.objects.get)(id=message_id)
            await database_sync_to_async(lambda: message.sender.to_http_response)()
            if message.read_at is None:
                message.read_at = timezone.now()
                await database_sync_to_async(message.save)()
                await self.group_message(message)
        except Message.DoesNotExist:
            await self.send_error(f'Message not found: "{message_id}"')

    async def received_notify_read_all(self):
        await self.group_message_notify_read_all()

    async def group_message(self, message):
        await self.channel_layer.group_send(
            self.group_id,
            {
                'type': 'send_message',
                'message': json.dumps(message.to_ws_response())
            }
        )

    async def group_message_notify_read_all(self):
        await self.channel_layer.group_send(
            self.group_id,
            {
                'type': 'send_message',
                'message': json.dumps({
                    'notify_read_all': True,
                    'sender_id': self.user.id,
                })
            }
        )

    async def send_message(self, event):
        await self.send(text_data=event['message'])

    async def send_error(self, error_message):
        await self.send(text_data=json.dumps({'error': error_message}))


class PostConsumer(AsyncWebsocketConsumer):
    user = None

    async def connect(self):
        self.channel_id = self.scope['url_route']['kwargs']['channel_id']

        if not self.scope['user']:
            await self.send_error(f'You must be logged in')
            await self.close()
            return

        self.user = self.scope['user']

        if not self.user.email.endswith("@andrew.cmu.edu"):
            await self.send_error(f'You must be logged with Andrew identity')
            await self.close()
            return

        self.group_id = f'channel_{self.channel_id}'

        try:
            channel = await database_sync_to_async(Channel.objects.get)(id=self.channel_id)
            if not await database_sync_to_async(channel.users.filter(id=self.user.id).exists)():
                await self.send_error(f'Unexpected channel not found')
                await self.close()
                return
        except:
            await self.send_error(f'Unexpected channel not found')
            await self.close()
            return

        await self.channel_layer.group_add(
            self.group_id,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.group_id,
            self.channel_name
        )

    async def receive(self, text_data):
        post_serializer = PostRequestSerializer(data=json.loads(text_data))
        post_serializer.is_valid(raise_exception=True)

        action = post_serializer.validated_data.get('action')

        if action.lower() == PostActions.CREATE.value:
            await self.received_add(post_serializer)
            return
        elif action.lower() == PostActions.COMMENT.value:
            await self.received_add_comment(post_serializer)
            return

        await self.send_error(f'Invalid action property: "{action}"')

    async def received_add(self, serializer):
        new_post = Post(
            content=serializer.validated_data.get('content'),
            channel_id=self.channel_id,
            user=self.user,
        )
        await database_sync_to_async(new_post.save)()
        await self.group_message(new_post)

    async def received_add_comment(self, serializer):
        # create new comments for post
        post_id = serializer.validated_data.get('post_id')
        try:
            post = await database_sync_to_async(Post.objects.get)(id=post_id)
        except Post.DoesNotExist:
            await self.send_error(f'Post with ID {post_id} not found in channel {self.channel_id}')
            return

        self.comments_group_id = f'post_{post_id}'
        await self.channel_layer.group_add(
            self.comments_group_id,
            self.channel_name
        )

        new_comment = Comment(
            content=serializer.validated_data.get('content'),
            post=post,
            user=self.user,
        )
        await database_sync_to_async(new_comment.save)()
        await self.comments_group_message(new_comment)

    async def group_message(self, post):
        await self.channel_layer.group_send(
            self.group_id,
            {
                'type': 'send_post',
                'post': json.dumps(post.to_ws_response())
            }
        )

    async def comments_group_message(self, comment):
        await self.channel_layer.group_send(
            self.comments_group_id,
            {
                'type': 'send_comment',
                'comment': json.dumps(comment.to_ws_response())
            }
        )

    async def send_post(self, event):
        await self.send(text_data=event['post'])

    async def send_comment(self, event):
        await self.send(text_data=event['comment'])

    async def send_error(self, error_message):
        await self.send(text_data=json.dumps({'error': error_message}))
