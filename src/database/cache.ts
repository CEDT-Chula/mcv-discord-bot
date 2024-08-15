import NodeCache from 'node-cache'
import { Assignment, Course } from './database'
const cacheOption = {
  stdTTL: 10000, //seconds
  deleteOnExpire: true,
}

class WrapperCache<T> {
  _rawCache = new NodeCache(cacheOption)
  set(key: string, value: T) {
    this._rawCache.set(key, value)
  }
  get(key: string): T | null {
    return this._rawCache.get(key) as T
  }
}

export const assignmentsCache = new WrapperCache<Assignment>()
export const coursesCache = new WrapperCache<Course>()
