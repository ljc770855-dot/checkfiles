import { drizzle } from 'drizzle-orm/d1';
import * as schema from '../drizzle/schema';
import { getRequestContext } from '@cloudflare/next-on-pages';

export const db = () => {
  const { env } = getRequestContext();
  return drizzle(env.DB, { schema });
};
