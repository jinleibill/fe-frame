/**
 * 统计数组每项的个数
 *
 * 比如: [A,B,A,C]
 * {
 *     A: 2,
 *     B: 1,
 *     C: 1,
 * }
 *
 * @param array
 * @returns {Map<any, any>}
 */
export function makeCountMap(array) {
    const map = new Map()

    for (const item of array) {
        map.set(item, (map.get(item) || 0) + 1)
    }

    return map
}

/**
 * 两个 map 差集
 * 比如：
 * const oldMap = new Map([
 *     ['a', 1],
 *     ['b', 2],
 *     ['c', 2],
 * ])
 * const newMap = new Map([
 *     ['a', 1],
 *     ['b', 4],
 *     ['c', 1]
 * ])
 * {
 *     added: ['c'], removed: ['c'], updated: ['b']
 * }
 *
 * @param oldMap
 * @param newMap
 * @returns {{removed: unknown[], added: unknown[], updated: unknown[]}}
 */
export function mapsDiff(oldMap, newMap) {
    const oldKeys = Array.from(oldMap.keys())
    const newKeys = Array.from(newMap.keys())

    return {
        added: newKeys.filter((key) => !oldMap.has(key)),
        removed: oldKeys.filter((key) => !newMap.has(key)),
        updated: newKeys.filter(
            (key) => oldMap.has(key) && oldMap.get(key) !== newMap.get(key),
        )
    }
}