// jest.mock("@/scraper/updateAll")
const mockGetAllCoursesOfTargetSemester = jest.fn()
const mockUpdateAssignments = jest.fn()
jest.mock('@/scraper/updateCourses')

jest.mock('@/database/database', () => {
  return {
    getAllCoursesOfTargetSemester: mockGetAllCoursesOfTargetSemester,
  }
})

jest.mock('@/scraper/updateAssignments', () => {
  return {
    __esModule: true,
    default: mockUpdateAssignments,
  }
})

import { Assignment } from '@/database/database'
import { updateAll } from '@/scraper/updateAll'
import { Course } from '@prisma/client'
import { none, some } from 'fp-ts/lib/Option'
import assert from 'assert'
describe('updateAll', () => {
  let coursesFromUpdate: Course[] = []
  let assignmentsOfCourseFromUpdate: Record<number, Assignment[]> = {}
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

  beforeAll(() => {
    mockGetAllCoursesOfTargetSemester.mockImplementation(
      () => coursesFromUpdate
    )
    mockUpdateAssignments.mockImplementation((mcvId: number) => {
      const assignments = assignmentsOfCourseFromUpdate[mcvId]
      if (assignments != undefined) {
        return some(assignments)
      } else {
        return none
      }
    })
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('normal', async () => {
    coursesFromUpdate = [course123]
    assignmentsOfCourseFromUpdate = {
      123: [
        {
          mcvCourseID: 123,
          assignmentID: 456,
          assignmentName: 'งานที่ 1',
        },
      ],
    }
    const result = await updateAllSpy()
    const expected: string[] = [
      '## New Assignments!!' +
        '\n- How to Rickroll 101' +
        `\n - [งานที่ 1](https://www.mycourseville.com/?q=courseville/worksheet/123/456)`,
    ]
    assertAndExpect(result, expected, updateAllSpy)
  })

  it('2 courses', async () => {
    coursesFromUpdate = [course123, course540]
    assignmentsOfCourseFromUpdate = {
      123: [
        {
          mcvCourseID: 123,
          assignmentID: 456,
          assignmentName: 'งานที่ 1',
        },
      ],
      540: [
        {
          mcvCourseID: 540,
          assignmentID: 456,
          assignmentName: 'งานที่ 1 นะจ๊ะ',
        },
      ],
    }
    const result = await updateAllSpy()
    const expected: string[] = [
      '## New Assignments!!' +
        '\n- How to Rickroll 101' +
        `\n - [งานที่ 1](https://www.mycourseville.com/?q=courseville/worksheet/123/456)`+
        '\n- How to Make Mcv bot 101' +
        `\n - [งานที่ 1 นะจ๊ะ](https://www.mycourseville.com/?q=courseville/worksheet/540/456)`,
    ]
    assertAndExpect(result, expected, updateAllSpy)
  })

  it('no new courses', async () => {
    coursesFromUpdate = []
    assignmentsOfCourseFromUpdate = {}
    const result = await updateAllSpy()
    const expected: string[] = []
    assertAndExpect(result, expected, updateAllSpy)
  })

  it('no new assignments', async () => {
    coursesFromUpdate = [course123]
    assignmentsOfCourseFromUpdate = {}
    const result = await updateAllSpy()
    const expected: string[] = []
    assertAndExpect(result, expected, updateAllSpy)
  })

  it('exceed limit in the same course', async () => {
    coursesFromUpdate = [course123]
    assignmentsOfCourseFromUpdate = {
      123: [
        {
          mcvCourseID: 123,
          assignmentID: 456,
          assignmentName: 'ก'.repeat(850),
        },
        {
          mcvCourseID: 123,
          assignmentID: 789,
          assignmentName: 'ข'.repeat(850),
        },
        {
          mcvCourseID: 123,
          assignmentID: 150,
          assignmentName: 'ค'.repeat(850),
        },
      ],
    }
    const result = await updateAllSpy()
    const expected = [
      '## New Assignments!!' +
        '\n- How to Rickroll 101' +
        `\n - [${'ก'.repeat(850)}](https://www.mycourseville.com/?q=courseville/worksheet/123/456)` +
        `\n - [${'ข'.repeat(850)}](https://www.mycourseville.com/?q=courseville/worksheet/123/789)`,

      '## New Assignments!!' +
        '\n- How to Rickroll 101' +
        `\n - [${'ค'.repeat(850)}](https://www.mycourseville.com/?q=courseville/worksheet/123/150)`,
    ]
    assertAndExpect(result,expected,updateAllSpy);
  })

  it('exceed limit in the same course: edge case: 2000 chars after ข', async () => {
    coursesFromUpdate = [course123]
    assignmentsOfCourseFromUpdate = {
      123: [
        {
          mcvCourseID: 123,
          assignmentID: 456,
          assignmentName: 'ก'.repeat(850),
        },
        {
          mcvCourseID: 123,
          assignmentID: 789,
          assignmentName: 'ข'.repeat(968),
        },
        {
          mcvCourseID: 123,
          assignmentID: 150,
          assignmentName: 'ค'.repeat(850),
        },
      ],
    }
    const result = await updateAllSpy()
    const expected = [
      '## New Assignments!!' +
        '\n- How to Rickroll 101' +
        `\n - [${'ก'.repeat(850)}](https://www.mycourseville.com/?q=courseville/worksheet/123/456)` +
        `\n - [${'ข'.repeat(968)}](https://www.mycourseville.com/?q=courseville/worksheet/123/789)`,

      '## New Assignments!!' +
        '\n- How to Rickroll 101' +
        `\n - [${'ค'.repeat(850)}](https://www.mycourseville.com/?q=courseville/worksheet/123/150)`,
    ]
    assertAndExpect(result, expected, updateAllSpy)
  })

  it('exceed limit in the same course: edge case: 2001 chars after ข', async () => {
    coursesFromUpdate = [course123]
    assignmentsOfCourseFromUpdate = {
      123: [
        {
          mcvCourseID: 123,
          assignmentID: 456,
          assignmentName: 'ก'.repeat(850),
        },
        {
          mcvCourseID: 123,
          assignmentID: 789,
          assignmentName: 'ข'.repeat(969),
        },
        {
          mcvCourseID: 123,
          assignmentID: 150,
          assignmentName: 'ค'.repeat(849),
        },
      ],
    }
    const result = await updateAllSpy()
    const expected = [
      '## New Assignments!!' +
        '\n- How to Rickroll 101' +
        `\n - [${'ก'.repeat(850)}](https://www.mycourseville.com/?q=courseville/worksheet/123/456)`,

      '## New Assignments!!' +
        '\n- How to Rickroll 101' +
        `\n - [${'ข'.repeat(969)}](https://www.mycourseville.com/?q=courseville/worksheet/123/789)` +
        `\n - [${'ค'.repeat(849)}](https://www.mycourseville.com/?q=courseville/worksheet/123/150)`,
    ]
    for (const expectedStr of expected) {
      assert.equal([...expectedStr].length <= 2000, true)
    }
    assertAndExpect(result, expected, updateAllSpy)
  })

  it('exceed limit in the different course', async () => {
    coursesFromUpdate = [course123, course540]
    assignmentsOfCourseFromUpdate = {
      123: [
        {
          mcvCourseID: 123,
          assignmentID: 456,
          assignmentName: 'ก'.repeat(850),
        },
        {
          mcvCourseID: 123,
          assignmentID: 789,
          assignmentName: 'ข'.repeat(850),
        },
      ],
      540: [
        {
          mcvCourseID: 540,
          assignmentID: 150,
          assignmentName: 'ค'.repeat(850),
        },
      ],
    }
    const result = await updateAllSpy()
    const expected = [
      '## New Assignments!!' +
        '\n- How to Rickroll 101' +
        `\n - [${'ก'.repeat(850)}](https://www.mycourseville.com/?q=courseville/worksheet/123/456)` +
        `\n - [${'ข'.repeat(850)}](https://www.mycourseville.com/?q=courseville/worksheet/123/789)`,

      '## New Assignments!!' +
        '\n- How to Make Mcv bot 101' +
        `\n - [${'ค'.repeat(850)}](https://www.mycourseville.com/?q=courseville/worksheet/540/150)`,
    ]
    for (const expectedStr of expected) {
      assert.equal([...expectedStr].length <= 2000, true)
    }
    assertAndExpect(result, expected, updateAllSpy)
  })
})

function assertAndExpect(
  result: unknown,
  expected: unknown,
  updateAllSpy: jest.Mock
) {
  assert.deepEqual(result, expected)
  expect(updateAllSpy).toHaveBeenCalledTimes(1)
}
