import {
  ASSIGNMENT_MESSAGE_PATTERN,
  COURSE_MESSAGE_PATTERN,
  MAX_DISCORD_MESSAGE_SIZE,
  NEW_ASSIGNMENTS_MESSAGE,
  NEW_ASSIGNMENTS_MESSAGE_SIZE,
} from '@/config/config'
import db, { Assignment, Course } from '../database/database'
import updateAssignmentsOfCourse from './updateAssignmentsOfCourse'
import updateCourses from './updateCourses'
import MutableWrapper from '@/utils/MutableWrapper'
import { format } from 'util'

/**
 * @description update assignments of each course
 * @returns message containing new added assignments
 * @throws {Error}
 */
export async function updateAll(): Promise<Array<string>> {
  console.log("updating courses")
  await updateCourses()
  const coursesList = await db.getAllCoursesOfTargetSemester()
  // const coursesWithAssignments: Map<Course, Array<Assignment>> = new Map()
  const mcvIdToCourse: Map<number, Course> = new Map()
  for (let course of coursesList) {
    mcvIdToCourse.set(course.mcvID, course)
  }
  let mcvIdToNewAssignments: Map<number, Array<Assignment>> = new Map()
  console.log("found courses:",coursesList)
  for await (const course of coursesList) {
    const newAssignments = await updateAssignmentsOfCourse(course.mcvID)
    if (newAssignments == undefined || newAssignments.size == 0) {
      continue
    }
    for (let [mcvId, assignments] of newAssignments) {
      if (assignments.length == 0) {
        continue
      }
      if (!mcvIdToNewAssignments.has(mcvId)) {
        mcvIdToNewAssignments.set(mcvId, assignments)
      } else {
        mcvIdToNewAssignments.get(mcvId)!.concat(assignments)
      }
    }
  }

  if (mcvIdToNewAssignments.size == 0) {
    return []
  }
  const messages: string[] = []
  const currentMessage: MutableWrapper<string> = new MutableWrapper(
    NEW_ASSIGNMENTS_MESSAGE
  )
  const currentMessageSize: MutableWrapper<number> = new MutableWrapper(
    NEW_ASSIGNMENTS_MESSAGE_SIZE
  )
  for (const [mcvId, assignments] of mcvIdToNewAssignments.entries()) {
    const courseInformation = mcvIdToCourse.get(mcvId)!
    const newCourseLine = format(
      COURSE_MESSAGE_PATTERN,
      courseInformation.title
    )
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
        assignment.assignmentName == ''
          ? '(Nameless)'
          : assignment.assignmentName,
        mcvId,
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
