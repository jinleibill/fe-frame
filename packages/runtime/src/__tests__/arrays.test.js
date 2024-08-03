import { describe, expect, test } from 'vitest'
import {arraysDiff, withoutNulls} from "../utils/arrays";

test('过滤数组中的 null', () => {
    expect(withoutNulls([1, 2, null, 3])).toEqual([1,2,3])
})

describe('数组差集', () => {
    test('数组相等', () => {
        const oldArray = [1, 2, 3]
        const newArray = [1, 2, 3]

        expect(arraysDiff(oldArray, newArray)).toEqual({added: [], removed: []})
    })

    test("新增", () => {
        const oldArray = [1, 2, 3]
        const newArray = [1, 2, 3, 4]

        expect(arraysDiff(oldArray, newArray)).toEqual({added: [4], removed: []})
    })

    test("移除", () => {
        const oldArray = [1, 2, 3]
        const newArray = [1, 2]

        expect(arraysDiff(oldArray, newArray)).toEqual({added: [], removed: [3]})
    })

    test("新增并移除", () => {
        const oldArray = [1, 2, 3]
        const newArray = [1, 2, 4, 5]

        expect(arraysDiff(oldArray, newArray)).toEqual({added: [4, 5], removed: [3]})
    })

    test("重复项部分移除", () => {
        const oldArray = [1, 1]
        const newArray = [1]

        expect(arraysDiff(oldArray, newArray)).toEqual({added: [], removed: [1]})
    })

    test("重复项全部移除", () => {
        const oldArray = [1, 1]
        const newArray = []

        expect(arraysDiff(oldArray, newArray)).toEqual({added: [], removed: [1, 1]})
    })

    test("新增一个重复项", () => {
        const oldArray = [1]
        const newArray = [1, 1]

        expect(arraysDiff(oldArray, newArray)).toEqual({added: [1], removed: []})
    })

    test("新增重复项", () => {
        const oldArray = []
        const newArray = [1, 1]

        expect(arraysDiff(oldArray, newArray)).toEqual({added: [1, 1], removed: []})
    })

    test("综合情况测试", () => {
        const oldArray = [1, 2, 2, 3, 4]
        const newArray = [1, 2, 4, 5, 5]

        const {added, removed} = arraysDiff(oldArray, newArray)
        added.sort()
        removed.sort()

        expect({ added, removed }).toEqual({
            added: [5, 5], removed: [2,3]}
        )
    })
})

