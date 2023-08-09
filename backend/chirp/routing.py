from channels.routing import ProtocolTypeRouter, URLRouter
# import app.routing
from django.urls import re_path
from chirp.consumers import ConversationConsumer, PostConsumer

websocket_urlpatterns = [
    re_path(
        r'^ws/conversation/(?P<conversation_id>[-\w]+)', ConversationConsumer.as_asgi()),
    re_path(r'^ws/channels/(?P<channel_id>[-\w]+)', PostConsumer.as_asgi()),
]
