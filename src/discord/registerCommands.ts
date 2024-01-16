import { REST, Routes } from 'discord.js';
import {toDiscordCommandBody} from "./getCommands"
import * as dotenv from "dotenv"
dotenv.config({
    path:"./.env"
})
const rest = new REST().setToken(process.env.DISCORD_TOKEN!);
export function registerCommands(commands:any){
    let discordCommandBody = toDiscordCommandBody(commands);
    
    rest.put(Routes.applicationCommands(process.env.CLIENT_ID!),{body:discordCommandBody})
}

