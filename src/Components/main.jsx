import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import "../css/index.css";
import App from "./App.jsx";

// Einstiegspunkt der App – rendert <App /> mit Routing-Unterstützung
ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
