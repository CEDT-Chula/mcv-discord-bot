import {
  Course as PrismaCourse,
  Assignment as PrismaAssignment,
  NotificationChannel as PrismaNotificationChannel,
} from '@prisma/client'
import { assignmentsCache, coursesCache } from './cache'
import { targetSemester, targetYear } from '../config/config'
import prisma from './prisma'

// eslint-disable-next-line @typescript-eslint/no-namespace
namespace db {
  export async function courseExists(course: Course): Promise<boolean> {
    if (coursesCache.get(indexCourse(course)) !== undefined) {
      return true
    }
    const found = await prisma.course.findFirst({
      where: {
        mcvID: course.mcvID,
      },
    })
    if (found) {
      coursesCache.set(indexCourse(course), course)
    }
    return found != null
  }

  export async function assignmentExists(
    assignment: Assignment
  ): Promise<boolean> {
    if (assignmentsCache.get(indexAssignment(assignment)) !== undefined) {
      return true
    }
    const found = await prisma.assignment.findFirst({
      where: {
        mcvCourseID: assignment.mcvCourseID,
        assignmentID: assignment.assignmentID,
      },
    })
    if (found) {
      assignmentsCache.set(indexAssignment(assignment), found)
    }
    return found != null
  }

  export async function channelOfGuildExists(
    NotificationChannel: NotificationChannel
  ): Promise<boolean> {
    const found = await prisma.notificationChannel.findFirst({
      where: {
        guildID: NotificationChannel.guildID,
      },
    })
    return found != null
  }

  export async function getAllChannels(): Promise<NotificationChannel[]> {
    return await prisma.notificationChannel.findMany()
  }

  export async function getAllCoursesOfTargetSemester(): Promise<Course[]> {
    return await prisma.course.findMany({
      where: {
        year: targetYear.value,
        semester: targetSemester.value,
      },
    })
  }

  export async function getCourse(mcvID: number): Promise<Course | null> {
    const cacheFound = coursesCache.get(mcvID.toString())
    if (cacheFound !== undefined) {
      return cacheFound
    }
    return await prisma.course.findFirst({
      where: {
        mcvID: mcvID,
      },
    })
  }

  export async function getChannelOfGuild(
    guildID: string
  ): Promise<NotificationChannel | null> {
    return await prisma.notificationChannel.findFirst({
      where: {
        guildID,
      },
    })
  }

  export async function saveCourse(obj: Course) {
    // prisma.course.upsert
    const course = await prisma.course.create({
      data: obj,
    })
    if (course != undefined) {
      coursesCache.set(indexCourse(course), course)
    }
  }

  export async function saveAssignment(obj: Assignment) {
    const assignment = await prisma.assignment.create({
      data: obj,
    })
    if (assignment != undefined) {
      assignmentsCache.set(indexAssignment(assignment), assignment)
    }
  }

  export async function saveChannel(obj: NotificationChannel) {
    await prisma.notificationChannel.create({
      data: obj,
    })
  }

  export async function unsetChannelOfGuild(guildID: string) {
    return await prisma.notificationChannel.delete({
      where: {
        guildID,
      },
    })
  }
}

export type NotificationChannel = PrismaNotificationChannel
export type Course = PrismaCourse
export type Assignment = PrismaAssignment
export type CourseWithAssignments = Course & { assignments: Array<Assignment> }

export default db

function indexAssignment(assignment: Assignment): string {
  return assignment.mcvCourseID + '/' + assignment.assignmentID
}

function indexCourse(course: Course): string {
  return course.mcvID.toString()
}
