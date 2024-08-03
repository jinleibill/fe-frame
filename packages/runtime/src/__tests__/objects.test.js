import { expect, test } from 'vitest'
import {objectsDiff} from "../utils/objects";

test('同样 object', () => {
    const oldObj = { foo: 'bar' }
    const newObj = { foo: 'bar' }
    const { added, removed, updated } = objectsDiff(oldObj, newObj)

    expect(added).toEqual([])
    expect(removed).toEqual([])
    expect(updated).toEqual([])
})

test('添加 key', () => {
    const oldObj = {}
    const newObj = { foo: 'bar' }
    const { added, removed, updated } = objectsDiff(oldObj, newObj)

    expect(added).toEqual(['foo'])
    expect(removed).toEqual([])
    expect(updated).toEqual([])
})

test('移除 key', () => {
    const oldObj = { foo: 'bar' }
    const newObj = {}
    const { added, removed, updated } = objectsDiff(oldObj, newObj)

    expect(added).toEqual([])
    expect(removed).toEqual(['foo'])
    expect(updated).toEqual([])
})

test('更新 value', () => {
    const arr = [1, 2, 3]
    const oldObj = { foo: 'bar', arr }
    const newObj = { foo: 'baz', arr }
    const { added, removed, updated } = objectsDiff(oldObj, newObj)

    expect(added).toEqual([])
    expect(removed).toEqual([])
    expect(updated).toEqual(['foo'])
})