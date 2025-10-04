import type { Config } from 'drizzle-kit';

export default {
  schema: './src/drizzle/schema.ts',
  out: './src/drizzle/migrations',
  dialect: 'sqlite',
  driver: 'd1-http',
  dbCredentials: {
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
    databaseId: process.env.CLOUDFLARE_DATABASE_ID || 'b4c84633-9d74-4eff-b482-a72c710c6cf5',
    token: process.env.CLOUDFLARE_API_TOKEN!,
  },
} satisfies Config;
