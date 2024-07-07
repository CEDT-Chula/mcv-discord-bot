import { Client, GatewayIntentBits } from 'discord.js'
import type { DMChannel, Interaction } from 'discord.js'
import { NotificationChannel } from './database/database'
import { getCommands } from './discord/getCommands'
import { registerCommands } from './discord/registerCommands'
import env from './env/env'
import formatDateToBangkok from './utils/formatDateToBangkok'
import updateHandler from './utils/updateHandler'
import MutableWrapper from './utils/MutableWrapper'
import DiscordCommandHandler from './interfaces/DiscordCommandHandler'

export const hasEncounteredError: MutableWrapper<boolean> = new MutableWrapper(
  false
)

export const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
})

export let adminDM: DMChannel
let intervalId: NodeJS.Timeout
let commands: DiscordCommandHandler

client.on('interactionCreate', async (interaction: Interaction) => {
  if (!interaction.isChatInputCommand() || interaction.guildId == null) {
    return
  }
  try {
    console.log('command triggered', interaction.commandName)
    const command =
      commands[interaction.commandName as keyof DiscordCommandHandler]
    if (command != undefined) {
      await interaction.reply({
        content: 'working on it...',
        ephemeral: true,
      })
      const calledChannel: NotificationChannel = {
        guildID: interaction.guildId,
        channelID: interaction.channelId,
      }
      await command.callback(interaction, calledChannel)
    } else {
      await interaction.reply('command not found')
    }
  } catch (e) {
    console.error('error occured', e)
    if (e instanceof Error) {
      adminDM.send('error: ' + (e as Error).stack)
    } else {
      adminDM.send('unknown error')
    }
    await interaction.editReply('Error occured!')
  }
})

client.on('ready', async () => {
  console.log('Server started at ' + formatDateToBangkok(new Date()))
  adminDM = await client.users.createDM(env.ADMIN_USER_ID)
  adminDM.send('server is up!')

  if (await updateHandler()) {
    intervalId = setInterval(updateHandler, env.DELAY * 1000)
  }
})

/**
 * @description do something before connecting to discord
 */
export async function start() {
  commands = await getCommands()
  await registerCommands(commands)

  // let channels = await db.getAllChannels();
  console.log(commands)
  client.login(env.DISCORD_TOKEN)
}

export function getIntervalId() {
  return intervalId
}
