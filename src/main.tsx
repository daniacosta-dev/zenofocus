import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles.css"
import { useTimer } from "./store/useTimer"

// Ticker global — corre siempre, independiente de qué tab está abierta
let interval: ReturnType<typeof setInterval> | null = null

useTimer.subscribe((state) => {
  if (state.running && !interval) {
    interval = setInterval(() => {
      useTimer.getState().tick()
    }, 1000)
  } else if (!state.running && interval) {
    clearInterval(interval)
    interval = null
  }
})

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
