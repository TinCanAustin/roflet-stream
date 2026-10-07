import { config } from "dotenv";
import { defineConfig } from 'drizzle-kit';

config({
    path: ".env"
});

export default defineConfig({
    schema: "./drizzel/schema.ts",
    out: "./drizzel/migrations",
    dialect: "postgresql",
    dbCredentials:{
        url: process.env.DATABASE_URL as string
    },
    schemaFilter: ["public"],
    tablesFilter: ["!pg_stat_*"],
});