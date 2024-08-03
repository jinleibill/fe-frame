export function makeInitialState() {
    return {
        board: [
            [null, null, null],
            [null, null, null],
            [null, null, null],
        ],
        player: 'X',
        draw: false,
        winner: null,
    }
}

export function markReducer(state, { row, col }) {
    if (row > 3 || row < 0 || col > 3 || col < 0) {
        throw new Error('无效走棋')
    }

    if (state.board[row][col]) {
        throw new Error('无效走棋')
    }

    const newBoard = [
        [...state.board[0]],
        [...state.board[1]],
        [...state.board[2]],
    ]
    newBoard[row][col] = state.player

    const newPlayer = state.player === 'X' ? 'O' : 'X'
    const winner = checkWinner(newBoard, state.player)
    const draw = !winner && newBoard.every((row) => row.every((cell) => cell))

    return {
        board: newBoard,
        player: newPlayer,
        draw,
        winner,
    }
}

/**
 * 通过检查行、列和对角线来检查给定的玩家是否赢得了游戏。
 *
 * @param {*[][]} board 要检查的 board
 * @param {string} player 检查玩家是 X 或者 O
 * @returns {string|null} 赢家是 X 或者 O ，否则是 null
 */
function checkWinner(board, player) {
    for (let i = 0; i < 3; i++) {
        if (checkRow(board, i, player)) {
            return player
        }

        if (checkColumn(board, i, player)) {
            return player
        }
    }

    if (checkMainDiagonal(board, player)) {
        return player
    }

    if (checkSecondaryDiagonal(board, player)) {
        return player
    }

    return null
}

/**
 * 检查玩家给定的行是否赢
 *
 * @param {*[][]} board 要检查的 board
 * @param {number} idx 行
 * @param {string} player 检查玩家是 X 或者 O
 *
 * @returns {boolean} 如果玩家赢了这一行，则为True，否则为false
 */
function checkRow(board, idx, player) {
    const row = board[idx]
    return row.every((cell) => cell === player)
}

/**
 * 检查玩家给定的列是否赢
 *
 * @param {*[][]} board 要检查的 board
 * @param {number} idx 列
 * @param {string} player 检查玩家是 X 或者 O
 *
 * @returns {boolean} 如果玩家赢了这一列，则为True，否则为false
 */
function checkColumn(board, idx, player) {
    const column = [board[0][idx], board[1][idx], board[2][idx]]
    return column.every((cell) => cell === player)
}

/**
 * 检查玩家给定的对角线(\)是否赢
 *
 * @param {*[][]} board 要检查的 board
 * @param {string} player 检查玩家是 X 或者 O
 *
 * @returns {boolean} 如果玩家赢了这一对角线，则为True，否则为false
 */
function checkMainDiagonal(board, player) {
    const diagonal = [board[0][0], board[1][1], board[2][2]]
    return diagonal.every((cell) => cell === player)
}

/**
 * 检查玩家给定的对角线(/)是否赢
 *
 * @param {*[][]} board 要检查的 board
 * @param {string} player 检查玩家是 X 或者 O
 *
 * @returns {boolean} 如果玩家赢了这一对角线，则为True，否则为false
 */
function checkSecondaryDiagonal(board, player) {
    const diagonal = [board[0][2], board[1][1], board[2][0]]
    return diagonal.every((cell) => cell === player)
}