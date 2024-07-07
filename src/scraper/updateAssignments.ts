import { Assignment } from '../database/database'
import { option } from 'fp-ts'
import fetchAndCatch from '../utils/fetchAndCatch'
import responseToCheerio from '../utils/responseToCheerio'
import extractAssignmentsFromCheerio from './extractAssignmentsFromCheerio'

/**
 * @throws {InvalidCookieError}
 */
export default async function updateAssignments(
  mcvID: number
): Promise<option.Option<Array<Assignment>>> {
  const result = await fetchAndCatch(
    `https://www.mycourseville.com/?q=courseville/course/${mcvID}/assignment`,
    'GET'
  )
  const optionalCheerioRoot = await responseToCheerio(result)
  if (option.isNone(optionalCheerioRoot)) {
    return option.none
  }
  const $ = optionalCheerioRoot.value

  const assignments = await extractAssignmentsFromCheerio(mcvID, $)

  return option.some(assignments)
}
