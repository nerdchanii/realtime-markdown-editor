import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { App } from "./app/App";
import { LocalWorkspace } from "./core/local-workspace";
import { StorageError } from "./layouts/shell/StorageError";

import "./styles/tokens.css";
import "./styles/base.css";

const root = document.getElementById("root");
if (!root) throw new Error("root element is missing");

async function openWorkspace(): Promise<LocalWorkspace | null> {
  try {
    return await LocalWorkspace.open();
  } catch (error) {
    console.error("local workspace failed to open", error);
    return null;
  }
}

const workspace = await openWorkspace();

createRoot(root).render(
  <StrictMode>{workspace ? <App workspace={workspace} /> : <StorageError />}</StrictMode>,
);
