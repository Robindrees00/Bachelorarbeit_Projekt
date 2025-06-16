import "../css/index.css";
import "../css/Result.css";

// Zeigt die vom KI-Modell berechneten Ergebnisse für Bündelung & Spedition
export default function ResultsContainer({ optimizedResult, extraClass = "" }) {
  // Falls kein Ergebnis vorliegt: nichts anzeigen
  if (!optimizedResult) return null;

  let bundling = null;
  let spedition = null;

  // Sicheres Parsen der JSON-Antworten (könnten als String oder Objekt kommen)
  try {
    bundling = JSON.parse(optimizedResult.bundling);
  } catch (e) {
    bundling = optimizedResult.bundling;
  }

  try {
    spedition = JSON.parse(optimizedResult.spedition);
  } catch (e) {
    spedition = optimizedResult.spedition;
  }

  return (
    <div className={`results-container ${extraClass}`}>
      <div className="optimized-card">
        <h2 style={{ color: "#87CEEB", textAlign: "center" }}>
          KI-Versandbewertung
        </h2>

        <hr
          className="summary-divider animated-divider"
          style={{ animationDelay: "0.8s" }}
        />

        {/* Bündelungsteil */}
        <h3 style={{ color: "#00FFAA", marginTop: "1rem" }}>Bündelung</h3>
        {Array.isArray(bundling) ? (
          bundling.map((entry, idx) => (
            <div key={idx} style={{ marginBottom: "1rem" }}>
              <strong>{entry.land}</strong>
              <br />
              Pakete: {entry["30erPakete"]} | Rest: {entry.restFlaschen}
              <br />
              Zusatzkosten: € {entry.geschätzteZusatzkosten}
              <br />
              <em>{entry.begründung}</em>
            </div>
          ))
        ) : (
          <pre>{bundling}</pre>
        )}

        <hr className="summary-divider" style={{ margin: "2rem 0" }} />

        {/* Speditionsvorschläge */}
        <h3 style={{ color: "#00FFAA", marginTop: "1rem" }}>
          Speditionsbewertung
        </h3>
        {Array.isArray(spedition) ? (
          spedition.map((entry, idx) => (
            <div key={idx} style={{ marginBottom: "1rem" }}>
              <strong>{entry.land}</strong>
              <br />
              Menge: {entry.menge} Flaschen
              <br />
              Kosten: € {entry.geschätzte_speditionskosten}
              <br />
              <em>{entry.begründung}</em>
            </div>
          ))
        ) : (
          <pre>{spedition}</pre>
        )}
      </div>
    </div>
  );
}
