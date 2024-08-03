import {beforeEach, describe, expect, test, vi} from 'vitest'
import {defineComponent} from "../component";
import {h, hFragment, hString} from "../h";
import {nextTick} from "../scheduler";
import {singleHtmlLine} from "./utils";
import {mountDOM} from "../mount-dom";

beforeEach(() => {
    document.body.innerHTML = ''
})

const Comp = defineComponent({
    render() {
        return h('p', {}, ['test'])
    },
})

const FragComp = defineComponent({
    render() {
        return hFragment([
            h('p', {}, ['test1']),
            h('p', {}, ['test2']),
        ])
    },
})

const PropsComp = defineComponent({
    render() {
        return h('p', {class: this.props.pClass}, [
            'test',
        ])
    },
})

const StateComp = defineComponent({
    state() {
        return {count: 0}
    },
    render() {
        return h(
            'button',
            {
                on: {
                    click: () => this.updateState({count: this.state.count + 1}),
                },
            },
            [hString(this.state.count)]
        )
    },
})

const DefinitionsComponent = defineComponent({
    state() {
        return {
            items: [
                'test1',
                'test2',
                'test3',
            ],
        }
    },
    render() {
        return h(List, {
            items: this.state.items,
            on: {'remove-item': this.removeItem},
        })
    },
    removeItem(item) {
        const idx = this.state.items.indexOf(item)
        const items = this.state.items.filter((_, i) => i !== idx)
        this.updateState({items})
    },
})

const List = defineComponent({
    render() {
        return h(
            'ul',
            {},
            this.props.items.map((item) =>
                h(ListItem, {
                    text: item,
                    on: {'remove-item': (item) => this.emit('remove-item', item)},
                })
            )
        )
    },
})

const ListItem = defineComponent({
    state() {
        return {highlighted: false}
    },
    render() {
        return h(
            'li',
            {
                class: this.state.highlighted ? 'highlighted' : '',
                on: {
                    click: () => this.updateState({highlighted: !this.state.highlighted}),
                    dblclick: () => this.emit('remove-item', this.props.text),
                },
            }, [this.props.text]
        )
    },
})

describe("挂载和卸载", () => {
    test("挂载到 DOM", () => {
        new Comp().mount(document.body)

        expect(document.body.innerHTML).toBe('<p>test</p>')
    })

    test("挂载到指定位置", () => {
        document.body.innerHTML = '<h1>title</h1><hr>'

        new Comp().mount(document.body, 1)

        expect(document.body.innerHTML).toBe(
            '<h1>title</h1><p>test</p><hr>'
        )
    })

    test("不能挂载多次", () => {
        const comp = new Comp()
        comp.mount(document.body)

        expect(() => comp.mount(document.body)).toThrow(/already mounted/)
    })

    test("可以卸载", () => {
        const comp = new Comp()
        comp.mount(document.body)
        comp.unmount()

        expect(document.body.innerHTML).toBe('')
    })

    test("如果没有挂载，不能卸载", () => {
        const comp = new Comp()

        expect(() => comp.unmount()).toThrow(/not mounted/)
    })

    test("卸载后可再次挂载", () => {
        const comp = new Comp()
        comp.mount(document.body)
        comp.unmount()
        comp.mount(document.body)

        expect(document.body.innerHTML).toBe('<p>test</p>')
    })

    test("可以挂载 fragment", () => {
        const comp = new FragComp()
        comp.mount(document.body)

        expect(document.body.innerHTML).toBe('<p>test1</p><p>test2</p>')
    })
})

describe('component props', () => {
    test('有 props', () => {
        const comp = new PropsComp({pClass: 'definition'})
        comp.mount(document.body)

        expect(document.body.innerHTML).toBe('<p class="definition">test</p>')
    })

    test('如果组件没挂载，不能修改 DOM', () => {
        const comp = new PropsComp({pClass: 'definition'})
        expect(() => comp.updateProps({pClass: 'test'})).toThrow(/not mounted/)
    })

    test('当 props 已更新，DOM 可以修改', () => {
        const comp = new PropsComp({pClass: 'definition'})
        comp.mount(document.body)

        comp.updateProps({pClass: 'test'})

        expect(document.body.innerHTML).toBe('<p class="test">test</p>')
    })

    test('如果 props 相同，不能修改 DOM', () => {
        const comp = new PropsComp({pClass: 'definition'})
        comp.mount(document.body)

        const renderSpy = vi.spyOn(comp, 'render')

        comp.updateProps({pClass: 'definition'})

        expect(renderSpy).not.toHaveBeenCalled()
    })
})

describe('component state', () => {
    test('有内部状态', () => {
        const comp = new StateComp()
        comp.mount(document.body)

        expect(document.body.innerHTML).toBe('<button>0</button>')
    })

    test('基于 props', () => {
        const Comp = defineComponent({
            state(props) {
                return {count: props.initialCount}
            },
            render() {
                return h('p', {}, [hString(this.state.count)])
            }
        })

        const comp = new Comp({initialCount: 10})
        comp.mount(document.body)

        expect(document.body.innerHTML).toBe('<p>10</p>')
    })

    test('当状态改变，DOM 修改', () => {
        const comp = new StateComp()
        comp.mount(document.body)

        comp.updateState({count: 5})

        expect(document.body.innerHTML).toBe('<button>5</button>')
    })

    test('通过事件改变状态', () => {
        const comp = new StateComp()
        comp.mount(document.body)

        document.querySelector('button').click()

        expect(document.body.innerHTML).toBe('<button>1</button>')
    })
})

describe('component 方法', () => {
    test('使用方法处理事件', () => {
        const Comp = defineComponent({
            state() {
                return {count: 0}
            },
            render() {
                return h('button', {
                    on: {click: this.increment}
                }, [hString(this.state.count)])
            },
            increment() {
                this.updateState({count: this.state.count + 1})
            },
        })
        const comp = new Comp()
        comp.mount(document.body)

        document.querySelector('button').click()
        expect(document.body.innerHTML).toBe('<button>1</button>')
    })
})

describe('修改 DOM', () => {
    test('添加事件监听器到组件', async () => {
        const Component = defineComponent({
            state() {
                return {count: 0}
            },
            render() {
                return hFragment([
                    this.state.count > 0
                        ? h('button', {
                            id: 'minus-btn',
                            on: {
                                click() {
                                    this.updateState({count: this.state.count - 1})
                                }
                            },
                        }, ['-'])
                        : null,
                    h('span', {}, [hString(this.state.count)]),
                    h('button', {
                        id: 'plus-btn',
                        on: {
                            click: () => {
                                this.updateState({count: this.state.count + 1})
                            }
                        },
                    }, ['+'])
                ])
            }
        })

        const comp = new Component()
        comp.mount(document.body)

        expect(document.body.innerHTML).toBe(
            '<span>0</span><button id="plus-btn">+</button>'
        )

        document.querySelector('#plus-btn').click()
        await nextTick()
        expect(document.body.innerHTML).toBe(
            '<button id="minus-btn">-</button><span>1</span><button id="plus-btn">+</button>'
        )

        document.querySelector('#minus-btn').click()
        expect(document.body.innerHTML).toBe(
            '<span>0</span><button id="plus-btn">+</button>'
        )
    })
})

describe('child component', () => {
    const items = ['test1', 'test2']

    test('可以挂载子组件', () => {
        const comp = new List({items})
        comp.mount(document.body)

        expect(document.body.innerHTML).toBe(
            '<ul><li>test1</li><li>test2</li></ul>'
        )
    })

    test('可以卸载子组件', () => {
        const comp = new List({items})
        comp.mount(document.body)

        comp.unmount()

        expect(document.body.innerHTML).toBe('')
    })

    test('通过重新渲染来保存子组件的状态', () => {
        const comp = new List({items})
        comp.mount(document.body)

        document.querySelectorAll('li')[0].click()
        expect(document.body.innerHTML).toBe(
            singleHtmlLine`
            <ul>
                <li class="highlighted">test1</li>
                <li>test2</li>
            </ul>`
        )

        comp.updateProps({
            items: [...items, 'test3'],
        })

        expect(document.body.innerHTML).toBe(
            singleHtmlLine`
            <ul>
                <li class="highlighted">test1</li>
                <li>test2</li>
                <li>test3</li>
            </ul>`
        )
    })

    test('添加子组件', () => {
        const comp = new List({items})
        comp.mount(document.body)

        comp.updateProps({
            items: [...items, 'test3'],
        })

        expect(document.body.innerHTML).toBe(
            singleHtmlLine`
            <ul>
                <li>test1</li>
                <li>test2</li>
                <li>test3</li>
            </ul>`
        )
    })

    test('移除子组件', () => {
        const comp = new List({items})
        comp.mount(document.body)

        comp.updateProps({items: [items[0]]})

        expect(document.body.innerHTML).toBe(
            singleHtmlLine`
            <ul>
                <li>test1</li>
            </ul>`
        )
    })
})

describe('事件', () => {
    test('组件可以触发事件', () => {
        const handler = vi.fn()
        const comp = new ListItem(
            {text: 'test1'},
            {'remove-item': handler}
        )
        comp.mount(document.body)

        document.querySelector('li').dispatchEvent(new Event('dblclick'))

        expect(handler).toHaveBeenCalledTimes(1)
        expect(handler).toHaveBeenCalledWith('test1')
    })

    test('在挂载组件之前，不会调用其事件处理程序', () => {
        const handler = vi.fn()
        const comp = new ListItem(
            {text: 'test1'},
            {'remove-item': handler}
        )

        comp.emit('remove-item')

        expect(handler).not.toHaveBeenCalled()
    })

    test('卸载组件时，将删除其事件处理程序', () => {
        const handler = vi.fn()
        const comp = new ListItem(
            {text: 'test1'},
            {'remove-item': handler}
        )
        comp.mount(document.body)
        comp.unmount()

        comp.emit('remove-item')

        expect(handler).not.toHaveBeenCalled()
    })

    test('事件处理程序可以绑定到组件', () => {
        const comp = new DefinitionsComponent()
        comp.mount(document.body)

        expect(document.body.innerHTML).toBe(
            singleHtmlLine`
            <ul>
                <li>test1</li>
                <li>test2</li>
                <li>test3</li>
            </ul>`
        )

        document.querySelectorAll('li')[1].dispatchEvent(new Event('dblclick'))

        expect(document.body.innerHTML).toBe(
            singleHtmlLine`
            <ul>
                <li>test1</li>
                <li>test3</li>
            </ul>`
        )
    })
})

describe('挂载 elements', () => {
    test('未挂载的组件没有挂载元素', () => {
        const Component = defineComponent({
            render() {
                return h('p', {}, ['test'])
            },
        })
        const comp = new Component()

        expect(comp.elements).toEqual([])
    })

    test('组件中只有一个根元素', () => {
        const Component = defineComponent({
            render() {
                return h('p', {}, ['test'])
            },
        })
        const comp = new Component()
        comp.mount(document.body)

        const expectedEl = document.querySelector('p')

        expect(comp.elements).toEqual([expectedEl])
    })

    test('组件的根 fragment 包含元素', () => {
        const Component = defineComponent({
            render() {
                return hFragment([
                    h('p', {}, ['test1']),
                    h('p', {}, ['test2']),
                ])
            },
        })
        const comp = new Component()
        comp.mount(document.body)

        const [expectedOne, expectedTwo] = document.querySelectorAll('p')

        expect(comp.elements).toEqual([expectedOne, expectedTwo])
    })

    test('组件的根 fragment 包含其他组件', () => {
        const Subcomponent = defineComponent({
            render() {
                return h('p', {}, ['test'])
            },
        })
        const Component = defineComponent({
            render() {
                return hFragment([h(Subcomponent), h(Subcomponent)])
            },
        })
        const comp = new Component()
        comp.mount(document.body)

        const [expectedOne, expectedTwo] = document.querySelectorAll('p')

        expect(comp.elements).toEqual([expectedOne, expectedTwo])
    })

    test('组件的根 fragment 包含其他嵌套组件', () => {
        const Subcomponent = defineComponent({
            render() {
                return hFragment([h('p', {}, ['One']), h('p', {}, ['Two'])])
            },
        })
        const Component = defineComponent({
            render() {
                return hFragment([h(Subcomponent), h(Subcomponent)])
            },
        })
        const comp = new Component()
        comp.mount(document.body)

        const [expectedOne, expectedTwo, expectedThree, expectedFour] =
            document.querySelectorAll('p')

        expect(comp.elements).toEqual([
            expectedOne,
            expectedTwo,
            expectedThree,
            expectedFour,
        ])
    })
})

describe('offset', () => {
    test('当组件的顶层元素是一个 fragment 时，它有一个偏移量', () => {
        const vdom = h('div', {}, [h(FragComp), h(FragComp), h(FragComp)])
        mountDOM(vdom, document.body)

        const firstComponent = vdom.children[0].component
        const secondComponent = vdom.children[1].component
        const thirdComponent = vdom.children[2].component

        expect(firstComponent.offset).toBe(0)
        expect(secondComponent.offset).toBe(2)
        expect(thirdComponent.offset).toBe(4)
    })

    test('当组件的顶层元素不是 fragment 时，它没有偏移量', () => {
        const vdom = h('div', {}, [h(Comp), h(Comp), h(Comp)])
        mountDOM(vdom, document.body)

        const firstComponent = vdom.children[0].component
        const secondComponent = vdom.children[1].component
        const thirdComponent = vdom.children[2].component

        expect(firstComponent.offset).toBe(0)
        expect(secondComponent.offset).toBe(0)
        expect(thirdComponent.offset).toBe(0)
    })
})
