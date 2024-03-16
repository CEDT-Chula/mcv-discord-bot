import { REST, Routes } from 'discord.js';
import {toDiscordCommandBody} from "./getCommands"
import * as dotenv from "dotenv"
import { env } from '../utils/env';
dotenv.config({
    path:"./.env"
})
const rest = new REST().setToken(
    env.DISCORD_TOKEN
);
export function registerCommands(commands:any){
    let discordCommandBody = toDiscordCommandBody(commands);
    console.log(commands)
    rest.put(Routes.applicationCommands(
        env.CLIENT_ID
    ),{body:discordCommandBody})
}

