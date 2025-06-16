import { useState, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import Header from "./Header.jsx";
import ResultButton from "./Resultbutton.jsx";
import ResultsContainer from "./ResultsContainer.jsx";
import SummaryContainer from "./SummaryContainer.jsx";
import P1Content from "./P1Content.jsx";
import Phase3View from "./Phase3View.jsx";

import {
  calculateDhlEinzelkosten,
  calculateTotalMengeProLand,
} from "../ControlInput/dhlUtils.js";

//CSS-Imports
import "../css/index.css";
import "../css/Result.css";
import "../css/Summary.css";
import "../css/Phase-1.css";
import "../css/Phase-Transition.css";

// Für Entwicklungszwecke: Fake Ergebnisse nutzen
const USE_FAKE_RESULT = false;

function App() {
  const navigate = useNavigate();

  // App-State
  const [started, setStarted] = useState(false);
  const [jsonContent, setJsonContent] = useState(null);
  const [fileName, setFileName] = useState("");
  const [showVariables, setShowVariables] = useState(false);
  const [totalEinzelkosten, setTotalEinzelkosten] = useState(0);

  // Status für Phasenwechsel & finale Ergebnisse
  const [showPhase2, setShowPhase2] = useState(false);
  const [finalResult, setFinalResult] = useState(null);
  const [mengeProLand, setMengeProLand] = useState({});
  const [bundlingOverview, setBundlingOverview] = useState({});

  // Startknopf gedrückt
  const handleStart = () => setStarted(true);

  // Datei per Drag & Drop verarbeitet
  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = JSON.parse(e.target.result);

      // Berechnung DHL-Kosten & Mengen pro Land
      const withEinzelkosten = calculateDhlEinzelkosten(data);
      const mengeProLand = calculateTotalMengeProLand(withEinzelkosten);
      const total = withEinzelkosten.reduce(
        (sum, order) => sum + order.cost,
        0
      );

      setTotalEinzelkosten(total.toFixed(2));
      setJsonContent(withEinzelkosten);
      setMengeProLand(mengeProLand);

      // Kurze Verzögerung vor Anzeige
      setTimeout(() => setShowVariables(true), 1500);
    };
    reader.readAsText(file);
  };

  // Dragover erlauben
  const handleDragOver = (event) => event.preventDefault();

  // Summenberechnungen
  const totalQuantity = jsonContent
    ? jsonContent.reduce((sum, order) => sum + order.menge, 0)
    : 0;

  const totalOrders = jsonContent ? jsonContent.length : 0;

  return (
    <>
      <Header />

      <Routes>
        {/* Phase 1 + Phase 2 - Bis zu dem Punkt wo "Resultat Anzeigen" gedrückt wird */}
        <Route
          path="/"
          element={
            <>
              {/* Phase 1 UI - Dashboard, JSON Hochladen - Durch den Button "Optimieren" (Solvebutton) erfolgt der Übergang zu Phase 2 */}

              <div className={`p1-wrapper ${showPhase2 ? "phase1-exit" : ""}`}>
                {!showPhase2 && (
                  <P1Content
                    started={started}
                    jsonContent={jsonContent}
                    fileName={fileName}
                    totalQuantity={totalQuantity}
                    totalOrders={totalOrders}
                    USE_FAKE_RESULT={USE_FAKE_RESULT}
                    handleStart={handleStart}
                    handleDrop={handleDrop}
                    handleDragOver={handleDragOver}
                    setFinalResult={setFinalResult}
                    setShowPhase2={setShowPhase2}
                    setBundlingOverview={setBundlingOverview}
                    totalEinzelkosten={totalEinzelkosten}
                    //In P1Content ist der Solvebutton eingebunden
                  />
                )}
              </div>

              {/* Phase 2 UI - Übersicht, KI-Ausgabe
              Linke Bildschirmhälfte: Ungefilterter KI-Output (Resultscontainer)
              Rechte Bildschirmhälfte: Zusammenfassung der Bestellliste - Kosten aus KI-Output extrahiert (Summarycontainer) */}

              <div className="main-content">
                {showPhase2 && (
                  <>
                    <ResultsContainer
                      optimizedResult={finalResult}
                      extraClass="phase2-enter"
                    />
                    <SummaryContainer
                      fileName={fileName}
                      totalQuantity={totalQuantity}
                      totalOrders={totalOrders}
                      totalEinzelkosten={totalEinzelkosten}
                      summarizedOrders={mengeProLand}
                      bundlingOverview={bundlingOverview}
                      filteredSpeditionList={finalResult?.speditionList}
                      filteredBundlingList={finalResult?.bundlingList}
                      nonPotentialBundling={finalResult?.singleList}
                      totalBundlingCost={finalResult?.totalBundlingCost}
                      totalSpeditionCost={finalResult?.totalSpeditionCost}
                    />
                    <ResultButton onClick={() => navigate("/result")} />
                  </>
                )}
              </div>
            </>
          }
        />

        {/* Phase 3 - Startet durch klicken von "Resultat Anzeigen" (ResultButton) */}

        <Route
          path="/result"
          element={
            <Phase3View
              bundlingOverview={bundlingOverview}
              filteredSpeditionList={finalResult?.speditionList}
              nonPotentialBundling={finalResult?.singleList}
              totalEinzelkostenNonBundled={
                finalResult?.totalEinzelkostenNonBundled
              }
              totalBundlingCost={finalResult?.totalBundlingCost}
              totalSpeditionCost={finalResult?.totalSpeditionCost}
            />
          }
        />
      </Routes>
    </>
  );
}

export default App;
