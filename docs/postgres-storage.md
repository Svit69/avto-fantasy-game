# PostgreSQL storage on VPS

1. Install PostgreSQL:

```bash
sudo apt update
sudo apt install -y postgresql postgresql-contrib
```

2. Create database and user:

```bash
sudo -u postgres psql
CREATE USER avto_fantasy WITH PASSWORD 'strong_password_here';
CREATE DATABASE avto_fantasy OWNER avto_fantasy;
\q
```

3. Set `.env`:

```env
STORAGE_DRIVER=postgres
DATABASE_URL=postgresql://avto_fantasy:strong_password_here@localhost:5432/avto_fantasy
```

4. Install dependencies and migrate:

```bash
npm ci
npm run db:migrate
npm run db:import-json
pm2 restart avto-fantasy-game --update-env
```

`db:import-json` copies current JSON storage into PostgreSQL. Run it once after backup.
