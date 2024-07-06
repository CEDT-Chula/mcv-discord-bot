import env from "../env/env";
import { adminDM } from "../server";

export default async function errorFetchingNotify(message: string) {
  if (env.ERROR_FETCHING_NOTIFICATION) {
    await adminDM.send("Error fetching, Might be rate limited or server is down")
  }
}