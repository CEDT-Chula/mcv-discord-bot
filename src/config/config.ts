import MutableWrapper from '../utils/MutableWrapper'

export const targetYear: MutableWrapper<number | undefined> =
  new MutableWrapper(undefined)
export const targetSemester: MutableWrapper<number | undefined> =
  new MutableWrapper(undefined)

export enum NotifyMessage {
  FetchingError = 'Error fetching, Might be rate limited or server is down',
  SessionLost = 'Session lost',
}
