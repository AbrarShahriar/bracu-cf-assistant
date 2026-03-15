import path from "path";
import { BrowserContext, BrowserType } from "playwright";
import { PlaywrightExtraClass } from "playwright-extra";
import * as vscode from "vscode";
import { BaseState, GlobalContext } from "../types";
import { updateStatusBar } from "../utils";

export default async function login(
  state: BaseState,
  globalContext: GlobalContext,
) {
  if (!state.context) {
    vscode.window.showErrorMessage("Extension not active!");
    return;
  }

  if (!state.chromium) {
    vscode.window.showErrorMessage("Could not launch browser!");
    return;
  }

  const userDataDir = path.join(
    state.context.globalStorageUri.fsPath,
    "cf-stealth-session",
  );

  try {
    // Check if context exists AND is actually usable
    if (state.browserContext) {
      try {
        // Test if the browser is still responsive
        await state.browserContext.pages()[0]?.title();
      } catch (e) {
        // Browser was likely closed manually by the user
        state.browserContext = null;
      }
    }

    if (!state.browserContext) {
      state.browserContext = await state.chromium.launchPersistentContext(
        userDataDir,
        {
          headless: false,
          args: [
            "--disable-blink-features=AutomationControlled",
            "--start-maximized",
            "--no-sandbox",
          ],
          viewport: null,
        },
      );

      updateStatusBar({ state, globalContext });

      // Listen for manual window closure
      state.browserContext.on("close", () => {
        state.browserContext = null;
        updateStatusBar({
          state: { ...state, browserContext: null },
          globalContext,
        }); // Turns the icon red automatically
      });
    }

    const page =
      state.browserContext.pages()[0] || (await state.browserContext.newPage());

    // --- THE WARM-UP PROTOCOL ---
    // 1. Visit a high-authority "Neutral" site first
    vscode.window.showInformationMessage("Initializing secure session...");
    await page.goto("https://www.google.com", {
      waitUntil: "domcontentloaded",
    });

    // 2. Small human-like delay (Wait 3-5 seconds)
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // --- CODEFORCES NAVIGATION ---
    try {
      // Use 'commit' to ignore redirects. If it fails due to Cloudflare refresh,
      // the catch block prevents the extension from throwing an error.
      await page.goto("https://codeforces.com/enter", {
        waitUntil: "commit",
        timeout: 60000,
      });
    } catch (e) {
      console.log(
        "Navigation redirected or interrupted (Normal for Cloudflare).",
      );
    }

    await page.waitForLoadState("domcontentloaded").catch(() => {});
    await page.waitForTimeout(2000);

    // Check for content
    const content = await page.content();
    if (
      content.includes("cf-challenge") ||
      content.includes("ray-id") ||
      (await page.title()).includes("Just a moment")
    ) {
      vscode.window.showWarningMessage(
        "Verification required. Please interact with the browser.",
      );

      // Wait indefinitely for the login form to appear
      await page.waitForSelector("#loginForm", { timeout: 0 });
      vscode.window.showInformationMessage("Verification successful!");
    } else {
      vscode.window.showInformationMessage("Ready to login or scrape.");
    }
  } catch (err) {
    vscode.window.showErrorMessage(`Session Launch Failed: ${err}`);
  }
}
