import { option } from 'fp-ts'
import env from '../env/env'
import { hasEncounteredError } from '../server'
import errorFetchingNotify from './errorFetchingNotify'
import * as cheerio from 'cheerio'
import { isCookieInvalid } from './isCookieInvalid'
import InvalidCookieError from './InvalidCookieError'

/**
 * @throws {InvalidCookieError}
 */
export default async function fetchPostFormDataAndCatch(
  url: string,
  body: URLSearchParams | undefined
): Promise<option.Option<cheerio.Root>> {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Cookie: env.COOKIE,
    },
    body: JSON.stringify(body),
  }).catch(async (_e) => {
    if (hasEncounteredError.get()) {
      return
    }
    hasEncounteredError.set(true)
    await errorFetchingNotify()
  })
  if (response == undefined) {
    return option.none
  }
  const responseText = await response.text()
  // if error is first time -> notify
  if (response.status != 200) {
    if (hasEncounteredError.get()) {
      return option.none
    }
    console.log(responseText)
    hasEncounteredError.set(true)
    await errorFetchingNotify()
    return option.none
  }
  hasEncounteredError.set(false)

  const $ = cheerio.load(responseText)
  if (await isCookieInvalid($)) {
    throw new InvalidCookieError('InvalidCookie')
  }
  return option.some($)
}
