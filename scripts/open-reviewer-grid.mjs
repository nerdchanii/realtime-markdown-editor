import { chromium } from "@playwright/test";

const defaultConfig = {
  baseUrl: "http://127.0.0.1:5173",
  documentId: "seed-review-plan",
  left: 0,
  top: 0,
  width: 1440,
  height: 900,
};

const sessions = [
  { label: "Alice 1", member: "alice" },
  { label: "Bob 1", member: "bob" },
  { label: "Alice 2", member: "alice" },
  { label: "Bob 2", member: "bob" },
];

const config = readConfig(process.argv.slice(2));
const windows = createGridWindows(config);
const browsers = [];

process.once("SIGINT", () => void shutdown(0));
process.once("SIGTERM", () => void shutdown(0));

for (const [index, session] of sessions.entries()) {
  const bounds = windows[index];
  const browser = await chromium.launch({
    headless: false,
    args: [
      `--window-position=${bounds.left},${bounds.top}`,
      `--window-size=${bounds.width},${bounds.height}`,
    ],
  });
  browsers.push(browser);

  const context = await browser.newContext({ viewport: null });
  const page = await context.newPage();
  await page.goto(createReviewerUrl(config, session.member));
  await page.evaluate((label) => {
    document.title = `RME ${label}`;
  }, session.label);
}

console.log("Opened four reviewer windows.");
console.log("Press Ctrl+C in this terminal to close them.");
await new Promise(() => {});

function readConfig(args) {
  const options = new Map();

  for (const arg of args) {
    collectOption(options, arg);
  }

  return {
    baseUrl: readStringOption(options, "url", process.env.RME_REVIEWER_URL, defaultConfig.baseUrl),
    documentId: readStringOption(
      options,
      "document",
      process.env.RME_REVIEWER_DOCUMENT,
      defaultConfig.documentId,
    ),
    left: readNumber(options.get("left"), defaultConfig.left),
    top: readNumber(options.get("top"), defaultConfig.top),
    width: readNumber(options.get("width"), defaultConfig.width),
    height: readNumber(options.get("height"), defaultConfig.height),
  };
}

function collectOption(options, arg) {
  const [key, value] = arg.replace(/^--/, "").split("=");
  if (key && value !== undefined) options.set(key, value);
}

function readStringOption(options, key, envValue, fallback) {
  return options.get(key) ?? envValue ?? fallback;
}

function readNumber(value, fallback) {
  if (!value) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function createGridWindows({ left, top, width, height }) {
  const cellWidth = Math.floor(width / 2);
  const cellHeight = Math.floor(height / 2);

  return [
    { left, top, width: cellWidth, height: cellHeight },
    { left: left + cellWidth, top, width: cellWidth, height: cellHeight },
    { left, top: top + cellHeight, width: cellWidth, height: cellHeight },
    { left: left + cellWidth, top: top + cellHeight, width: cellWidth, height: cellHeight },
  ];
}

function createReviewerUrl({ baseUrl, documentId }, member) {
  const url = new URL(baseUrl);
  url.searchParams.set("member", member);
  url.searchParams.set("document", documentId);
  return url.toString();
}

async function shutdown(exitCode) {
  for (const browser of browsers) {
    await browser.close().catch(() => undefined);
  }

  process.exit(exitCode);
}
