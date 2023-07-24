function NewCell() {
    let value = ""
    const getValue = () => value;
    const setValue = (newValue) => value = newValue;
    return {getValue, setValue}
}


function NewPlayer(name, value, description) {
    const getName = () => name;
    const getValue = () => value;
    const getDescription = () => description;
    return {getName, getValue, getDescription};
}


const gameBoard = (() => {
    let board = [];
    for (let i = 0; i < 3; ++i) {
        board[i] = [];
        for (let j = 0; j < 3; ++j) {
            board[i].push(NewCell());
        }
    }

    const getBoard = () => board;

    const clearBoard = () => {
        board.forEach(row => row.forEach(cell => cell.setValue("")));
        gameController.setCurrentPlayer();
        displayController.displayGrid();
    }

    const checkBoardIsFull = () => board.every(row => row.every(cell => cell.getValue() !== ""));

    const getAvailableCells = () => {
        let availableCells = [];
        board.forEach(row => row.forEach(cell => {
            if (cell.getValue() === "") availableCells.push(cell);
        }));
        return availableCells;
    };

    const getBoardCopy = () => board.map(row => row.map(cell => cell.getValue()));

    return {getBoard, clearBoard, checkBoardIsFull, getAvailableCells, getBoardCopy};
})();


const gameController = (() => {
    const board = gameBoard.getBoard();
    let message;
    let playerOne;
    let playerTwo;
    let currentPlayer;
    let gameOver = false;

    const checkGameStatus = () => {
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

        for (let i = 0; i < winConditions.length; ++i) {
            const condition = winConditions[i];
            if (condition.every(cell => cell.getValue() === condition[0].getValue() && cell.getValue() !== "")) {
                const winner = (playerOne.getValue() === condition[0].getValue()) ? playerOne.getName() : playerTwo.getName();
                message = `${winner} wins!`
                gameOver = true;
                break;
            }
        }

        if (gameOver === false && gameBoard.checkBoardIsFull() === true) {
            message = `It is a draw.`;
            gameOver = true;
        }
    }

    const computerTurn = () => {
        const availableCells = gameBoard.getAvailableCells();
        const randomCell = Math.floor((Math.random() * availableCells.length));
        playTurn(availableCells[randomCell]);
    }

    const aiTurn = () => {
        const boardCopy = board.map(row => row.map(cell => cell.getValue()));
        const [, bestMove] = minimax(boardCopy, -1, 1, true);
        playTurn(board[bestMove.row][bestMove.column]);

        function minimax(board, alpha, beta, maxPlayer) {
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
    
            for (let i = 0; i < winConditions.length; ++i) {
                const condition = winConditions[i];
                if (condition.every(cell => cell === condition[0] && cell !== "")) {
                    return (condition[0] === "X") ? [-1, ""] : [1, ""];
                }
            }
    
            if (board.every(row => row.every(cell => cell !== ""))) {
                return [0, ""];
            }

            let availableMoves = [];
            board.map((row, i) => row.filter((move, j) => {
                if(move === "") availableMoves.push({row: i, column: j});
            }));

            if (maxPlayer === true) {
                let maxScore = -1;
                let bestMove;
                for (let i = 0; i < availableMoves.length; ++i) {
                    const currentMove = availableMoves[i];
                    const boardCopy = board.map(row => row.map(cell => cell));
                    boardCopy[currentMove.row][currentMove.column] = "O";
                    const [minScore, ] = minimax(boardCopy, alpha, beta, false);
                    if (minScore >= maxScore) {
                        maxScore = minScore;
                        bestMove = currentMove;
                    }
                    alpha = Math.max(alpha, minScore);
                    if (alpha > beta) {
                        break;
                    }
                }
                return [maxScore, bestMove];
            } else {
                let minScore = 1;
                for (let i = 0; i < availableMoves.length; ++i) {
                    const currentMove = availableMoves[i];
                    const boardCopy = board.map(row => row.map(cell => cell));
                    boardCopy[currentMove.row][currentMove.column] = "X";
                    const [maxScore, ] = minimax(boardCopy, alpha, beta, true);
                    if (maxScore <= minScore) {
                        minScore = maxScore;
                    } 
                    beta = Math.min(beta, maxScore);
                    if (beta < alpha) {
                        break;
                    }
                }
                return [minScore, ""];
            }
        }
    }

    const setPlayers = (players, vs) => {
        playerOne = NewPlayer(players[0], "X", "player");
        let playerTwoDescription;
        if (vs === "vs. computer") {
            playerTwoDescription = "computer";
        } else if (vs === "vs. ai") {
            playerTwoDescription = "ai"
        } else playerTwoDescription = "player";
        playerTwo = NewPlayer(players[1], "O", playerTwoDescription);
        setCurrentPlayer();
        displayController.displayGrid();
        getPlayerOneName = () => playerOne.getName();
        getPlayerTwoName = () => playerTwo.getName();

        return {getPlayerOneName, getPlayerTwoName};
    }

    const playTurn = (cell) => {
        if (cell.getValue() === "" && gameOver === false) {
            cell.setValue(currentPlayer.getValue());
            checkGameStatus();
            if (gameOver === true) {
                displayController.displayGameResult();
                gameOver = false;
            } else {
                currentPlayer = (currentPlayer === playerOne) ? playerTwo : playerOne;
                displayController.displayGrid();
                if (currentPlayer.getDescription() === "computer") computerTurn();
                if (currentPlayer.getDescription() === "ai") aiTurn();
            }
        }
    }

    const getCurrentPlayer = () => currentPlayer;
    const setCurrentPlayer = () => currentPlayer = playerOne;
    const getMessage = () => message;

    return {setPlayers, playTurn, getCurrentPlayer, setCurrentPlayer, getMessage};
})();


const displayController = (()=> {
    const board = gameBoard.getBoard();
    const buttons = document.querySelectorAll("button");
    const titleScreen = document.querySelector(".title-screen");
    const opponentScreen = document.querySelector(".opponent-screen");
    const nameScreen = document.querySelector(".name-screen");
    const gameScreen = document.querySelector(".game-screen");
    const playerOneDisplay = document.querySelector(".player-one-display");
    const playerTwoDisplay = document.querySelector(".player-two-display");
    const resultScreen = document.querySelector(".result-screen");
    const overlay = document.querySelector(".overlay");

    const setSquareListeners = () => {
        const squares = document.querySelectorAll(".square");
        let array = [];
        board.forEach((row) => row.forEach((cell) => array.push(cell)));
        squares.forEach((square, index) => square.addEventListener("click", () => {
            gameController.playTurn(array[index]);
        }));
    }

    const displayGrid = () => {
        const grid = document.querySelector(".grid");
        grid.replaceChildren();
        board.forEach(row => {
            row.forEach(cell => {
                const square = document.createElement("div");
                square.classList.add("square");
                square.innerText = cell.getValue();
                grid.appendChild(square);
            });
        });
        setSquareListeners();
        indicateTurn();
    }

    const displayGameResult = () => {
        displayGrid();
        const message = document.querySelector(".message");
        message.innerText = gameController.getMessage();
        overlay.style.display = "block";
        resultScreen.style.display = "flex";
    }

    const indicateTurn = () => {
        const currentPlayer = gameController.getCurrentPlayer()
        if (currentPlayer.getValue() === "X") {
            playerOneDisplay.style.cssText = "background-color: hsl(120, 100%, 80%); outline: 5px solid hsl(240, 100%, 80%)";
            playerTwoDisplay.style.cssText = "background-color: hsl(0, 100%, 80%); outline: none";
        } else {
            playerOneDisplay.style.cssText = "background-color: hsl(0, 100%, 80%); outline: none";
            playerTwoDisplay.style.cssText = "background-color: hsl(120, 100%, 80%); outline: 5px solid hsl(240, 100%, 80%)";
        }
    }

    buttons.forEach((button) => {
        button.addEventListener("click", (event) => {
            switch (true) {
                case (button.classList.contains("start")):
                    titleScreen.style.display = "none";
                    opponentScreen.style.display = "flex";
                    break;

                case (button.classList.contains("select-opponent")):
                    event.preventDefault();
                    const opponentChoice = document.querySelector("select").value;
                    if (opponentChoice === "computer" || opponentChoice === "ai") {
                        let name = opponentChoice.slice(0, 1).toUpperCase().concat(opponentChoice.slice(1));
                        const game = gameController.setPlayers(["Player", name], `vs. ${opponentChoice}`);
                        playerOneDisplay.innerText = game.getPlayerOneName();
                        playerTwoDisplay.innerText = game.getPlayerTwoName();
                        opponentScreen.style.display = "none";
                        gameScreen.style.display = "grid";
                    } else {
                        opponentScreen.style.display = "none";
                        nameScreen.style.display = "flex";
                    }
                    break;

                case (button.classList.contains("submit-names")):
                    const nameInputs = Array.from(document.querySelectorAll("input"));
                    const players = nameInputs.map(input => input.value);
                    const formValid = players.every(player => player !== "");
                    if (formValid === true) {
                        event.preventDefault();
                        const game = gameController.setPlayers(players, "vs. player");
                        playerOneDisplay.innerText = game.getPlayerOneName();
                        playerTwoDisplay.innerText = game.getPlayerTwoName();
                        nameScreen.style.display = "none";
                        gameScreen.style.display = "grid";
                    }
                    break;

                case (button.classList.contains("back-from-game")):
                    gameBoard.clearBoard();
                    gameScreen.style.display = "none";
                    titleScreen.style.display = "flex";
                    break;

                case (button.classList.contains("back-from-form")):
                    nameScreen.style.display = "none";
                    titleScreen.style.display = "flex";
                    break;

                case (button.classList.contains("home")):
                    gameBoard.clearBoard();
                    gameScreen.style.display = "none";
                    overlay.style.display = "none";
                    resultScreen.style.display = "none";
                    titleScreen.style.display = "flex";
                    break;

                case (button.classList.contains("play-again")):
                    gameBoard.clearBoard();
                    overlay.style.display = "none";
                    resultScreen.style.display = "none";
                    break;

                case (button.classList.contains("restart")):
                    gameBoard.clearBoard();
                    break;
            }
        })
    })

    return {displayGrid, displayGameResult}
})();
