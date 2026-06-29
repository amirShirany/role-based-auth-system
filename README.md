# User Management

A modern User Management application built with **Angular 22** as a technical assessment.

## Tech Stack

- Angular 22
- TypeScript
- Angular Material
- Bootstrap 5
- Dexie.js (IndexedDB)
- Web Crypto API (PBKDF2)

## Features

- User registration
- User account activation
- User login
- Home page
- Administrator authentication
- User management (Create, Read, Update, Delete)
- Role-based authorization (Admin / User)
- Password hashing using the Web Crypto API (PBKDF2)
- Responsive user interface

## Getting Started

### Install dependencies

```bash
npm install
```

### Run the application

```bash
ng serve
```

The application will be available at:

```
http://localhost:4200
```

## Default Administrator Account

A default administrator account is automatically created when the application runs for the first time.

| Email | Password |
|--------|----------|
| `admin@local.app` | `Admin123!` |

## Project Structure

```
src/app
├── core
├── database
├── features
├── layouts
├── models
├── repositories
└── services
```

## Notes

- The backend is simulated using **IndexedDB** with **Dexie.js**.
- All user data is stored locally in the browser.
- Passwords are securely hashed using the **Web Crypto API (PBKDF2)** before being stored.
- Authentication and user management are implemented entirely on the client side for demonstration purposes.

## Build

```bash
ng build
```

## Author

**Amirhossein Shirani**

Frontend Developer
