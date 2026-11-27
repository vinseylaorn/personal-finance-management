# Personal Finance Management

កម្មវិធីគ្រប់គ្រងចំណូល និងចំណាយ ដែលប្រើ Nuxt សម្រាប់ផ្ទាំងគ្រប់គ្រង និង Laravel សម្រាប់ API។ អ្នកអាចកត់ត្រាប្រតិបត្តិការតាមប្រភេទ តាមដានសមតុល្យលើ Dashboard និងនាំចេញរបាយការណ៍ជា CSV។ អ្នកគ្រប់គ្រងក៏អាចកំណត់ម៉ឺនុយ និងសកម្មភាពសម្រាប់អ្នកប្រើនីមួយៗបានដែរ។

## ចាប់ផ្ដើមជាមួយ Docker

ត្រូវមាន Docker ដែលកំពុងដំណើរការ និង Docker Compose កំណែ 2.24 ឬថ្មីជាងនេះ។ បន្ទាប់ពី clone ឬទាញយកគម្រោង សូមបើក Terminal ក្នុងថតដែលមាន `compose.yaml` ហើយរត់៖

```sh
docker compose up --build -d --wait
```

នៅលើកដំបូង Docker នឹងដំឡើង dependencies បង្កើត SQLite database និងគណនីសាកល្បង។ ការកំណត់លំនាំដើមមានក្នុងគម្រោងស្រាប់ ដូច្នេះអ្នកអាចរត់ command ខាងលើបានភ្លាម។

| សម្រាប់ការសាកល្បងលើម៉ាស៊ីនផ្ទាល់ខ្លួន | តម្លៃ |
| --- | --- |
| ទំព័រចូល | [បើកកម្មវិធី](http://localhost:3003/login) |
| ឈ្មោះអ្នកប្រើ | `supperadmin` |
| ពាក្យសម្ងាត់ | `supperadmin@123` |
| ស្ថានភាព API | [ពិនិត្យ Laravel](http://localhost:8001/up) |

បន្ទាប់ពីចូល អ្នកអាចបង្កើតប្រភេទមួយក្នុង **Category** បន្ថែមប្រតិបត្តិការក្នុង **Income** ឬ **Expense** រួចបើក **Dashboard** ដើម្បីមើលចំនួនសរុប។

## Commands ប្រើញឹកញាប់

រត់ពីថតដើមរបស់គម្រោង។

| គោលបំណង | Command |
| --- | --- |
| មើលស្ថានភាព services | `docker compose ps` |
| មើល logs ពេលមានបញ្ហា | `docker compose logs --tail=100 frontend backend` |
| រត់តេស្ត Laravel | `docker compose exec backend php artisan test` |
| Build និងបើកកំណែក្រោយកែ code | `docker compose up --build -d --wait` |
| បិទកម្មវិធី និងរក្សាទិន្នន័យ | `docker compose down` |

## កែគម្រោងបន្ត

| ទីតាំង | អ្វីដែលអាចកែនៅទីនោះ |
| --- | --- |
| [frontend/pages](frontend/pages) | ទំព័រ Login, Dashboard, ប្រតិបត្តិការ និងរបាយការណ៍ |
| [frontend/components](frontend/components) | Sidebar, header, តារាង និង dialog ដែលទំព័រប្រើរួមគ្នា |
| [frontend/composables](frontend/composables) | ការហៅ API និង logic ដែលប្រើក្នុងទំព័រ |
| [backend/routes/api.php](backend/routes/api.php) | ផ្លូវ API សម្រាប់ការចូលប្រើ និងទិន្នន័យហិរញ្ញវត្ថុ |
| [backend/database](backend/database) | Migrations សម្រាប់រចនាសម្ព័ន្ធ database និង seeders សម្រាប់ទិន្នន័យដំបូង |
| [compose.yaml](compose.yaml) | Services, ports និង volumes សម្រាប់ការរត់លើម៉ាស៊ីនផ្ទាល់ខ្លួន |

Compose អាន `.env.example` ក្នុងថត frontend និង backend ជាលំនាំដើម។ បើចង់កែសម្រាប់ម៉ាស៊ីនខ្លួនឯង អាចបង្កើត `.env` នៅក្បែរឯកសារគំរូនីមួយៗ។ តម្លៃដែលកំណត់ក្នុងផ្នែក `environment` នៃ `compose.yaml` មានអាទិភាពលើ `.env`។ បើប្ដូរ port របស់ API ត្រូវកែ host port, `APP_URL` និង `NUXT_PUBLIC_API_BASE` ឱ្យត្រូវគ្នា។

ទិន្នន័យ SQLite និង application key រក្សាទុកក្នុង volume `finance-data`។ ឯកសារ upload រក្សាទុកក្នុង volume `uploads`។ ទិន្នន័យទាំងនេះនៅតែមានពេលបិទកម្មវិធីដោយប្រើ `docker compose down` ហើយបើកវាឡើងវិញ។

សម្រាប់ការអភិវឌ្ឍ API សូមមើល [មគ្គុទ្ទេសក៍ backend](backend/README.md)។
