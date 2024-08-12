global.fetch = jest.fn(async () => {
  return {
    status: 200,
    text: async () => {
      return `
      <html>
        <h2>2023/3</h2>
        <h2>2023/2</h2>
        <h2>2023/1</h2>
      </html>
      `
    },
  }
}) as jest.Mock

jest.mock('@/env/env', () => {
  return {
    COOKIE: 'cookie',
    ERROR_FETCHING_NOTIFICATION: false,
    AUTO_DETERMINE_YEAR_AND_SEMESTER: true,
  }
})

jest.mock('@/server', () => {
  const actualModule = jest.requireActual('@/server')
  return {
    __esModule: true,
    ...actualModule,
    adminDM: {
      send: jest.fn().mockImplementation(() => {}),
    },
    start: jest.fn().mockImplementation(() => {}),
  }
})

jest.mock('@/database/database', () => {
  return {
    __esModule: true,
  }
})

const mockErrorFetchingNotify = jest.fn()
jest.mock('@/utils/errorFetchingNotify', () => ({
  __esModule: true,
  default: mockErrorFetchingNotify,
}))

import fetchAndCatch from '@/utils/fetchAndCatch'
import { determineYearAndSemester } from '@/scraper/determineYearAndSemester'
import { option } from 'fp-ts'
import { targetSemester, targetYear } from '@/config/config'
import responseToCheerio from '@/utils/responseToCheerio'

let $: cheerio.Root
describe('stop notify after encountered error', () => {
  beforeAll(async () => {
    const result = await fetchAndCatch(`https://www.mycourseville.com/`,"GET");
    const optionalCheerioRoot = await responseToCheerio(result);
    expect(option.isSome(optionalCheerioRoot));
    if (option.isNone(optionalCheerioRoot)) {
      return
    }
    $ = optionalCheerioRoot.value
  })

  test('', async () => {
    determineYearAndSemester($)
    expect(targetYear.value).toBe(2023)
    expect(targetSemester.value).toBe(3)
  })
})
