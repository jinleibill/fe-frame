import { describe, expect, test } from 'vitest'
import {makeCountMap, mapsDiff} from "../utils/maps";

describe('map 统计', () => {
    test('空数组', () => {
        expect(makeCountMap([])).toEqual(new Map())
    })

    test('数组中一个项', () => {
        expect(makeCountMap(['A'])).toEqual(new Map([['A', 1]]))
    })

    test('数组中没有重复项', () => {
        expect(makeCountMap(['A', 'B', 'C'])).toEqual(new Map([['A', 1], ['B', 1], ['C', 1]]))
    })

    test('数组中有重复项', () => {
        expect(makeCountMap(['A', 'B', 'A', 'C', 'B', 'B'])).toEqual(new Map([['A', 2], ['B', 3], ['C', 1],]))
    })
})

describe('maps 差集', () => {
    test('空 maps', () => {
        const oldMap = new Map()
        const newMap = new Map()

        expect(mapsDiff(oldMap, newMap)).toEqual({added: [], removed: [], updated: [],})
    })

    test('maps 有相同 key 和 value', () => {
        const oldMap = new Map([['a', 1], ['b', 2], ['c', 3]])
        const newMap = new Map([['a', 1], ['b', 2], ['c', 3],])

        expect(mapsDiff(oldMap, newMap)).toEqual({added: [], removed: [], updated: []})
    })

    test('maps 有不同 value', () => {
        const oldMap = new Map([['a', 1], ['b', 2], ['c', 3]])
        const newMap = new Map([['a', 1], ['b', 4], ['c', 3],])

        expect(mapsDiff(oldMap, newMap)).toEqual({added: [], removed: [], updated: ['b'],})
    })

    test('maps 有不同 key', () => {
        const oldMap = new Map([['a', 1], ['b', 2], ['c', 3]])
        const newMap = new Map([['a', 1], ['b', 2], ['d', 3]])

        expect(mapsDiff(oldMap, newMap)).toEqual({added: ['d'], removed: ['c'], updated: []})
    })
})