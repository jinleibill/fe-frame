import {beforeEach, expect, test, vi} from "vitest";
import {h, hFragment, hString} from "../h";
import {mountDOM} from "../mount-dom";
import {destroyDOM} from "../destroy-dom";
import {defineComponent} from "../component";

beforeEach(() => {
    document.body.innerHTML = "";
})

test("销毁一个 element", async () => {
    const vdom = hString("hello")

    await mountDOM(vdom, document.body)
    expect(document.body.innerHTML).toBe("hello")
    expect(vdom.el).toBeInstanceOf(Text)

    await destroyDOM(vdom)
    expect(document.body.innerHTML).toBe("")
    expect(allElementsHaveBeenDestroyed(vdom)).toBe(true)
})

test("销毁一个 html element 和它的子元素", async () => {
    const vdom = h("div", {}, [hString("hello")])

    await mountDOM(vdom, document.body)
    expect(document.body.innerHTML).toBe("<div>hello</div>")
    expect(vdom.el).toBeInstanceOf(HTMLDivElement)

    await destroyDOM(vdom)
    expect(document.body.innerHTML).toBe("")
    expect(allElementsHaveBeenDestroyed(vdom)).toBe(true)
})

test("移除一个 html element 事件监听器", async () => {
    const handler = vi.fn()
    const vdom = h("button", {on: {click: handler}}, [hString("hello")])

    await mountDOM(vdom, document.body)
    const buttonEl = vdom.el
    buttonEl.click()

    expect(handler).toBeCalledTimes(1)

    await destroyDOM(vdom)
    buttonEl.click()

    expect(handler).toBeCalledTimes(1)

})

test("递归销毁一个 html element 和它的子元素", async () => {
    const vdom = h("div", {}, [
        h("p", {}, [hString("hello")]),
        h("span", {}, [hString("world")])
    ])

    await mountDOM(vdom, document.body)
    expect(document.body.innerHTML).toBe(
        "<div><p>hello</p><span>world</span></div>"
    )
    expect(vdom.el).toBeInstanceOf(HTMLDivElement)

    await destroyDOM(vdom)
    expect(document.body.innerHTML).toBe("")
    expect(allElementsHaveBeenDestroyed(vdom)).toBe(true)
})

test("销毁一个 fragment", async () => {
    const vdom = hFragment([
        h("div", {}, [hString("hello")]),
        h("span", {}, [hString("world")])
    ])

    await mountDOM(vdom, document.body)
    expect(document.body.innerHTML).toBe("<div>hello</div><span>world</span>")

    await destroyDOM(vdom)
    expect(document.body.innerHTML).toBe("")
    expect(allElementsHaveBeenDestroyed(vdom)).toBe(true)
})

test('递归销毁一个 fragment', async () => {
    const vdom = hFragment([
        h('span', {}, ['hello']),
        hFragment([h('span', {}, [hString('world')])]),
    ])

    await mountDOM(vdom, document.body)
    expect(document.body.innerHTML).toBe(
        '<span>hello</span><span>world</span>'
    )

    await destroyDOM(vdom)
    expect(document.body.innerHTML).toBe('')
    expect(allElementsHaveBeenDestroyed(vdom)).toBe(true)
})

test('销毁带有子组件的组件', async () => {
    const ChildComponent = defineComponent({
        render() {
            return h('p', {}, ['body'])
        },
    })
    const ParentComponent = defineComponent({
        render() {
            return hFragment([h('h1', {}, ['Title']), h(ChildComponent)])
        },
    })
    const vdom = h('div', {}, [h(ParentComponent)])

    await mountDOM(vdom, document.body)
    expect(document.body.innerHTML).toBe(
        '<div><h1>Title</h1><p>body</p></div>'
    )

    await destroyDOM(vdom)
    expect(document.body.innerHTML).toBe('')
    expect(allElementsHaveBeenDestroyed(vdom)).toBe(true)
})

function allElementsHaveBeenDestroyed(vdom) {
    if (vdom.el) {
        return false
    }

    return vdom.children?.every(allElementsHaveBeenDestroyed) ?? true
}