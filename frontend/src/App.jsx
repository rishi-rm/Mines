import { useState, useEffect } from "react";
import Box from "./Box";

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
  

  useEffect(()=>{
    getWalletAmount();
  }, [walletAmount])

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
    // already revealed
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


  const handleCashOut = async ()=>{
    const res = await fetch("http://localhost:5000/api/addCashOutToWallet", {
      method:"POST",
    });

    const data = await res.json();
    console.log(data);

    setWalletAmount(data.updatedWallet);
    resetGame();
  }

  return (
    <div className="min-h-screen w-screen flex flex-col justify-center items-center">
      <div className="flex gap-[5rem]">
        <div className="flex flex-col gap-2">
          <div className="text-xl flex flex-col gap-2">
            <div className="flex flex-col">
              <label className="text-sm">Number of mines</label>
              <select
                disabled={canChangeMines}
                value={numberOfMines}
                onChange={(e) => setNumberOfMines(Number(e.target.value))}
                className="border-1 border-gray-400 rounded-lg p-2 text-xl"
              >
                {Array.from({ length: 24 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col">
              <label className="text-sm">Enter bet amount</label>
              <div className="relative inline-block">
                <p className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                  ₹
                </p>

                <input
                  type="number"
                  disabled={disableChangeBet}
                  value={betAmount}
                  onChange={(e) => {
                    setBetAmount(e.target.value);
                  }}
                  className="border border-gray-400 rounded-lg p-2 pl-8 text-xl"
                />
              </div>
            </div>
          </div>

          <button
            className="text-xl border rounded-lg p-2 cursor-pointer"
            disabled={freezeStartButton}
            onClick={startGame}
          >
            Start
          </button>

          <button
            className="text-xl border rounded-lg p-2 cursor-pointer"
            disabled={disableCashout}
            onClick={handleCashOut}
          >
            Cash Out
          </button>
        </div>

        <div className="grid grid-cols-5 gap-4">
          {board.map((value, idx) => (
            <Box
              key={idx}
              value={value}
              disabled={freezeBoxButton || value !== null}
              onClick={() => handleBoxClick(idx)}
            />
          ))}
        </div>
        <div className="flex flex-col gap-2">
          <button
            className="h-[3rem] rounded-lg bg-gray-200 border cursor-pointer text-2xl p-2 text-center select-none"
            onClick={resetGame}
          >
            Reset Game
          </button>
          <button className="h-[3rem] rounded-lg bg-gray-200 border cursor-pointer text-2xl p-2 text-center select-none">
            Add money to wallet
          </button>
          <div>Wallet: {walletAmount}</div>
        </div>
      </div>
    </div>
  );
}
