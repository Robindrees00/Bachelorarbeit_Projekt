import zones from "./zones.js";

// Basistarife für jede DHL-Zone
const zoneTariffs = {
  "Zone 1 – EU": { base: 13.2, perKg: 0.9 },
  "Zone 1 – non EU": { base: 21.3, perKg: 0.9 },
  "Zone 2 – EU/non EU": { base: 13.3, perKg: 0.9 },
  "Zone 3 – EU": { base: 13.3, perKg: 1.0 },
  "Zone 3 – non EU": { base: 20.3, perKg: 1.8 },
  "Zone 4 – non EU": { base: 24.55, perKg: 2.75 },
  "Zone 5 – non EU": { base: 28.4, perKg: 5.9 },
  "Zone 6 – non EU": { base: 36.0, perKg: 7.9 },
};

// Liefert die Zone zu einem Land
export function getZoneByCountry(country) {
  return zones[country] || "Zone 6 – non EU";
}

// Gibt Tarife (Basis + kg) zur Zone zurück
export function getTariffByZone(zone) {
  return zoneTariffs[zone];
}

// Berechnet die Versandkosten pro Bestellung (DHL-Einzelversand)
export function calculateDhlEinzelkosten(orderList) {
  return orderList.map(order => {
    const zone = getZoneByCountry(order.land);
    const tariff = getTariffByZone(zone);
    const menge = order.menge;
    const pakete = Math.ceil(menge / 30);
    const cost = +(pakete * tariff.base + tariff.perKg * menge).toFixed(2);
    return { ...order, zone, cost };
  });
}

// Summiert Einzelkosten pro Land (für Gesamtauswertung)
export function calculateEinzelkostenProLand(withEinzelkosten) {
  return withEinzelkosten.reduce((acc, order) => {
    const land = order.land;
    acc[land] = (acc[land] || 0) + order.cost;
    return acc;
  }, {});
}

// Berechnet Gesamtmenge pro Land
export function calculateTotalMengeProLand(orderList) {
  const result = {};
  for (const order of orderList) {
    const land = order.land;
    if (!result[land]) result[land] = 0;
    result[land] += order.menge;
  }
  return result;
}

// Erstellt eine Übersicht zur Bündelung: Pakete + Restflaschen pro Land
// Für Summarycontainer und aus Validierungszwecken - Das Finale Bündelungsvorgehen wird allerdings von der KI übernommen
export function buildBundlingOverview(orderList) {
  const grouped = {};

  for (const order of orderList) {
    const { land, menge } = order;
    if (!grouped[land]) grouped[land] = 0;
    grouped[land] += menge;
  }

  const overview = {};
  for (const [country, total] of Object.entries(grouped)) {
    const pakete = Math.floor(total / 30);
    const rest = total % 30;
    overview[country] = { pakete, rest };
  }

  return overview;
}
