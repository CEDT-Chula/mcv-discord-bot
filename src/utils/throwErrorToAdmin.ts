import { adminDM, getIntervalId } from '../server'

export async function throwErrorToAdmin(msg: string) {
  await adminDM.send(msg)
  clearInterval(getIntervalId())
}
