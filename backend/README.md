## Quick Start

### Create Database
```sh
python manage.py makemigrations
python manage.py makemigrations chirp
python manage.py migrate
python manage.py migrate chirp
```

### Initialize Default General Channel
```sh
python manage.py loaddata channel.json
```