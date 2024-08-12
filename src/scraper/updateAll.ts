import {
  ASSIGNMENT_MESSAGE_PATTERN,
  COURSE_MESSAGE_PATTERN,
  MAX_DISCORD_MESSAGE_SIZE,
  NEW_ASSIGNMENTS_MESSAGE,
  NEW_ASSIGNMENTS_MESSAGE_SIZE,
} from '@/config/config'
import db, { Assignment, Course } from '../database/database'
import updateAssignments from './updateAssignments'
import updateCourses from './updateCourses'
import * as option from 'fp-ts/Option'
import MutableWrapper from '@/utils/MutableWrapper'
import { format } from 'util'

/**
 * @description update assignments of each course
 * @returns message containing new added assignments
 * @throws {Error}
 */
export async function updateAll(): Promise<Array<string>> {
  await updateCourses()
  const coursesList = await db.getAllCoursesOfTargetSemester()
  const coursesWithAssignments: Map<Course, Array<Assignment>> = new Map()
  for await (const course of coursesList) {
    const newAssignments: option.Option<Assignment[]> = await updateAssignments(
      course.mcvID
    )
    if (option.isNone(newAssignments) || newAssignments.value.length == 0) {
      continue
    }
    coursesWithAssignments.set(course, newAssignments.value)
  }
  if (coursesWithAssignments.size == 0) {
    return []
  }
  const messages: string[] = []
  const currentMessage: MutableWrapper<string> = new MutableWrapper(
    NEW_ASSIGNMENTS_MESSAGE
  )
  const currentMessageSize: MutableWrapper<number> = new MutableWrapper(
    NEW_ASSIGNMENTS_MESSAGE_SIZE
  )
  for (const [course, assignments] of coursesWithAssignments) {
    // const newCourseLine = `\n- ${course.title}`
    const newCourseLine = format(COURSE_MESSAGE_PATTERN, course.title)
    const newAssignmentLineSize = [...newCourseLine].length
    const hasExceeded =
      currentMessageSize.value + newAssignmentLineSize >
      MAX_DISCORD_MESSAGE_SIZE
    if (hasExceeded) {
      pushAndReinitialize(messages, currentMessage, currentMessageSize)
    }
    currentMessageSize.value += [...newCourseLine].length
    for (const assignment of assignments) {
      // const newAssignmentLine = `\n - [${assignment.assignmentName}](https://www.mycourseville.com/?q=courseville/worksheet/${course.mcvID}/${assignment.assignmentID})`
      const newAssignmentLine = format(
        ASSIGNMENT_MESSAGE_PATTERN,
        assignment.assignmentName,
        course.mcvID,
        assignment.assignmentID
      )
      const newAssignmentLineSize = [...newAssignmentLine].length
      const hasExceeded =
        currentMessageSize.value + newAssignmentLineSize >
        MAX_DISCORD_MESSAGE_SIZE
      const isFirstAssignment = assignments[0] == assignment
      if (hasExceeded) {
        pushAndReinitialize(messages, currentMessage, currentMessageSize)
        currentMessage.value += newCourseLine
        currentMessageSize.value += [...newCourseLine].length
      } else if (isFirstAssignment) {
        currentMessage.value += newCourseLine
      }
      currentMessage.value += newAssignmentLine
      currentMessageSize.value += newAssignmentLineSize
    }
  }
  messages.push(currentMessage.value)
  return messages
}

function pushAndReinitialize(
  messages: string[],
  currentMessage: MutableWrapper<string>,
  currentMessageSize: MutableWrapper<number>
) {
  messages.push(currentMessage.value)
  currentMessage.value = NEW_ASSIGNMENTS_MESSAGE
  currentMessageSize.value = NEW_ASSIGNMENTS_MESSAGE_SIZE
}
