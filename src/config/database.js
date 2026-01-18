import 'dotenv/config';

import { neon, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';

if (process.env.DATABASE_URL === 'development') {
  neonConfig.fetchEndpoint = 'https://neon-local:5432/sql';
  neonConfig.useSecureWebSocket = false;
  neonConfig.poolQueryViaFetch = true; 
}

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql);

export { db, sql };
