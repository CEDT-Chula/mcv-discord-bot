// jest.mock("@/scraper/updateAll")
const mockScrapeAssignmentsOfPage = jest.fn()
const mockExtractAssignmentsFromCheerio = jest.fn()
const mockFetchAndCatch = jest.fn()
const mockResponseToCheerio = jest.fn()

jest.mock('@/env/env', () => {
  return {}
})

jest.mock('@/utils/fetchAndCatch', () => {
  return {
    __esModule: true,
    default: mockFetchAndCatch,
  }
})

jest.mock('@/utils/responseToCheerio', () => {
  return {
    __esModule: true,
    default: mockResponseToCheerio,
  }
})

jest.mock('@/scraper/scrapeAssignmentsOfPage', () => {
  return {
    __esModule: true,
    default: mockScrapeAssignmentsOfPage,
  }
})

jest.mock('@/scraper/extractAssignmentsFromCheerio', () => {
  return {
    __esModule: true,
    default: mockExtractAssignmentsFromCheerio,
  }
})

import { Assignment } from '@/database/database'
import { updateAll } from '@/scraper/updateAll'
import updateAssignmentsOfCourse from '@/scraper/updateAssignmentsOfCourse'
import { Course } from '@prisma/client'
describe('updateAll', () => {
  let fetchAndCatchResponse: string
  let coursesFromUpdate: Course[] = []
  let assignmentsOfCourseFromUpdate: Record<string, Assignment[]> = {}

  let hasNext: boolean = false
  let scrapedAssignmentCourseId: number = 0
  let scrapedAssignments: Assignment[] = []

  const updateAllSpy = jest.fn(updateAll)
  const course123 = {
    mcvID: 123,
    courseID: '2111031',
    title: 'How to Rickroll 101',
    year: 2023,
    semester: 2,
  }
  const course540 = {
    mcvID: 540,
    courseID: '2111032',
    title: 'How to Make Mcv bot 101',
    year: 2023,
    semester: 2,
  }

  const assignment456 = {
    mcvCourseID: 123,
    assignmentID: 456,
    assignmentName: 'งานที่ 1',
  }

  const assignment789 = {
    mcvCourseID: 540,
    assignmentID: 789,
    assignmentName: 'งาน',
  }

  beforeAll(() => {
    mockFetchAndCatch.mockImplementation(() => undefined)
    mockResponseToCheerio.mockImplementation(() => 1)
    mockExtractAssignmentsFromCheerio.mockImplementation(() => {
      return [123, assignment456]
    })
    mockScrapeAssignmentsOfPage.mockImplementation(() => {
      return [hasNext, scrapedAssignmentCourseId, scrapedAssignments]
    })
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('Unexpected course id', async () => {
    hasNext = false
    scrapedAssignmentCourseId = 540
    scrapedAssignments = [assignment789]
    const result = Array.from((await updateAssignmentsOfCourse(123))!.entries())
    const expected = [
      [123, assignment456],
      [540, [assignment789]],
    ]
    expect(result).toEqual(expected)
  })
})

function assertAndExpect(
  result: unknown,
  expected: string[],
  updateAllSpy: jest.Mock
) {
  for (const expectedStr of expected) {
    expect([...expectedStr].length).toBeLessThanOrEqual(2000)
  }
  expect(result).toEqual(expected)
  expect(updateAllSpy).toHaveBeenCalledTimes(1)
}
