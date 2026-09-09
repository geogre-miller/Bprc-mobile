#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { asArray, now, parseArgs, printJson, requiredArg, writeJson } from "../agents/lib/common.mjs";

export async function captureRoute(options) {
  const {
    baseUrl,
    route = "/",
    output,
    metadata,
    width,
    height,
    browserChannel = "chrome",
    fullPage = false,
    testIds = [],
    timeoutMs = 30_000,
  } = options;

  let chromium;
  try {
    ({ chromium } = await import("playwright"));
  } catch (error) {
    return failure("CAPABILITY_UNAVAILABLE", `Playwright is unavailable: ${error.message}`);
  }

  const url = new URL(route, baseUrl).toString();
  const startedAt = now();
  let browser;
  try {
    browser = await chromium.launch({ channel: browserChannel, headless: true });
  } catch (error) {
    try {
      browser = await chromium.launch({ headless: true });
    } catch (fallbackError) {
      return failure("CAPABILITY_UNAVAILABLE", `No Playwright browser is available: ${fallbackError.message}`, { primaryError: error.message });
    }
  }

  const pageErrors = [];
  const consoleErrors = [];
  const requestFailures = [];
  try {
    const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1 });
    const page = await context.newPage();
    page.on("pageerror", (error) => pageErrors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });
    page.on("requestfailed", (request) => requestFailures.push({ url: request.url(), error: request.failure()?.errorText ?? "unknown" }));

    await page.goto(url, { waitUntil: "domcontentloaded", timeout: timeoutMs });
    await page.waitForLoadState("networkidle", { timeout: Math.min(timeoutMs, 10_000) }).catch(() => undefined);
    await page.evaluate(() => document.fonts?.ready);

    const layout = await page.evaluate(() => ({
      viewport: { width: window.innerWidth, height: window.innerHeight, devicePixelRatio: window.devicePixelRatio },
      document: {
        scrollWidth: document.documentElement.scrollWidth,
        scrollHeight: document.documentElement.scrollHeight,
      },
    }));
    const probes = {};
    for (const testId of testIds) {
      const locator = page.getByTestId(testId).first();
      probes[testId] = await locator.boundingBox().catch(() => null);
    }

    fs.mkdirSync(path.dirname(path.resolve(output)), { recursive: true });
    await page.screenshot({ path: path.resolve(output), fullPage });
    const result = {
      schemaVersion: 2,
      artifactType: "CaptureMetadata",
      status: "captured",
      capturedAt: now(),
      startedAt,
      url,
      route,
      output: path.relative(process.cwd(), path.resolve(output)).replaceAll(path.sep, "/"),
      requestedViewport: { width, height },
      actualViewport: layout.viewport,
      document: layout.document,
      fullPage,
      probes,
      diagnostics: { pageErrors, consoleErrors, requestFailures },
    };
    if (metadata) writeJson(metadata, result);
    await context.close();
    return { ok: true, ...result };
  } catch (error) {
    return failure("CHECK_FAILED", error.message, { url, pageErrors, consoleErrors, requestFailures });
  } finally {
    await browser.close();
  }
}

function failure(reasonCode, error, details = {}) {
  return { ok: false, reasonCode, error, details };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const result = await captureRoute({
    baseUrl: requiredArg(args, "url"),
    route: String(args.route ?? "/"),
    output: requiredArg(args, "out"),
    metadata: args.metadata ? String(args.metadata) : undefined,
    width: Number(args.width ?? 390),
    height: Number(args.height ?? 844),
    browserChannel: String(args.channel ?? "chrome"),
    fullPage: args["full-page"] === true,
    testIds: asArray(args["test-id"]),
    timeoutMs: Number(args.timeout ?? 30_000),
  });
  printJson(result);
  if (!result.ok) process.exitCode = 1;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) await main();
