function withoutNulls(arr) {
    return arr.filter((item) => item != null)
}
function arraysDiff(oldArray, newArray) {
    return {
        added: newArray.filter((newItem) => !oldArray.includes(newItem)),
        removed: oldArray.filter((oldItem) => !newArray.includes(oldItem)),
    }
}
const ARRAY_DIFF_OP = {
    ADD: "add",
    REMOVE: "remove",
    MOVE: "move",
    NOOP: "noop",
};
class ArrayWithOriginalIndices {
    #array = []
    #originalIndices = []
    #equalsFn
    constructor(array, equalsFn) {
        this.#array = [...array];
        this.#originalIndices = array.map((_, i) => i);
        this.#equalsFn = equalsFn;
    }
    get length() {
        return this.#array.length
    }
    isRemoval(index, newArray) {
        if (index >= this.length) {
            return false
        }
        const item = this.#array[index];
        const indexInNewArray = newArray.findIndex((newItem) =>
            this.#equalsFn(item, newItem)
        );
        return indexInNewArray === -1
    }
    removeItem(index){
        const operation = {
            op: ARRAY_DIFF_OP.REMOVE,
            index,
            item: this.#array[index],
        };
        this.#array.splice(index, 1);
        this.#originalIndices.splice(index, 1);
        return operation
    }
    isNoop(index, newArray) {
        if (index >= this.length) {
            return false
        }
        const item = this.#array[index];
        const newItem = newArray[index];
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
        for (let i = fromIndex; i < this.length;i++) {
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
        };
        this.#array.splice(index, 0, item);
        this.#originalIndices.splice(index, 0, -1);
        return operation
    }
    moveItem(item, toIndex) {
        const fromIndex = this.findIndexFrom(item, toIndex);
        const operation = {
            op: ARRAY_DIFF_OP.MOVE,
            originalIndex: this.originalIndexAt(fromIndex),
            from: fromIndex,
            index: toIndex,
            item: this.#array[fromIndex],
        };
        const [_item] = this.#array.splice(fromIndex, 1);
        this.#array.splice(toIndex, 0, _item);
        const [originalIndex] = this.#originalIndices.splice(fromIndex, 1);
        this.#originalIndices.splice(toIndex, 0, originalIndex);
        return operation
    }
    removeItemsAfter(index) {
        const operations = [];
        while( this.length > index) {
            operations.push(this.removeItem(index));
        }
        return operations
    }
}
function arraysDiffSequence(oldArray, newArray, equalsFn = (a, b) => a === b) {
    const sequence = [];
    const array = new ArrayWithOriginalIndices(oldArray, equalsFn);
    for (let index= 0; index < newArray.length; index++) {
        if (array.isRemoval(index, newArray)) {
            sequence.push(array.removeItem(index));
            index--;
            continue
        }
        if (array.isNoop(index, newArray)) {
            sequence.push(array.noopItem(index));
            continue
        }
        const item = newArray[index];
        if (array.isAddition(item, index)) {
            sequence.push(array.addItem(item, index));
            continue
        }
        sequence.push(array.moveItem(item, index));
    }
    sequence.push(...array.removeItemsAfter(newArray.length));
    return sequence
}

const DOM_TYPES = {
    TEXT: "text",
    ELEMENT: "element",
    FRAGMENT: "fragment",
};
function h(tag, props = {}, children = []) {
    return {
        tag,
        props,
        children: mapTextNodes(withoutNulls(children)),
        type: DOM_TYPES.ELEMENT,
    }
}
function mapTextNodes(children) {
    return children.map((child) =>
        typeof child === "string" ? hString(child) : child
    )
}
function hString(str) {
    return {type: DOM_TYPES.TEXT, value: str};
}
function hFragment(vNodes) {
    return {
        type: DOM_TYPES.FRAGMENT,
        children: mapTextNodes(withoutNulls(vNodes)),
    }
}
function extractChildren(vdom) {
    if (vdom.children == null) {
        return []
    }
    const children = [];
    for (const child of vdom.children) {
        if (child.type === DOM_TYPES.FRAGMENT) {
            children.push(...extractChildren(child));
        } else {
            children.push(child);
        }
    }
    return children
}

function addEventListener(eventName, handler, el) {
    el.addEventListener(eventName, handler);
    return handler
}
function addEventListeners(listeners = {}, el) {
    const addedListeners = {};
    Object.entries(listeners).forEach(([eventName, handler]) => {
        addedListeners[eventName] = addEventListener(eventName, handler, el);
    });
    return addedListeners
}
function removeEventListeners(listeners = {}, el) {
    Object.entries(listeners).forEach(([eventName, handler]) => {
        el.removeEventListener(eventName, handler);
    });
}

function destroyDOM(vdom) {
    const {type} = vdom;
    switch (type) {
        case DOM_TYPES.TEXT: {
            removeTextNode(vdom);
            break
        }
        case DOM_TYPES.ELEMENT: {
            removeElementNode(vdom);
            break
        }
        case DOM_TYPES.FRAGMENT: {
            removeFragmentNodes(vdom);
            break
        }
        default:{
            throw new Error(`can't destroy DOM of type: ${type}`);
        }
    }
    delete vdom.el;
}
function removeTextNode(vdom) {
    const {el} = vdom;
    el.remove();
}
function removeElementNode(vdom) {
    const {el, children, listeners} = vdom;
    el.remove();
    children.forEach(destroyDOM);
    if (listeners) {
        removeEventListeners(listeners, el);
        delete vdom.listeners;
    }
}
function removeFragmentNodes(vdom) {
    const {children} = vdom;
    children.forEach(destroyDOM);
}

function setAttributes(el, attrs) {
    const {class: className, style, ...otherAttrs} = attrs;
    delete otherAttrs.key;
    if (className) {
        setClass(el, className);
    }
    if (style) {
        Object.entries(style).forEach(([prop, value]) => {
            setStyle(el, prop, value);
        });
    }
    for (const [name, value] of Object.entries(otherAttrs)) {
        setAttribute(el, name, value);
    }
}
function setClass(el, className) {
    el.className = "";
    if (typeof className === "string") {
        el.className = className;
    }
    if (Array.isArray(className)) {
        el.classList.add(...className);
    }
}
function setStyle(el, name, value) {
    el.style[name] = value;
}
function removeStyle(el, name) {
    el.style[name] = null;
}
function setAttribute(el, name, value) {
    if (value == null) {
        removeAttribute(el, name);
    } else if (name.startsWith("data-")) {
        el.setAttribute(name, value);
    } else {
        el[name] = value;
    }
}
function removeAttribute(el, name) {
    el[name] = null;
    el.removeAttribute(name);
}

function mountDOM(vdom, parentEl, index) {
    switch (vdom.type) {
        case DOM_TYPES.TEXT: {
            createTextNode(vdom, parentEl, index);
            break
        }
        case DOM_TYPES.ELEMENT: {
            createElementNode(vdom, parentEl, index);
            break
        }
        case DOM_TYPES.FRAGMENT: {
            createFragmentNodes(vdom, parentEl, index);
            break
        }
        default: {
            throw new Error(`Can't mount DOM of type: ${vdom.type}`)
        }
    }
}
function createTextNode(vdom, parentEl, index) {
    const { value } = vdom;
    const textNode = document.createTextNode(value);
    vdom.el = textNode;
    insert(textNode, parentEl, index);
}
function createElementNode(vdom, parentEl, index) {
    const {tag, props, children} = vdom;
    const element = document.createElement(tag);
    addProps(element, props, vdom);
    vdom.el = element;
    children.forEach((child) => mountDOM(child, element));
    insert(element, parentEl, index);
}
function addProps(el, props, vdom) {
    const {on: events, ...attrs} = props;
    vdom.listeners = addEventListeners(events, el);
    setAttributes(el, attrs);
}
function createFragmentNodes(vdom, parentEl, index) {
    const {children} = vdom;
    vdom.el = parentEl;
    children.forEach((child, i) =>
        mountDOM(child, parentEl, index ? index + i : null)
    );
}
function insert(el, parentEl, index) {
    if (index == null) {
        parentEl.append(el);
        return
    }
    if (index < 0 ){
        throw new Error(`Index must be a positive integer, got ${index}`)
    }
    const children = parentEl.childNodes;
    if (index >= children.length) {
        parentEl.append(el);
    } else {
        parentEl.insertBefore(el, children[index]);
    }
}

class Dispatcher {
    #subs = new Map();
    #afterHandlers = []
    dispatch(commandName, payload) {
        if (this.#subs.has(commandName)) {
            this.#subs.get(commandName).forEach((handler) => handler(payload));
        } else {
            console.warn(`No handlers for command: ${commandName}`);
        }
        this.#afterHandlers.forEach((handler) => handler());
    }
    subscribe(commandName, handler) {
        if (!this.#subs.has(commandName)) {
            this.#subs.set(commandName, []);
        }
        const handlers = this.#subs.get(commandName);
        if (handlers.includes(handler)) {
            return () => {}
        }
        handlers.push(handler);
        return () => {
            const idx = handlers.indexOf(handler);
            handlers.splice(idx, 1);
        }
    }
    afterEveryCommand(handler) {
        this.#afterHandlers.push(handler);
        return () => {
            const idx = this.#afterHandlers.indexOf(handler);
            this.#afterHandlers.splice(idx, 1);
        }
    }
}

function areNodesEqual(nodeOne, nodeTwo) {
    if (nodeOne.type !== nodeTwo.type) {
        return false;
    }
    if (nodeOne.type === DOM_TYPES.ELEMENT) {
        const {tag: tagOne} = nodeOne;
        const {tag: tagTwo} = nodeTwo;
        return tagOne === tagTwo
    }
    return true
}

function objectsDiff(oldObj, newObj) {
    const oldKeys = Object.keys(oldObj);
    const newKeys = Object.keys(newObj);
    return {
        added: newKeys.filter((key) => !(key in oldObj)),
        removed: oldKeys.filter((key) => !(key in newObj)),
        updated: newKeys.filter(
            (key) => key in oldObj && oldObj[key] !== newObj[key]
        )
    }
}

function isNotBlankOrEmptyString(str) {
    return isNotEmptyString(str.trim())
}
function isNotEmptyString(str) {
    return str !== ""
}

function patchDOM(oldVdom, newVdom, parentEl) {
    if (!areNodesEqual(oldVdom, newVdom)) {
        const index = findIndexInParent(parentEl, oldVdom.el);
        destroyDOM(oldVdom);
        mountDOM(newVdom, parentEl, index);
        return newVdom
    }
    newVdom.el = oldVdom.el;
    switch(newVdom.type) {
        case DOM_TYPES.TEXT: {
            patchText(oldVdom, newVdom);
            return newVdom
        }
        case DOM_TYPES.ELEMENT: {
            patchElement(oldVdom, newVdom);
            break
        }
    }
    patchChildren(oldVdom, newVdom);
    return newVdom
}
function findIndexInParent(parentEl, el) {
    const index = Array.from(parentEl.childNodes).indexOf(el);
    if (index < 0) {
        return null
    }
    return index
}
function patchText(oldVdom, newVdom) {
    const el = oldVdom.el;
    const {value: oldText} = oldVdom;
    const {value: newText} = newVdom;
    if (oldText !== newText) {
        el.nodeValue = newText;
    }
}
function patchElement(oldVdom, newVdom) {
    const el = oldVdom.el;
    const {
        class: oldClass,
        style: oldStyle,
        on: oldEvents,
        ...oldAttrs
    } = oldVdom.props;
    const {
        class: newClass,
        style: newStyle,
        on: newEvents,
        ...newAttrs
    } = newVdom.props;
    const {listeners: oldListeners} = oldVdom;
    patchAttrs(el, oldAttrs, newAttrs);
    patchClasses(el, oldClass, newClass);
    patchStyles(el, oldStyle, newStyle);
    newVdom.listeners = patchEvents(el, oldListeners,  oldEvents, newEvents);
}
function patchAttrs(el, oldAttrs, newAttrs) {
    const {added, removed, updated} = objectsDiff(oldAttrs, newAttrs);
    for (const attr of removed) {
        removeAttribute(el, attr);
    }
    for (const attr of added.concat(updated)) {
        setAttribute(el, attr, newAttrs[attr]);
    }
}
function patchClasses(el, oldClass, newClass) {
    const oldClasses = toClassList(oldClass);
    const newClasses = toClassList(newClass);
    const {added, removed} = arraysDiff(oldClasses, newClasses);
    if (removed.length > 0) {
        el.classList.remove(...removed);
    }
    if (added.length > 0) {
        el.classList.add(...added);
    }
}
function toClassList(classes = "") {
    return Array.isArray(classes)
        ? classes.filter(isNotBlankOrEmptyString)
        : classes.split(/(\s+)/).filter(isNotBlankOrEmptyString)
}
function patchStyles(el, oldStyle = {}, newStyle = {}) {
    const {added, removed, updated} = objectsDiff(oldStyle, newStyle);
    for (const style of removed) {
        removeStyle(el, style);
    }
    for (const style of added.concat(updated)) {
        setStyle(el, style, newStyle[style]);
    }
}
function patchEvents(el, oldListeners = {},  oldEvents = {}, newEvents = {}) {
    const {added, removed, updated} = objectsDiff(oldEvents, newEvents);
    for (const eventName of removed.concat(updated)) {
        el.removeEventListener(eventName, oldListeners[eventName]);
    }
    const addedListeners = {};
    for (const eventName of added.concat(updated)) {
        addedListeners[eventName] = addEventListener(eventName, newEvents[eventName], el);
    }
    return addedListeners
}
function patchChildren(oldVdom, newVdom) {
    const oldChildren = extractChildren(oldVdom);
    const newChildren = extractChildren(newVdom);
    const parentEl = oldVdom.el;
    const diffSeq = arraysDiffSequence(oldChildren, newChildren, areNodesEqual);
    for (const operation of diffSeq) {
        const {originalIndex, index, item} = operation;
        switch (operation.op) {
            case ARRAY_DIFF_OP.ADD: {
                mountDOM(item, parentEl, index);
                break
            }
            case ARRAY_DIFF_OP.REMOVE: {
                destroyDOM(item);
                break
            }
            case ARRAY_DIFF_OP.MOVE: {
                const oldChild = oldChildren[originalIndex];
                const newChild = newChildren[index];
                const el = oldChild.el;
                const elAtTargetIndex = parentEl.childNodes[index];
                parentEl.insertBefore(el, elAtTargetIndex);
                patchDOM(oldChild, newChild, parentEl);
                break
            }
            case ARRAY_DIFF_OP.NOOP: {
                patchDOM(oldChildren[originalIndex], newChildren[index], parentEl);
                break
            }
        }
    }
}

function createApp({state, view, reducers={}}) {
    let parentEl = null;
    let vdom = null;
    const dispatcher = new Dispatcher();
    const subscriptions = [dispatcher.afterEveryCommand(renderApp)];
    function emit(eventName, payload) {
        dispatcher.dispatch(eventName, payload);
    }
    for (const actionName in reducers) {
        const reducer = reducers[actionName];
        const subs = dispatcher.subscribe(actionName, (payload) => {
            state = reducer(state, payload);
        });
        subscriptions.push(subs);
    }
    function renderApp() {
        const newVdom = view(state, emit);
        vdom = patchDOM(vdom, newVdom,  parentEl);
    }
    return {
        mount(_parentEl) {
            parentEl = _parentEl;
            vdom = view(state, emit);
            mountDOM(vdom, parentEl);
        },
        unmount() {
            destroyDOM(vdom);
            vdom = null;
            subscriptions.forEach((unsubscribe) => unsubscribe());
        }
    }
}

export { createApp, h, hFragment, hString };
