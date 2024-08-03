import { expect, test } from 'vitest'
import {extractPropsAndEvents} from "../utils/props";
import {h} from "../h";

const Component = {}

test('空 props', () => {
    const { props } = extractPropsAndEvents(h(Component, {}))
    expect(props).toEqual({})
})

test('空 events', () => {
    const { events } = extractPropsAndEvents(h(Component, {}))
    expect(events).toEqual({})
})

test('提取 props', () => {
    const expected = { id: 'test', name: 'foo', age: 42 }
    const { props } = extractPropsAndEvents(h(Component, expected))
    expect(props).toEqual(expected)
})

test('提取 events', () => {
    const expected = { click: () => {}, dblclick: () => {} }
    const { events } = extractPropsAndEvents(h(Component, { on: expected }))
    expect(events).toEqual(expected)
})