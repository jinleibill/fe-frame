import { expect, test } from 'vitest'
import {h, hFragment, hString} from "../h";
import {areNodesEqual} from "../nodes-equal";
import {defineComponent} from "../component";

test('不同类型的节点不相等', () => {
    const nodeOne = h('p', {}, ['foo'])
    const nodeTwo = hString('foo')
    const nodeThree = hFragment([nodeOne, nodeTwo])

    expect(areNodesEqual(nodeOne, nodeTwo)).toBe(false)
    expect(areNodesEqual(nodeOne, nodeThree)).toBe(false)
    expect(areNodesEqual(nodeTwo, nodeThree)).toBe(false)
})

test('文本类型 nodes 相等', () => {
    const nodeOne = hString('foo')
    const nodeTwo = hString('bar')

    expect(areNodesEqual(nodeOne, nodeTwo)).toBe(true)
})

test('Fragment nodes 相等', () => {
    const nodeOne = hFragment([hString('foo')])
    const nodeTwo = hFragment([hString('bar')])

    expect(areNodesEqual(nodeOne, nodeTwo)).toBe(true)
})

test('Element nodes 有相同 tag 相等', () => {
    const nodeOne = h('p', {}, ['foo'])
    const nodeTwo = h('p', {}, ['bar'])
    const nodeThree = h('div', {}, ['foo'])

    expect(areNodesEqual(nodeOne, nodeTwo)).toBe(true)
    expect(areNodesEqual(nodeOne, nodeThree)).toBe(false)
})

test('Element nodes 有相同 key 相等', () => {
    const nodeOne = h('p', { key: 'foo' }, ['foo'])
    const nodeTwo = h('p', { key: 'foo' }, ['bar'])
    const nodeThree = h('p', { key: 'bar' }, ['foo'])

    expect(areNodesEqual(nodeOne, nodeTwo)).toBe(true)
    expect(areNodesEqual(nodeOne, nodeThree)).toBe(false)
})

test('Element nodes key 不同不相等', () => {
    const nodeOne = h('p', { key: 'foo' }, ['foo'])
    const nodeTwo = h('p', { key: 'bar' }, ['bar'])

    expect(areNodesEqual(nodeOne, nodeTwo)).toBe(false)
})

test('Component nodes 有不同 tag 不相等', () => {
    const ComponentA = defineComponent({})
    const ComponentB = defineComponent({})

    const nodeOne = h(ComponentA, {})
    const nodeTwo = h(ComponentB, {})

    expect(areNodesEqual(nodeOne, nodeTwo)).toBe(false)
})

test('Component nodes 使用相同组件相等（props 不同）', () => {
    const Component = defineComponent({})

    const nodeOne = h(Component, { foo: 1 })
    const nodeTwo = h(Component, { bar: 2 })

    expect(areNodesEqual(nodeOne, nodeTwo)).toBe(true)
})

test('Component nodes 使用相同组件 key 不同不相等', () => {
    const Component = defineComponent({})

    const nodeOne = h(Component, { key: 'foo' })
    const nodeTwo = h(Component, { key: 'bar' })

    expect(areNodesEqual(nodeOne, nodeTwo)).toBe(false)
})