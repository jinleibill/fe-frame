import {afterEach, beforeEach, describe, expect, test} from 'vitest'
import {createApp} from "../app";
import {App} from "./app";
import {nextTick} from "../scheduler";
import {singleHtmlLine} from "./utils";

let app

beforeEach(() => {
    app = createApp(App, {todos: ['修电视']})
})

afterEach(() => {
    document.body.innerHTML = "";
})

describe('当应用挂载时', () => {
    afterEach(async () => {
        await nextTick()
        app.unmount()
    })

    test('显示 loading 消息', () => {
        app.mount(document.body)
        nextTick()

        expect(document.body.innerHTML).toBe(singleHtmlLine`<p>加载中...</p>`)
    })

    test('加载数据并渲染完成', async () => {
        app.mount(document.body)
        await nextTick()

        expect(document.body.innerHTML).toBe(
            singleHtmlLine`
            <h1>待办事项</h1>
            <input type="text">
            <button>添加</button>
            <ul>
                <li>
                    <span>遛狗</span>
                    <button>完成</button>
                </li>
                <li>
                    <span>浇花</span>
                    <button>完成</button>
                </li>
            </ul>`
        )
    })
})

describe('当应用卸载时', () => {
    beforeEach(async () => {
        app.mount(document.body)
        await nextTick()
    })

    test('从父元素移除', async () => {
        app.unmount()
        await nextTick()

        expect(document.body.innerHTML).toBe('')
    })
})

describe('当用户添加一个待办时', () => {
    beforeEach(async () => {
        app.mount(document.body)
        await nextTick()

        writeInInput('买手机')
        clickAddButton()

        await nextTick()
    })

    test('添加待办', () => {
        expect(document.body.innerHTML).toBe(
            singleHtmlLine`
            <h1>待办事项</h1>
            <input type="text">
            <button>添加</button>
            <ul>
                <li>
                    <span>遛狗</span>
                    <button>完成</button>
                </li>
                <li>
                    <span>浇花</span>
                    <button>完成</button>
                </li>
                <li>
                    <span>买手机</span>
                    <button>完成</button>
                </li>
            </ul>`
        )
    })
})

describe('当用户移除一个待办时', () => {
    beforeEach(async () => {
        app.mount(document.body)
        await nextTick()

        clickDoneButton(0)
    })

    test('移除待办', () => {
        expect(document.body.innerHTML).toBe(
            singleHtmlLine`
            <h1>待办事项</h1>
            <input type="text">
            <button>添加</button>
            <ul>
                <li>
                    <span>浇花</span>
                    <button>完成</button>
                </li>
            </ul>`
        )
    })
})

function writeInInput(text) {
    document.querySelector('input').value = text
    document.querySelector('input').dispatchEvent(new Event('input'))
}

function clickAddButton() {
    document.querySelector('button').click()
}

function clickDoneButton(index) {
    document.querySelectorAll('li button')[index].click()
}

