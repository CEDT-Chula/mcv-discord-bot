import { option } from "fp-ts";
import env from "../env/env";
import { hasEncounteredError } from "../server";
import errorFetchingNotify from "./errorFetchingNotify";
import * as cheerio from "cheerio"
import { isCookieInvalid } from "./isCookieInvalid";
import InvalidCookieError from "./InvalidCookieError";

/** 
 * @throws {InvalidCookieError}
 */
export default async function fetchAndCatch(url: string): Promise<option.Option<cheerio.Root>>{
  let response = await fetch(url, {
    method: "GET",
    headers: {
      Cookie: env.COOKIE
    }
  }).catch(async (e) => {
    if (hasEncounteredError.get()) {
      return;
    }
    hasEncounteredError.set(true);
    await errorFetchingNotify("Error fetching, Might be rate limited or server is down")
  })
  if (response == undefined) {
    return option.none;
  }
  const responseText = await response.text()
  // if error is first time -> notify
  if (response.status != 200) {
    if (hasEncounteredError.get()) {
      return option.none;
    }
    console.log(responseText)
    hasEncounteredError.set(true);
    await errorFetchingNotify("Error fetching, Might be rate limited or server is down")
    return option.none;
  }
  hasEncounteredError.set(false);

  const $ = cheerio.load(responseText);
  if (await isCookieInvalid($)) {
    throw new InvalidCookieError("InvalidCookie")
  }
  return option.some($);
}