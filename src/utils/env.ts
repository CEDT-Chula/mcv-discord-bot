import * as dotenv from "dotenv"
import z from 'zod';
dotenv.config({
    path:"./.env"
})

enum EnvKey {
    DISCORD_TOKEN="DISCORD_TOKEN",
    CLIENT_ID="CLIENT_ID",
    ADMIN_USER_ID="ADMIN_USER_ID",
    COOKIE="COOKIE",
}


const envSchema = z.object({
    DATABASE_URL: z.string(),
    DISCORD_TOKEN: z.string(),
    CLIENT_ID: z.string(),
    ADMIN_USER_ID: z.string(),
    COOKIE: z.string(),
});


const envParser = envSchema.safeParse({
    DATABASE_URL: process.env.DATABASE_URL,
    DISCORD_TOKEN: process.env.DISCORD_TOKEN,
    CLIENT_ID: process.env.CLIENT_ID,
    ADMIN_USER_ID: process.env.ADMIN_USER_ID,
    COOKIE: process.env.COOKIE,
});


if (!envParser.success) {
    console.error(envParser.error.errors);
    process.exit(1);
}

export const env = envParser.data;
