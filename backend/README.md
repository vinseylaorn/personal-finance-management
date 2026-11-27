# Personal Finance API

Backend នេះប្រើ Laravel 12, Sanctum និង SQLite។ Nuxt ហៅ API ដើម្បីគ្រប់គ្រងចំណូល ចំណាយ ប្រភេទប្រតិបត្តិការ និងគណនីអ្នកប្រើ។ សម្រាប់ការដំឡើងកម្មវិធីទាំងមូល និងគណនីសាកល្បង សូមមើល [README របស់គម្រោង](../README.md)។

## សាកល្បង API ក្នុង Docker

បន្ទាប់ពីបើកគម្រោងតាម Docker Compose អ្នកអាចពិនិត្យស្ថានភាព backend បានដោយប្រើ៖

```sh
curl -i http://localhost:8001/up
```

ការចូលជោគជ័យតាម `POST /api/login` ផ្ដល់ token សម្រាប់ប្រើក្នុង header `Authorization: Bearer <token>`។ ប្រើ `GET /api/user` ដើម្បីមើលគណនីដែលកំពុងចូល និង `POST /api/logout` ដើម្បីបញ្ចប់ session។

## Commands សម្រាប់អ្នកអភិវឌ្ឍ

រត់ពីថតដែលមាន `compose.yaml` នៅពេល backend កំពុងដំណើរការ។

```sh
docker compose exec backend php artisan route:list --path=api
docker compose exec backend php artisan migrate:status
docker compose exec backend php artisan test
```

បើចង់បន្ថែម endpoint សូមចាប់ផ្ដើមពី [API routes](routes/api.php) និង [controllers](app/Http/Controllers)។ ការកែរចនាសម្ព័ន្ធ database ត្រូវដាក់ក្នុង [migrations](database/migrations)។ ពេល container ចាប់ផ្ដើម វារត់ migrations ដែលនៅសល់ដោយស្វ័យប្រវត្តិ។
