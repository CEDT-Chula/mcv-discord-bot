import env from '../env/env'
import { targetYear, targetSemester } from '../config/config'
import * as cheerio from 'cheerio'
import db, { Course } from '../database/database'
import fetchAndCatch from '../utils/fetchAndCatch'
import { option } from 'fp-ts'
import { determineYearAndSemester } from './determineYearAndSemester'
import responseToCheerio from '../utils/responseToCheerio'

/**
 * @throws {InvalidCookieError}
 */
export default async function updateCourses(): Promise<void> {
  const result = await fetchAndCatch(`https://www.mycourseville.com/`, 'GET')
  const optionalCheerioRoot = await responseToCheerio(result)

  if (option.isNone(optionalCheerioRoot)) {
    return
  }
  const $ = optionalCheerioRoot.value

  if (env.AUTO_DETERMINE_YEAR_AND_SEMESTER) {
    determineYearAndSemester($)
  }
  const courseElements: cheerio.Element[] = $(
    `#courseville-courseicongroup-icon-lineup-${targetYear.value}-${targetSemester.value}-join a`
  ).toArray()
  for (let courseElement of courseElements) {
    courseElement = courseElement as cheerio.TagElement
    const course: Course = {
      year: parseInt(courseElement.attribs.year!),
      semester: parseInt(courseElement.attribs.semester!),
      courseID: courseElement.attribs.course_no!,
      mcvID: parseInt(courseElement.attribs.cv_cid!),
      title: courseElement.attribs.title!,
    }
    const found = await db.courseExists(course)
    if (!found) {
      db.saveCourse(course)
    }
  }
}
