import mine from "./assets/mine.png";
import gem from "./assets/gem.png";

export default function Box({ value, disabled, onClick }) {
  return (
    <button
      className="h-[5rem] w-[5rem] rounded-lg bg-gray-200 border cursor-pointer text-2xl p-2 text-center select-none"
      disabled={disabled}
      onClick={onClick}
    >
      {value !== null &&
        (value === 1 ? (
          <img src={mine} alt="Mine" className="h-12 w-12" />
        ) : (
          <img src={gem} alt="Gem" className="h-12 w-12" />
        ))}
    </button>
  );
}