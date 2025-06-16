import reactLogo from "../assets/react.svg";
import viteLogo from "/vite.svg";
import "../css/index.css";

// Header mit Logos und einfacher Navigation
function Header() {
  return (
    <header className="header">
      {/* Logo-Bereich */}
      <div className="logos">
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo small" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react small" alt="React logo" />
        </a>
      </div>

      {/* Hauptmenü */}
      <nav className="menu">
        <ul>
          <li>
            <a href="#logisticsai">Logistics Ai</a>
          </li>
        </ul>
      </nav>
    </header>
  );
}

export default Header;
