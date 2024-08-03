import {expect, test, vi} from "vitest";
import { addEventListener } from '../events'
import {flushPromises} from "../utils/promises";

test('不带 host 组件的同步事件，带参数调用', () => {
    const btn = makeButton()
    const handler = vi.fn()
    const argument = { foo: 'bar' }

    addEventListener('click', () => handler(argument), btn)
    btn.click()

    expect(handler).toHaveBeenCalledWith(argument)
})

test('不带 host 组件的异步事件', async () => {
    const btn = makeButton()
    let data = null
    async function handler() {
        data = 'not foo'
        await Promise.resolve()
        data = 'foo'
    }

    addEventListener('click', handler, btn)
    btn.click()

    await flushPromises()
    expect(data).toBe('foo')
})

test('host 组件同步事件，handler 绑定到组件', () => {
    const btn = makeButton()

    let actualArgument = null
    let actualBinding = null

    const hostComponent = { bar: 'baz' }
    function handler(arg) {
        actualBinding = this
        actualArgument = arg
    }

    addEventListener('click', handler, btn, hostComponent)
    btn.click()

    expect(actualBinding).toBe(hostComponent)
    expect(actualArgument).toBeInstanceOf(Event)
})

test('host 组件异步事件，handler 绑定到组件', async () => {
    const btn = makeButton()

    let actualArgument = null
    let actualBinding = null

    const hostComponent = { bar: 'baz' }
    async function handler(arg) {
        await Promise.resolve()
        actualBinding = this
        await Promise.resolve()
        actualArgument = arg
    }

    addEventListener('click', handler, btn, hostComponent)
    btn.click()

    await flushPromises()

    expect(actualBinding).toBe(hostComponent)
    expect(actualArgument).toBeInstanceOf(Event)
})


function makeButton() {
    const button = document.createElement('button')
    button.textContent = 'Click me'

    return button
}

