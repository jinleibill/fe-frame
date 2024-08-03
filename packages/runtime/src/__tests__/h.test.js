import {expect, test} from "vitest";
import {DOM_TYPES, extractChildren, h, hFragment, hString} from "../h";

test("创建文本 vNode", () => {
    const vNode = hString("test")

    expect(vNode).toEqual({
        type: DOM_TYPES.TEXT,
        value: "test"
    })
})

test("创建 element vNode", () => {
    const tag = "div"
    const props = {id: "test"}
    const children = [hString("test")]

    const vNode = h(tag, props, children)

    expect(vNode).toEqual({
        tag,
        props,
        children: [{type: DOM_TYPES.TEXT, value: "test"}],
        type: DOM_TYPES.ELEMENT,
    })
})

test("h() 过滤 null 子节点", () => {
    const tag = "div"
    const props = {id: "test"}
    const children = [hString("test"), null]

    const vNode = h(tag, props, children)

    expect(vNode).toEqual({
        tag,
        props,
        children: [{type: DOM_TYPES.TEXT, value: "test"}],
        type: DOM_TYPES.ELEMENT,
    })
})

test("h() 映射文本 vNodes", () => {
    const vNode = h("div", {}, ["test"])

    expect(vNode).toEqual({
        tag: "div",
        props: {},
        children: [{type: DOM_TYPES.TEXT, value: "test"}],
        type: DOM_TYPES.ELEMENT,
    })
})

test("创建 fragment vNode", () => {
    const children = [h("div", {class: "foo"}, [])]
    const vNode = hFragment(children)

    expect(vNode).toEqual({
        type: DOM_TYPES.FRAGMENT,
        children: [
            {
                type: DOM_TYPES.ELEMENT,
                tag: "div",
                props: {class: "foo"},
                children: [],
            }
        ]
    })
})

test("hFragment() 过滤 null 子节点", () => {
    const children = [h("div", {class: "foo"}, []), null]
    const vNode = hFragment(children)

    expect(vNode).toEqual({
        type: DOM_TYPES.FRAGMENT,
        children: [
            {
                type: DOM_TYPES.ELEMENT,
                tag: "div",
                props: {class: "foo"},
                children: [],
            }
        ]
    })
})

test("hFragment() 映射文本 vNodes", () => {
    const vNode = hFragment(["test"])

    expect(vNode).toEqual({
        type: DOM_TYPES.FRAGMENT,
        children: [
            {
                type: DOM_TYPES.TEXT,
                value: "test",
            }
        ]
    })
})

test('从 fragment tree 上取出子节点', () => {
    const vNode = h('div', {}, [
        'A',
        hFragment([
            hFragment([hString('B')]),
            hString('C'),
            hFragment([hString('D')]),
        ]),
        'E',
    ])
    const children = extractChildren(vNode)

    expect(children).toEqual([
        { type: DOM_TYPES.TEXT, value: 'A' },
        { type: DOM_TYPES.TEXT, value: 'B' },
        { type: DOM_TYPES.TEXT, value: 'C' },
        { type: DOM_TYPES.TEXT, value: 'D' },
        { type: DOM_TYPES.TEXT, value: 'E' },
    ])
})
