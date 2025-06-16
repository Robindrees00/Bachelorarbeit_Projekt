import "../css/Phase3View.css";

// Abschlussansicht: Zusammenfassung aller Versandarten + Gesamtkosten
export default function Phase3View({
  bundlingOverview = {},
  filteredSpeditionList = [],
  nonPotentialBundling = [],
  totalEinzelkostenNonBundled = 0,
  totalBundlingCost = 0,
  totalSpeditionCost = 0,
}) {
  // Summiere Flaschenmengen pro Land für Speditionsversand
  const speditionsLänder = filteredSpeditionList.reduce((acc, order) => {
    acc[order.land] = (acc[order.land] || 0) + order.menge;
    return acc;
  }, {});

  // Gesamtkosten aus allen drei Versandwegen
  const gesamtKosten =
    totalEinzelkostenNonBundled + totalBundlingCost + totalSpeditionCost;

  // Interne Log: Flaschen pro Versandtyp
  const totalBundledBottles = Object.values(bundlingOverview).reduce(
    (sum, { pakete, rest }) => sum + pakete * 30 + rest,
    0
  );

  const totalSpeditionBottles = Object.values(speditionsLänder).reduce(
    (sum, menge) => sum + menge,
    0
  );

  const totalSingleBottles = nonPotentialBundling.reduce(
    (sum, order) => sum + order.menge,
    0
  );

  // Log-Ausgabe für Debugging
  console.log("Einzelversand-Flaschen:", totalSingleBottles);
  console.log("Gebündelte Flaschen:", totalBundledBottles);
  console.log("Speditions-Flaschen:", totalSpeditionBottles);
  console.log(
    "Gesamtflaschen:",
    totalBundledBottles + totalSpeditionBottles + totalSingleBottles
  );

  return (
    <div className="phase3-container">
      <div className="optimized-card">
        <h2 className="phase3-title">Optimiertes Ergebnis</h2>
        <hr className="phase3-divider" />

        {/* Einzelversandübersicht */}
        {nonPotentialBundling.length > 0 && (
          <>
            <h3 className="phase3-section-header blue">
              Individuelle Einzelversand-Bestellungen
            </h3>
            <ul className="phase3-list">
              {nonPotentialBundling.map((order, i) => (
                <li key={i}>
                  <span style={{ color: "#87CEEB", fontWeight: "bold" }}>
                    {order.land}
                  </span>
                  : {order.menge} Flaschen
                </li>
              ))}
            </ul>
            <hr className="phase3-divider" />
          </>
        )}

        {/* Bündelungsübersicht */}
        {Object.keys(bundlingOverview).length > 0 && (
          <>
            <h3 className="phase3-section-header blue">
              Gebündelte Versandgruppen
            </h3>
            <p className="phase3-subtext">
              Die folgenden Länder enthalten zusammengefasste Bestellungen. Die
              Pakete wurden in 30er-Einheiten optimiert. Restmengen werden
              separat berücksichtigt.
            </p>
            <ul className="phase3-list">
              {Object.entries(bundlingOverview).map(
                ([land, { pakete, rest }], i) => (
                  <li key={i}>
                    <span style={{ color: "#87CEEB", fontWeight: "bold" }}>
                      {land}
                    </span>
                    : {pakete}x 30er Paket
                    {rest > 0 ? ` + ${rest} einzelne Flaschen` : ""}
                  </li>
                )
              )}
            </ul>
            <hr className="phase3-divider" />
          </>
        )}

        {/* Speditionsübersicht */}
        {Object.keys(speditionsLänder).length > 0 && (
          <>
            <h3 className="phase3-section-header blue">Speditionsversand</h3>
            <p className="phase3-subtext">
              Diese Länder überschreiten die Schwelle für Speditionsversand oder
              liegen weit entfernt. Versand erfolgt über Spedition.
            </p>
            <ul className="phase3-list">
              {Object.entries(speditionsLänder).map(([land, menge], i) => (
                <li key={i}>
                  <span style={{ color: "#87CEEB", fontWeight: "bold" }}>
                    {land}
                  </span>
                  : {menge} Flaschen
                </li>
              ))}
            </ul>
            <hr className="phase3-divider" />
          </>
        )}

        {/* Gesamtkostenanzeige */}
        <div style={{ marginTop: "2rem", textAlign: "center" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "1rem",
            }}
          >
            <h3 className="phase3-section-header" style={{ margin: 0 }}>
              Gesamtkosten (geschätzt):
            </h3>
            <span
              style={{
                fontSize: "1.5rem",
                color: "#00FF00",
                fontWeight: "bold",
                marginLeft: "0.5rem",
              }}
            >
              {gesamtKosten.toLocaleString("de-DE", {
                style: "currency",
                currency: "EUR",
              })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
