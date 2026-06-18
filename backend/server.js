const express = require("express");
const cors = require("cors");
const PORT = 5000;
const app = express();
app.use(cors());
app.use(express.json());
app.get("/", (req, res) => {
  res.send("Hello");
});

// 0 -> gem 1 -> mine
let board = Array.from({ length: 25 }, (val, idx) => ({
  value: 0,
  isClicked: false,
}));
let numberOfMines = null;
let isGameRunning = false;
let gemCounter = 0;
let betAmount = 0;
let multiplier = 0;
let cashOut = 0;
let wallet = 100;


function getMultiplier(numberOfMines, safeTilesOpened) {
  let multiplier = 0.99;

  for (let i = 0; i < safeTilesOpened; i++) {
    multiplier *= (25 - i) / (25 - numberOfMines - i);
  }

  return multiplier;
}

function setMines() {
  //set random indices to mines
  let mines = [];
  let i = 0;
  while (i < numberOfMines) {
    const randomIndex = Math.floor(Math.random() * 25);
    if (mines.includes(randomIndex)) continue;
    mines.push(randomIndex);
    i++;
  }

  for (let i = 0; i < board.length; i++) {
    if (mines.includes(i)) {
      board[i].value = 1;
      const index = mines.indexOf(i);
      if (index !== -1) {
        mines.splice(index, 1);
      }
    }
  }
}

app.get("/api/getWalletAmount", (req, res)=>{
  return res.json({walletAmount: wallet});
});

app.post("/api/resetgame", (req, res) => {
  board = Array.from({ length: 25 }, (val, idx) => ({
    value: 0,
    isClicked: false,
  }));
  numberOfMines = null;
  isGameRunning = false;
  gemCounter = 0;

  res.json({ isGameRunning: isGameRunning });
});

app.post("/api/startgame", (req, res) => {
  numberOfMines = req.body.numberOfMines;
  betAmount = req.body.betAmount;
  if(betAmount > wallet) return res.json({"message":"betting amount can't be higher than wallet amount!"});
  wallet -= betAmount;
  setMines();
  isGameRunning = true;
  console.log(board);
  console.log(numberOfMines);
  console.log(betAmount);

  res.json({ isGameRunning: isGameRunning, betAmount: betAmount, numberOfMines: numberOfMines, updatedWallet: wallet });
});

app.post("/api/checkbox", (req, res) => {
  const { box_id } = req.body;

  if (board[box_id].isClicked === true) {
    res.send({ alreadyClicked: true });
  }

  board[box_id].isClicked = true;
  console.log("box id recieved: " + box_id + " board[boxid]: " + board[box_id]);
  if (board[box_id].value === 1) {
    console.log("MINE");
    isGameRunning = false;
    multiplier = 0;
    cashOut = 0;
    res.json({
      value: 1,
      isGameRunning: isGameRunning,
    });
  } else {
    console.log("GEM");
    gemCounter++;
    multiplier = getMultiplier(numberOfMines, gemCounter);
    cashOut = multiplier * betAmount;
    res.json({
      value: 0,
      gemCounter: gemCounter,
      multiplier: multiplier,
      cashOut: cashOut,
      currentProfit: (multiplier * betAmount) - betAmount,
    });
  }
});

app.post("/api/addCashOutToWallet", (req, res)=>{
  wallet += cashOut;

  res.json({updatedWallet: wallet});
});

app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});
