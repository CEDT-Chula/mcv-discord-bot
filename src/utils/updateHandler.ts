import { DiscordAPIError, TextChannel } from 'discord.js'
import db from '../database/database'
import { updateAll } from '../scraper/updateAll'
import { adminDM, client } from '../server'
import { none, Option, some } from 'fp-ts/lib/Option'

/**
 * @description update assignments and send message to all notification channels
 *  */
export default async function updateHandler(): Promise<Option<boolean>> {
  let messages: Array<string> = []
  try {
    messages = await updateAll()
  } catch (e) {
    console.trace(e)
    return none
  }
  if (messages.length == 0) {
    return some(true)
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
  return some(false)
}
