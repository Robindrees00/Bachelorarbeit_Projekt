# Logistics-AI (Bachelorarbeit)

Dies ist das begleitende Softwareprojekt zur Bachelorarbeit im Studiengang Wirtschaftsinformatik. Ziel der Arbeit war die Entwicklung und Evaluation eines digitalen Hilfsmittels zur automatisierten Versandoptimierung im Kontext internationaler Weinauktionen.  
Im Mittelpunkt steht die Frage, inwiefern generative Sprachmodelle – konkret GPT-4 – in der Lage sind, wirtschaftlich sinnvolle Versandentscheidungen zu treffen und klassische Entscheidungsprozesse sinnvoll zu ergänzen.  

Die hier dokumentierte Implementierung übernimmt die prototypische Umsetzung des entworfenen Konzepts. Sie umfasst:

- den Import strukturierter Bestelldaten im JSON-Format,  
- die algorithmische Vorverarbeitung (z. B. DHL-Kalkulation, Mengenaggregation),  
- die Einbindung eines LLM zur Versandartbewertung (Bündelung, Spedition),  
- die Generierung von Versandempfehlungen im lokalen Browser.

---

## Projekt lokal starten

### 1. Repository klonen

git clone https://github.com/Robindrees00/Bachelorarbeit_Projekt.git
cd Bachelorarbeit_Projekt

---

### 2. Abhängigkeiten installieren

npm install

Erfordert Node.js (empfohlen: v18 oder neuer)
Download: https://nodejs.org

---

### 3. .env Datei aktualisieren (Für den KI-Schlüssel)

Der Inhalt der Datei .env befindet sich im beigefügten ZIP-Anhang. (AI-Key.zip)

Der richtige Schlüssel aus der Zip-Datei muss nun in die .env Datei des Projekts kopiert werden


---

### 4. Projekt starten (lokaler Dev-Server)

npm run dev

Danach im Browser öffnen: http://localhost:5173

---

---
