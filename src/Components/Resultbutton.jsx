import "../css/ResultButton.css";

export default function ResultButton({ onClick }) {
  return (
    <div className="result-button-wrapper">
      <button className="result-button" onClick={onClick}>
        Resultat anzeigen
      </button>
    </div>
  );
}
