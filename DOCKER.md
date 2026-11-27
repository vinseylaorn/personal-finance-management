# Local development with Docker

From the project root, start Docker Desktop and run:

```sh
docker compose up --build -d --wait
```

Open http://localhost:3003/login and sign in with the seeded local account
`supperadmin` / `supperadmin@123`. The Laravel health endpoint is
http://localhost:8001/up.

Compose reads each service's .env.example and applies overrides from its
optional .env file (Compose 2.24 or newer). The first start initializes a
fresh SQLite database and generates an application key. Docker volumes
keep the database, application key and uploads across restarts.

Run the backend tests with `docker compose exec backend php artisan test`.
Stop the application with `docker compose down`.
