import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { App } from "./app/App";
import { LocalWorkspace } from "./core/local-workspace";

import "./styles/tokens.css";
import "./styles/base.css";

const root = document.getElementById("root");
if (!root) throw new Error("root element is missing");

const workspace = new LocalWorkspace();
await workspace.ready();

createRoot(root).render(
  <StrictMode>
    <App workspace={workspace} />
  </StrictMode>,
);
