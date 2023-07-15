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

    const rows = 3;
    const columns = 3;
    for (let i = 0; i < rows; ++i) {
        board[i] = [];
        for (let j = 0; j < columns; ++j) {
            board[i].push(NewCell());
        }
    }

    const getBoard = () => board;

    const clearBoard = () => board.forEach(row => row.forEach(cell => cell.setValue("")));

    const boardIsFull = () => board.every(row => row.every(cell => cell.getValue() !== ""));

    return {getBoard, boardIsFull, clearBoard};
})();

const gameController = (() => {
    const board = gameBoard.getBoard();
    let gameOver = false;
    let message;
    let playerOne;
    let playerTwo;
    let currentPlayer;

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
            switch (true) {
                case (winConditions[i].every(cell => cell.getValue() === winConditions[i][0].getValue() && cell.getValue() !== "")):
                    const winner = (playerOne.getValue() === winConditions[i][0].getValue()) ? playerOne.getName() : playerTwo.getName();
                    message = `${winner} wins!`
                    gameOver = true;
                    break;
                case (gameBoard.boardIsFull()):
                    message = `It is a draw.`;
                    gameOver = true;
                    break;
            }
        }

        return ;
    }

    const changeCurrentPlayer = () => currentPlayer = (currentPlayer === playerOne) ? playerTwo : playerOne;

    const setPlayers = () => {
        const inputs = Array.from(document.querySelectorAll("input"));
        const formValid = inputs.every(input => input.value !== "");
        if (formValid === true) {
            playerOne = NewPlayer(inputs[0].value, "X");
            playerTwo = NewPlayer(inputs[1].value, "O");
            currentPlayer = playerOne;
        }

        getPlayerOneName = () => playerOne.getName();
        getPlayerTwoName = () => playerTwo.getName();
        return {formValid, getPlayerOneName, getPlayerTwoName};
    }

    const play = (cell) => {
        let returnValue = false;
        if (cell.getValue() === "" && gameOver === false) {
            cell.setValue(currentPlayer.getValue());
            checkGameStatus();
            if (gameOver === true) {
                returnValue = gameOver;
                gameOver = false;
            } else {
                changeCurrentPlayer();
            }
        }
        return returnValue;
    }

    const getCurrentPlayer = () => currentPlayer;
    const setCurrentPlayer = () => currentPlayer = playerOne;
    const getMessage = () => message;

    return {setPlayers, play, getCurrentPlayer, setCurrentPlayer, getMessage};
})();






const displayController = (()=> {
    const board = gameBoard.getBoard();
    const buttons = document.querySelectorAll("button");
    const titleScreen = document.querySelector(".title-screen");
    const formScreen = document.querySelector(".form-screen");
    const gameScreen = document.querySelector(".game-screen");
    const playerOneDisplay = document.querySelector(".player-one-display");
    const playerTwoDisplay = document.querySelector(".player-two-display");
    const resultScreen = document.querySelector(".result-screen");
    const overlay = document.querySelector(".overlay");

    const setSquareListeners = () => {
        const squares = document.querySelectorAll(".square");
        let array = [];
        board.forEach(row => row.forEach(cell => array.push(cell)));
        squares.forEach((square, index) => square.addEventListener("click", () => {
            const gameOver = gameController.play(array[index]);
            if (gameOver === false) {
                displayGrid();
            } else if (gameOver === true) {
                displayGameResult();
            } else console.log(turn);
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
        const message = document.querySelector(".message");
        displayGrid();
        overlay.style.display = "block";
        resultScreen.style.display = "flex";
        message.innerText = gameController.getMessage();
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
                    formScreen.style.display = "flex";
                    break;

                case (button.classList.contains("submit-form")):
                    const game = gameController.setPlayers();
                    if (game.formValid === true) {
                        event.preventDefault();
                        const playerOneName = game.getPlayerOneName();
                        const playerTwoName = game.getPlayerTwoName();
                        playerOneDisplay.innerText = playerOneName;
                        playerTwoDisplay.innerText = playerTwoName;
                        displayGrid();
                        formScreen.style.display = "none";
                        gameScreen.style.display = "grid";
                    }
                    break;

                case (button.classList.contains("back")):
                    gameBoard.clearBoard();
                    gameScreen.style.display = "none";
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
                    overlay.style.display = "none";
                    resultScreen.style.display = "none";
                    gameBoard.clearBoard();
                    gameController.setCurrentPlayer();
                    displayGrid();
                    break;

                case (button.classList.contains("restart")):
                    gameBoard.clearBoard();
                    gameController.setCurrentPlayer();
                    displayGrid();
                    break;
            }
        })
    })
})();
