import { laenderKategorien, kostenNachKategorie } from "./category.js";
import zones from "./zones.js";


export function buildFilterPrompt(jsonOrders) {
  const ordersText = jsonOrders
    .map((order) => `${order.land}: ${order.menge} Flaschen`)
    .sort((a, b) => a.localeCompare(b)) // Länder alphabetisch sortieren
    .join("\n");

  const zoneMap = Object.entries(zones)
    .map(([land, zone]) => `${land}: Zone ${zone}`)
    .join("\n");

  return `
You are a logistics AI that classifies international wine shipments for optimal delivery.

🚫 DO NOT write explanations.  
🚫 DO NOT return code.  
✅ ONLY return valid JSON, as shown at the end.

---

🎯 **Goal:**
1. Group all orders **by country**.
2. Sum the total number of bottles per country.
3. Classify each country into exactly **one** of the following categories:

---

 **singleList**
- If the country has **only one order**

 **speditionList**
- If the country is in **Zone 5 or Zone 6**, always include it
- If the country has **more than 120 bottles**, regardless of zone

 **bundlingList**
- If the country is in **Zone 1–4**
- AND the total bottle count is **≤ 120**
- AND there are **multiple orders** to that country

---

✳️ Each country must appear in **only one** category.

📛 Do NOT lose any orders.
📛 Do NOT skip any countries.
📛 Double-check that the total bottles across all lists equals the total from the input.

---

📋 **Zone Mapping:**
${zoneMap}

---

📝 **Orders (sorted by country):**
${ordersText}

---

✅ **Return JSON only (no code or comments):**
{
  "speditionList": [ { "land": "Landname", "menge": X }, ... ],
  "bundlingList":  [ { "land": "Landname", "menge": X }, ... ],
  "singleList":    [ { "land": "Landname", "menge": X }, ... ]
}
`.trim();
}


/**
 * Prompt for Bundling Optimization
 */
export function buildBundlingPrompt(orderList) {
  const bestellungenText = orderList
    .filter(order => order && typeof order.land === "string" && typeof order.menge === "number") // ✅ Absicherung
    .map((order, i) => {
      const land = order.land;
      const menge = order.menge;
      const kategorie = laenderKategorien[land] || "Unknown";
      const kosten = kostenNachKategorie[kategorie] || {};
      return `Order ${i + 1}: ${menge} bottles to ${land} (${kategorie}) → Packaging: ${kosten.umverpackung ?? "?"} €, Local shipping: ${kosten.inlandWeiterleitung ?? "?"} €`;
    })
    .join("\n");

  return `
You are a logistics optimization AI specializing in international wine shipments. Your task is to optimize **bundling** of shipments to reduce DHL shipping costs.

---

🎯 **Goal:**
Group orders going to the same destination country into **30-bottle packages**.

🧾 **Rules:**
- Each 30-bottle package is sent to the destination country and redistributed locally.
- Redistribution requires:
  - Packaging cost **per bundle** depending on country type:
    - Industrialized: 5 € + 5 €
    - Emerging: 7 € + 7 €
    - Developing: 9 € + 9 €


---

DHL Tariffs = {
  "Zone 1 – EU": { base: 13.2, perKg: 0.9 },
  "Zone 1 – non EU": { base: 21.3, perKg: 0.9 },
  "Zone 2 – EU/non EU": { base: 13.3, perKg: 0.9 },
  "Zone 3 – EU": { base: 13.3, perKg: 1.0 },
  "Zone 3 – non EU": { base: 20.3, perKg: 1.8 },
  "Zone 4 – non EU": { base: 24.55, perKg: 2.75 },
  "Zone 5 – non EU": { base: 28.4, perKg: 5.9 },
  "Zone 6 – non EU": { base: 36.0, perKg: 7.9 },
};

📦 **Your Output:**
For each country:
- Number of 30-bottle packages
- Remaining bottles
- Additional costs (if applicable)
- Total **estimated cost** using DHL tariffs for bundled packages + additional costs
- Short explanation

📋 **Format Example:**

Country: Spain  
30er Packages: 2  
Remaining Bottles: 15  
Additional Costs: 20 €  
Estimated Total Cost: 145 €  
Reasoning: Two 30-bottle packages were possible. One remaining order with 15 bottles. Additional cost because bundles include multiple recipients.

---

✅ At the end, return:
**Total Estimated Cost for All Bundled Countries: X €**

---

📝 **Orders:**
${bestellungenText}
`.trim();
}

/**
 * Prompt for Spedition Optimization
 */
export function buildSpeditionsPrompt(orderList, speditionsdaten) {
  const mengenProLand = orderList.reduce((acc, order) => {
  const land = typeof order.land === "string" ? order.land.trim() : "Unbekannt";
  if (!acc[land]) acc[land] = 0;
  acc[land] += order.menge || 0;
  return acc;
}, {});


  const mengenText = Object.entries(mengenProLand)
    .map(([land, menge]) => `${land}: ${menge} bottles`)
    .join("\n");

  const speditionText = speditionsdaten
    .map(entry => {
      const teile = [`${entry.Land}:`];
      if (entry.Richtwert_50) teile.push(`  • 50 bottles: ${entry.Richtwert_50} €`);
      if (entry.Preis_EUR) teile.push(`  • 100 bottles: ${entry.Preis_EUR} €`);
      return teile.join("\n");
    })
    .join("\n\n");

  return `
You are a logistics AI estimating **freight shipping costs** for an international wine auction.

---

🎯 **Goal:**
Estimate realistic **freight shipping costs per country**, using:
- Total bottle count per country
- Reference rates (for 50 or 100 bottles)
- Logical extrapolation for volumes beyond reference points
- No arbitrary estimates

---

🧾 **Instructions:**
- Use the **highest available reference point** (either 50 or 100 bottles) **once**
- For all bottles beyond that point, calculate proportionally using **per-bottle cost**
- Do **not** combine multiple reference prices (e.g., no “100 + 50” logic)
- If only one rate is available, use it
- If no rate is available, return **null**
- Provide clear reasoning and show your math

---

🧮 **Example (Correct Method):**
Country: South Africa  
Total bottles: 156  
Available rates: 100 bottles = 800 €  
→ Base: 100 bottles → 800 €  
→ Remaining: 56 bottles → (800 € / 100) × 56 = 448 €  
✅ Total Estimated Freight Cost = 1248 €

❌ Do not combine 100 + 50 rates (e.g. 800 € + 650 €) – this inflates the cost

---

📋 **Output Format:**

Country: Brazil  
Bottles: 90  
Estimated Freight Cost: 720 €  
Reasoning: Used 50-bottle rate (400 €). Calculated 40 extra bottles proportionally: 400/50 × 40 = 320 €. Total: 720 €.
Geopolitical and Infrastructure Notes: Brazil has long transport distances, challenging customs procedures, and limited cold chain infrastructure, which increases logistical complexity and cost.

---

✅ At the end, return:
**Total Estimated Freight Cost for All Countries: X €**

---

📦 **Total Bottles Per Country:**
${mengenText}

🚚 **Freight Reference Rates:**
${speditionText}
`.trim();
}
