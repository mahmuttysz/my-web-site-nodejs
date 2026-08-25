Personal Portfolio & Blog Engine
A personal website and admin panel project developed using Node.js, Express, and TypeScript, adhering to type-safety principles and a layered MVC architecture. Server-Side Rendering via EJS and Tailwind CSS v4 were chosen on the client side for fast SEO performance and low resource utilization.

🛠️ Tech Stack & Ecosystem
Backend: Node.js, Express.js, TypeScript

Frontend / View Engine: EJS (Server-Side Rendering), Tailwind CSS v4

Database & Caching: MySQL / MariaDB, Redis (Session & Caching)

Process Manager: PM2 (Zero-Downtime Reload)

CI/CD & Server: GitHub Actions, Rocky Linux 9 (RHEL)

🚀 Key Features
Full Type-Safety: Separated TypeScript interfaces for database tables (dbTables) and API/View responses (response).

Advanced Admin Panel: Modular management panel for experiences, projects, articles, contact messages, and social media links.

Security & Performance:

Cloudflare Turnstile integration

Express Rate-Limiting and Helmet security layers

Dynamic Sitemap (/sitemap.xml) generation

Automated error handling (errorHandler, notFoundHandler) with custom 404/500 error pages

Automated Deployment (CI/CD): GitHub Actions and SSH tünel integration for zero-downtime deployment backed by pm2 reload on Rocky Linux 9.

📁 Project Architecture

Plaintext

src/

├── config/          # Database, Redis, Session, and Upload configurations

├── controllers/     # Site and Admin panel business logic layer (Controllers)

├── middlewares/     # Authentication, rate-limiting, and Turnstile protections

├── routes/          # Web and Admin routes

├── styles/          # Tailwind CSS entry files (input.css)

├── types/           # Type definitions (dbTables, response types)

├── utils/           # Helper functions, email service, and language files

└── app.ts           # Application entry point

views/               # EJS templates (Admin, Blog, Errors, Partials)

⚙️ Setup & Installation
1. Prerequisites
Node.js (v18+)

Redis Server

MySQL / MariaDB Database

2. Installing Dependencies
Bash
npm install
3. Environment Variables
Copy the .env.sample file to .env and configure the required database and Redis credentials:

Bash
cp .env.sample .env

4. Development Mode
Bash

npm run dev

6. Production Build & Execution
Bash

# Compile TypeScript and Tailwind CSS
npm run build

# Start application via PM2
pm2 start dist/app.js --name "my-site"
🔄 CI/CD Workflow
Every push to the main branch triggers the GitHub Actions workflow automatically:

npm ci installs dependencies strictly adhering to the lockfile.

npm run build compiles TypeScript and CSS assets for production.

The server executes pm2 reload for zero-downtime updates.

🗄️ Database Setup & Automated Backup
The DumpSQL.sql script located in the root directory features an integrated automated backup procedure (sp_safe_backup_all) to prevent data loss during database updates. When executed:

It creates timestamped backup copies (table_name_bak_YYYYMMDD_HHMMSS) of all existing live tables.

Once the backup completes, it drops and recreates the fresh table schemas.

Terminal (CLI) Installation
Bash

mysql -u [username] -p [database_name] < DumpSQL.sql

GUI Installation (Navicat / DBeaver / phpMyAdmin)

Connect to your target database.

Use Execute SQL Script... (or Execute Script) and select the DumpSQL.sql file.

Optionally, add this line to your package.json under scripts to import the schema with a single command:

JSON

"scripts": {
  "db:import": "mysql -u root -p website < DumpSQL.sql"
}

Bash

npm run db:import
