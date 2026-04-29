import { readCollabRuntimeConfig } from "./config.js";
import { createHocuspocusRuntime } from "./hocuspocus-runtime.js";

const config = readCollabRuntimeConfig(process.env);
const runtime = createHocuspocusRuntime(config);

runtime.listen();

function shutdown(): void {
  runtime.destroy();
}

process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);
