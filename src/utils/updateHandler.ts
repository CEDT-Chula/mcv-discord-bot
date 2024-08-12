import { TextChannel } from 'discord.js'
import db from '../database/database'
import env from '../env/env'
import { updateAll } from '../scraper/updateAll'
import { client } from '../server'
import formatDateToBangkok from './formatDateToBangkok'
import { none, Option, some } from 'fp-ts/lib/Option'

/**
 * @description update assignments and send message to all notification channels
 *  */
export default async function updateHandler(): Promise<Option<boolean>> {
  if (env.INTERVAL_LOGGING) {
    console.log('new interval started at ' + formatDateToBangkok(new Date()))
  }
  let messages: Array<string> = []
  try {
    messages = await updateAll()
  } catch (e) {
    console.log(e)
    return none
  }
  if (messages.length == 0) {
    return some(true)
  }
  const channels = await db.getAllChannels()
  for (const message of messages) {
    for await (const NotificationChannel of channels) {
      const discordChannel = (await client.channels.fetch(
        NotificationChannel.channelID
      )) as TextChannel
      // adminDM.send(message);
      await discordChannel.send(message)
    }
  }
  return some(false)
}
