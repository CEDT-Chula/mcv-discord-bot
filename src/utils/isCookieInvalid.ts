import { throwErrorToAdmin } from "./throwErrorToAdmin";

export async function isCookieInvalid($: cheerio.Root) {
  if ($("#courseville-login-w-platform-cu-button").length != 0) {
    await throwErrorToAdmin("Cookie is invalid")
    return true;
  }
  return false;
}