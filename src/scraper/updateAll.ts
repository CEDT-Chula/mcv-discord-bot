import db, {
  Assignment,
  CourseWithAssignments,
} from '../database/database'
import updateAssignments from './updateAssignments'
import updateCourses from './updateCourses'
import * as option from 'fp-ts/Option'

/**
 * @description update assignments of each course
 * @returns message containing new added assignments
 * @throws {Error}
 */
export async function updateAll(): Promise<string> {
  await updateCourses()
  const coursesList = await db.getAllCoursesOfTargetSemester()
  const unfilteredCoursesWithAssignments: Array<CourseWithAssignments> =
    await Promise.all(
      coursesList.map(async (course) => {
        const newAssignments = await updateAssignments(course.mcvID)
        const newAssignmentsUnwrapped: Assignment[] = option.getOrElse(
          () => [] as Assignment[]
        )(newAssignments)
        const result: CourseWithAssignments = {
          ...course,
          assignments: newAssignmentsUnwrapped,
        }
        return result
      })
    )
  const coursesWithAssignments = unfilteredCoursesWithAssignments.filter(
    (course) => {
      return course.assignments.length != 0
    }
  )
  if (coursesWithAssignments.length == 0) {
    return ''
  }
  let message: string = '## New Assignments!!'
  for (const course of coursesWithAssignments) {
    message += `\n- ${course.title}`
    for (const assignment of course.assignments) {
      message += `\n - [${assignment.assignmentName}](https://www.mycourseville.com/?q=courseville/worksheet/${course.mcvID}/${assignment.assignmentID})`
    }
  }
  return message
}
