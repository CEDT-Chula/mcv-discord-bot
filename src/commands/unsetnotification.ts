import { ChatInputCommandInteraction, CacheType } from 'discord.js'
import db, { NotificationChannel } from '../database/database'
export default {
  name: 'unsetnotification',
  description: 'Unset this NotificationChannel for MyCourseVille notification',
  callback: async (
    interaction: ChatInputCommandInteraction<CacheType>,
    calledChannel: NotificationChannel
  ) => {
    try {
      await db.unsetChannelOfGuild(calledChannel.guildID)
      await interaction.editReply(
        'Successfully stop notification in this NotificationChannel'
      )
      return
    } catch {
      await interaction.editReply(
        'An error occurred, are you sure this server has notification NotificationChannel?'
      )
      return
    }
  },
}
