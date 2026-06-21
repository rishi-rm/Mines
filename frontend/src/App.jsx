import { useState, useEffect } from "react";
import Box from "./Box";
import "./App.css";

export default function App() {
  const [board, setBoard] = useState(Array(25).fill(null));
  const [numberOfMines, setNumberOfMines] = useState(1);
  const [multiplier, setMultiplier] = useState(0);
  const [canChangeMines, setCanChangeMines] = useState(false);
  const [freezeStartButton, setFreezeStartButton] = useState(false);
  const [freezeBoxButton, setFreezeBoxButton] = useState(true);
  const [betAmount, setBetAmount] = useState(0);
  const [disableChangeBet, setDisableChangeBet] = useState(false);
  const [walletAmount, setWalletAmount] = useState(0);
  const [disableCashout, setDisableCashout] = useState(true);
  const [cashOutAmount, setCashOutAmount] = useState(0);
  const [addCashOpen, setAddCashOpen] = useState(false);
  const [addCashAmount, setAddCashAmount] = useState(0);

  const resetGame = async () => {
    try {
      await fetch("http://localhost:5000/api/resetgame", {
        method: "POST",
      });

      setBoard(Array(25).fill(null));
      setCanChangeMines(false);
      setFreezeStartButton(false);
      setFreezeBoxButton(true);
      setDisableChangeBet(false);
      setDisableCashout(true);
    } catch (err) {
      console.error(err);
    }
  };

  const getWalletAmount = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/getWalletAmount");
      const data = await res.json();
      setWalletAmount(data.walletAmount);
    } catch (err) {
      console.log(err);
    }
  };
  useEffect(() => {
    resetGame();
  }, []);

  useEffect(() => {
    getWalletAmount();
  }, [walletAmount]);

  const startGame = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/startgame", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          numberOfMines: Number(numberOfMines),
          betAmount: Number(betAmount),
        }),
      });

      const data = await response.json();

      if (!data.isGameRunning) {
        console.log(data.message);
        return;
      }
      setWalletAmount(data.updatedWallet);
      setDisableCashout(false);
      setDisableChangeBet(true);
      setCanChangeMines(true);
      setFreezeStartButton(data.isGameRunning);
      setFreezeBoxButton(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleBoxClick = async (idx) => {
    if (board[idx] !== null) return;

    try {
      const response = await fetch("http://localhost:5000/api/checkbox", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          box_id: idx,
        }),
      });

      const data = await response.json();
      console.log(data);
      if (data.alreadyClicked) return;

      setCashOutAmount(data.cashOut);
      setBoard((prev) => {
        const next = [...prev];
        next[idx] = data.value;
        return next;
      });

      if (data.value === 1) {
        setFreezeBoxButton(true);
        setCashOutAmount(0);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCashOut = async () => {
    const res = await fetch("http://localhost:5000/api/addCashOutToWallet", {
      method: "POST",
    });

    const data = await res.json();
    console.log(data);

    setWalletAmount(data.updatedWallet);
    resetGame();
  };

  const addMoneyToWallet = async (addCashAmount) => {
    const res = await fetch("http://localhost:5000/api/addMoneyTowallet", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        addCashAmount: Number(addCashAmount),
      }),
    });

    const data = await res.json();

    setWalletAmount(data.updatedWalletAmount);
    console.log(data.message);
  };

  return (
    <div className="app-shell">
      <div className="hero-panel">
        <div className="hero-copy">
          <span className="eyebrow">Strategic mines gameplay</span>
          <h1>Vault Run</h1>
          <p className="hero-subtitle">
            Premium, clean controls for your minefield challenge. Keep your eyes on the balance and reveal rewards with every pick.
          </p>
        </div>
      </div>

      {addCashOpen && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h2>Add funds to wallet</h2>
            </div>
            <input
              className="modal-input"
              type="number"
              placeholder="Enter amount to add"
              value={addCashAmount}
              onChange={(e) => {
                setAddCashAmount(e.target.value);
              }}
            />
            <div className="modal-actions">
              <button
                className="control-button primary-button"
                type="button"
                onClick={() => {
                  if (addCashAmount === 0 || addCashAmount === null) return;
                  addMoneyToWallet(addCashAmount);
                  setAddCashAmount(0);
                  setAddCashOpen(false);
                }}
              >
                Add
              </button>
              <button
                className="control-button secondary-button"
                type="button"
                onClick={() => {
                  setAddCashAmount(0);
                  setAddCashOpen(false);
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="dashboard-grid">
        <aside className="panel panel-controls">
          <div className="panel-header">
            <h2>Game controls</h2>
            <span className="panel-tag">Ready</span>
          </div>

          <div className="field-group">
            <label htmlFor="mines">Number of mines</label>
            <select
              id="mines"
              disabled={canChangeMines}
              value={numberOfMines}
              onChange={(e) => setNumberOfMines(Number(e.target.value))}
              className="styled-select"
            >
              {Array.from({ length: 24 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1}
                </option>
              ))}
            </select>
          </div>

          <div className="field-group">
            <label htmlFor="bet">Enter bet amount</label>
            <div className="input-row">
              <span className="currency-label">₹</span>
              <input
                id="bet"
                type="number"
                disabled={disableChangeBet}
                value={betAmount}
                onChange={(e) => {
                  setBetAmount(e.target.value);
                }}
                className="styled-input"
              />
            </div>
          </div>

          <div className="button-stack">
            <button
              className="control-button primary-button"
              disabled={freezeStartButton}
              onClick={startGame}
              type="button"
            >
              Start
            </button>
            <button
              className="control-button secondary-button"
              disabled={disableCashout}
              onClick={handleCashOut}
              type="button"
            >
              Cash Out
            </button>
          </div>
        </aside>

        <section className="panel panel-board">
          <div className="panel-header">
            <h2>Mines board</h2>
            <span className="panel-tag">{board.filter((value) => value !== null).length} revealed</span>
          </div>
          <div className="board-grid">
            {board.map((value, idx) => (
              <Box
                key={idx}
                value={value}
                disabled={freezeBoxButton || value !== null}
                onClick={() => handleBoxClick(idx)}
              />
            ))}
          </div>
        </section>

        <aside className="panel panel-wallet flex flex-col gap-2">
          <div className="panel-header">
            <h2>Wallet</h2>
            <span className="panel-tag">Balance</span>
          </div>

          <div className="wallet-card">
            <div className="wallet-label">Available balance</div>
            <div className="wallet-amount">₹{walletAmount.toFixed(2)}</div>
          </div>

          <div className="wallet-info">
            <div className="wallet-detail">
              <span>Pending cashout</span>
              <strong>₹{cashOutAmount?.toFixed(2)}</strong>
            </div>
            <div className="wallet-detail">
              <span>Mines selected</span>
              <strong>{numberOfMines}</strong>
            </div>
          </div>

          <div className="wallet-actions">
            <button className="control-button secondary-button" type="button" onClick={resetGame}>
              Reset Game
            </button>
            <button className="control-button secondary-button" type="button" onClick={() => setAddCashOpen(true)}>
              Add money to wallet
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
