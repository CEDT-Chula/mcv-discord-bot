import { option } from 'fp-ts'
import fetchAndCatch from '../utils/fetchAndCatch'
import { Assignment } from '../database/database'
import * as cheerio from 'cheerio'
import { hasEncounteredError } from '../server'
import errorFetchingNotify from '../utils/errorFetchingNotify'
import LoadMoreAssignmentsResponse from '../interfaces/LoadMoreAssignmentsResponse'
import { NotifyMessage } from '../config/config'
import extractAssignmentsFromCheerio from './extractAssignmentsFromCheerio'

/**
 * @throws {InvalidCookieError}
 */
export default async function scrapeAssignmentsOfPage(
  mcvID: number,
  next: number
): Promise<option.Option<Array<Assignment>>> {
  const optionalResponse = await fetchAndCatch(
    `https://www.mycourseville.com/?q=courseville/ajax/loadmoreassignmentrows`,
    'POST',
    new URLSearchParams({
      cv_cid: mcvID.toString(),
      next: next.toString(),
    })
  )
  if (option.isNone(optionalResponse)) return option.none
  const response = optionalResponse.value
  const resultJson: LoadMoreAssignmentsResponse = await response?.json()

  if (resultJson.status == 0) {
    if (hasEncounteredError.get()) {
      return option.none
    }
    console.log(resultJson)
    hasEncounteredError.set(true)
    await errorFetchingNotify(NotifyMessage.SessionLost)
    return option.none
  }
  hasEncounteredError.set(false)

  const $ = cheerio.load(
    '<html><table><tbody>' + resultJson.data.html + '</tbody></table></html>'
  )

  const assignments = await extractAssignmentsFromCheerio(mcvID, $)

  if (resultJson.all == undefined || resultJson.all !== true) {
    scrapeAssignmentsOfPage(mcvID, next + 5)
  }
  return option.some(assignments)
}
