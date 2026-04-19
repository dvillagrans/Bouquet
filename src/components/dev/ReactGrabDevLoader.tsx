"use client";

import { useEffect } from "react";

/** Carga react-grab solo en desarrollo sin renderizar `<script>` en el árbol de React (evita avisos en React 19). */
export function ReactGrabDevLoader() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    const id = "bouquet-react-grab-global";
    if (document.getElementById(id)) return;
    const s = document.createElement("script");
    s.id = id;
    s.src = "https://unpkg.com/react-grab/dist/index.global.js";
    s.crossOrigin = "anonymous";
    document.head.appendChild(s);
  }, []);

  return null;
}
