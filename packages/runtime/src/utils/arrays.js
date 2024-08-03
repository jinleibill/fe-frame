import {makeCountMap, mapsDiff} from "./maps";

export function withoutNulls(arr) {
    return arr.filter((item) => item != null)
}

export function arraysDiff(oldArray, newArray) {
    const oldsCount = makeCountMap(oldArray)
    const newsCount = makeCountMap(newArray)
    const diff = mapsDiff(oldsCount, newsCount)

    const added = diff.added.flatMap((key) =>
        Array(newsCount.get(key)).fill(key)
    )

    const removed = diff.removed.flatMap((key) =>
        Array(oldsCount.get(key)).fill(key)
    )

    for (const key of diff.updated) {
        const oldCount = oldsCount.get(key)
        const newCount = newsCount.get(key)
        const delta = newCount - oldCount

        if (delta > 0) {
            added.push(...Array(delta).fill(key))
        } else {
            removed.push(...Array(-delta).fill(key))
        }
    }

    return {
        added: added,
        removed: removed,
    }
}

export const ARRAY_DIFF_OP = {
    ADD: "add",
    REMOVE: "remove",
    MOVE: "move",
    NOOP: "noop",
}

class ArrayWithOriginalIndices {
    #array = []
    #originalIndices = []
    #equalsFn

    constructor(array, equalsFn) {
        this.#array = [...array]
        this.#originalIndices = array.map((_, i) => i)
        this.#equalsFn = equalsFn
    }

    get length() {
        return this.#array.length
    }

    isRemoval(index, newArray) {
        if (index >= this.length) {
            return false
        }

        const item = this.#array[index]
        const indexInNewArray = newArray.findIndex((newItem) =>
            this.#equalsFn(item, newItem)
        )

        return indexInNewArray === -1
    }

    removeItem(index) {
        const operation = {
            op: ARRAY_DIFF_OP.REMOVE,
            index,
            item: this.#array[index],
        }

        this.#array.splice(index, 1)
        this.#originalIndices.splice(index, 1)

        return operation
    }

    isNoop(index, newArray) {
        if (index >= this.length) {
            return false
        }

        const item = this.#array[index]
        const newItem = newArray[index]

        return this.#equalsFn(item, newItem)
    }

    originalIndexAt(index) {
        return this.#originalIndices[index]
    }

    noopItem(index) {
        return {
            op: ARRAY_DIFF_OP.NOOP,
            originalIndex: this.originalIndexAt(index),
            index,
            item: this.#array[index],
        }
    }

    isAddition(item, fromIdx) {
        return this.findIndexFrom(item, fromIdx) === -1
    }

    findIndexFrom(item, fromIndex) {
        for (let i = fromIndex; i < this.length; i++) {
            if (this.#equalsFn(item, this.#array[i])) {
                return i
            }
        }

        return -1
    }

    addItem(item, index) {
        const operation = {
            op: ARRAY_DIFF_OP.ADD,
            index,
            item,
        }

        this.#array.splice(index, 0, item)
        this.#originalIndices.splice(index, 0, -1)

        return operation
    }

    moveItem(item, toIndex) {
        const fromIndex = this.findIndexFrom(item, toIndex)

        const operation = {
            op: ARRAY_DIFF_OP.MOVE,
            originalIndex: this.originalIndexAt(fromIndex),
            from: fromIndex,
            index: toIndex,
            item: this.#array[fromIndex],
        }

        const [_item] = this.#array.splice(fromIndex, 1)
        this.#array.splice(toIndex, 0, _item)

        const [originalIndex] = this.#originalIndices.splice(fromIndex, 1)
        this.#originalIndices.splice(toIndex, 0, originalIndex)

        return operation
    }

    removeItemsAfter(index) {
        const operations = []

        while (this.length > index) {
            operations.push(this.removeItem(index))
        }

        return operations
    }

}

export function arraysDiffSequence(oldArray, newArray, equalsFn = (a, b) => a === b) {
    const sequence = []
    const array = new ArrayWithOriginalIndices(oldArray, equalsFn)

    for (let index = 0; index < newArray.length; index++) {
        // removal
        if (array.isRemoval(index, newArray)) {
            sequence.push(array.removeItem(index))
            index--
            continue
        }
        // noop
        if (array.isNoop(index, newArray)) {
            sequence.push(array.noopItem(index))
            continue
        }
        // addition
        const item = newArray[index]

        if (array.isAddition(item, index)) {
            sequence.push(array.addItem(item, index))
            continue
        }
        // move
        sequence.push(array.moveItem(item, index))
    }

    // remove extra items
    sequence.push(...array.removeItemsAfter(newArray.length))

    return sequence
}

export function applyArraysDiffSequence(oldArray, diffSeq) {
    return diffSeq.reduce((array, {op, item, index, from}) => {
            switch (op) {
                case ARRAY_DIFF_OP.ADD:
                    array.splice(index, 0, item)
                    break

                case ARRAY_DIFF_OP.REMOVE:
                    array.splice(index, 1)
                    break

                case ARRAY_DIFF_OP.MOVE:
                    array.splice(index, 0, array.splice(from, 1)[0])
                    break
            }
            return array
        },
        [...oldArray]
    )
}