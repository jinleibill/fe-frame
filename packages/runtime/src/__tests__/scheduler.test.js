import { expect, test, vi } from 'vitest'
import {enqueueJob, nextTick} from "../scheduler";

test('进入队列的作业在nextTick之后运行', async () => {
    const job = vi.fn()
    enqueueJob(job)

    expect(job).not.toHaveBeenCalled()

    await nextTick()
    expect(job).toHaveBeenCalled()
})

test('排队作业按顺序运行', async () => {
    const order = []
    enqueueJob(() => order.push(1))
    enqueueJob(() => order.push(2))
    enqueueJob(() => order.push(3))

    expect(order).toEqual([])

    await nextTick()
    expect(order).toEqual([1, 2, 3])
})

test('作业在同步代码之后运行', async () => {
    const order = []
    enqueueJob(() => order.push(1))
    enqueueJob(() => order.push(2))
    enqueueJob(() => order.push(3))

    expect(order).toEqual([])

    order.push(4)

    await nextTick()
    expect(order).toEqual([4, 1, 2, 3])
})

test('异步作业阻塞会执行别的作业', async () => {
    const order = []
    enqueueJob(async () => {
        order.push(1)
        await Promise.resolve()
        order.push(2)
    })
    enqueueJob(() => order.push(3))

    await nextTick()

    expect(order).toEqual([1, 3, 2])
})