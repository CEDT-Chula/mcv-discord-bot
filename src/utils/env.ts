import * as dotenv from "dotenv"
import z from 'zod';
dotenv.config({
    path:"./.env"
})

const envSchema = z.object({
    DATABASE_URL: z.string(),
    DISCORD_TOKEN: z.string(),
    CLIENT_ID: z.string(),
    ADMIN_USER_ID: z.string(),
    COOKIE: z.string(),
    DELAY: z.string().regex(/^\d+$/).transform(Number),
    INTERVAL_LOGGING: z.enum(["true", "false"]).transform((v) => v === "true")
});


const envParser = envSchema.safeParse({
    DATABASE_URL: process.env.DATABASE_URL,
    DISCORD_TOKEN: process.env.DISCORD_TOKEN,
    CLIENT_ID: process.env.CLIENT_ID,
    ADMIN_USER_ID: process.env.ADMIN_USER_ID,
    COOKIE: process.env.COOKIE,
    DELAY: process.env.DELAY,
    INTERVAL_LOGGING: process.env.INTERVAL_LOGGING
});


if (!envParser.success) {
    console.error(envParser.error.errors);
    process.exit(1);
}

export const env = envParser.data;