from rest_framework.response import Response


def http_success_response(data=None):
    response = Response(
        {
            'status': 'ok',
            'response': {
                **(data if data else {}),
            }
        }
    )
    return response


def http_error_response(message=None, http_code=None, error_code=None, info=None):
    return Response(
        {
            'status': 'failed',
            'message': message,
            'error_code': error_code,
            'info': info if info else None
        },
        http_code if http_code else 500,
    )


def unauthorized_failure():
    return http_error_response(
        "Unauthorized Error",
        401,
        1001,
    )


def login_failure():
    return http_error_response(
        "Username / password is incorrect or unmatched",
        401,
        1002,
    )


def user_already_signup_failure(info=None):
    return http_error_response(
        'User already signup. Please select another username for registration',
        409,
        2001,
        info=info,
    )

def email_already_signup_failure(info=None):
    return http_error_response(
        'User already signup. Please select another email for registration',
        409,
        2001,
        info=info,
    )

def user_registration_failure(info=None):
    return http_error_response(
        "Failed to sign up with the email and password",
        400,
        2002,
        info=info,
    )


def user_email_validation_failure(info=None):
    return http_error_response(
        "Email should be from andrew.cmu.edu domain",
        400,
        2004,
        info=info,
    )


def channel_already_exist_failure(info=None):
    return http_error_response(
        'Channel name already exist',
        409,
        3001,
        info=info,
    )


def channel_creation_failure(info=None):
    return http_error_response(
        "Failed to create new channel",
        400,
        3002,
        info=info,
    )


def get_channels_failure(info=None):
    return http_error_response(
        "Failed to get channels",
        400,
        3003,
        info=info,
    )


def conversation_creation_failure(info=None):
    return http_error_response(
        "Failed to create conversation",
        400,
        4001,
        info=info,
    )


def get_conversations_failure(info=None):
    return http_error_response(
        "Failed to get conversations",
        400,
        4002,
        info=info,
    )


def get_users_failure(info=None):
    return http_error_response(
        "Failed to get users",
        400,
        2003,
        info=info,
    )


def get_messages_failure(info=None):
    return http_error_response(
        "Failed to get messages",
        400,
        5001,
        info=info,
    )


def messages_mark_as_read_failure(info=None):
    return http_error_response(
        "Failed to read messages",
        400,
        4002,
        info=info,
    )


def get_posts_failure(info=None):
    return http_error_response(
        "Failed to get posts",
        400,
        6001,
        info=info,
    )
