import React from "react";
import { createRoot } from "react-dom/client";
import App from "./src/App.tsx";

const root = createRoot(document.getElementById("shopify-app") as HTMLElement);
root.render(<App />);