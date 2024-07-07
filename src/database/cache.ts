
import NodeCache from "node-cache";
import { Assignment, Course } from "./database";
const cacheOption = {
    stdTTL: 10000, //seconds
    deleteOnExpire: true
}
// const assignmentsRawCache = new NodeCache();
// const coursesRawCache = new NodeCache();

class wrapperCache<T>{
    _rawCache = new NodeCache(cacheOption);
    set(key:string, value: T){
        this._rawCache.set(key,value);
    }
    get(key:string):T|null{
        return this._rawCache.get(key) as T
    }
}

export const assignmentsCache = new wrapperCache<Assignment>();
export const coursesCache = new wrapperCache<Course>();
// export ={assignmentsCache, coursesCache};
