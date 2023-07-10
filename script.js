const gameBoard = (() => {
    let board = [];

    const rows = 3;
    const columns = 3;
    for (let i = 0; i < rows; ++i) {
        board[i] = [];
        for (let j = 0; j < columns; ++j) {
            board[i].push({value: ""});
        }
    }

    const getBoard = () => board;

    const printBoard = () => {
        let boardValueCopy = board.map(row => row.map(cell => cell.value));
        console.table(boardValueCopy);
        return boardValueCopy;
    }

    return {getBoard, printBoard};
})();

const gameController = (() => {
    const board = gameBoard.getBoard();
    const playerOne = NewPlayer("player 1", "X");
    const playerTwo = NewPlayer("Player 2", "O");
    let players = [playerOne, playerTwo];
    let currentPlayer = players[0];

    function NewPlayer(name, token) {
        return {name, token};
    }

    const switchCurrentPlayer = () => {
        currentPlayer = (currentPlayer === players[0]) ? players[1] : players[0];
    }

    const getCurrentPlayer = () => currentPlayer;

    const playTurn = (row, column) => {
        const cell = board[row][column];
        console.log("yes")
        if (cell.value != "") return;
        cell.value = currentPlayer.token;
        gameBoard.printBoard();
        switchCurrentPlayer();
    }

    return {playTurn, getCurrentPlayer};
})();