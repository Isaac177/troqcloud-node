# troqcloud-node

## Database Setup (Prisma ORM)

1. Copy env file:
   - `cp .env.example .env`
2. Set your DB connection in `.env`:
   - PostgreSQL: keep `DATABASE_URL` as `postgresql://...`
3. Create/update DB schema:
   - `npm run db:push`
4. Start app:
   - `npm run dev`

## Switching to MySQL (minimal code changes)

Your API code does not change.

1. Update `DATABASE_URL` in `.env` to a MySQL URL.
2. In `prisma/schema.prisma`, change datasource provider from `"postgresql"` to `"mysql"`.
3. Regenerate Prisma client and sync schema:
   - `npm run prisma:generate`
   - `npm run db:push`
4. Restart the app.

## Endpoints

- `GET /`
- `GET /about`
- `GET /health`
- `GET /ready`
- `GET /users`
- `GET /users/:id`
- `POST /users`
