function NewCell() {
    let value = ""
    const getValue = () => value;
    const setValue = (newValue) => value = newValue;
    return {getValue, setValue}
}

function NewPlayer(name, value) {
    const getName = () => name;
    const getValue = () => value;
    return {getName, getValue};
}

const gameBoard = (() => {
    let board = [];

    const setBoard = () => {
        const rows = 3;
        const columns = 3;
        for (let i = 0; i < rows; ++i) {
            board[i] = [];
            for (let j = 0; j < columns; ++j) {
                board[i].push(NewCell());
            }
        }
    }

    const getBoard = () => board;

    const printBoard = () => {
        let boardValueCopy = board.map(row => row.map(cell => cell.getValue()));
        console.table(boardValueCopy);
        return boardValueCopy;
    }

    setBoard();
    return {getBoard, printBoard, setBoard};
})();

const gameController = (() => {
    const board = gameBoard.getBoard();

    const playerOne = NewPlayer("Player one", "X");
    const playerTwo = NewPlayer("Player two", "O");
    const players = [playerOne, playerTwo];
    let currentPlayer = players[0];
    let gameEnd = false;

    const checkWin = () => {
        const winConditions = [
            board[0],
            board[1],
            board[2],
            [board[0][0], board[1][0], board[2][0]],
            [board[0][1], board[1][1], board[2][1]],
            [board[0][2], board[1][2], board[2][2]],
            [board[0][0], board[1][1], board[2][2]],
            [board[0][2], board[1][1], board[2][0]],
        ]

        let result = {};

        for (let i = 0; i < winConditions.length; ++i) {
            gameEnd = winConditions[i].every(cell => cell.getValue() === winConditions[i][0].getValue() && cell.getValue() !== "");
            
            if (gameEnd === true) {
                const winner = (playerOne.getValue() === winConditions[i][0].getValue()) ? playerOne.getName() : playerTwo.getName();
                result = {winner, condition: winConditions[i]};
                console.log(`${result.winner} wins! End of game.`)
                break;
            }
        }

        if (gameEnd === false) console.log(`${currentPlayer.getName()}'s turn.`);
        return result;
    }

    const checkDraw = () => {
        let isDraw = true;
        for (let i = 0; i < board.length; ++i) {
            isDraw = board[i].every((cell) => cell.getValue() !== "");
            if (isDraw === false) {
                break;
            }
        }
        if (isDraw === true && gameEnd === false) console.log(`It is a draw. End of game.`);
    }

    const switchCurrentPlayer = () => {
        currentPlayer = (currentPlayer === players[0]) ? players[1] : players[0];
    }

    const getCurrentPlayer = () => currentPlayer;

    const playTurn = (row, column) => {
        const cell = board[row][column];
        if (cell.getValue() != "") return;
        cell.setValue(currentPlayer.getValue());
        gameBoard.printBoard();
        switchCurrentPlayer();
        checkWin();
        checkDraw();
    }

    return {playTurn, getCurrentPlayer};
})();