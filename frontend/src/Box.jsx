import mine from "./assets/mine.png";
import gem from "./assets/gem.png";

export default function Box({ value, disabled, onClick }) {
  const stateClass =
    value === null ? "" : value === 1 ? "board-box-mine" : "board-box-gem";

  return (
    <button
      type="button"
      className={["board-box", stateClass].join(" ")}
      disabled={disabled}
      onClick={onClick}
      aria-pressed={value !== null}
    >
      {value !== null &&
        (value === 1 ? (
          <img src={mine} alt="Mine" className="board-icon" />
        ) : (
          <img src={gem} alt="Gem" className="board-icon" />
        ))}
    </button>
  );
}
