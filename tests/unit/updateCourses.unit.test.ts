global.fetch = jest.fn();

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

const mockErrorFetchingNotify = jest.fn()
jest.mock('@/utils/errorFetchingNotify', () => ({
  __esModule: true,
  default: mockErrorFetchingNotify,
}))

import updateCourses from '@/scraper/updateCourses'
import { hasEncounteredError } from '@/server'

describe('stop notify after encountered error', () => {
  beforeAll(()=>{
    (global.fetch as jest.Mock).mockImplementation((async () => {
      throw new Error('')
    }))
  })
  beforeEach(() => {
    hasEncounteredError.value=false
    mockErrorFetchingNotify.mockClear()
  })

  test('run twice', async () => {
    await updateCourses()
    await updateCourses()
    expect(mockErrorFetchingNotify).toHaveBeenCalledTimes(1)
  })

  test('already encountered', async () => {
    hasEncounteredError.value=true
    expect(hasEncounteredError.value).toBe(true)
    await updateCourses()
    expect(mockErrorFetchingNotify).not.toHaveBeenCalled()
  })
})
