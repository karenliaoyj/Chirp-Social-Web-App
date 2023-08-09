from django.http import HttpResponse
from django.shortcuts import reverse

from chirp.response import http_error_response


def ajax_login_required(func):
    def wrapper(request, *args, **kwargs):
        if not request.user.is_authenticated:
            return http_error_response(message="You must be logged in to do this operation", http_code=401)

        return func(request, *args, **kwargs)
    return wrapper
