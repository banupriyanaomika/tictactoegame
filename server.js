const express = require('express');
const app = express();
const http = require('http').createServer(app);
const port = 5050;
const io = require('socket.io')(http);

let players = 0;
let player1;
let player2;

let playerOneTurn = true;

let tttboard = {
  1: ".",
  2: ".",
  3: ".",
  4: ".",
  5: ".",
  6: ".",
  7: ".",
  8: ".",
  9: "."

}

const winpossiblilities = [[1, 2, 3], [4, 5, 6], [7, 8, 9], [1, 4, 7], [2, 5, 8], [3, 6, 9], [1, 5, 9], [3, 5, 7]];


function checkForWin(playermove) {
  let count;
  for (let i = 0; i < winpossiblilities.length; i++) {
    count = 0;
    for (let j = 0; j < winpossiblilities[i].length; j++) {
      if (tttboard[winpossiblilities[i][j]] === playermove)
        count++;
    }
    if (count == 3) {
      return true;
    }
  }
  return false;
}


function checkFortie() {
  for (let i = 1; i <= Object.keys(tttboard).length; i++) {
    if (tttboard[i] === ".")
      return false;
  }
  return true;
}


//Reset and start the new Game
function startGame() {
  Object.keys(tttboard).forEach(key => {
    tttboard[key] = ".";
  });
  playerOneTurn = true;
}

//connect the players to the game
io.on("connection", socket => {
  console.log("connected");
  if (players === 0) {
    player1 = socket.id;
    socket.emit("mes", 1)
    players++;
  } else
    
  if (players === 1) {
      player2 = socket.id;
      socket.emit("mes", 2)
      players++;
      io.to(player1).emit("who", "Game Started,you are the 1st player");
    }
    else {
      socket.emit("mes", -1)
    }


  socket.on("disconnect", () => {
    if (players !== 0) {
      players--;
    }
    startGame();
    return;
  })


  socket.on("move", res => {
    if (playerOneTurn) {//sends the board and sets for player1
      if (tttboard[res] !== ".")
        io.to(player1).emit("who", "The spot is already occupied");
      else {
        tttboard[res] = "X";
        if (checkForWin("X")) {
          io.emit("win", "Player1 won");
          startGame();
            return;
        } else{
          if (checkFortie()) {
            io.emit("win", "It's a TIE!!");
            startGame();
            return;
          }
        
      }

      // Sends the board and sets for player2
      io.emit("board", tttboard);
      io.to(player2).emit("who", "");
      playerOneTurn = false;
    }
    } else {

      if (tttboard[res] !== ".") {
        io.to(player2).emit("who", "spot already taken");
      } else {
        tttboard[res] = "O";
        // If won or tie then resets game and sends win or tie message
        if (checkForWin("O")) {
          io.emit("win", "Player 2 won");
          startGame();
          return;
        } else {
          if (checkFortie()) {
            io.emit("win", "It's a TIE!!");
            startGame();
            return;
          }
      }
        
        io.emit("board", tttboard);
        io.to(player1).emit("who", "");
        playerOneTurn = true;
    }
    }
  });

  // Resign code
  socket.on("exit", (msg) => {
    if (socket.id === player1) {
      io.emit("win", "Game won by second player");
      startGame();
    } else if (socket.id === player2) {
      io.emit("win", "Game won by first player");
      startGame();
    }
  });
});





http.listen(port, () => {
  console.log(`node server.js ${port}`)
})
