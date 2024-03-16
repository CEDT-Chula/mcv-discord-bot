import NodeCache from "node-cache";
const cacheOption = {
    stdTTL: 10000, //seconds
    deleteOnExpire: true
}
export const assignmentsCache = new NodeCache();
export const coursesCache = new NodeCache();

// export ={assignmentsCache, coursesCache};
