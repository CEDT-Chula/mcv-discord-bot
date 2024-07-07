import { ChatInputCommandInteraction, CacheType } from 'discord.js'
import db, { NotificationChannel } from '../database/database'

export default {
  name: 'setnotification',
  description: 'Set this NotificationChannel for MyCourseVille notification',
  callback: async (
    interaction: ChatInputCommandInteraction<CacheType>,
    calledChannel: NotificationChannel
  ) => {
    const found = await db.channelOfGuildExists(calledChannel)
    if (found) {
      await interaction.editReply(
        `This server's notification NotificationChannel has already been set!\nTo disable: /unsetnotification`
      )
      return
    }

    db.saveChannel(calledChannel)
    await interaction.editReply('Done!')
  },
}
