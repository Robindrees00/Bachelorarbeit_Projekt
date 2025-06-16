import "../css/index.css";
import "../css/Summary.css";
import { calculateDhlEinzelkosten } from "../ControlInput/dhlUtils";

// Zusammenfassende Übersicht über die Ergebnisse der Optimierung
export default function SummaryContainer({
  fileName,
  totalQuantity,
  totalOrders,
  totalEinzelkosten,
  summarizedOrders = {},
  bundlingOverview,
  filteredSpeditionList = [],
  filteredBundlingList = [],
  totalBundlingCost,
  totalSpeditionCost,
  nonPotentialBundling = [],
}) {
  // Alle Zielländer in der Bestellliste
  const uniqueCountries = Object.keys(summarizedOrders || {});

  // Länder, die nicht gebündelt oder per Spedition verschickt werden können
  const einzellaender = [
    ...new Set(nonPotentialBundling.map((order) => order.land)),
  ];

  // Summiere Flaschenanzahl pro Einzelland
  const einzelLaenderMap = nonPotentialBundling.reduce(
    (acc, { land, menge }) => {
      acc[land] = (acc[land] || 0) + menge;
      return acc;
    },
    {}
  );

  // DHL-Einzelversandkosten für alle nicht-optimierten Bestellungen berechnen
  const einzellaenderkosten = calculateDhlEinzelkosten(nonPotentialBundling);

  // Länder, die per Spedition verschickt werden sollen
  const speditionsLaender = [
    ...new Set(filteredSpeditionList.map((order) => order.land)),
  ];

  // Summiere Flaschenanzahl pro Speditionsland
  const speditionsLaenderMap = filteredSpeditionList.reduce(
    (acc, { land, menge }) => {
      acc[land] = (acc[land] || 0) + menge;
      return acc;
    },
    {}
  );

  // Länder, für die eine Paketbündelung vorgesehen ist
  const bundlingLaender = [
    ...new Set(filteredBundlingList.map((order) => order.land)),
  ];

  return (
    <div className="summary-container">
      <div className="side-summary">
        {/* Kopfbereich */}
        <div className="top-info">
          <div className="additional-info-header">
            <h2 className="summary-title">📄 Bestellliste: {fileName}</h2>
          </div>
          <div className="summary-row">
            <p className="fade-in-left-soft" style={{ animationDelay: "1.4s" }}>
              <strong>Total Quantity:</strong> {totalQuantity}
            </p>
            <p className="fade-in-left-soft" style={{ animationDelay: "1.6s" }}>
              <strong>Orders:</strong> {totalOrders}
            </p>
            <p className="fade-in-left-soft" style={{ animationDelay: "1.8s" }}>
              <strong>Zielländer:</strong> {uniqueCountries.length}
            </p>
          </div>
        </div>

        <hr className="summary-divider" />

        {/* Bestellmengen nach Land */}
        <h3 className="summary-subheading">
          📦 Bestellmengen nach Land (in Flaschen):
        </h3>
        <ul className="country-list">
          {uniqueCountries.map((country, i) => (
            <li key={country} style={{ animationDelay: `${i * 0.1 + 3}s` }}>
              {country}:{" "}
              <strong className="highlight">{summarizedOrders[country]}</strong>
            </li>
          ))}
        </ul>

        <hr
          className="summary-divider animated-divider"
          style={{ animationDelay: `${uniqueCountries.length * 0.1 + 2.8}s` }}
        />

        {/* Theoretische Einzelversandkosten */}
        <p
          className="fade-in-left-soft"
          style={{ animationDelay: `${uniqueCountries.length * 0.1 + 2.9}s` }}
        >
          <strong style={{ fontSize: "1.25rem" }}>
            📊 Gesamtkosten Einzelversand:
          </strong>{" "}
          <strong style={{ color: "#00FF00", fontSize: "1.25rem" }}>
            € {totalEinzelkosten}
          </strong>
          <br />
          <div className="additional-info">
            *diese Kosten würden Schätzungsweise entstehen, wenn jede Bestellung
            separat verschickt würde
          </div>
        </p>

        <hr
          className="summary-divider animated-divider"
          style={{ animationDelay: `${uniqueCountries.length * 0.1 + 4}s` }}
        />

        {/* Filter-Ergebnisse der KI */}
        <h3
          className="summary-subheading fade-in-left-soft"
          style={{
            animationDelay: `${uniqueCountries.length * 0.1 + 4.1}s`,
            fontWeight: "bold",
            color: "#fff",
          }}
        >
          <span style={{ marginRight: "0.5em" }}>▼</span>
          KI-gefiltertes Versandvorgehen
          <span style={{ marginLeft: "0.5em" }}>▼</span>
        </h3>

        {/* 🔸 Einzellieferungen */}
        <div
          className="bundling-info slide-up-soft"
          style={{
            animationDelay: `${uniqueCountries.length * 0.1 + 4.3}s`,
          }}
        >
          <div className="bundling-info-header">Einzellieferungen</div>
          <p>
            Länder, die zu klein oder zu selten bestellt wurden, werden einzeln
            verschickt (kein Bündel-/Speditionspotenzial).
          </p>

          <ul className="bundling-list">
            {einzellaender.map((land, i) => (
              <li key={land} style={{ animationDelay: `${i * 0.08 + 4.5}s` }}>
                <strong>
                  <span style={{ color: "#fff" }}>{land}</span>{" "}
                  <span className="highlight">
                    ({einzelLaenderMap[land]} Flaschen)
                  </span>
                </strong>
              </li>
            ))}
          </ul>

          <hr
            className="summary-divider animated-divider"
            style={{ animationDelay: `${einzellaender.length * 0.08 + 5.1}s` }}
          />

          {/* Einzelkosten laut KI berechnet */}
          <div
            className="bundling-summary-footer fade-in-left-soft"
            style={{ animationDelay: `${einzellaender.length * 0.08 + 5.3}s` }}
          >
            <p className="cost-heading">
              <strong>KI-basierte Einzelversandkosten:</strong>{" "}
              <span className="cost-value">
                {einzellaenderkosten.length > 0
                  ? einzellaenderkosten
                      .reduce((sum, order) => sum + (order.cost || 0), 0)
                      .toLocaleString("de-DE", {
                        style: "currency",
                        currency: "EUR",
                      })
                  : "n/a"}
              </span>
            </p>
          </div>
        </div>

        {/* Bündelungen */}
        <div
          className="bundling-info slide-up-soft"
          style={{ animationDelay: `${uniqueCountries.length * 0.1 + 5.6}s` }}
        >
          <div className="bundling-info-header">
            📦 Bündelungsvorgehen (einfach)
          </div>
          <p>
            Mehrere Bestellungen ins gleiche Land werden zu 30er-Paketen
            zusammengefasst. Das spart Versandkosten.
          </p>
          <p>Umverpackungskosten im Zielland sind eingerechnet.</p>

          {/* Gruppierung nach "Paketanzahl + Rest" */}
          {bundlingOverview && (
            <div className="bundling-list-wrapper">
              <ul className="bundling-list">
                {Object.entries(
                  Object.entries(bundlingOverview).reduce(
                    (acc, [country, { pakete, rest }]) => {
                      const key = `${pakete}x 30er Paket${
                        rest > 0 ? ` + ${rest} ungebündelt` : ""
                      }`;
                      if (!acc[key]) acc[key] = [];
                      acc[key].push(country);
                      return acc;
                    },
                    {}
                  )
                ).map(([description, countries], i) => (
                  <li
                    key={description}
                    style={{ animationDelay: `${i * 0.08 + 5.8}s` }}
                  >
                    {countries.join(" / ")}:{" "}
                    <strong className="highlight">{description}</strong>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <hr
            className="summary-divider animated-divider"
            style={{
              animationDelay: `${uniqueCountries.length * 0.1 + 6.1}s`,
            }}
          />

          <div
            className="bundling-summary-footer fade-in-left-soft"
            style={{
              animationDelay: `${
                5.3 + Object.keys(bundlingOverview).length * 0.08 + 4.1
              }s`,
            }}
          >
            <p className="cost-heading">
              Geschätzte Bündelungskosten:{" "}
              <span className="cost-value">
                {totalBundlingCost
                  ? totalBundlingCost.toLocaleString("de-DE", {
                      style: "currency",
                      currency: "EUR",
                    })
                  : "n/a"}
              </span>
            </p>
          </div>
        </div>

        {/* Speditionsversand */}
        <div
          className="bundling-info slide-up-soft"
          style={{
            animationDelay: `${speditionsLaender.length * 0.08 + 8.4}s`,
          }}
        >
          <div className="bundling-info-header">🚚 Speditionsversand</div>
          <p>
            Große oder entfernte Länder erhalten die Lieferung per Spedition.
            Dies ist effizienter als Einzelversand.
          </p>
          <p>Länder mit Speditionsversand:</p>

          <ul className="bundling-list">
            {speditionsLaender.map((land, i) => (
              <li key={land} style={{ animationDelay: `${i * 0.08 + 8.7}s` }}>
                <strong>
                  <span style={{ color: "#fff" }}>{land}</span>{" "}
                  <span className="highlight">
                    ({speditionsLaenderMap[land]} Flaschen)
                  </span>
                </strong>
              </li>
            ))}
          </ul>

          <hr
            className="summary-divider animated-divider"
            style={{
              animationDelay: `${speditionsLaender.length * 0.08 + 8.9}s`,
            }}
          />

          <div
            className="bundling-summary-footer fade-in-left-soft"
            style={{
              animationDelay: `${speditionsLaender.length * 0.08 + 10}s`,
            }}
          >
            <p className="cost-heading">
              <strong>KI-basierte Speditionskosten:</strong>{" "}
              <span className="cost-value">
                {totalSpeditionCost
                  ? totalSpeditionCost.toLocaleString("de-DE", {
                      style: "currency",
                      currency: "EUR",
                    })
                  : "n/a"}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
