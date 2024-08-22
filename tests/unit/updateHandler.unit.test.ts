import db, { NotificationChannel } from '@/database/database'
import { updateAll } from '@/scraper/updateAll'
import { adminDM, client } from '@/server'
import updateHandler from '@/utils/updateHandler'
import { DiscordAPIError } from 'discord.js'

jest.mock("@/env/env", ()=>{});
jest.mock('@/server', () => {
  return {
    client: {
      channels: {
        fetch: jest.fn(),
      },
    },
    adminDM: {
      send: jest.fn(),
    },
  }
})
jest.mock('@/server')
jest.mock('@/scraper/updateAll')
jest.mock('@/database/database', () => {
  return {
    getAllChannels: jest.fn(),
  }
})

describe('catch discord error', () => {
  let channels: NotificationChannel[]
  let error: any
  let messages: string[]

  beforeAll(() => {
    ;(updateAll as jest.Mock).mockImplementation(() => {
      return messages
    })
    ;(db.getAllChannels as jest.Mock).mockImplementation(() => {
      return channels
    })
    ;(client.channels.fetch as jest.Mock).mockImplementation(() => {
      throw error
    })
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('discord error', async () => {
    channels = [
      {
        guildID: '123',
        channelID: '456',
      },
    ]

    error = new DiscordAPIError(
      {
        code: 50001,
        errors: {},
        message: '',
      },
      50001,
      403,
      'GET',
      '',
      {}
    )

    messages = ['g']

    await updateHandler()

    expect(adminDM.send).toHaveBeenCalledTimes(0)
  })

  it('non-discord error', async () => {
    channels = [
      {
        guildID: '123',
        channelID: '456',
      },
    ]

    error = 'gg'

    messages = ['g']

    await updateHandler()

    expect(adminDM.send).toHaveBeenCalledTimes(1)
  })
})
