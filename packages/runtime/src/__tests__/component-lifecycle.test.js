import {beforeEach, expect, test, vi} from 'vitest'
import {defineComponent} from "../component";
import {h, hString} from "../h";
import {mountDOM} from "../mount-dom";
import {nextTick} from "../scheduler";
import {destroyDOM} from "../destroy-dom";

beforeEach(() => {
    document.body.innerHTML = ''
})

test('组件对挂载有反应', async () => {
    const onMounted = vi.fn()
    const Component = defineComponent({
        state() {
            return {mounted: false}
        },
        onMounted() {
            onMounted()
            this.updateState({mounted: true})
        },
        render() {
            return h('div', {}, [
                hString(this.state.mounted ? 'mounted' : 'not mounted'),
            ])
        },
    })

    mountDOM(h(Component, {}), document.body)
    await nextTick()

    expect(onMounted).toHaveBeenCalledTimes(1)
    expect(document.body.textContent).toBe('mounted')
})

test('组件对被挂载做出异步反应', async () => {
    const onMounted = vi.fn().mockResolvedValue({})
    const Component = defineComponent({
        state() {
            return {mounted: false}
        },
        render() {
            return h('div', {}, [
                hString(this.state.mounted ? 'mounted' : 'not mounted'),
            ])
        },
        async onMounted() {
            await onMounted()
            this.updateState({mounted: true})
        },
    })

    mountDOM(h(Component, {}), document.body)
    await nextTick()

    expect(onMounted).toHaveBeenCalledTimes(1)
    expect(document.body.textContent).toBe('mounted')
})

test('组件对卸载有反应', async () => {
    const onMounted = vi.fn()
    const onUnmounted = vi.fn()
    const Component = defineComponent({
        onMounted,
        onUnmounted,
        render() {
            return h('div')
        },
    })
    const vdom = h(Component, {})

    mountDOM(vdom, document.body)
    await nextTick()

    destroyDOM(vdom)
    await nextTick()

    expect(onMounted).toHaveBeenCalledTimes(1)
    expect(onUnmounted).toHaveBeenCalledTimes(1)
})

test('组件对异步卸载做出反应', async () => {
    const onMounted = vi.fn()
    const onUnmounted = vi.fn().mockResolvedValue({})
    const Component = defineComponent({
        onMounted,
        onUnmounted,
        render() {
            return h('div')
        },
    })
    const vdom = h(Component, {})

    mountDOM(vdom, document.body)
    await nextTick()

    destroyDOM(vdom)
    await nextTick()

    expect(onMounted).toHaveBeenCalledTimes(1)
    expect(onUnmounted).toHaveBeenCalledTimes(1)
})