import {describe, expect, it, vi} from 'vitest'
import {Dispatcher} from '../dispatcher'

const commandName = 'test-event'
const payload = {test: 'payload'}

describe('命令分发器', () => {
    it('可以对指定命令注册和取消注册 handler', () => {
        const dispatcher = new Dispatcher()
        const handler = vi.fn()

        const unsubscribe = dispatcher.subscribe(commandName, handler)
        dispatcher.dispatch(commandName, payload)

        expect(handler).toHaveBeenCalledWith(payload)

        unsubscribe()
        dispatcher.dispatch(commandName, payload)

        expect(handler).toHaveBeenCalledTimes(1)
    })

    it("不能注册同一个 handler 两次", () => {
        const dispatcher = new Dispatcher()
        const handler = vi.fn()

        const unsubscribe = dispatcher.subscribe(commandName, handler)
        dispatcher.subscribe(commandName, handler)
        dispatcher.subscribe(commandName, handler)

        dispatcher.dispatch(commandName, payload)

        expect(handler).toHaveBeenCalledTimes(1)

        unsubscribe()
        dispatcher.dispatch(commandName, payload)

        expect(handler).toHaveBeenCalledTimes(1)
    })

    it('取消订阅多个 handlers', () => {
        const dispatcher = new Dispatcher()
        const handler1 = vi.fn()
        const handler2 = vi.fn()

        const unsubscribe1 = dispatcher.subscribe(commandName, handler1)
        const unsubscribe2 = dispatcher.subscribe(commandName, handler2)
        dispatcher.dispatch(commandName, payload)

        expect(handler1).toHaveBeenCalledWith(payload)
        expect(handler2).toHaveBeenCalledWith(payload)

        unsubscribe1()
        unsubscribe2()
        dispatcher.dispatch(commandName, payload)

        expect(handler1).toHaveBeenCalledTimes(1)
        expect(handler2).toHaveBeenCalledTimes(1)
    })

    it('可以注册和注销在每个命令之后运行的 handler', () => {
        const dispatcher = new Dispatcher()
        const handler = vi.fn()

        const unsubscribe = dispatcher.afterEveryCommand(handler)
        dispatcher.dispatch(commandName, payload)

        expect(handler).toHaveBeenCalled()

        unsubscribe()
        dispatcher.dispatch(commandName, payload)

        expect(handler).toHaveBeenCalledTimes(1)
    })
})