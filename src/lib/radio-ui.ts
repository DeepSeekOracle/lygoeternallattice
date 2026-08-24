import { useEffect, useState } from "react";

const KEY = "lygo-hub-radio-open";

let open = false;
let playing = false;
try {
  open = sessionStorage.getItem(KEY) === "1";
} catch {
  open = false;
}

const listeners = new Set<() => void>();

function emit() {
  try {
    sessionStorage.setItem(KEY, open ? "1" : "0");
  } catch {
    /* ignore */
  }
  listeners.forEach((fn) => fn());
}

export function setRadioOpen(v: boolean) {
  if (open === v) return;
  open = v;
  emit();
}

export function toggleRadio() {
  setRadioOpen(!open);
}

export function setRadioPlaying(v: boolean) {
  if (playing === v) return;
  playing = v;
  emit();
}

export function useRadioUi() {
  const [state, setState] = useState({ open, playing });
  useEffect(() => {
    const fn = () => setState({ open, playing });
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  }, []);
  return state;
}

export function useRadioOpen() {
  return useRadioUi().open;
}
