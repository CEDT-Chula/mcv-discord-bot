import { DiscordAPIError, TextChannel } from 'discord.js'
import db from '../database/database'
import { updateAll } from '../scraper/updateAll'
import { adminDM, client } from '../server'

/**
 * @description update assignments and send message to all notification channels
 * return true if there is no new assignments, else false. but if error happens return undefined
 *  */
export default async function updateHandler(): Promise<boolean | undefined> {
  let messages: Array<string> = []
  try {
    messages = await updateAll()
  } catch (e) {
    console.trace(e)
    return undefined
  }
  if (messages.length == 0) {
    return true
  }
  const channels = await db.getAllChannels()
  for (const message of messages) {
    for await (const NotificationChannel of channels) {
      try {
        const discordChannel = (await client.channels.fetch(
          NotificationChannel.channelID
        )) as TextChannel
        await discordChannel.send(message)
      } catch (err) {
        console.trace(err)
        if (!(err instanceof DiscordAPIError)) {
          adminDM.send(JSON.stringify(err))
        }
      }
    }
  }
  return false
}
