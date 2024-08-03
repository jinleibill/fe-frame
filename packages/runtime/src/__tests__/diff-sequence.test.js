import {expect, test} from 'vitest'
import {applyArraysDiffSequence, ARRAY_DIFF_OP, arraysDiffSequence} from "../utils/arrays";

test('相等数组', () => {
    const oldArray = [1, 2, 3]
    const newArray = [1, 2, 3]

    const diffSeq = arraysDiffSequence(oldArray, newArray)

    expect(diffSeq).toEqual([
        {
            op: ARRAY_DIFF_OP.NOOP,
            originalIndex: 0,
            index: 0,
            item: 1,
        },
        {
            op: ARRAY_DIFF_OP.NOOP,
            originalIndex: 1,
            index: 1,
            item: 2,
        },
        {
            op: ARRAY_DIFF_OP.NOOP,
            originalIndex: 2,
            index: 2,
            item: 3,
        },
    ])
    expect(applyArraysDiffSequence(oldArray, diffSeq)).toEqual(newArray)
})

test('移除开始项', () => {
    const oldArray = [1, 2, 3]
    const newArray = [2, 3]

    const diffSeq = arraysDiffSequence(oldArray, newArray)

    expect(diffSeq).toEqual([
        {op: ARRAY_DIFF_OP.REMOVE, index: 0, item: 1},
        {op: ARRAY_DIFF_OP.NOOP, originalIndex: 1, index: 0, item: 2},
        {op: ARRAY_DIFF_OP.NOOP, originalIndex: 2, index: 1, item: 3},
    ])
    expect(applyArraysDiffSequence(oldArray, diffSeq)).toEqual(newArray)
})

test('移除结尾项', () => {
    const oldArray = ['a', 'b', 'c']
    const newArray = ['a', 'b']

    const diffSeq = arraysDiffSequence(oldArray, newArray)

    expect(diffSeq).toEqual([
        {op: ARRAY_DIFF_OP.NOOP, originalIndex: 0, index: 0, item: 'a'},
        {op: ARRAY_DIFF_OP.NOOP, originalIndex: 1, index: 1, item: 'b'},
        {op: ARRAY_DIFF_OP.REMOVE, index: 2, item: 'c'},
    ])
    expect(applyArraysDiffSequence(oldArray, diffSeq)).toEqual(newArray)
})

test('移除中间项', () => {
    const oldArray = ['a', 'b', 'c']
    const newArray = ['a', 'c']

    const diffSeq = arraysDiffSequence(oldArray, newArray)

    expect(diffSeq).toEqual([
        {op: ARRAY_DIFF_OP.NOOP, originalIndex: 0, index: 0, item: 'a'},
        {op: ARRAY_DIFF_OP.REMOVE, item: 'b', index: 1},
        {op: ARRAY_DIFF_OP.NOOP, originalIndex: 2, index: 1, item: 'c'},
    ])
    expect(applyArraysDiffSequence(oldArray, diffSeq)).toEqual(newArray)
})

test('添加开始项', () => {
    const oldArray = ['b', 'c']
    const newArray = ['a', 'b', 'c']

    const diffSeq = arraysDiffSequence(oldArray, newArray)

    expect(diffSeq).toEqual([
        {op: ARRAY_DIFF_OP.ADD, item: 'a', index: 0},
        {op: ARRAY_DIFF_OP.NOOP, originalIndex: 0, index: 1, item: 'b'},
        {op: ARRAY_DIFF_OP.NOOP, originalIndex: 1, index: 2, item: 'c'},
    ])
    expect(applyArraysDiffSequence(oldArray, diffSeq)).toEqual(newArray)
})

test('添加结尾项', () => {
    const oldArray = ['a', 'b']
    const newArray = ['a', 'b', 'c']

    const diffSeq = arraysDiffSequence(oldArray, newArray)

    expect(diffSeq).toEqual([
        {op: ARRAY_DIFF_OP.NOOP, originalIndex: 0, index: 0, item: 'a'},
        {op: ARRAY_DIFF_OP.NOOP, originalIndex: 1, index: 1, item: 'b'},
        {op: ARRAY_DIFF_OP.ADD, item: 'c', index: 2},
    ])
    expect(applyArraysDiffSequence(oldArray, diffSeq)).toEqual(newArray)
})

test('添加中间项', () => {
    const oldArray = ['a', 'c']
    const newArray = ['a', 'b', 'c']

    const diffSeq = arraysDiffSequence(oldArray, newArray)

    expect(diffSeq).toEqual([
        {op: ARRAY_DIFF_OP.NOOP, originalIndex: 0, index: 0, item: 'a'},
        {op: ARRAY_DIFF_OP.ADD, item: 'b', index: 1},
        {op: ARRAY_DIFF_OP.NOOP, originalIndex: 1, index: 2, item: 'c'},
    ])
    expect(applyArraysDiffSequence(oldArray, diffSeq)).toEqual(newArray)
})

test('添加在两个相等元素中间的项', () => {
    const oldArray = ['a', 'a']
    const newArray = ['a', 'b', 'a']

    const diffSeq = arraysDiffSequence(oldArray, newArray)

    expect(diffSeq).toEqual([
        {op: ARRAY_DIFF_OP.NOOP, originalIndex: 0, index: 0, item: 'a'},
        {op: ARRAY_DIFF_OP.ADD, item: 'b', index: 1},
        {op: ARRAY_DIFF_OP.NOOP, originalIndex: 1, index: 2, item: 'a'},
    ])
    expect(applyArraysDiffSequence(oldArray, diffSeq)).toEqual(newArray)
})

test('从两个相等的元素中移除项(移除第二个元素)', () => {
    const oldArray = ['b', 'b']
    const newArray = ['b']

    const diffSeq = arraysDiffSequence(oldArray, newArray)

    expect(diffSeq).toEqual([
        {op: ARRAY_DIFF_OP.NOOP, originalIndex: 0, index: 0, item: 'b'},
        {op: ARRAY_DIFF_OP.REMOVE, item: 'b', index: 1},
    ])
    expect(applyArraysDiffSequence(oldArray, diffSeq)).toEqual(newArray)
})

test('删除和添加项在同一地方', () => {
    const oldArray = ['a', 'b', 'c']
    const newArray = ['a', 'd', 'c']

    const diffSeq = arraysDiffSequence(oldArray, newArray)

    expect(diffSeq).toEqual([
        {op: ARRAY_DIFF_OP.NOOP, originalIndex: 0, index: 0, item: 'a'},
        {op: ARRAY_DIFF_OP.REMOVE, item: 'b', index: 1},
        {op: ARRAY_DIFF_OP.ADD, item: 'd', index: 1},
        {op: ARRAY_DIFF_OP.NOOP, originalIndex: 2, index: 2, item: 'c'},
    ])
    expect(applyArraysDiffSequence(oldArray, diffSeq)).toEqual(newArray)
})

test('替换中间两个项', () => {
    const oldArray = ['a', 'b', 'c', 'd']
    const newArray = ['a', 'X', 'Y', 'd']

    const diffSeq = arraysDiffSequence(oldArray, newArray)

    expect(diffSeq).toEqual([
        {op: ARRAY_DIFF_OP.NOOP, originalIndex: 0, index: 0, item: 'a'},
        {op: ARRAY_DIFF_OP.REMOVE, item: 'b', index: 1},
        {op: ARRAY_DIFF_OP.REMOVE, item: 'c', index: 1},
        {op: ARRAY_DIFF_OP.ADD, item: 'X', index: 1},
        {op: ARRAY_DIFF_OP.ADD, item: 'Y', index: 2},
        {op: ARRAY_DIFF_OP.NOOP, originalIndex: 3, index: 3, item: 'd'},
    ])
    expect(applyArraysDiffSequence(oldArray, diffSeq)).toEqual(newArray)
})

test('移动两个项', () => {
    const oldArray = ['a', 'b', 'c']
    const newArray = ['b', 'a', 'c']

    const diffSeq = arraysDiffSequence(oldArray, newArray)

    expect(diffSeq).toEqual([
        {op: ARRAY_DIFF_OP.MOVE, originalIndex: 1, from: 1, index: 0, item: 'b'},
        {op: ARRAY_DIFF_OP.NOOP, originalIndex: 0, index: 1, item: 'a'},
        {op: ARRAY_DIFF_OP.NOOP, originalIndex: 2, index: 2, item: 'c'},
    ])
    expect(applyArraysDiffSequence(oldArray, diffSeq)).toEqual(newArray)
})

test('删除、添加和移动', () => {
    const oldArray = ['a', 'b', 'c', 'd']
    const newArray = ['b', 'X', 'd', 'c']

    const diffSeq = arraysDiffSequence(oldArray, newArray)

    expect(diffSeq).toEqual([
        {op: ARRAY_DIFF_OP.REMOVE, item: 'a', index: 0},
        {op: ARRAY_DIFF_OP.NOOP, originalIndex: 1, index: 0, item: 'b'},
        {op: ARRAY_DIFF_OP.ADD, item: 'X', index: 1},
        {op: ARRAY_DIFF_OP.MOVE, item: 'd', originalIndex: 3, from: 3, index: 2},
        {op: ARRAY_DIFF_OP.NOOP, originalIndex: 2, index: 3, item: 'c'},
    ])
    expect(applyArraysDiffSequence(oldArray, diffSeq)).toEqual(newArray)
})

test('删除重复元素，添加和移动', () => {
    const oldArray = ['a', 'a', 'b', 'c']
    const newArray = ['c', 'k', 'a', 'b']

    const diffSeq = arraysDiffSequence(oldArray, newArray)
    expect(diffSeq).toEqual([
        {op: ARRAY_DIFF_OP.MOVE, originalIndex: 3, from: 3, index: 0, item: 'c'},
        {op: ARRAY_DIFF_OP.ADD, index: 1, item: 'k'},
        {op: ARRAY_DIFF_OP.NOOP, originalIndex: 0, index: 2, item: 'a'},
        {op: ARRAY_DIFF_OP.MOVE, originalIndex: 2, from: 4, index: 3, item: 'b'},
        {op: ARRAY_DIFF_OP.REMOVE, index: 4, item: 'a'},
    ])

    const actual = applyArraysDiffSequence(oldArray, diffSeq)
    expect(actual).toEqual(newArray)
})

test.each([
    {
        oldArray: ['a', 'b', 'c'],
        newArray: ['c', 'a', 'b'],
        expected: [
            {op: ARRAY_DIFF_OP.MOVE, item: 'c', originalIndex: 2, from: 2, index: 0},
            {op: ARRAY_DIFF_OP.NOOP, originalIndex: 0, index: 1, item: 'a'},
            {op: ARRAY_DIFF_OP.NOOP, originalIndex: 1, index: 2, item: 'b'},
        ],
    },
    {
        oldArray: ['a', 'b', 'c'],
        newArray: ['b', 'c', 'a'],
        expected: [
            {op: ARRAY_DIFF_OP.MOVE, item: 'b', originalIndex: 1, from: 1, index: 0},
            {op: ARRAY_DIFF_OP.MOVE, item: 'c', originalIndex: 2, from: 2, index: 1},
            {op: ARRAY_DIFF_OP.NOOP, originalIndex: 0, index: 2, item: 'a'},
        ],
    },
    {
        oldArray: ['a', 'b', 'c', 'd'],
        newArray: ['c', 'a', 'b', 'd'],
        expected: [
            {op: ARRAY_DIFF_OP.MOVE, item: 'c', originalIndex: 2, from: 2, index: 0},
            {op: ARRAY_DIFF_OP.NOOP, originalIndex: 0, index: 1, item: 'a'},
            {op: ARRAY_DIFF_OP.NOOP, originalIndex: 1, index: 2, item: 'b'},
            {op: ARRAY_DIFF_OP.NOOP, originalIndex: 3, index: 3, item: 'd'},
        ],
    },
])(
    '查找move 和 noop，从$oldArray到$newArray',
    ({oldArray, newArray, expected}) => {
        const diffSeq = arraysDiffSequence(oldArray, newArray)

        expect(diffSeq).toEqual(expected)
        expect(applyArraysDiffSequence(oldArray, diffSeq)).toEqual(newArray)
    }
)

test('删除最后的项', () => {
    const oldArray = ['a', 'b', 'd', 'd', 'e', 'c', 'f', 'd', 'b', 'c', 'd', 'e', 'a']
    const newArray = ['f', 'a', 'a', 'a', 'd', 'c', 'e', 'e', 'f', 'a', 'd', 'a']

    const diffSeq = arraysDiffSequence(oldArray, newArray)
    const actual = applyArraysDiffSequence(oldArray, diffSeq)

    expect(actual).toEqual(newArray)
})
