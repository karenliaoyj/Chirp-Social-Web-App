import shutil
# import uuid
from django.core.management.utils import get_random_secret_key

# Copy the config.ini.sample file to config.ini
shutil.copyfile('config.ini.example', 'config.ini')

# Generate a random secret key using Django's utility function
secret_key = get_random_secret_key()
secret_key = secret_key.replace("%", "%%")

# TODO: Update the password
db_password = 'secret'

# Update the config.ini file with the new secret key
with open('config.ini', 'r') as f:
    contents = f.read()

contents = contents.replace('secret=', f'secret={secret_key}')
contents = contents.replace('password=', f'password={db_password}')

with open('config.ini', 'w') as f:
    f.write(contents)