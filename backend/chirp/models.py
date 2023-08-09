import uuid
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import EmailValidator

from chirp.utils import convert_to_us_eastern


class User(AbstractUser):
    username = models.CharField(max_length=256, unique=True)
    first_name = models.CharField(max_length=256)
    last_name = models.CharField(max_length=256)
    email = models.EmailField(
        validators=[
            EmailValidator(message='Please enter a valid email address.'),
            EmailValidator(
                'Email should be from andrew.cmu.edu domain', 'andrew.cmu.edu'),
        ],
        unique=True
    )
    bio_description = models.CharField(max_length=500, blank=True)
    image_blob = models.FileField(blank=True)
    content_type = models.CharField(max_length=50, blank=True)

    USERNAME_FIELD = 'username'
    EMAIL_FIELD = 'email'

    @staticmethod
    def get_user_by_id(user_id):
        return User.objects.get(id__exact=user_id)

    @staticmethod
    def get_users_by_same_email_domain(user_id):
        user = User.get_user_by_id(user_id)
        domain = user.email.split('@')[-1]
        users = User.objects.filter(email__icontains='@{}'.format(domain))
        return users

    @staticmethod
    def get_all_users():
        return User.objects.all()

    def to_http_response(self):
        return {
            'id': self.id,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'email': self.email,
            'username': self.username
        }


class Conversation(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    users = models.ManyToManyField(User, blank=True)

    @staticmethod
    def get_conversation_by_id(conversation_id):
        return Conversation.objects.get(id__exact=conversation_id)

    @staticmethod
    def get_conversations_by_user_id(user_id):
        return Conversation.objects.filter(users__id=user_id)

    @staticmethod
    def get_all_conversations():
        return Conversation.objects.all()


class Message(models.Model):
    content = models.TextField(default='')
    created_at = models.DateTimeField(auto_now_add=True)

    conversation = models.ForeignKey(
        Conversation, on_delete=models.PROTECT, related_name='messages')
    sender = models.ForeignKey(
        User, on_delete=models.PROTECT, related_name='messages_sent')
    read_at = models.DateTimeField(default=None, null=True, blank=True)

    ordering = ['-created_at']

    def to_ws_response(self):
        return {
            'id': self.id,
            'content': self.content,
            'created_at': convert_to_us_eastern(self.created_at).strftime("%m/%d/%Y %I:%M %p"),
            'read_at': convert_to_us_eastern(self.read_at).strftime("%m/%d/%Y %I:%M %p") if self.read_at else None,
            'sender': self.sender.to_http_response()
        }


class Channel(models.Model):
    name = models.CharField(max_length=256)
    type = models.CharField(max_length=10)
    owner = models.ForeignKey(User, on_delete=models.PROTECT, related_name='channel_owner', blank=True, null=True)
    users = models.ManyToManyField(User, blank=True, related_name="followers")
    description = models.CharField(max_length=1024)

    def __str__(self):
        return f'id={self.id}, name="{self.name}"'

    @staticmethod
    def get_all_public_channels():
        return Channel.objects.filter(type="public")

    @staticmethod
    def get_channels_by_user_id(user_id):
        return Channel.objects.filter(users__id=user_id)

    @staticmethod
    def get_channel_by_name(name):
        return Channel.objects.get(name=name)

    @staticmethod
    def check_if_channel_existed(name):
        return Channel.get_all_public_channels().filter(name=name).exists()

    @staticmethod
    def get_channel_by_id(channel_id):
        return Channel.objects.get(id=channel_id)


class Post(models.Model):
    user = models.ForeignKey(User, blank=True, on_delete=models.PROTECT)
    channel = models.ForeignKey(Channel, on_delete=models.CASCADE)
    content = models.TextField(default='')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'id={self.id}, name="{self.content}"'

    @staticmethod
    def get_post_by_channel_id(channel_id):
        return Post.objects.filter(channel__id=channel_id)

    def to_ws_response(self):
        return {
            'id': self.id,
            'content': self.content,
            'created_at': convert_to_us_eastern(self.created_at).strftime("%m/%d/%Y %I:%M %p"),
            'user': self.user.to_http_response(),
            'comments': [],
        }


class Comment(models.Model):
    post = models.ForeignKey(
        Post, on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField(default='')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.author} - {self.created_at.strftime('%Y-%m-%d %H:%M:%S')} - {self.content[:30]}"

    def to_ws_response(self):
        return {
            'id': self.id,
            'post_id': self.post.id,
            'content': self.content,
            'created_at': convert_to_us_eastern(self.created_at).strftime("%m/%d/%Y %I:%M %p"),
            'user': self.user.to_http_response(),
        }
