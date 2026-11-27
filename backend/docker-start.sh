#!/bin/sh
set -eu
cp .env.example .env
if [ ! -s /data/app-key ]; then
    php artisan key:generate --show > /data/app-key.tmp
    mv /data/app-key.tmp /data/app-key
fi
export APP_KEY="$(cat /data/app-key)"
touch "$DB_DATABASE"
php artisan migrate --force
if [ ! -f /data/seeded ]; then
    php artisan db:seed --class=DefaultUserSeeder --force
    touch /data/seeded
fi
exec php artisan serve --no-reload --host=0.0.0.0 --port=8000
