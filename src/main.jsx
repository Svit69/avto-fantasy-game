import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App.jsx";
import "./styles/base.css";
import "./styles/layout.css";
import "./styles/header.css";
import "./styles/metrics.css";
import "./styles/navigation.css";
import "./styles/months.css";
import "./styles/lineup.css";
import "./styles/team-header.css";
import "./styles/position.css";
import "./styles/position-groups.css";
import "./styles/slot.css";
import "./styles/slot-content.css";
import "./styles/summary.css";
import "./styles/save-button.css";
import "./styles/bottom-nav.css";
import "./styles/responsive.css";
import "./styles/compact-mobile.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
