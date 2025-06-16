import StartButton from "./StartButton.jsx";
import SolveButton from "./SolveButton.jsx";
import { useEffect, useState } from "react";

import "../css/index.css";
import "../css/Phase-1.css";

// Haupt-UI für Phase 1 – Upload & Voranalyse
export default function P1Content({
  started,
  jsonContent,
  fileName,
  totalQuantity,
  totalOrders,
  USE_FAKE_RESULT,
  handleStart,
  handleDrop,
  handleDragOver,
  totalEinzelkosten,
  setFinalResult,
  setShowPhase2,
  setBundlingOverview,
}) {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [cardSlidingOut, setCardSlidingOut] = useState(false);

  // Zeigt Bestätigung nach erfolgreichem Upload
  useEffect(() => {
    if (jsonContent) {
      setShowConfirmation(true);
      const timer = setTimeout(() => setShowConfirmation(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [jsonContent]);

  const uniqueCountries = [...new Set(jsonContent?.map((o) => o.land))] || [];

  return (
    <div className={`container ${started ? "started" : ""}`}>
      {/* Überschrift */}
      <h1 className={`main-title ${jsonContent ? "fade-out" : ""}`}>
        Welcome to <span className="highlight">Logistics-AI!</span>
      </h1>

      {/* Einleitungstext */}
      {!started && (
        <p className="intro-text">
          Hier kannst du deine Logistikdaten hochladen und optimieren lassen.
          <br />
          Starte die Anwendung durch Klicken auf den Button unten.
          <br />
          <span className="highlight highlight-gap">Viel Spaß!</span>
        </p>
      )}

      {/* Startbutton */}
      <StartButton
        onStart={handleStart}
        className={`start-button ${started ? "hide" : ""}`}
      />

      {/* Upload-Bereich */}
      <div className={`upload-section ${started ? "visible" : ""}`}>
        <div
          className={`drop-area ${jsonContent ? "hidden" : ""}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <p>
            (Drag & Drop)
            <br />
            Fügen Sie hier Ihre Bestellliste ein
          </p>
          <label htmlFor="file-upload" className="file-upload-button">
            📂 Datei öffnen
          </label>
          <input
            id="file-upload"
            type="file"
            accept=".json"
            style={{ display: "none" }}
            onChange={(e) => {
              const file = e.target.files[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = (e) => {
                const data = JSON.parse(e.target.result);
                // simulate Drop-Event für handleDrop
                const dropEvent = {
                  dataTransfer: { files: [file] },
                  preventDefault: () => {},
                };
                handleDrop(dropEvent);
              };
              reader.readAsText(file);
            }}
          />
        </div>

        {/* Rückmeldung nach Upload */}
        {jsonContent && (
          <>
            {showConfirmation ? (
              <div className="upload-confirmation">
                {"Bestellliste erkannt! ".split("").map((char, i) => (
                  <span
                    key={i}
                    className="fade-in"
                    style={{ animationDelay: `${i * 0.05}s` }}
                  >
                    {char}
                  </span>
                ))}
                <span className="checkmark" role="img" aria-label="check">
                  ✅
                </span>
              </div>
            ) : (
              <div className="upload-feedback fade-in-soft">
                {/* Dateiname animiert */}
                <div className="file-name">
                  {fileName.split("").map((char, i) => (
                    <span
                      key={i}
                      className="fade-in"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    >
                      {char}
                    </span>
                  ))}
                </div>

                {/* Kurzzusammenfassung */}
                <div
                  className={`summary-card ${
                    cardSlidingOut ? "slide-out-left" : ""
                  }`}
                >
                  <div className="summary-header">
                    Total Orders:{" "}
                    <span className="summary-highlight">{totalOrders}</span>{" "}
                    &nbsp;|&nbsp; Total Quantity:{" "}
                    <span className="summary-highlight">{totalQuantity}</span>
                  </div>
                  <div className="summary-body">
                    <p>
                      <strong>Zielländer:</strong> {uniqueCountries.length}
                    </p>
                    <p>
                      <strong>Beliefert werden:</strong>{" "}
                      {uniqueCountries.join(", ")}
                    </p>
                    <p style={{ marginTop: "1rem" }}>
                      Eine Einzellieferung (nach DHL Konditionen) jeder
                      Bestellung separat würde schätzungsweise
                      <span className="cost-green"> {totalEinzelkosten}€ </span>
                      kosten.
                    </p>
                    <p style={{ marginTop: "1rem" }}>
                      Die Bestellliste bietet Potenzial zur Optimierung durch{" "}
                      <span className="highlight">Paketbündelungen</span> und{" "}
                      <span className="highlight">Speditionsversand</span>.
                    </p>
                  </div>
                </div>

                {/* Optimierung starten */}
                {USE_FAKE_RESULT ? (
                  <button
                    className="solve-button"
                    onClick={handleSolve}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        Optimierung läuft...
                        <span className="spinner" />
                      </>
                    ) : (
                      "🔍 Optimieren"
                    )}
                  </button>
                ) : (
                  <SolveButton
                    jsonContent={jsonContent}
                    onResult={(result) => {
                      setFinalResult(result);
                      setBundlingOverview(result.bundlingOverview);
                      setShowPhase2(true);
                    }}
                  />
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
