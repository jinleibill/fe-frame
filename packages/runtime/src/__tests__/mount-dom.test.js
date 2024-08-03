import {beforeEach, expect, test, vi} from "vitest";
import {h, hFragment, hString} from "../h";
import {mountDOM} from "../mount-dom";
import {defineComponent} from "../component";
import {singleHtmlLine} from "./utils";
import {nextTick} from "../scheduler";

beforeEach(() => {
    vi.unstubAllGlobals()
    document.body.innerHTML = "";
})

test("不能挂载 element 到 parent element", () => {
    const vdom = h("div", {}, [hString("hello")])

    expect(() => mountDOM(vdom)).toThrow()
})

test("挂载文本 element 到 parent element", () => {
    const vdom = hString("hello")
    mountDOM(vdom, document.body)

    expect(document.body.innerHTML).toBe("hello")
})

test("保存文本 element 实例到 vdom", () => {
    const vdom = hString("hello")
    mountDOM(vdom, document.body)
    const el = vdom.el

    expect(el).toBeInstanceOf(Text)
    expect(el.textContent).toBe("hello")
})

test("挂载 element 到 parent element", () => {
    const vdom = h("div", {}, [hString("hello")])
    mountDOM(vdom, document.body)

    expect(document.body.innerHTML).toBe("<div>hello</div>")
})

test("保存 element 实例到 vdom", () => {
    const vdom = h("div")
    mountDOM(vdom, document.body)
    const el = vdom.el

    expect(el).toBeInstanceOf(HTMLDivElement)
})

test("不能挂载 fragment 到 parent element", () => {
    const vdom = hFragment([hString("hello")])
    expect(() => mountDOM(vdom)).toThrow()
})

test("挂载 fragment 到 parent element", () => {
    const vdom = hFragment([hString("hello, "), hString("world")])
    mountDOM(vdom, document.body)

    expect(document.body.innerHTML).toBe("hello, world")
})

test("挂载 fragment 内部包含 fragment 到 parent element", () => {
    const vdom = hFragment([
        h("p", {}, ["foo"]),
        hFragment([
            h("p", {}, ["bar"]),
            h("p", {}, ["baz"])
        ])
    ])

    mountDOM(vdom, document.body)

    expect(document.body.innerHTML).toBe("<p>foo</p><p>bar</p><p>baz</p>")
})

test("所有嵌套 fragments 的实例引用 parent element", () => {
    const vdomOne = hFragment([hString("hello, "), hString("world")])
    const vdomTwo = hFragment([vdomOne])
    const vdomThree = hFragment([vdomTwo])

    mountDOM(vdomThree, document.body)

    expect(vdomThree.el).toBe(document.body)
    expect(vdomTwo.el).toBe(document.body)
    expect(vdomOne.el).toBe(document.body)
})

test("挂载 fragment 包含属性的子节点", () => {
    const vdom = hFragment([
        h("span", {id: "foo"}, [hString("hello, ")]),
        h("span", {id: "bar"}, [hString("world")]),
    ])

    mountDOM(vdom, document.body)

    expect(document.body.innerHTML).toBe(
        '<span id="foo">hello, </span><span id="bar">world</span>'
    )
})

test("挂载具有 id 属性 element", () => {
    const vdom = h("div", {id: "foo"})
    mountDOM(vdom, document.body)

    expect(document.body.innerHTML).toBe('<div id="foo"></div>')
})

test("挂载具有 class 属性 element", () => {
    const vdom = h("div", {class: "foo"})
    mountDOM(vdom, document.body)

    expect(document.body.innerHTML).toBe('<div class="foo"></div>')
})

test("挂载具有 class 数组属性 element", () => {
    const vdom = h("div", {class: ["foo", "bar"]})
    mountDOM(vdom, document.body)

    expect(document.body.innerHTML).toBe('<div class="foo bar"></div>')
})

test("挂载具有 event handler 的 element", () => {
    const onClick = vi.fn()
    const vdom = h("div", {on: {click: onClick}})
    mountDOM(vdom, document.body)

    vdom.el?.click()

    expect(onClick).toBeCalledTimes(1)
    expect(onClick).toBeCalledWith(expect.any(MouseEvent))
    expect(vdom.listeners).toEqual({click: expect.any(Function)})
})

test("挂载具有 style 属性 element", () => {
    const vdom = h("div", {style: {color: "red"}})
    mountDOM(vdom, document.body)
    const el = vdom.el

    expect(document.body.innerHTML).toBe('<div style="color: red;"></div>')
    expect(el.style.color).toBe('red')
})

test("props 绑定事件触发器", () => {
    const comp = { count: 5}
    const vdom = hFragment([
        h("button", {on: {click() { this.count++}}, id: "btn-1"}, ["One"]),
        h("div",{}, [h('button', {on: {click() { this.count++}}, id: "btn-2"}, ["Two"])]),
    ])

    mountDOM(vdom, document.body, null, comp)

    document.querySelector('#btn-1').click()
    expect(comp.count).toBe(6)

    document.querySelector('#btn-2').click()
    expect(comp.count).toBe(7)
})

test('挂载有 props 的 component', () => {
    const Component = defineComponent({
        render() {
            return h('p', { class: 'important' }, [this.props.message])
        },
    })
    const vdom = h(Component, { message: 'hello' })
    mountDOM(vdom, document.body)

    expect(document.body.innerHTML).toBe('<p class="important">hello</p>')
    expect(vdom.component).toBeInstanceOf(Component)
})

test('挂载有 child 的 component', () => {
    const ChildComp = defineComponent({
        render() {
            return h('p', {}, [this.props.message])
        },
    })
    const ParentComp = defineComponent({
        render() {
            return h('div', {},
                this.props.messages.map((msg) =>
                    h(ChildComp, { message: msg })
                )
            )
        },
    })
    const vdom = h(ParentComp, { messages: ['hello', 'world'] })
    mountDOM(vdom, document.body)

    expect(document.body.innerHTML).toBe('<div><p>hello</p><p>world</p></div>')
    expect(vdom.component).toBeInstanceOf(ParentComp)
})

test('挂载有 event handler 的 component', () => {
    const onClick = vi.fn()
    const Component = defineComponent({
        render() {
            return h('button', { on: { click: () => this.emit('click') } }, ['Click me'])
        },
    })
    const vdom = h(Component, { on: { click: onClick } })
    mountDOM(vdom, document.body)

    document.querySelector('button').click()

    expect(onClick).toBeCalledTimes(1)
})

test('挂载有 parent component 的 component', () => {
    const Parent = {}
    const Component = defineComponent({
        render() {
            return h('p', {}, ['child'])
        },
    })
    const vdom = h(Component)
    mountDOM(vdom, document.body, null, Parent)

    expect(document.body.innerHTML).toBe('<p>child</p>')
    expect(vdom.component.parentComponent).toBe(Parent)
})

test('子组件保持对父组件的引用', () => {
    const CompC = defineComponent({
        render() {return h('p', {}, ['c'])},
    })
    const CompB = defineComponent({
        render() {return h(CompC)},
    })
    const CompA = defineComponent({
        render() {return h(CompB)},
    })
    const vdom = h(CompA)
    mountDOM(vdom, document.body)

    const compA = vdom.component
    const compB = compA.vdom.component
    const compC = compB.vdom.component

    expect(compA.parentComponent).toBe(null)
    expect(compB.parentComponent).toBe(compA)
    expect(compC.parentComponent).toBe(compB)
})

test('当一个包含多个元素的组件被挂载时，vdom会保留对第一个元素的引用', () => {
    const Component = defineComponent({
        render() {
            return hFragment([
                h('p', { id: 'one' }, ['1']),
                h('p', { id: 'two' }, ['2']),
            ])
        },
    })
    const vdom = h(Component)
    mountDOM(vdom, document.body)

    expect(vdom.el).toBe(document.querySelector('p#one'))
})

const FragComp = defineComponent({
    render() {
        return hFragment([h('p', {}, ['three']), h('p', {}, ['four'])])
    },
})

const NestedFragComp = defineComponent({
    render() {
        return hFragment([h(FragComp), h('p', {}, ['five'])])
    },
})

test.each([
    {
        body: '<p>one</p><p>two</p>',
        description: '嵌套 component',
        vdom: hFragment([
            h(FragComp),
            h('p', {}, ['five']),
            hFragment([h('p', {}, ['six']), h('p', {}, ['seven'])]),
        ]),
        index: 2,
    },
    {
        body: '<p>one</p><p>two</p>',
        description: '嵌套具有嵌套的 component',
        vdom: hFragment([
            h(NestedFragComp),
            hFragment([h('p', {}, ['six']), h('p', {}, ['seven'])]),
        ]),
        index: 2,
    },
    {
        body: '<p>one</p><p>two</p><p>five</p><p>six</p><p>seven</p>',
        description: '没有嵌套',
        vdom: hFragment([h('p', {}, ['three']), h('p', {}, ['four'])]),
        index: 2,
    },
    {
        body: '<p>one</p><p>two</p><p>seven</p>',
        description: '嵌套元素',
        vdom: hFragment([
            h('p', {}, ['three']),
            hFragment([
                h('p', {}, ['four']),
                h('p', {}, ['five']),
                h('p', {}, ['six']),
            ]),
        ]),
        index: 2,
    },
    {
        body: '<p>one</p><p>two</p><p>seven</p>',
        description: '双嵌套',
        vdom: hFragment([
            h('p', {}, ['three']),
            hFragment([
                h('p', {}, ['four']),
                h('p', {}, ['five']),
                hFragment([h('p', {}, ['six'])]),
            ]),
        ]),
        index: 2,
    },
    {
        body: '<p>five</p><p>six</p><p>seven</p>',
        description: '单嵌套',
        vdom: hFragment([
            h('p', {}, ['one']),
            hFragment([h('p', {}, ['two']), h('p', {}, ['three'])]),
            h('p', {}, ['four']),
        ]),
        index: 0,
    },
    {
        body: '<p>one</p><p>two</p>',
        description: '单嵌套2',
        vdom: hFragment([
            hFragment([h('p', {}, ['three']), h('p', {}, ['four'])]),
            h('p', {}, ['five']),
            hFragment([h('p', {}, ['six']), h('p', {}, ['seven'])]),
        ]),
        index: null,
    },
])('在索引$index上挂载$description片段', ({ body, vdom, index }) => {
    document.body.innerHTML = body
    mountDOM(vdom, document.body, index)

    expect(document.body.innerHTML).toBe(singleHtmlLine`<p>one</p><p>two</p><p>three</p><p>four</p><p>five</p><p>six</p><p>seven</p>`)
})

test('当组件中的onMounted()抛出错误时，DOM仍然会正确呈现', async () => {
    const consoleErrorMock = vi.fn()
    vi.stubGlobal('console', { error: consoleErrorMock })

    const ProblematicComponent = defineComponent({
        onMounted() {return Promise.reject(new Error('oops'))},
        render() {return h('p', {}, ['problem'])},
    })
    const GoodBoy = defineComponent({
        onMounted() {return Promise.resolve()},
        render() {return h('p', {}, ['good'])},
    })

    const vdom = hFragment([
        h(GoodBoy), h(ProblematicComponent), h(GoodBoy), h(GoodBoy),
    ])
    mountDOM(vdom, document.body)
    await nextTick()

    expect(document.body.innerHTML).toBe('<p>good</p><p>problem</p><p>good</p><p>good</p>')
    expect(consoleErrorMock).toBeCalledWith(expect.stringMatching(/scheduler/))
})