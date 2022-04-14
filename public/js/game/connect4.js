// Connect 4
const socket = io();
const serverId = window.location.href.split('/').pop();

const w = 100;
const GRID_ROWS = 6;
const GRID_COLS = 7;
const grid = make2dArray(GRID_ROWS, GRID_COLS)

const gameArea = document.getElementById('gameArea');
const infosArea = document.getElementById('infos');

let winSound;
let loseSound;
let startSound;

let end = false;
let player;
// The two players are 'R' and 'Y'
let turn = 'R';


/*********************************/
/*        Socket handling        */
/*********************************/
socket.emit('game:c4:connected', { serverId });

socket.on('game:c4:welcome', (data) => {
  player = data.player;
});
socket.on('game:c4:start', () => {
  countdown();
});
socket.on('game:c4:userDisconnected', () => {
  document.getElementById('gameArea').textContent = "Your opponent has disconnected, you win! You will soon be redirected to the home page...";
  setTimeout(() => {
    window.location.replace('http://localhost:5000/');
  }, 3000);
});
socket.on('game:c4:yourTurn', (data) => {
  play(data.cell[0], data.cell[1]);
  infosArea.innerHTML = "It's your turn";
});
socket.on('game:c4:gameEndLose', (data) => {
  play(data.cell[0], data.cell[1]);
  infosArea.innerHTML = 'You lose...';
  loseSound.play();
  end = true;
});
socket.on('game:c4:gameEndDraw', (data) => {
  play(data.cell[0], data.cell[1]);
  infosArea.innerHTML = "Nobody won...";
  end = true;
});

function nextPlayer(cell) {
  socket.emit('game:c4:nextPlayer', { cell });
  infosArea.innerHTML = "Waiting for your opponent to play";
}

function endGame(type, cell) {
  if (type === 'win') {
    socket.emit('game:c4:endGameWin', { cell });
    infosArea.innerHTML = 'You win!';
    winSound.play();
  } else if (type === 'draw') {
    socket.emit('game:c4:endGameDraw', { cell });
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
  infosArea.innerHTML = `${player === 'R' ? 'It is your turn !' : 'Waiting for your opponent to play'}<br>`;
  gameArea.innerHTML += `You are the player ${player === 'R' ? '"red"' : '"yellow"'}<br />`;
  gameArea.style.display = 'block';

  createCanvas(GRID_COLS * w, GRID_ROWS * w);
  background(40, 50, 220);
  for (let i = 0; i < GRID_COLS; i++) {
    for (let j = 0; j < GRID_ROWS; j++) {
      fill(255);
      stroke(0);
      ellipse(i * w + w / 2, j * w + w / 2, w * 0.8);
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

function makeSymbol(symbol, row, col) {
  if (symbol === 'R')
    fill(255, 0, 0);
  else
    fill(255, 255, 0);

  ellipse(col * w + w / 2, row * w + w / 2, w * 0.8);
}

function dropToBottom(col) {
  for (let row = GRID_ROWS - 1; row >= 0; row--) {
    if (grid[row][col] === '.') return row;
  }
  return -1;
}

function play(row, col) {
  makeSymbol(turn, row, col);
  grid[row][col] = turn;
  turn = turn === 'R' ? 'Y' : 'R';
}

function hasWin(row, col) {
  // Get all the cells from each direction
  let diagL = [];
  let diagR = [];
  let horiz = [];
  let vert = [];

  for (let i = 0; i < GRID_ROWS; i++) {
    for (let j = 0; j < GRID_COLS; j++) {
      // Horizontal cells
      if (i == row)
        horiz.push(grid[i][j]);
      // Vertical cells
      if (j == col)
        vert.push(grid[i][j]);
      // Top left to bottom right
      if (i - j == row - col)
        diagL.push(grid[i][j]);
      // Top right to bottom left
      if (i + j == row + col)
        diagR.push(grid[i][j]);
    }
  }

  // if any have four in a row, return a win!
  return connect4(diagL) || connect4(diagR) || connect4(horiz) || connect4(vert);
}

function connect4(cells) {
  let count = 0;
  let lastOwner = null;
  let winningCells = [];

  for (let i = 0; i < cells.length; i++) {
    if (cells[i] === '.') {
      // No owner, reset the count
      count = 0;
      winningCells = [];
    } else if (cells[i] === lastOwner) {
      // Same owner, add to the count
      count++;
      winningCells.push(cells[i]);
    } else {
      // New owner, new count
      count = 1;
      winningCells = [];
      winningCells.push(cells[i]);
    }

    // Set the lastOwner
    lastOwner = cells[i];
  }
  return count === 4;
}

function mousePressed() {
  const col = floor(mouseX / w);
  const row = dropToBottom(col);

  if (turn !== player) return;
  if (row === -1) return;

  if (!row > 2 || !row < 0 || !col > 2 || !col < 0 || possible(row, col)) {
    play(row, col);

    if (hasWin(row, col))
      return endGame('win', [row, col]);
    else if (noMorePossibilities())
      return endGame('draw', [row, col]);

    return nextPlayer([row, col]);
  }
}
