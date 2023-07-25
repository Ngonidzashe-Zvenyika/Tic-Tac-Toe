//This constructor function creates a new player object;
function NewPlayer(name, value, description) {
    const getName = () => name;
    const getValue = () => value;
    const getDescription = () => description;
    return {getName, getValue, getDescription};
}

//This constructo function creates a new cell object;
function NewCell() {
    let value = ""
    const getValue = () => value;
    const setValue = (newValue) => value = newValue;
    return {getValue, setValue}
}

//This module contains the main board and all the functions that relate to it;
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

// This module contains all the functions that relate to the flow of the game, decide player turns, and check if the game is over;
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

    // This function within the gameController module uses destructuring assignment syntax for the minimax algorithm which returns multiple values in an array and determines the best move for the ai by calling itself until it reaches an end state - recursion;
    const aiTurn = () => {
        function minimax(board, alpha, beta, depth, maxPlayer) {
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
                    return (condition[0] === "X") ? [-1,"",depth] : [1,"",depth];
                }
            }
            if (board.every(row => row.every(cell => cell !== ""))) {
                return [0,"",depth];
            }
            let availableMoves = [];
            board.map((row, i) => row.filter((move, j) => {
                if(move === "") availableMoves.push({row: i, column: j});
            }));
            if (maxPlayer === true) {
                let highestScore = -1;
                let maxDepth = 8;
                let bestMove;
                for (let i = 0; i < availableMoves.length; ++i) {
                    const currentMove = availableMoves[i];
                    const boardCopy = board.map(row => row.map(cell => cell));
                    boardCopy[currentMove.row][currentMove.column] = "O";
                    const [lowestScore, ,minDepth] = minimax(boardCopy, alpha, beta, depth + 1, false);
                    if (lowestScore > highestScore) {
                        highestScore = lowestScore;
                        maxDepth = minDepth;
                        bestMove = currentMove;
                    } else if (highestScore === lowestScore && minDepth < maxDepth) {
                        highestScore = lowestScore;
                        maxDepth = minDepth;
                        bestMove = currentMove;
                    }
                    alpha = Math.max(alpha, lowestScore);
                    if (alpha > beta) {
                        break;
                    }
                }
                return [highestScore, bestMove, maxDepth];
            } else {
                let lowestScore = 1;
                let maxDepth = 8;
                for (let i = 0; i < availableMoves.length; ++i) {
                    const currentMove = availableMoves[i];
                    const boardCopy = board.map(row => row.map(cell => cell));
                    boardCopy[currentMove.row][currentMove.column] = "X";
                    const [highestScore, ,minDepth] = minimax(boardCopy, alpha, beta, depth + 1, true);
                    if (highestScore < lowestScore) {
                        lowestScore = highestScore;
                        maxDepth = minDepth;
                    } else if (lowestScore === highestScore && minDepth < maxDepth) {
                        lowestScore = highestScore;
                        maxDepth = minDepth;
                    }
                    beta = Math.min(beta, highestScore);
                    if (beta < alpha) {
                        break;
                    }
                }
                return [lowestScore,"",maxDepth];
            }
        }

        const boardCopy = gameBoard.getBoardCopy();
        const [score, bestMove] = minimax(boardCopy, -1, 1, 0, true);
        playTurn(board[bestMove.row][bestMove.column]);
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

// This module contains all the functions that relate to displaying the progress of the game to the users, event listeners etc;
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
