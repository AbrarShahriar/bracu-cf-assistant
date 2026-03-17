import path from "path";
import * as vscode from "vscode";
import { BaseState, GlobalContext } from "../types";
import { injectBanner, updateStatusBar } from "../utils";
import { Page } from "playwright-core";

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
      const channel =
        globalContext.config.get<string>("browserChannel") || "chrome";
      try {
        state.browserContext = await state.chromium.launchPersistentContext(
          userDataDir,
          {
            channel,
            headless: false,
            args: [
              "--disable-blink-features=AutomationControlled",
              "--start-maximized",
              "--no-sandbox",
            ],
            viewport: null,
          },
        );

        // Script to inject only in codeforces url
        const attachInstructionListener = (target: Page) => {
          const handleInjection = async () => {
            const handleInjection = async () => {
              const url = target.url();
              if (!url.includes("codeforces.com")) return;

              // Detect if we are on a problem page
              const isProblemPage =
                url.includes("/problem/") ||
                url.includes("/problemset/problem/");

              if (isProblemPage) {
                // SUCCESS STATE: Green banner
                await injectBanner(
                  target,
                  "✅ <b>Problem Detected!</b> Return to VS Code and run <code>Pull Current Problem</code> to begin.",
                  globalContext.ui.colors.SUCCESS, // Success Green
                  true,
                );
              } else {
                // INSTRUCTION STATE: Standard Blue/Navy banner
                await injectBanner(
                  target,
                  "Navigate to a problem, then return to VS Code and run <code>Pull Current Problem</code>",
                  globalContext.ui.colors.INFO,
                  true,
                );
              }
            };

            target.on("framenavigated", (frame) => {
              if (frame === target.mainFrame()) handleInjection();
            });
            target.on("load", handleInjection);
          };

          // Trigger on frame change (handles immediate changes)
          target.on("framenavigated", (frame) => {
            if (frame === target.mainFrame()) handleInjection();
          });

          // Trigger on full load (safety net for redirects)
          target.on("load", handleInjection);
        };

        state.browserContext.on("page", (newPage) =>
          attachInstructionListener(newPage),
        );
        state.browserContext
          .pages()
          .forEach((p) => attachInstructionListener(p));
      } catch (error) {
        vscode.window.showErrorMessage(
          `Could not find ${channel}. Please install it or change the browser in Extension Settings.`,
        );
        return;
      }

      updateStatusBar({ state, globalContext });

      // Listen for manual window closure
      state.browserContext.on("close", () => {
        state.browserContext = null;
        updateStatusBar({
          state: { ...state, browserContext: null },
          globalContext,
        });
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

    // Inject a custom message onto the Google page
    await injectBanner(
      page,
      "Initializing secure session... Please wait.",
      globalContext.ui.colors.INFO, // Google Blue
      false, // No dismiss button for warmup
    );

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
