import { ChatInputCommandInteraction, CacheType, TextChannel } from 'discord.js'
import { updateAll } from '../scraper/updateAll'
import { client } from '../server'
import db, { NotificationChannel } from '../database/database'

export default {
  name: 'update',
  description: 'Update assignments list to notification NotificationChannel',
  callback: async (
    interaction: ChatInputCommandInteraction<CacheType>,
    _calledChannel: NotificationChannel
  ) => {
    const result = await updateAll()
    if (result != '' && result != undefined) {
      const notificationChannel = await db.getChannelOfGuild(
        interaction.guildId!
      )
      if (notificationChannel == null) {
        await interaction.editReply(
          'There is no notification NotificationChannel in this server.'
        )
        return
      }
      const discordChannel = (await client.channels.fetch(
        notificationChannel.channelID
      )) as TextChannel
      discordChannel.send(result)
      await interaction.editReply('Done!')
      return
    } else {
      await interaction.editReply('Assignments are up to date!')
      return
    }
  },
}
