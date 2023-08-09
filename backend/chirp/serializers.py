
from chirp.utils import convert_to_us_eastern
from chirp.models import User, Channel
from enum import Enum
from chirp.models import User, Conversation, Channel, Message, Post, Comment
from rest_framework import serializers
from django.core.validators import validate_email


class LoginRequestSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()


"""
User Serializer
"""


class UserRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'username',
            'first_name',
            'last_name',
            'email',
            'password'
        ]

    def validate_email(self, value):
        # Use Django's validate_email method to validate the email format
        validate_email(value)

        if not value.endswith('@andrew.cmu.edu'):
            raise serializers.ValidationError(
                "Email should be from andrew.cmu.edu domain")

        return value

    def create(self, validated_data):
        user = User(**validated_data)
        user.set_password(validated_data['password'])
        user.is_staff = False
        user.is_superuser = False
        user.save()
        return user


class PublicUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'first_name', 'last_name', 'email')


"""
Conversation Serializer
"""


class CreateConversationRequestSerializer(serializers.Serializer):
    receiver_id = serializers.IntegerField()


class PublicConversationSerializer(serializers.ModelSerializer):
    users = serializers.SerializerMethodField()
    type = serializers.SerializerMethodField()
    receiver = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = ('id', 'created_at', 'users',
                  'type', 'receiver', 'unread_count')

    def get_users(self, obj):
        users = obj.users.all()
        return [u.to_http_response() for u in users]

    def get_type(self, obj):
        return "DirectMessage"

    def get_receiver(self, obj):
        user = self.context['request'].user
        _reveiver = obj.users.exclude(id=user.id).first()
        return _reveiver.to_http_response()

    def get_unread_count(self, obj):
        user = self.context['request'].user
        query_set = obj.messages.filter(read_at=None)
        query_set = query_set.exclude(sender_id=user.id)
        return query_set.count()

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        ret['type'] = self.get_type(instance)
        ret['receiver'] = self.get_receiver(instance)
        ret['unread_count'] = self.get_unread_count(instance)
        return ret


"""
Channel Serializer
"""


class CreateChannelSerializer(serializers.Serializer):
    members_id = serializers.ListSerializer(child=serializers.CharField(),allow_empty=True)
    name = serializers.CharField(max_length=256)
    type = serializers.CharField(max_length=10)
    description = serializers.CharField(max_length=1024)


class PublicChannelSerializer(serializers.ModelSerializer):
    users = serializers.SerializerMethodField()

    class Meta:
        model = Channel
        fields = ('id', 'name', 'users', 'description', 'owner', 'type')

    def get_users(self, obj):
        users = obj.users.all()
        return [u.to_http_response() for u in users]


"""
Message Serializer
"""


class MessageActions(Enum):
    CREATE = 'create'
    MARK_AS_READ = 'mark_as_read'
    Notify_READ_ALL = 'notify_read_all'

    @classmethod
    def choices(cls):
        return [(choice.value, choice.name) for choice in cls]


class PostActions(Enum):
    CREATE = 'create'
    COMMENT = 'comment'

    @classmethod
    def choices(cls):
        return [(choice.value, choice.name) for choice in cls]


class MessageBaseRequestSerializer(serializers.Serializer):
    action = serializers.ChoiceField(choices=MessageActions.choices())


class MessageRequestSerializer(MessageBaseRequestSerializer):
    message = serializers.CharField()


class MessageReadRequestSerializer(MessageBaseRequestSerializer):
    message_id = serializers.IntegerField()


class PublicMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ['id', 'sender', 'content', 'created_at', 'read_at']

    def get_sender(self, obj):
        return obj.sender.to_http_response()

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        ret['sender'] = self.get_sender(instance)
        ret['created_at'] = convert_to_us_eastern(instance.created_at).strftime(
            "%m/%d/%Y %I:%M %p")
        ret['read_at'] = convert_to_us_eastern(instance.read_at).strftime(
            "%m/%d/%Y %I:%M %p") if instance.read_at else None
        return ret


class PostRequestSerializer(serializers.Serializer):
    action = serializers.ChoiceField(choices=PostActions.choices())
    content = serializers.CharField()
    post_id = serializers.CharField(required=False)


class CommentSerializer(serializers.ModelSerializer):
    user = PublicUserSerializer()

    class Meta:
        model = Comment
        fields = ('id', 'post_id', 'content', 'created_at', 'user')


class PublicPostSerializer(serializers.ModelSerializer):
    comments = CommentSerializer(many=True)

    class Meta:
        model = Post
        fields = ['id', 'user', 'content', 'created_at', 'comments']

    def get_user(self, obj):
        return obj.user.to_http_response()

    def get_comments(self, instance):
        comments = instance.comments.all()
        return CommentSerializer(comments, many=True).data

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        ret['user'] = self.get_user(instance)
        ret['created_at'] = convert_to_us_eastern(instance.created_at).strftime(
            "%m/%d/%Y %I:%M %p")
        ret['post_id'] = instance.id
        ret['comments'] = self.get_comments(instance)
        return ret
