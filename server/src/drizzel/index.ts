import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import path from 'path';

config({ path:  path.resolve(__dirname, "../.env")});

const connection = process.env.DATABASE_URL!;

export const client = postgres(connection, { prepare : false });
export const db = drizzle({client});