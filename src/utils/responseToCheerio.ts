import InvalidCookieError from './InvalidCookieError'
import { isCookieInvalid } from './isCookieInvalid'
import * as cheerio from 'cheerio'

export default async function responseToCheerio(
  response: Response | undefined
): Promise<cheerio.Root | undefined> {
  if (response == undefined) {
    return undefined
  }

  const responseText = await response.text()

  const $ = cheerio.load(responseText)
  if (await isCookieInvalid($)) {
    throw new InvalidCookieError('InvalidCookie')
  }
  return $
}
