import { env } from "process";
import { adminDM } from "../server";

export async function errorFetchingNotify(message: string) {
  if (env.ERROR_FETCHING_NOTIFICATION) {
    await adminDM.send("Error fetching, Might be rate limited or server is down")
  }
}