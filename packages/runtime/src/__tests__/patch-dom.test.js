import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import {h, hFragment, hString} from "../h";
import {mountDOM} from "../mount-dom";
import {patchDOM} from "../patch-dom";
import {singleHtmlLine} from "./utils";
import {defineComponent} from "../component";

beforeEach(() => {
    document.body.innerHTML = ''
})

test('相同 vdom', async () => {
    const oldVdom = h('div', {}, ['hello'])
    const newVdom = h('div', {}, ['hello'])

    const vdom = await patch(oldVdom, newVdom)

    expect(document.body.innerHTML).toEqual('<div>hello</div>')
    expect(newVdom.el).toBe(vdom.el)
})

test('改变 root node', async () => {
    const oldVdom = h('div', {}, ['hello'])
    const newVdom = h('span', {}, ['hello'])

    const vdom = await patch(oldVdom, newVdom)

    expect(document.body.innerHTML).toEqual('<span>hello</span>')
    expect(vdom.el).toBeInstanceOf(HTMLSpanElement)
    expect(newVdom.el).toBe(vdom.el)
})

test('改变 root node, 挂载到相同的 index', async () => {
    const staticVdom = h('p', {}, ['bye'])
    await mountDOM(staticVdom, document.body)

    const oldVdom = h('div', {}, ['hello'])
    const newVdom = h('span', {}, ['hello'])
    await mountDOM(oldVdom, document.body, 0)
    await patchDOM(oldVdom, newVdom, document.body)

    expect(document.body.innerHTML).toEqual('<span>hello</span><p>bye</p>')
})

test('设置 el 到新的 vdom', async () => {
    const oldVdom = h('div', {}, ['hello'])
    const newVdom = h('div', {}, ['hello'])

    const vdom = await patch(oldVdom, newVdom)

    expect(newVdom.el).toBe(vdom.el)
})

test('修改文本', async () => {
    const oldVdom = hString('foo')
    const newVdom = hString('bar')

    await patch(oldVdom, newVdom)

    expect(document.body.innerHTML).toEqual('bar')
})

describe('修改 fragments', () => {
    test('嵌套 fragments, 添加子节点', async () => {
        const oldVdom = hFragment([hFragment([hString('foo')])])
        const newVdom = hFragment([
            hFragment([hString('foo'), hString('bar')]),
            h('p', {}, ['baz']),
        ])

        await patch(oldVdom, newVdom)

        expect(document.body.innerHTML).toEqual('foobar<p>baz</p>')
    })

    test('嵌套 fragments, 添加子节点到指定 index', async () => {
        const oldVdom = hFragment([
            hString('A'),
            hFragment([hString('B'), hString('C')]),
        ])
        const newVdom = hFragment([
            hFragment([hString('X')]),
            hString('A'),
            hFragment([hString('B'), hFragment([hString('Y')]), hString('C')]),
        ])

        await patch(oldVdom, newVdom)

        expect(document.body.innerHTML).toEqual('XABYC')
    })

    test('嵌套 fragments, 移除子节点', async () => {
        const oldVdom = hFragment([
            hFragment([hString('X')]),
            hString('A'),
            hFragment([hString('B'), hFragment([hString('Y')]), hString('C')]),
        ])
        const newVdom = hFragment([
            hString('A'),
            hFragment([hString('B'), hString('C')]),
        ])

        await patch(oldVdom, newVdom)

        expect(document.body.innerHTML).toEqual('ABC')
    })

    test('嵌套 fragments, 移动子节点', async () => {
        const oldVdom = hFragment([
            hString('A'),
            hFragment([hString('B'), hString('C')]),
        ])
        const newVdom = hFragment([
            hFragment([hString('B')]),
            hString('A'),
            hFragment([hString('C')]),
        ])

        await patch(oldVdom, newVdom)

        expect(document.body.innerHTML).toEqual('BAC')
    })
})

describe('修改 attributes', () => {
    test('添加 attribute', async () => {
        const oldVdom = h('div', {})
        const newVdom = h('div', { id: 'foo' })

        await patch(oldVdom, newVdom)

        expect(document.body.innerHTML).toEqual('<div id="foo"></div>')
    })

    test('移除 attribute', async () => {
        const oldVdom = h('div', { id: 'foo' })
        const newVdom = h('div', {})

        await patch(oldVdom, newVdom)

        expect(document.body.innerHTML).toEqual('<div></div>')
    })

    test('更新 attribute 值', async () => {
        const oldVdom = h('div', { id: 'foo' })
        const newVdom = h('div', { id: 'bar' })

        await patch(oldVdom, newVdom)

        expect(document.body.innerHTML).toEqual('<div id="bar"></div>')
    })
})

describe('修改 class', () => {
    test('从空 class 到指定 class', async () => {
        const oldVdom = h('div', { class: '' })
        const newVdom = h('div', { class: 'foo' })

        await patch(oldVdom, newVdom)

        expect(document.body.innerHTML).toEqual('<div class="foo"></div>')
    })

    test('从指定 class 到空 class', async () => {
        // Need to prevent an empty class to be removed from the classList (that throws an error)
        // `SyntaxError: The token provided must not be empty.`
        const oldVdom = h('div', { class: 'foo' })
        const newVdom = h('div', { class: '' })

        await patch(oldVdom, newVdom)

        expect(document.body.innerHTML).toEqual('<div class=""></div>')
    })

    test('添加 class', async () => {
        const oldVdom = h('div', {})
        const newVdom = h('div', { class: 'foo' })

        await patch(oldVdom, newVdom)

        expect(document.body.innerHTML).toEqual('<div class="foo"></div>')
    })

    test('移除 class', async () => {
        const oldVdom = h('div', { class: 'foo' })
        const newVdom = h('div', {})

        await patch(oldVdom, newVdom)

        expect(document.body.innerHTML).toEqual('<div class=""></div>')
    })

    test('改变 class 值', async () => {
        const oldVdom = h('div', { class: 'foo' })
        const newVdom = h('div', { class: 'bar' })

        await patch(oldVdom, newVdom)

        expect(document.body.innerHTML).toBe('<div class="bar"></div>')
    })

    test('class 值从字符串到数组', async () => {
        const oldVdom = h('div', { class: 'foo' })
        const newVdom = h('div', { class: ['foo', 'bar'] })

        await patch(oldVdom, newVdom)

        expect(document.body.innerHTML).toBe('<div class="foo bar"></div>')
    })

    test('class 值从数组到字符串', async () => {
        const oldVdom = h('div', { class: ['foo', 'bar'] })
        const newVdom = h('div', { class: 'foo' })

        await patch(oldVdom, newVdom)

        expect(document.body.innerHTML).toBe('<div class="foo"></div>')
    })

    test('class 值数组增加项', async () => {
        const oldVdom = h('div', { class: ['foo'] })
        const newVdom = h('div', { class: ['foo', 'bar'] })

        await patch(oldVdom, newVdom)

        expect(document.body.innerHTML).toBe('<div class="foo bar"></div>')
    })

    test('class 值数组减少项', async () => {
        const oldVdom = h('div', { class: ['foo', 'bar'] })
        const newVdom = h('div', { class: ['foo'] })

        await patch(oldVdom, newVdom)

        expect(document.body.innerHTML).toBe('<div class="foo"></div>')
    })

    test('class 值字符串添加', async () => {
        const oldVdom = h('div', { class: 'foo' })
        const newVdom = h('div', { class: 'foo bar' })

        await patch(oldVdom, newVdom)

        expect(document.body.innerHTML).toBe('<div class="foo bar"></div>')
    })

    test('class 值字符串移除', async () => {
        const oldVdom = h('div', { class: 'foo bar' })
        const newVdom = h('div', { class: 'foo' })

        await patch(oldVdom, newVdom)

        expect(document.body.innerHTML).toBe('<div class="foo"></div>')
    })
})

describe('修改 style', () => {
    test('添加新 style', async () => {
        const oldVdom = h('div')
        const newVdom = h('div', { style: { color: 'red' } })

        await patch(oldVdom, newVdom)

        expect(document.body.innerHTML).toBe('<div style="color: red;"></div>')
    })

    test('移除 style', async () => {
        const oldVdom = h('div', { style: { color: 'red' } })
        const newVdom = h('div')

        await patch(oldVdom, newVdom)

        expect(document.body.innerHTML).toBe('<div style=""></div>')
    })

    test('改变 style', async () => {
        const oldVdom = h('div', { style: { color: 'red' } })
        const newVdom = h('div', { style: { color: 'blue' } })

        await patch(oldVdom, newVdom)

        expect(document.body.innerHTML).toBe('<div style="color: blue;"></div>')
    })
})

describe('修改 event handlers', () => {
    test('改变 event handler', async () => {
        const oldHandler = vi.fn()
        const oldVdom = h('button', { on: { click: oldHandler } }, ['Click me'])
        const newHandler = vi.fn()
        const newVdom = h('button', { on: { click: newHandler } }, ['Click me'])

        await patch(oldVdom, newVdom)

        document.body.querySelector('button').click()

        expect(oldHandler).not.toHaveBeenCalled()
        expect(newHandler).toHaveBeenCalled()
        expect(newVdom.listeners).not.toBeUndefined()
    })

    test('移除 event handler', async () => {
        const oldHandler = vi.fn()
        const oldVdom = h('button', { on: { click: oldHandler } }, ['Click me'])
        const newVdom = h('button', {}, ['Click me'])

        await patch(oldVdom, newVdom)

        document.body.querySelector('button').click()

        expect(oldHandler).not.toHaveBeenCalled()
        expect(newVdom.listeners).toStrictEqual({})
    })
})

describe('修改 children', () => {
    describe('文本 node', () => {
        test('添加末尾', async () => {
            const oldVdom = h('div', {}, ['A'])
            const newVdom = h('div', {}, ['A', 'B'])

            await patch(oldVdom, newVdom)

            expect(document.body.innerHTML).toBe('<div>AB</div>')
        })

        test('添加开始', async () => {
            const oldVdom = h('div', {}, ['B'])
            const newVdom = h('div', {}, ['A', 'B'])

            await patch(oldVdom, newVdom)

            expect(document.body.innerHTML).toBe('<div>AB</div>')
        })

        test('添加中间', async () => {
            const oldVdom = h('div', {}, ['A', 'B'])
            const newVdom = h('div', {}, ['A', 'B', 'C'])

            await patch(oldVdom, newVdom)

            expect(document.body.innerHTML).toBe('<div>ABC</div>')
        })

        test('移除末尾', async () => {
            const oldVdom = h('div', {}, ['A', 'B'])
            const newVdom = h('div', {}, ['A'])

            await patch(oldVdom, newVdom)

            expect(document.body.innerHTML).toBe('<div>A</div>')
        })

        test('移除开始', async () => {
            const oldVdom = h('div', {}, ['A', 'B'])
            const newVdom = h('div', {}, ['B'])

            await patch(oldVdom, newVdom)

            expect(document.body.innerHTML).toBe('<div>B</div>')
        })

        test('移除中间', async () => {
            const oldVdom = h('div', {}, ['A', 'B', 'C'])
            const newVdom = h('div', {}, ['A', 'C'])

            await patch(oldVdom, newVdom)

            expect(document.body.innerHTML).toBe('<div>AC</div>')
        })

        test('改变', async () => {
            const oldVdom = h('div', {}, ['A'])
            const newVdom = h('div', {}, ['B'])

            await patch(oldVdom, newVdom)

            expect(document.body.innerHTML).toBe('<div>B</div>')
        })

        test('移动到旁边', async () => {
            const oldVdom = h('div', {}, ['A', 'B', 'C'])
            const newVdom = h('div', {}, ['C', 'A', 'B'])

            await patch(oldVdom, newVdom)

            expect(document.body.innerHTML).toBe('<div>CAB</div>')
        })

        test('递归', async () => {
            const oldVdom = hFragment([
                h('p', {}, ['A']),
                h('span', {}, ['B']),
                h('div', {}, ['C']),
            ])
            const newVdom = hFragment([
                h('div', {}, ['C']),
                h('span', { id: 'b' }, ['B']),
            ])

            await patch(oldVdom, newVdom)

            expect(document.body.innerHTML).toBe(
                '<div>C</div><span id="b">B</span>'
            )
        })
    })

    describe('element node', () => {
        test('添加末尾', async () => {
            const oldVdom = h('div', {}, [h('span', {}, ['A'])])
            const newVdom = h('div', {}, [
                h('span', {}, ['A']),
                h('span', { id: 'b' }, ['B']),
            ])

            await patch(oldVdom, newVdom)

            expect(document.body.innerHTML).toBe(
                '<div><span>A</span><span id="b">B</span></div>'
            )
        })

        test('添加开始', async () => {
            const oldVdom = h('div', {}, [h('span', {}, ['B'])])
            const newVdom = h('div', {}, [
                h('span', { id: 'a' }, ['A']),
                h('span', {}, ['B']),
            ])

            await patch(oldVdom, newVdom)

            expect(document.body.innerHTML).toBe('<div><span id="a">A</span><span>B</span></div>')
        })

        test('添加中间', async () => {
            const oldVdom = h('div', {}, [
                h('span', {}, ['A']),
                h('span', {}, ['C']),
            ])
            const newVdom = h('div', {}, [
                h('span', {}, ['A']),
                h('span', { id: 'b' }, ['B']),
                h('span', {}, ['C']),
            ])

            await patch(oldVdom, newVdom)

            expect(document.body.innerHTML).toBe('<div><span>A</span><span id="b">B</span><span>C</span></div>')
        })

        test('移除末尾', async () => {
            const oldVdom = h('div', {}, [
                h('span', {}, ['A']),
                h('span', {}, ['B']),
            ])
            const newVdom = h('div', {}, [h('span', {}, ['A'])])

            await patch(oldVdom, newVdom)

            expect(document.body.innerHTML).toBe('<div><span>A</span></div>')
        })

        test('移除开始', async () => {
            const oldVdom = h('div', {}, [
                h('span', {}, ['A']),
                h('span', {}, ['B']),
            ])
            const newVdom = h('div', {}, [h('span', {}, ['B'])])

            await patch(oldVdom, newVdom)

            expect(document.body.innerHTML).toBe('<div><span>B</span></div>')
        })

        test('移除中间', async () => {
            const oldVdom = h('div', {}, [
                h('span', {}, ['A']),
                h('span', {}, ['B']),
                h('span', {}, ['C']),
            ])
            const newVdom = h('div', {}, [
                h('span', {}, ['A']),
                h('span', {}, ['C']),
            ])

            await patch(oldVdom, newVdom)

            expect(document.body.innerHTML).toBe('<div><span>A</span><span>C</span></div>')
        })

        test('移动到旁边', async () => {
            const oldVdom = h('div', {}, [
                h('span', {}, ['A']),
                h('span', {}, ['B']),
                h('span', {}, ['C']),
            ])
            const newVdom = h('div', {}, [
                h('span', {}, ['C']),
                h('span', {}, ['A']),
                h('span', {}, ['B']),
            ])

            await patch(oldVdom, newVdom)

            expect(document.body.innerHTML).toBe('<div><span>C</span><span>A</span><span>B</span></div>')
        })
    })

    describe('fragment node', () => {
        test('添加末尾', async () => {
            const oldVdom = hFragment([h('span', {}, ['A'])])
            const newVdom = hFragment([
                h('span', {}, ['A']),
                h('span', { id: 'b' }, ['B']),
            ])

            await patch(oldVdom, newVdom)

            expect(document.body.innerHTML).toBe('<span>A</span><span id="b">B</span>')
        })

        test('添加开始', async () => {
            const oldVdom = hFragment([h('span', {}, ['B'])])
            const newVdom = hFragment([
                h('span', { id: 'a' }, ['A']),
                h('span', {}, ['B']),
            ])

            await patch(oldVdom, newVdom)

            expect(document.body.innerHTML).toBe('<span id="a">A</span><span>B</span>')
        })

        test('添加中间', async () => {
            const oldVdom = hFragment([
                h('span', {}, ['A']),
                h('span', {}, ['C']),
            ])
            const newVdom = hFragment([
                h('span', {}, ['A']),
                h('span', { id: 'b' }, ['B']),
                h('span', {}, ['C']),
            ])

            await patch(oldVdom, newVdom)

            expect(document.body.innerHTML).toBe('<span>A</span><span id="b">B</span><span>C</span>')
        })

        test('移除末尾', async () => {
            const oldVdom = hFragment([
                h('span', {}, ['A']),
                h('span', {}, ['B']),
            ])
            const newVdom = hFragment([h('span', {}, ['A'])])

            await patch(oldVdom, newVdom)

            expect(document.body.innerHTML).toBe('<span>A</span>')
        })

        test('移除开始', async () => {
            const oldVdom = hFragment([
                h('span', {}, ['A']),
                h('span', {}, ['B']),
            ])
            const newVdom = hFragment([h('span', {}, ['B'])])

            await patch(oldVdom, newVdom)

            expect(document.body.innerHTML).toBe('<span>B</span>')
        })

        test('移除中间', async () => {
            const oldVdom = hFragment([
                h('span', {}, ['A']),
                h('span', {}, ['B']),
                h('span', {}, ['C']),
            ])
            const newVdom = hFragment([
                h('span', {}, ['A']),
                h('span', {}, ['C']),
            ])

            await patch(oldVdom, newVdom)

            expect(document.body.innerHTML).toBe('<span>A</span><span>C</span>')
        })

        test('追加 fragment', async () => {
            const oldVdom = hFragment([h('span', {}, ['A'])])
            const newVdom = hFragment([
                h('span', {}, ['A']),
                hFragment([h('span', {}, ['B'])]),
            ])

            await patch(oldVdom, newVdom)

            expect(document.body.innerHTML).toBe('<span>A</span><span>B</span>')
        })

        test('移动到旁边', async () => {
            const oldVdom = hFragment([
                h('span', {}, ['A']),
                h('span', {}, ['B']),
                h('span', {}, ['C']),
            ])
            const newVdom = hFragment([
                h('span', {}, ['C']),
                h('span', {}, ['A']),
                h('span', {}, ['B']),
            ])

            await patch(oldVdom, newVdom)

            expect(document.body.innerHTML).toBe('<span>C</span><span>A</span><span>B</span>')
        })
    })
})

describe('修改组件 vdom', () => {
    const component = { count: 5 }
    const props = {on: {click() {this.count++}}}

    afterEach(() => {component.count = 5})

    test('当 root node 改变, 将组件绑定到事件 handler', async () => {
        const oldVdom = h('button', {}, ['Click'])
        const newVdom = h('div', props, ['Click'])

        await patch(oldVdom, newVdom, component)
        document.querySelector('div').click()

        expect(document.body.innerHTML).toBe('<div>Click</div>')
        expect(component.count).toBe(6)
    })

    test('当添加 child node, 绑定它的事件 handlers 到组件', async () => {
        const oldVdom = h('div', {}, ['hi'])
        const newVdom = h('div', {}, ['hi', h('button', props, ['Click'])])

        await patch(oldVdom, newVdom, component)
        document.querySelector('button').click()

        expect(document.body.innerHTML).toBe('<div>hi<button>Click</button></div>')
        expect(component.count).toBe(6)
    })

    test('当修改事件, 绑定它的事件 handlers 到组件', async () => {
        const oldVdom = h('button', {}, ['Click'])
        const newVdom = h('button', props, ['Click'])

        await patch(oldVdom, newVdom, component)
        document.querySelector('button').click()

        expect(document.body.innerHTML).toBe('<button>Click</button>')
        expect(component.count).toBe(6)
    })

    test('当 child node 移动, 绑定它的事件 handlers 到组件', async () => {
        const oldVdom = hFragment([
            h('span', {}, ['A']),
            h('button', {}, ['B']),
        ])
        const newVdom = hFragment([
            h('button', props, ['B']),
            h('span', {}, ['A']),
        ])

        await patch(oldVdom, newVdom, component)
        document.querySelector('button').click()

        expect(document.body.innerHTML).toBe('<button>B</button><span>A</span>')
        expect(component.count).toBe(6)
    })

    test('当子节点 noop 时, 绑定它的事件 handlers 到组件', async () => {
        const oldVdom = hFragment([h('button', {}, ['A'])])
        const newVdom = hFragment([h('button', props, ['A'])])

        await patch(oldVdom, newVdom, component)
        document.querySelector('button').click()

        expect(document.body.innerHTML).toBe('<button>A</button>')
        expect(component.count).toBe(6)
    })
})

describe('修改组件 props', () => {
    const Component = defineComponent({
        render() {return h('span', { class: 'foo' }, [this.props.text])},
    })

    test('新 props 修改到 DOM', async () => {
        const oldVdom = h(Component, { text: 'one' })
        const newVdom = h(Component, { text: 'two' })

        await patch(oldVdom, newVdom)

        expect(document.body.innerHTML).toBe('<span class="foo">two</span>')
    })

    test("保留组件实例(不重新创建组件)", async () => {
        const oldVdom = h(Component, { text: 'one' })
        const newVdom = h(Component, { text: 'two' })

        await patch(oldVdom, newVdom)

        expect(newVdom.component).toBe(oldVdom.component)
    })
})

describe('修改组件 keys', () => {
    const Component = defineComponent({
        state() {
            return { highlighted: false }
        },

        render() {
            const { highlighted } = this.state
            const { text } = this.props

            return h(
                'span',
                {
                    class: highlighted ? 'highlighted' : '',
                    id: text,
                    on: {
                        click: () => this.updateState({ highlighted: !highlighted }),
                    },
                },
                [text]
            )
        },
    })

    test('交换两个 components', async () => {
        const oldVdom = hFragment([
            h(Component, { key: 'a', text: 'A' }),
            h(Component, { key: 'b', text: 'B' }),
        ])
        const newVdom = hFragment([
            h(Component, { key: 'b', text: 'B' }),
            h(Component, { key: 'a', text: 'A' }),
        ])

        await mountDOM(oldVdom, document.body)

        document.querySelector('#A').click()
        expect(document.body.innerHTML).toBe(singleHtmlLine`<span id="A" class="highlighted">A</span><span id="B">B</span>`)

        await patchDOM(oldVdom, newVdom, document.body)

        expect(document.body.innerHTML).toBe(singleHtmlLine`<span id="B">B</span><span id="A" class="highlighted">A</span>`)
    })

    test('在中间添加一个新组件', async () => {
        const oldVdom = hFragment([
            h(Component, { key: 'a', text: 'A' }),
            h(Component, { key: 'b', text: 'B' }),
        ])
        const newVdom = hFragment([
            h(Component, { key: 'a', text: 'A' }),
            h(Component, { key: 'c', text: 'C' }),
            h(Component, { key: 'b', text: 'B' }),
        ])

        await mountDOM(oldVdom, document.body)

        document.querySelector('#A').click()
        document.querySelector('#B').click()
        expect(document.body.innerHTML).toBe(singleHtmlLine`<span id="A" class="highlighted">A</span><span id="B" class="highlighted">B</span>`)

        await patchDOM(oldVdom, newVdom, document.body)

        expect(document.body.innerHTML).toBe(singleHtmlLine`<span id="A" class="highlighted">A</span><span id="C">C</span><span id="B" class="highlighted">B</span>`)
    })

    test('在中间移除一个组件', async () => {
        const oldVdom = hFragment([
            h(Component, { key: 'a', text: 'A' }),
            h(Component, { key: 'b', text: 'B' }),
            h(Component, { key: 'c', text: 'C' }),
        ])
        const newVdom = hFragment([
            h(Component, { key: 'a', text: 'A' }),
            h(Component, { key: 'c', text: 'C' }),
        ])

        await mountDOM(oldVdom, document.body)

        document.querySelector('#B').click()
        expect(document.body.innerHTML).toBe(singleHtmlLine`<span id="A">A</span><span id="B" class="highlighted">B</span><span id="C">C</span>`)

        patchDOM(oldVdom, newVdom, document.body)

        expect(document.body.innerHTML).toBe(singleHtmlLine`<span id="A">A</span><span id="C">C</span>`)
    })

    test("当一个组件改变了它的键，就失去了它的内部状态(它被重新创建)", async () => {
        const oldVdom = hFragment([
            h(Component, { key: 'a', text: 'A' }),
            h(Component, { key: 'b', text: 'B' }),
        ])
        const newVdom = hFragment([
            h(Component, { key: 'a', text: 'A' }),
            h(Component, { key: 'c', text: 'C' }),
        ])

        await mountDOM(oldVdom, document.body)

        document.querySelector('#A').click()
        document.querySelector('#B').click()
        expect(document.body.innerHTML).toBe(singleHtmlLine`<span id="A" class="highlighted">A</span><span id="B" class="highlighted">B</span>`)

        await patchDOM(oldVdom, newVdom, document.body)

        expect(document.body.innerHTML).toBe(singleHtmlLine`<span id="A" class="highlighted">A</span><span id="C">C</span>`)
    })
})

describe('组件中的子数组', () => {
    const SwapComponent = defineComponent({
        state() {
            return { swap: false }
        },
        render() {
            return hFragment([
                h('span', {}, ['B']),
                this.state.swap ? h('p', {}, ['XX']) : h('span', {}, ['C']),
            ])
        },
    })

    const MoveComponent = defineComponent({
        state() {
            return { move: false }
        },
        render() {
            if (this.state.move) {
                return hFragment([h('p', {}, ['C']), h('span', {}, ['B'])])
            }

            return hFragment([h('span', {}, ['B']), h('p', {}, ['C'])])
        },
    })

    test('在组件内交换项(remove + add)，该组件位于同一父节点中的元素之后', async () => {
        const vdom = h('div', {}, [h('span', {}, ['A']), h(SwapComponent)])
        await mountDOM(vdom, document.body)

        const component = vdom.children[1].component
        await component.updateState({ swap: true })

        expect(document.body.innerHTML).toBe( singleHtmlLine`<div><span>A</span><span>B</span><p>XX</p></div>`)
    })

    test('移动组件中的项，该组件位于同一父节点中的元素之后', async () => {
        const vdom = h('div', {}, [h('span', {}, ['A']), h(MoveComponent)])
        await mountDOM(vdom, document.body)

        const component = vdom.children[1].component
        await component.updateState({ move: true })

        expect(document.body.innerHTML).toBe(singleHtmlLine`<div><span>A</span><p>C</p><span>B</span></div>`)
    })

    test('在fragment中元素之后的组件中交换项(remove + add)', async () => {
        const vdom = hFragment([h('span', {}, ['A']), h(SwapComponent)])
        await mountDOM(vdom, document.body)

        const component = vdom.children[1].component
        await component.updateState({ swap: true })

        expect(document.body.innerHTML).toBe(singleHtmlLine`<span>A</span><span>B</span><p>XX</p>`)
    })

    test('在组件中移动项，该组件位于片段中的元素之后', async () => {
        const vdom = hFragment([h('span', {}, ['A']), h(MoveComponent)])
        await mountDOM(vdom, document.body)

        const component = vdom.children[1].component
        await component.updateState({ move: true })

        expect(document.body.innerHTML).toBe(singleHtmlLine`<span>A</span><p>C</p><span>B</span>`)
    })
})

test('修改组件，其中顶层元素在渲染之间改变', async () => {
    const Component = defineComponent({
        render() {
            if (this.props.show) {
                return h('div', {}, ['A'])
            }
            return h('span', {}, ['B'])
        },
    })

    const oldVdom = h(Component, { show: true })
    const newVdom = h(Component, { show: false })
    await mountDOM(oldVdom, document.body)

    expect(document.body.innerHTML).toBe('<div>A</div>')
    expect(oldVdom.el).toBeInstanceOf(HTMLDivElement)

    await patchDOM(oldVdom, newVdom, document.body)

    expect(document.body.innerHTML).toBe('<span>B</span>')
    expect(newVdom.el).toBeInstanceOf(HTMLSpanElement)
})

test('修改有 fragments 包含两个有 key 组件', async () => {
    const Component = defineComponent({
        render() {
            return hFragment([h('span', {}, ['A']), h('span', {}, ['B'])])
        },
    })

    const oldVdom = hFragment([
        h(Component, { key: 'a' }),
        h(Component, { key: 'b' }),
    ])
    const newVdom = hFragment([
        h(Component, { key: 'b' }),
        h(Component, { key: 'a' }),
    ])

    await patch(oldVdom, newVdom)

    expect(document.body.innerHTML).toBe(singleHtmlLine`<span>A</span><span>B</span><span>A</span><span>B</span>`)
})

async function patch(oldVdom, newVdom, hostComponent = null) {
    await mountDOM(oldVdom, document.body)
    return patchDOM(oldVdom, newVdom, document.body, hostComponent)
}