import { option } from 'fp-ts'
import InvalidCookieError from './InvalidCookieError'
import { isCookieInvalid } from './isCookieInvalid'
import * as cheerio from 'cheerio'

export default async function responseToCheerio(
  optionalResponse: option.Option<Response>
): Promise<option.Option<cheerio.Root>> {
  if (option.isNone(optionalResponse)) {
    return option.none
  }

  const responseText = await optionalResponse.value.text()

  const $ = cheerio.load(responseText)
  if (await isCookieInvalid($)) {
    throw new InvalidCookieError('InvalidCookie')
  }
  return option.some($)
}
