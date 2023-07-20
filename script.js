function NewCell() {
    let value = ""
    const getValue = () => value;
    const setValue = (newValue) => value = newValue;
    return {getValue, setValue}
}


function NewPlayer(name, value, type) {
    const getType = () => type;
    const setType = (newType) => type = newType;
    const getName = () => name;
    const getValue = () => value;
    return {getName, getValue, getType, setType};
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

    const getAvailableSquares = () => board.filter(row => row.filter(cell => cell === ""));

    return {getBoard, boardIsFull, clearBoard, getAvailableSquares};
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
            if (winConditions[i].every(cell => cell.getValue() === winConditions[i][0].getValue() && cell.getValue() !== "")) {
                const winner = (playerOne.getValue() === winConditions[i][0].getValue()) ? playerOne.getName() : playerTwo.getName();
                message = `${winner} wins!`
                gameOver = true;
            }
        }

        if (gameOver === false && gameBoard.boardIsFull() === true) {
            message = `It is a draw.`;
            gameOver = true;
        }

    }

    const changeCurrentPlayer = () => currentPlayer = (currentPlayer === playerOne) ? playerTwo : playerOne;

    const setPlayers = (inputs, opponent) => {
        playerOne = NewPlayer(inputs[0], "X", "player");
        playerTwo = NewPlayer(inputs[1], "O", "player");
        if (opponent === "computer") playerTwo.setType("computer");
        currentPlayer = playerOne;

        getPlayerOneName = () => playerOne.getName();
        getPlayerTwoName = () => playerTwo.getName();
        return {getPlayerOneName, getPlayerTwoName};
    }

    const play = (cell) => {
        if (cell.getValue() === "" && gameOver === false) {
            cell.setValue(currentPlayer.getValue());
            checkGameStatus();
        }
        if (gameOver === false) {
            changeCurrentPlayer();
            displayController.displayGrid();
            if (currentPlayer.getType() === "computer") playComputer();
        } else if (gameOver === true) {
            displayController.displayGameResult();
            gameOver = false;
        } 
    }

    const playComputer = () => {
        let availableCells = [];
        board.forEach(row => row.forEach(cell => {
            if (cell.getValue() === "") availableCells.push(cell);
        }));
        const randomCell = Math.floor((Math.random()*availableCells.length));
        play(availableCells[randomCell]);
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
        board.forEach(row => row.forEach(cell => array.push(cell)));
        squares.forEach((square, index) => square.addEventListener("click", () => {
            gameController.play(array[index]);
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
                    opponentScreen.style.display = "flex";
                    break;

                case (button.classList.contains("submit-opponent")):
                    event.preventDefault()
                    const opponent = document.querySelector("select").value;
                    if (opponent === "player") {
                        opponentScreen.style.display = "none";
                        nameScreen.style.display = "flex";
                    } else {
                        const vsComputer = ["Player", "Computer"];
                        const computerGame = gameController.setPlayers(vsComputer, "computer");
                        const playerOneName = computerGame.getPlayerOneName();
                        const playerTwoName = computerGame.getPlayerTwoName();
                        playerOneDisplay.innerText = playerOneName;
                        playerTwoDisplay.innerText = playerTwoName;
                        displayGrid();
                        opponentScreen.style.display = "none";
                        gameScreen.style.display = "grid";
                    }
                    break;

                case (button.classList.contains("submit-names")):
                    const inputs = Array.from(document.querySelectorAll("input"));
                    const vsPlayer = inputs.map(input => input.value);
                    const formValid = vsPlayer.every(input => input !== "");
                    if (formValid === true) {
                        event.preventDefault();
                        const playerGame = gameController.setPlayers(vsPlayer, "player");
                        const playerOneName = playerGame.getPlayerOneName();
                        const playerTwoName = playerGame.getPlayerTwoName();
                        playerOneDisplay.innerText = playerOneName;
                        playerTwoDisplay.innerText = playerTwoName;
                        displayGrid();
                        nameScreen.style.display = "none";
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

    return {displayGrid, displayGameResult}
})();
