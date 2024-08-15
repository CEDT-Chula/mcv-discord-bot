jest.mock('@/env/env')

// jest.mock("@prisma/client",()=>({
//   __esModule: true,
//   default: mockDeep<PrismaClient>(),
// }))
import { mockDeep } from 'jest-mock-extended'
import { PrismaClient } from '@prisma/client'

let mockPrismaClient = mockDeep<PrismaClient>()
jest.mock('@/database/prisma', () => ({
  __esModule: true,
  default: mockPrismaClient,
}))

import db, { Assignment, Course } from '@/database/database'
import { assignmentsCache, coursesCache } from '@/database/cache'

describe('test assignment', () => {
  let assignmentCacheSetSpy = jest.spyOn(assignmentsCache, 'set')
  let assignmentCacheGetSpy = jest.spyOn(assignmentsCache, 'get')
  let returnAssignment: any = {}
  const assignment456 = {
    mcvCourseID: 123,
    assignmentID: 456,
    assignmentName: 'งานที่ 1',
  }

  beforeAll(() => {
    mockPrismaClient.assignment.create.mockImplementation(
      () => returnAssignment
    )
  })

  beforeEach(() => {
    jest.clearAllMocks()
    assignmentsCache._rawCache.flushAll()
  })

  it('cache works', async () => {
    returnAssignment = assignment456
    await db.saveAssignment(assignment456)

    expect(mockPrismaClient.assignment.create).toHaveBeenCalledTimes(1)
    expect(assignmentCacheSetSpy).toHaveBeenCalledTimes(1)
    expect(assignmentCacheGetSpy).toHaveBeenCalledTimes(0)

    jest.clearAllMocks()

    let result = await db.assignmentExists(assignment456)

    expect(result).toBe(true)
    expect(mockPrismaClient.assignment.findFirst).toHaveBeenCalledTimes(0)
    expect(assignmentCacheGetSpy).toHaveBeenCalledTimes(1)
    expect(assignmentCacheSetSpy).toHaveBeenCalledTimes(0)
  })

  it('assignment exists after assignment name is changed', async () => {
    returnAssignment = assignment456
    await db.saveAssignment(assignment456)

    expect(mockPrismaClient.assignment.create).toHaveBeenCalledTimes(1)
    expect(assignmentCacheSetSpy).toHaveBeenCalledTimes(1)
    expect(assignmentCacheGetSpy).toHaveBeenCalledTimes(0)

    jest.clearAllMocks()

    let updatedAssignment456: Assignment = {
      ...assignment456,
      assignmentName: '123',
    }
    let result = await db.assignmentExists(updatedAssignment456)

    expect(result).toBe(true)
    expect(mockPrismaClient.assignment.findFirst).toHaveBeenCalledTimes(0)
    expect(assignmentCacheGetSpy).toHaveBeenCalledTimes(1)
    expect(assignmentCacheSetSpy).toHaveBeenCalledTimes(0)
  })

  it("assignment doesn't exists", async () => {
    let result = await db.assignmentExists(assignment456)

    expect(result).toBe(false)
    expect(mockPrismaClient.assignment.findFirst).toHaveBeenCalledTimes(1)
    expect(assignmentCacheGetSpy).toHaveBeenCalledTimes(1)
    expect(assignmentCacheSetSpy).toHaveBeenCalledTimes(0)
  })
})

describe('test course', () => {
  let courseCacheSetSpy = jest.spyOn(coursesCache, 'set')
  let courseCacheGetSpy = jest.spyOn(coursesCache, 'get')
  let returnedCourse: any = {}
  const course123: Course = {
    mcvID: 123,
    courseID: '210112',
    title: 'how to tickroll',
    year: 2023,
    semester: 2,
  }

  beforeAll(() => {
    mockPrismaClient.course.create.mockImplementation(() => returnedCourse)
  })

  beforeEach(() => {
    jest.clearAllMocks()
    coursesCache._rawCache.flushAll()
  })

  it('cache works', async () => {
    returnedCourse = course123
    await db.saveCourse(course123)

    expect(mockPrismaClient.course.create).toHaveBeenCalledTimes(1)
    expect(courseCacheSetSpy).toHaveBeenCalledTimes(1)
    expect(courseCacheGetSpy).toHaveBeenCalledTimes(0)

    jest.clearAllMocks()

    let result = await db.courseExists(course123)

    expect(result).toBe(true)
    expect(mockPrismaClient.assignment.findFirst).toHaveBeenCalledTimes(0)
    expect(courseCacheGetSpy).toHaveBeenCalledTimes(1)
    expect(courseCacheSetSpy).toHaveBeenCalledTimes(0)
  })

  it('course exists', async () => {
    returnedCourse = course123
    await db.saveCourse(course123)

    expect(mockPrismaClient.course.create).toHaveBeenCalledTimes(1)
    expect(courseCacheSetSpy).toHaveBeenCalledTimes(1)
    expect(courseCacheGetSpy).toHaveBeenCalledTimes(0)

    jest.clearAllMocks()

    let updatedCourse123: Course = {
      ...course123,
      courseID: '123',
    }
    let result = await db.courseExists(updatedCourse123)

    expect(result).toBe(true)
    expect(mockPrismaClient.course.findFirst).toHaveBeenCalledTimes(0)
    expect(courseCacheGetSpy).toHaveBeenCalledTimes(1)
    expect(courseCacheSetSpy).toHaveBeenCalledTimes(0)
  })

  it("course doesn't exists", async () => {
    let result = await db.courseExists(course123)

    expect(result).toBe(false)
    expect(mockPrismaClient.course.findFirst).toHaveBeenCalledTimes(1)
    expect(courseCacheGetSpy).toHaveBeenCalledTimes(1)
    expect(courseCacheSetSpy).toHaveBeenCalledTimes(0)
  })
})
