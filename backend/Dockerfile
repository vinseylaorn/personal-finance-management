FROM php:8.4-cli
RUN apt-get update && apt-get install -y --no-install-recommends unzip libonig-dev libsqlite3-dev libxml2-dev libcurl4-openssl-dev \
    && docker-php-ext-install mbstring pdo_sqlite pcntl bcmath \
    && rm -rf /var/lib/apt/lists/*
COPY --from=composer:2 /usr/bin/composer /usr/local/bin/composer
WORKDIR /app
COPY . .
RUN composer install --prefer-dist --no-interaction && php artisan storage:link
CMD ["sh", "docker-start.sh"]
