import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { GameApp } from "@/components/app/GameApp";
import "../src/styles.css";

const el = document.getElementById("root");
if (!el) throw new Error("Missing #root");

createRoot(el).render(
  <StrictMode>
    <GameApp />
  </StrictMode>,
);
