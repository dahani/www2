# StockPro API — Backend Symfony 8

REST API for the **StockPro** stock & sales management app.
Built with **Symfony 8.0**, **Doctrine ORM 3.3**, and **PHP 8.4+**.
Ships with an **empty database** (SQLite by default, MySQL/PostgreSQL supported).

---

## Requirements

- PHP **8.4** or higher
- Composer 2.x
- (Optional) MySQL 8 / PostgreSQL / SQLite (default)
- Symfony CLI (recommended for `symfony serve`)

---

## Installation

```bash
cd backend
composer install
```

## Configuration

Copy `.env` to `.env.local` and adjust as needed. The default configuration uses SQLite
(no server required — the database file will be created at `var/data.db`).

To switch to MySQL, edit `.env.local`:

```dotenv
DATABASE_URL="mysql://user:password@127.0.0.1:3306/stockpro?serverVersion=8.0&charset=utf8mb4"
```

> **Note:** Symfony 8 requires **PHP 8.4+**. Check your version with `php -v`.

## Create the empty database & schema

```bash
# 1. create the database (SQLite file or MySQL DB)
php bin/console doctrine:database:create

# 2. run the migration to create empty tables
php bin/console doctrine:migrations:migrate --no-interaction
```

## Run the server

```bash
symfony serve
# — or —
php -S 127.0.0.1:8000 -t public
```

API will be available at `http://127.0.0.1:8000/api`.

---

## API endpoints (all JSON)

| Method | URL                             | Description                              |
| ------ | ------------------------------- | ---------------------------------------- |
| GET    | `/api/fournisseurs`             | List all suppliers                       |
| POST   | `/api/fournisseurs`             | Create a supplier                        |
| PUT    | `/api/fournisseurs/{id}`        | Update a supplier                        |
| DELETE | `/api/fournisseurs/{id}`        | Delete a supplier                        |
| GET    | `/api/clients`                  | List all clients                         |
| POST   | `/api/clients`                  | Create a client                          |
| PUT    | `/api/clients/{id}`             | Update a client                          |
| DELETE | `/api/clients/{id}`             | Delete a client                          |
| GET    | `/api/produits`                 | List all products                        |
| GET    | `/api/produits/barcode/{code}`  | Find a product by barcode                |
| POST   | `/api/produits`                 | Create a product                         |
| PUT    | `/api/produits/{id}`            | Update a product                         |
| DELETE | `/api/produits/{id}`            | Delete a product                         |
| GET    | `/api/ventes`                   | List all sales                           |
| POST   | `/api/ventes`                   | Create a sale (auto-decrements stock)    |
| GET    | `/api/credits`                  | List all credits                         |
| POST   | `/api/credits/{id}/paiement`    | Record a payment on a credit             |
| GET    | `/api/settings`                 | Get application settings                 |
| PUT    | `/api/settings`                 | Update application settings              |
| GET    | `/api/stats`                    | Dashboard statistics                     |

## CORS

CORS is enabled for `http://localhost:5173` (Vite dev server) via NelmioCorsBundle.
Adjust `CORS_ALLOW_ORIGIN` in `.env.local` if needed.

## Connecting the React frontend

In the frontend project, set the API base URL as an env variable (e.g. `.env.local`):

```dotenv
VITE_API_URL=http://127.0.0.1:8000/api
```

Then use `fetch(import.meta.env.VITE_API_URL + '/produits')` in your services.
