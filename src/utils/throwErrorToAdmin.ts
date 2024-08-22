import { adminDM, intervalId } from '../server'

export async function throwErrorToAdmin(msg: string) {
  await adminDM.send(msg)
  clearInterval(intervalId.value)
}
