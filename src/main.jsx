import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App.jsx";
import "./styles/base.css";
import "./styles/layout.css";
import "./styles/header.css";
import "./styles/navigation.css";
import "./styles/months.css";
import "./styles/lineup.css";
import "./styles/position.css";
import "./styles/slot.css";
import "./styles/summary.css";
import "./styles/responsive.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
