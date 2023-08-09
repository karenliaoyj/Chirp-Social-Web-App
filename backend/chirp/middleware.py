import urllib.parse

from chirp.signers import check_token

class WSAuthMiddleware:
    def __init__(self, inner):
        self.inner = inner

    async def __call__(self, scope, send, next):
        query_string = scope["query_string"].decode()
        params = urllib.parse.parse_qs(query_string)

        auth_tokens = dict(params).get('auth_token', '')
        if not auth_tokens or len(auth_tokens) == 0:
            raise ValueError('Invalid auth_token')

        user = await check_token(auth_tokens[0])
        if not user:
            raise ValueError('Invalid auth_token')

        scope['user'] = user
        return await self.inner(scope, send, next)