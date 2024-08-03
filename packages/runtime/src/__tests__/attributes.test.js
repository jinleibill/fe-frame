import {beforeEach, expect, test, describe} from "vitest";
import {removeAttribute, setAttributes} from "../attributes";

let el

beforeEach(() => {
    el = document.createElement("div");
})

test("设置 class 以字符串形式", () => {
    setAttributes(el, {class: "foo bar"})
    expect(el.className).toBe("foo bar")
})

test("设置 class 以数组形式", () => {
    setAttributes(el, {class: ["foo", "bar"]})
    expect(el.className).toBe("foo bar")
})

test("更新 class", () => {
    setAttributes(el, {class: "foo"})
    setAttributes(el, {class: "bar baz"})

    expect(el.className).toBe("bar baz")
})

test("设置 styles", () => {
    setAttributes(el, {style: {color: "red", backgroundColor: "blue"}})

    expect(el.style.color).toBe("red")
    expect(el.style.backgroundColor).toBe("blue")
})

test("设置 'data-' 属性", () => {
    setAttributes(el, {"data-my-attr": "foo"})
    expect(el.dataset.myAttr).toBe("foo")
})

test.each([
    {name: "hidden", value: true, expected: true},
    {name: "hidden", value: false, expected: false},
    {name: "tabIndex", value: 1, expected: 1},
    {name: "tabIndex", value: null, expected: -1},
])(`设置 $name 属性为 $value`, ({name, value, expected}) => {
    setAttributes(el, {[name]: value})
    expect(el[name]).toBe(expected)
})

describe('<input type="text">', () => {
    let input

    beforeEach(() => {
        input = document.createElement("input")
        input.type = 'text'
    })

    describe.each([
        {name: 'value', values: ['foo', 'bar'], whenRemove: ''},
        {name: 'placeholder', values: ['foo', 'bar'], whenRemove: ''},
        {name: 'disabled', values: [true, false], whenRemove: false},
        {name: 'required', values: [true, false], whenRemove: false},
        {name: 'readOnly', values: [true, false], whenRemove: false},
        {name: 'minLength', values: [1, 2], whenRemove: -1},
        {name: 'maxLength', values: [1, 2], whenRemove: -1},
        {name: 'size', values: [12], whenRemove: 20},
        {name: 'autocomplete', values: ['on', 'off', 'new-password', 'current-password', 'one',], whenRemove: ''}
    ])(`$name 属性`, ({name, values, whenRemove}) => {
        test('设置值', () => {
            for (const value of values) {
                setAttributes(input, {[name]: value})
                expect(input[name]).toBe(value)
            }
        })

        test('移除属性', () => {
            setAttributes(input, {[name]: values[0]})
            removeAttribute(input, name)

            expect(input[name]).toBe(whenRemove)
        })
    })
})

describe.each([
    {type: 'number', attribute: 'value', values: ['12', '24'], expectedWhenRemoved: ''},
    {type: 'checkbox', attribute: 'checked', values: [true, false], expectedWhenRemoved: false},
    {type: 'radio', attribute: 'checked', values: [true, false], expectedWhenRemoved: false},
])(`<input type="$type"/>属性: $attribute`, ({type, attribute, values, expectedWhenRemoved}) => {
    test('设置值', () => {
        const input = document.createElement("input")
        input.type = type

        for (const value of values) {
            setAttributes(input, {[attribute]: value})
            expect(input[attribute]).toBe(value)
        }
    })

    test('移除属性', () => {
        const input = document.createElement("input")
        input.type = type
        setAttributes(input, {[attribute]: values[0]})

        removeAttribute(input, attribute)
        expect(input[attribute]).toBe(expectedWhenRemoved)
    })
})

describe('<select>', () => {
    let select

    beforeEach(() => {
        select = document.createElement('select')

        const optionFoo = document.createElement('option')
        optionFoo.value = 'foo'
        select.appendChild(optionFoo)

        const optionBar = document.createElement('option')
        optionBar.value = 'bar'
        select.appendChild(optionBar)
    })

    test('设置存在的选项值', () => {
        setAttributes(select, { value: 'foo' })
        expect(select.value).toBe('foo')

        setAttributes(select, { value: 'bar' })
        expect(select.value).toBe('bar')
    })

    test('设置不存在的选项值', () => {
        setAttributes(select, { value: 'baz' })
        expect(select.value).toBe('')
    })

    test('设置为 null', () => {
        setAttributes(select, { value: null })
        expect(select.value).toBe('')
    })

    test('移除', () => {
        removeAttribute(select, 'value')
        expect(select.value).toBe('')
    })
})

describe.each([
    {tag: 'a', name: 'href', values: ['http://www.foo.com/', 'http://www.bar.cn/'], whenRemoved: ''},
    {tag: 'a', name: 'target', values: ['_blank', '_self'], whenRemoved: ''},
    { tag: 'a', name: 'download', values: ['foo', 'bar'], whenRemoved: '' },
    { tag: 'a', name: 'rel', values: ['foo', 'bar'], whenRemoved: '' },
    {tag: 'button', name: 'disabled', values: [true, false], whenRemoved: false},
    {tag: 'span', name: 'textContent', values: ['foo', 'bar'], whenRemoved: '',},
])(`"<$tag> 元素 $name" 属性`, ({ tag, name, values, whenRemoved }) => {
        test('设置值', () => {
            const el = document.createElement(tag)

            for (const value of values) {
                setAttributes(el, { [name]: value })
                expect(el[name]).toBe(value)
            }
        })

        test('移除值', () => {
            const el = document.createElement(tag)
            setAttributes(el, { [name]: values[0] })

            removeAttribute(el, name)

            expect(el[name]).toBe(whenRemoved)
        })
    }
)

