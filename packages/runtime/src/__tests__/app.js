import {defineComponent} from "../component";
import {h, hFragment} from "../h";

function fetchTodos() {
    return new Promise(resolve => resolve(["遛狗", "浇花"]))
}

export const App = defineComponent({
    state({todos = []}) {
        return {todos, isLoading: true}
    },
    async onMounted() {
        const todos = await fetchTodos()
        this.updateState({todos, isLoading: false})
    },
    render() {
        const {todos, isLoading} = this.state

        if (isLoading) {
            return h('p', {}, ['加载中...'])
        }

        return hFragment([
            h('h1', {}, ['待办事项']),
            h(AddTodo, { on: {addTodo: this.addTodo}}),
            h(TodosList, {
                todos: todos,
                on: {removeTodo: this.removeTodo},
            })
        ])
    },
    addTodo(desc) {
        this.updateState({todos: [...this.state.todos, desc]})
    },
    removeTodo(index) {
        this.updateState({todos: [...this.state.todos.slice(0, index), ...this.state.todos.slice(index + 1)]})
    }
})

const AddTodo = defineComponent({
    state() {
        return {desc: ''}
    },
    render() {
        return hFragment([
            h('input', {
                type: 'text',
                value: this.state.desc,
                on: { input: this.updateDesc},
            }),
            h('button', {on:{click: this.addTodo}},['添加'])
        ])
    },
    updateDesc({target}) {
        this.updateState({desc: target.value})
    },
    addTodo() {
        this.emit('addTodo', this.state.desc)
        this.updateState({desc: ''})
    }
})

const TodosList = defineComponent({
    render() {
        const {todos} = this.props

        return h(
            'ul',
            {},
            todos.map((desc, index) =>
            h(TodoItem, {
                desc,
                key: desc,
                index,
                on: {removeTodo: (index) => this.emit('removeTodo', index)},
            })
        ))
    }
})

const TodoItem = defineComponent({
    render() {
        const {desc} = this.props

        return h('li', {}, [
            h('span', {}, [desc]),
            h('button', {on: {click: this.removeTodo}}, ['完成'])
        ])
    },
    removeTodo() {
        this.emit('removeTodo', this.props.index)
    }
})