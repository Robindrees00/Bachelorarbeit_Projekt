import { useState } from "react";
import "../css/Phase-1.css";

import {
  buildBundlingPrompt,
  buildSpeditionsPrompt,
  buildFilterPrompt,
} from "../ControlInput/rules";

import {
  calculateDhlEinzelkosten,
  buildBundlingOverview,
} from "../ControlInput/dhlUtils";

import speditionsdaten from "../ControlInput/speditionsdaten";

// Button-Komponente zum Starten der Optimierung via OpenAI
export default function SolveButton({ jsonContent, onResult }) {
  const [loading, setLoading] = useState(false);

  const handleSolve = async () => {
    if (!jsonContent) return;
    setLoading(true);

    try {
      // === 1. Bestellungen filtern ===
      let filteredResponse = "";

      // Extrahiert JSON-Objekt aus KI-Antwort (zwischen erstem { und letztem })
      const extractJSON = (text) => {
        const start = text.indexOf("{");
        const end = text.lastIndexOf("}") + 1;
        if (start === -1 || end === -1) throw new Error("Kein JSON gefunden");
        return JSON.parse(text.slice(start, end));
      };

      let speditionList = [],
        bundlingList = [],
        singleList = [];

      try {
        const filterPrompt = buildFilterPrompt(jsonContent);
        filteredResponse = await fetchOpenAI(filterPrompt);
        const parsed = extractJSON(filteredResponse);

        // Ergebnisse aus KI-Antwort extrahieren
        speditionList = parsed.speditionList || [];
        bundlingList = parsed.bundlingList || [];
        singleList = parsed.singleList || [];
      } catch (e) {
        console.error("❌ Fehler beim Parsen der KI-Filterantwort:", e);
        alert("Die KI-Antwort konnte nicht gelesen werden.");
        console.log("KI-Antwort (Rohtext):", filteredResponse);
        setLoading(false);
        return;
      }

      // === 2. Prompt für Bündelung und Spedition bauen ===
      const speditionPrompt = buildSpeditionsPrompt(
        speditionList,
        speditionsdaten
      );
      const bundlingPrompt = buildBundlingPrompt(bundlingList);

      // Beide Prompts parallel an OpenAI senden
      const [speditionResponse, bundlingResponse] = await Promise.all([
        fetchOpenAI(speditionPrompt),
        fetchOpenAI(bundlingPrompt),
      ]);

      // === 3. Geschätzte Kosten aus Textantwort extrahieren ===
      const extractTotalCostFromText = (text) => {
        const euroPattern = /([\d.,]+)\s*€/g;
        let match;
        let lastMatch = null;

        while ((match = euroPattern.exec(text)) !== null) {
          lastMatch = match[1];
        }

        if (!lastMatch) return null;

        // Formatierung vereinheitlichen
        const raw = lastMatch;
        const containsComma = raw.includes(",");
        const containsDot = raw.includes(".");
        let normalized = raw;

        if (containsComma && containsDot) {
          normalized = raw.replace(/,/g, "");
        } else if (containsComma && !containsDot) {
          normalized = raw.replace(/\./g, "").replace(",", ".");
        }

        return parseFloat(normalized);
      };

      const totalBundlingCost = extractTotalCostFromText(bundlingResponse);
      const totalSpeditionCost = extractTotalCostFromText(speditionResponse);

      // Logische Überprüfung der Kosten (Validierungszwecke)
      console.log("KI-Antwort (Rohtext):", filteredResponse);

      // === 4. Einzelkosten (nicht optimierte Bestellungen) berechnen ===
      const einzelkostenList = calculateDhlEinzelkosten(singleList);
      const totalEinzelkostenNonBundled = einzelkostenList.reduce(
        (sum, order) => sum + order.cost,
        0
      );

      // Übersicht für UI aufbauen
      const bundlingOverview = buildBundlingOverview(bundlingList);

      // === 5. Ergebnis an Elternkomponente zurückgeben ===
      onResult({
        spedition: speditionResponse,
        bundling: bundlingResponse,
        totalBundlingCost,
        totalSpeditionCost,
        nonPotentialBundling: singleList,
        einzelkostenNonBundled: einzelkostenList,
        totalEinzelkostenNonBundled,
        singleList,
        speditionList,
        bundlingList,
        bundlingOverview,
      });
    } catch (error) {
      alert("Fehler bei der Optimierung");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Helferfunktion: Anfrage an OpenAI senden
  const fetchOpenAI = async (prompt) => {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          { role: "system", content: "Du bist ein Versandoptimierer." },
          { role: "user", content: prompt },
        ],
        temperature: 0.2,
      }),
    });

    const data = await response.json();
    return data.choices?.[0]?.message?.content || "Keine Antwort erhalten.";
  };

  // Button-UI
  return (
    <div style={{ marginTop: "20px", textAlign: "center" }}>
      <button className="solve-button" onClick={handleSolve} disabled={loading}>
        {loading ? (
          <>
            Optimierung läuft...
            <span className="spinner" />
          </>
        ) : (
          "Versand optimieren"
        )}
      </button>
    </div>
  );
}
