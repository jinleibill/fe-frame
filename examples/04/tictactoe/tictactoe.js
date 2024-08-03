import {
    createApp,
    defineComponent,
    h,
    hFragment,
} from '../fe-frame.js'
import {makeInitialState, markReducer} from './game.js'

const View = defineComponent({
    state() {
        return makeInitialState()
    },

    render() {
        const {winner, draw, player, board} = this.state

        return hFragment([
            h(Header, {
                winner, draw, player,
                on: {
                    restart: () => {this.updateState(makeInitialState())}
                }
            }),
            h(Board, {
                board,
                winner,
                draw,
                on: {
                    mark: ({row, col}) => {
                        console.log(`玩家 ${player} 标记 (${row}, ${col})`)
                        const newState = markReducer(this.state, {row, col})
                        this.updateState(newState)
                    }
                },
            }),
        ])
    },
})

const Header = defineComponent({
    render() {
        const {winner, draw, player} = this.props

        const child = h('button', {
            on: { click: () => this.emit('restart')}
        }, ['重新开始'])

        if (winner) {
            return h('h3', {class: 'win-title'}, [
                `玩家 ${winner} 赢!  `,
                child
            ])
        }

        if (draw) {
            return h('h3', {class: 'draw-title'}, [
                `平局!  `,
                child
            ])
        }

        return h('h3', {}, [`该轮到 ${player} 了!`])
    },
})

const Board = defineComponent({
    render() {
        const freezeBoard = this.props.winner || this.props.draw

        return h('table', {class: freezeBoard ? 'frozen' : ''}, [
            h(
                'tbody',
                {},
                this.props.board.map((row, i) =>
                    h(Row, {
                        row,
                        i,
                        on: {mark: (payload) => this.emit('mark', payload)},
                    })
                )
            ),
        ])
    },
})

const Row = defineComponent({
    render() {
        const {row, i} = this.props

        return h(
            'tr',
            {},
            row.map((cell, j) =>
                h(Cell, {
                    cell,
                    i,
                    j,
                    on: {mark: (payload) => this.emit('mark', payload)},
                })
            )
        )
    },
})

const Cell = defineComponent({
    render() {
        const {cell, i, j} = this.props

        const mark = cell
            ? h('span', {class: 'cell-text'}, [cell])
            : h(
                'div',
                {
                    class: 'cell',
                    on: {click: () => this.emit('mark', {row: i, col: j})},
                },
                []
            )

        return h('td', {}, [mark])
    },
})

createApp(View).mount(document.body)