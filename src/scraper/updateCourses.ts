import env from '../env/env'
import { targetYear, targetSemester } from '../config/config'
import db, { Course } from '../database/database'
import fetchAndCatch from '../utils/fetchAndCatch'
import { determineYearAndSemester } from './determineYearAndSemester'
import responseToCheerio from '../utils/responseToCheerio'
import {
  ParsedGetCoursesResponse,
  getCoursesResponseSchema,
} from '@/interfaces/GetCoursesResponse'
import { throwErrorToAdmin } from '@/utils/throwErrorToAdmin'

/**
 * @throws {InvalidCookieError}
 */
export default async function updateCourses(): Promise<void> {
  async function sendToDb(course: ParsedGetCoursesResponse['data'][number]) {
    const dbCourse: Course = {
      year: course.year,
      semester: course.semester,
      courseID: course.course_no,
      mcvID: course.cv_cid,
      title: course.title,
    }
    const found = await db.courseExists(dbCourse)
    if (!found) {
      await db.saveCourse(dbCourse)
    }
  }

  if (env.AUTO_DETERMINE_YEAR_AND_SEMESTER) {
    const result = await fetchAndCatch(`https://www.mycourseville.com/`, 'GET')
    const cheerioRootResponse = await responseToCheerio(result)

    if (cheerioRootResponse == undefined) {
      return
    }
    const $ = cheerioRootResponse
    determineYearAndSemester($)
  }

  const body = new FormData()
  body.append('yearsem', `${targetYear.value}/${targetSemester.value}`)
  body.append('role', 'student')
  body.append('type', 'course')

  const result = await fetchAndCatch(
    `https://www.mycourseville.com/courseville/ajax/cvhomepanel_get_filter`,
    'POST',
    body
  )

  const resultObj = await result?.json()
  if (resultObj==null){
    console.warn(`Found ${resultObj} while reading courses`)
    return;
  }

  try {
    const response = getCoursesResponseSchema.parse(resultObj)

    const tasks = []
    for (let course of response.data) {
      tasks.push(sendToDb(course))
    }
    await Promise.all(tasks)
  } catch (err) {
    console.error(`error while validating response: `, err)
    if (err instanceof Object && 'stack' in err) {
      await throwErrorToAdmin(`error while validating response: ` + err.stack)
    }
  }
}
