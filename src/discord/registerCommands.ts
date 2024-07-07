import { REST, Routes } from 'discord.js'
import { toDiscordCommandBody } from './getCommands'
import env from '../env/env'
import DiscordCommandHandler from '../interfaces/DiscordCommandHandler'
const rest = new REST().setToken(env.DISCORD_TOKEN)
export async function registerCommands(commands: DiscordCommandHandler) {
  if (Object.keys(commands).length == 0) {
    throw new Error('No Commands Found')
  }
  const discordCommandBody = toDiscordCommandBody(commands)
  const route = Routes.applicationCommands(env.CLIENT_ID)
  const requestData = {
    body: discordCommandBody,
  }
  await rest.put(route, requestData)
}
