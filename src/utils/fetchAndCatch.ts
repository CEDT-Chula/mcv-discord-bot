import { option } from 'fp-ts'
import env from '../env/env'
import { hasEncounteredError } from '../server'
import errorFetchingNotify from './errorFetchingNotify'
import { NotifyMessage } from '../config/config'

/**
 * @throws {InvalidCookieError}
 */
export default async function fetchAndCatch(
  url: string,
  method: string,
  body?: BodyInit
): Promise<option.Option<Response>> {
  const response = await fetch(url, {
    method: method,
    headers: {
      Cookie: env.COOKIE,
    },
    body: body,
  }).catch(async (_e) => {
    if (hasEncounteredError.value) {
      return
    }
    hasEncounteredError.value = true
    await errorFetchingNotify(NotifyMessage.FetchingError)
  })
  if (response == undefined) {
    return option.none
  }
  if (response.status != 200) {
    if (hasEncounteredError.value) {
      return option.none
    }
    console.log(await response.text())
    hasEncounteredError.value = true
    await errorFetchingNotify(NotifyMessage.FetchingError)
    return option.none
  }
  hasEncounteredError.value = false
  return option.some(response)
}
