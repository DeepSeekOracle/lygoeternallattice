import { useEffect, useState } from "react";

const KEY = "lygo-hub-radio-open";

let open = false;
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

export function isRadioOpen() {
  return open;
}

export function setRadioOpen(v: boolean) {
  if (open === v) return;
  open = v;
  emit();
}

export function toggleRadio() {
  setRadioOpen(!open);
}

export function useRadioOpen() {
  const [v, setV] = useState(open);
  useEffect(() => {
    const fn = () => setV(open);
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  }, []);
  return v;
}
