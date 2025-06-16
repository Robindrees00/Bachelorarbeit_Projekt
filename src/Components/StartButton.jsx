import "../css/Phase-1.css";

function StartButton({ onStart, className }) {
  return (
    <button className={className} onClick={onStart}>
      Start
    </button>
  );
}

export default StartButton;
