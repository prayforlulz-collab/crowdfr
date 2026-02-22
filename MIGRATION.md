# Database Migration Guide: SQLite -> PostgreSQL

You have successfully updated the project to use PostgreSQL. However, your database is currently empty.

## Prerequisites

1.  **PostgreSQL Database**: You need a running PostgreSQL instance.
    *   **Local**: Install PostgreSQL locally or use Docker (`docker run --name crowdz-postgres -e POSTGRES_PASSWORD=password -d -p 5432:5432 postgres`).
    *   **Cloud**: Use a managed provider like [Neon](https://neon.tech), [Supabase](https://supabase.com), or [Render](https://render.com).

2.  **Connection String**: Get your `DATABASE_URL`. It typically looks like:
    `postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public`

## Steps to Complete Migration

1.  **Update Environment Variables**:
    Open `.env` and replace the placeholder `DATABASE_URL` with your actual connection string.

2.  **Install Dependencies** (if needed):
    Stop your development server (`Ctrl+C`).
    Run: `npm install`

3.  **Generate Prisma Client**:
    Run: `npx prisma generate`

4.  **Create Initial Migration**:
    Run: `npx prisma migrate dev --name init`
    This will create the tables in your new PostgreSQL database.

5.  **Seed the Database** (Optional):
    If you want to start with some test data (this will NOT import your old SQLite data), run:
    `npx prisma db seed`

6.  **Restart Development Server**:
    Run: `npm run dev`

## Data Migration (Advanced)

If you need to keep your existing data from SQLite (`dev.db`), you must export it and import it into Postgres.
Tools like [pgloader](https://pgloader.io/) or custom scripts can help, but for a pre-production app, it's often easier to start fresh.
