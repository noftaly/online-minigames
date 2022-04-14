// Tic Tac Toe
const socket = io();
const serverId = window.location.href.split('/').pop();

const w = 200;
const GRID_ROWS = 3;
const GRID_COLS = 3;
const grid = make2dArray(GRID_ROWS, GRID_COLS)

const gameArea = document.getElementById('gameArea');
const infosArea = document.getElementById('infos');

let winSound;
let loseSound;
let startSound;

let end = false;
let player;
// The two players are 'X' and 'O'
let turn = 'X';
/*********************************/
/*        Socket handling        */
/*********************************/

socket.emit('game:ttt:connected', { serverId });

socket.on('game:ttt:welcome', (data) => {
  player = data.player;
});
socket.on('game:ttt:start', () => {
  countdown();
});
socket.on('game:ttt:userDisconnected', () => {
  document.getElementById('gameArea').textContent = "Your opponent has disconnected, you win! You will soon be redirected to the home page...";
  setTimeout(() => {
    window.location.replace('http://localhost:5000/');
  }, 0000);
});
socket.on('game:ttt:yourTurn', (data) => {
  play(data.cell[0], data.cell[1]);
  infosArea.innerHTML = "It's your turn";
});
socket.on('game:ttt:gameEndLose', (data) => {
  play(data.cell[0], data.cell[1]);
  infosArea.innerHTML = 'You lose...';
  loseSound.play();
  end = true;
});
socket.on('game:ttt:gameEndDraw', (data) => {
  play(data.cell[0], data.cell[1]);
  infosArea.innerHTML = "Nobody won...";
  end = true;
});

function nextPlayer(cell) {
  socket.emit('game:ttt:nextPlayer', { cell });
  infosArea.innerHTML = "Waiting for your opponent to play";
}

function endGame(type, cell) {
  if (type === 'win') {
    socket.emit('game:ttt:endGameWin', { cell });
    infosArea.innerHTML = 'You win!';
    winSound.play();
  } else if (type === 'draw') {
    socket.emit('game:ttt:endGameDraw', { cell });
    infosArea.innerHTML = "Nobody won...";
  }
  end = true;
}

document.getElementById('disconnect-button').addEventListener('click', () => {
  socket.disconnect();
  window.location.replace('http://localhost:5000/');
});


/********************************/
/*          Game logic          */
/********************************/
function preload() {
  soundFormats('mp3');
  winSound = loadSound('../../assets/win');
  loseSound = loadSound('../../assets/lose');
  startSound = loadSound('../../assets/start');
}

function setup() {}

function countdown() {
  infosArea.innerHTML = 'Starting in 3...';
  setTimeout(() => {
    infosArea.innerHTML = 'Starting in 2...';
    setTimeout(() => {
      infosArea.innerHTML = 'Starting in 1...';
      setTimeout(() => { start(); }, 1000);
    }, 1000);
  }, 1000);
}

function start() {
  startSound.play();
  infosArea.innerHTML = `${player === 'X' ? 'It is your turn !' : 'Waiting for your opponent to play'}<br>`;
  gameArea.innerHTML += `You are the player ${player}<br />`;
  gameArea.style.display = 'block';
  createCanvas(GRID_COLS * w, GRID_ROWS * w);
  for (let i = 0; i < GRID_COLS; i++) {
    for (let j = 0; j < GRID_ROWS; j++) {
      fill(230);
      stroke(0);
      strokeWeight(4);
      rect(i * w, j * w, w, w);
    }
  }
}

function possible(row, col) {
  if (row >= 0 && row < GRID_ROWS && col >= 0 && col < GRID_COLS && !end)
    return grid[row][col] === '.';
  return false;
}

function noMorePossibilities() {
  return grid.flat().filter(elt => elt === '.').length === 0;
}

function hasWin() {
  const squares = grid.flat();
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (const [a, b, c] of lines) {
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a] === player;
    }
  }
  return false;
}

function makeSymbol(symbol, row, col) {
  noFill();
  strokeWeight(8);

  if (symbol === 'X') {
    stroke(20, 20, 150);
    line(row * w + w / 3 + w / 2, col * w + w / 3 + w / 2, row * (w + 1) - w / 3 + w / 2, col * (w + 1) - w / 3 + w / 2);
    line(row * (w + 1) - w / 3 + w / 2, col * w + w / 3 + w / 2, row * w + w / 3 + w / 2, col * (w + 1) - w / 3 + w / 2);
  } else {
    stroke(0, 153, 51);
    ellipseMode(CENTER);
    ellipse(row * w + w / 2, col * w + w / 2, w - w / 3);
  }
}

function play(row, col) {
  makeSymbol(turn, row, col);
  grid[row][col] = turn;
  turn = turn === 'X' ? 'O' : 'X';
}

function mousePressed() {
  if (turn !== player) return;

  const row = floor(mouseX / w);
  const col = floor(mouseY / w);
  if (!row > 2 || !row < 0 || !col > 2 || !col < 0 || possible(row, col)) {
    play(row, col);

    if (hasWin())
      return endGame('win', [row, col]);
    else if (noMorePossibilities())
      return endGame('draw', [row, col]);

    return nextPlayer([row, col]);
  }
}
