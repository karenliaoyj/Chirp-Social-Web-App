from django.core.signing import Signer
from chirp.models import User
from random import randrange
from time import time
from asgiref.sync import sync_to_async


TOKEN_VALID_SECONDS = 2


def generate_token(user: User) -> str:
    token = {
        'user_id': user.id,
        'timestamp': int(time()),
        'random': randrange(123456789, 987654321),
    }

    s = Signer()
    return s.sign_object(token)


@sync_to_async
def check_token(signed_token: str):
    try:
        s = Signer()
        token = s.unsign_object(signed_token)
    except Exception as e:
        raise ValueError(e)

    token_age = int(time()) - int(token['timestamp'])
    if token_age > TOKEN_VALID_SECONDS:
        raise ValueError(
            f"Token for user.id={token['user_id']} expired {token_age-TOKEN_VALID_SECONDS:,d} seconds ago")

    try:
        return User.objects.get(id=token['user_id'])
    except User.DoesNotExist as e:
        raise ValueError(e)
