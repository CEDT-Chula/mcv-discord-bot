import { Assignment } from '../database/database'
import fetchAndCatch from '../utils/fetchAndCatch'
import responseToCheerio from '../utils/responseToCheerio'
import extractAssignmentsFromCheerio from './extractAssignmentsFromCheerio'
import scrapeAssignmentsOfPage from './scrapeAssignmentsOfPage'

/**
 * @throws {InvalidCookieError}
 */
export default async function updateAssignmentsOfCourse(
  mcvID: number
): Promise<Map<number, Array<Assignment>> | undefined> {
  const result = await fetchAndCatch(
    `https://www.mycourseville.com/?q=courseville/course/${mcvID}/assignment`,
    'GET'
  )
  const cheerioRootResponse = await responseToCheerio(result)
  if (cheerioRootResponse == undefined) {
    return undefined
  }
  const mergedNewAssignments: Map<number, Array<Assignment>> = new Map()

  let foundCourseIdAndAssignments =
    await extractAssignmentsFromCheerio(cheerioRootResponse)

  if (foundCourseIdAndAssignments == undefined) {
    return undefined
  }
  const [foundMcvId, assignments] = foundCourseIdAndAssignments
  if (assignments.length != 0) {
    mergedNewAssignments.set(foundMcvId, assignments)
  }

  let hasNext = true
  for (let currentAssignmentItems = 5; hasNext; currentAssignmentItems += 5) {
    const scrapeResult = await scrapeAssignmentsOfPage(currentAssignmentItems)

    if (scrapeResult == undefined) {
      break
    }

    const [resultHasNext, resultMcvId, resultAssignments] = scrapeResult

    hasNext = resultHasNext
    if (resultAssignments.length == 0) {
      continue
    }
    if (!mergedNewAssignments.has(resultMcvId)) {
      mergedNewAssignments.set(resultMcvId, resultAssignments)
    } else {
      const found = mergedNewAssignments.get(resultMcvId)!
      resultAssignments.forEach(function (v) {
        found.push(v)
      }, found)
    }
  }

  return mergedNewAssignments
}
