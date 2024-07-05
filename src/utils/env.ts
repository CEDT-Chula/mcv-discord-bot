import * as dotenv from "dotenv"
import { cleanEnv, str, email, json, bool, num } from 'envalid'
dotenv.config({
    path:"./.env"
})

export const env = cleanEnv(process.env,{
  DATABASE_URL: str(),
    DISCORD_TOKEN: str(),
    CLIENT_ID: str(),
    ADMIN_USER_ID: str(),
    COOKIE: str(),
    DELAY: num(),
    INTERVAL_LOGGING: bool(),
    ERROR_FETCHING_NOTIFICATION: bool(),
    // AUTO_DETERMINE_YEAR_AND_SEMESTER: bool(),
    // YEAR: 
})