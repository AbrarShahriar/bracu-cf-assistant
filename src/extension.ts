import * as vscode from "vscode";
import { chromium } from "playwright-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import login from "./actions/login";
import pull from "./actions/pull";
import { BaseState, GlobalContext } from "./types";
import kill from "./actions/kill";
import { updateStatusBar } from "./utils";
import { testLocal } from "./actions/testLocal";
import generateTests from "./actions/generateTests";

chromium.use(StealthPlugin());

const globalContext: GlobalContext = {
  ui: {
    components: { cfIsActive_StatusItem: null },
    colors: {
      INFO: "#1a73e8",
      SUCCESS: "#22c55e",
      WARNING: "#f59e0b",
      ERROR: "#ef4444",
      Green: "#4ec9b0",
      Red: "#f44336",
    },
  },
  config: vscode.workspace.getConfiguration("bracu-cf-assistant"),
  namespace: "bracu-cf-assistant",
};

export function activate(context: vscode.ExtensionContext) {
  // State
  const state: BaseState = { browserContext: null, chromium, context };

  // ---- UI Initialization ----

  // CF Window Is Active
  globalContext.ui.components.cfIsActive_StatusItem =
    vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  globalContext.ui.components.cfIsActive_StatusItem.command = `${globalContext.namespace}.login`;
  context.subscriptions.push(globalContext.ui.components.cfIsActive_StatusItem);
  updateStatusBar({ state, globalContext });

  // ---- Command Registration ----

  // Login
  let loginToCf = vscode.commands.registerCommand(
    `${globalContext.namespace}.login`,
    async () => login(state, globalContext),
  );
  context.subscriptions.push(loginToCf);

  // Pull
  let pullProblem = vscode.commands.registerCommand(
    `${globalContext.namespace}.pull`,
    async () => pull(state),
  );
  context.subscriptions.push(pullProblem);

  // Generate Custom Tests
  const generateTestsCommand = vscode.commands.registerCommand(
    `${globalContext.namespace}.generateTests`,
    generateTests,
  );
  context.subscriptions.push(generateTestsCommand);

  // Run Tests
  const testCommand = vscode.commands.registerCommand(
    `${globalContext.namespace}.test`,
    testLocal,
  );
  context.subscriptions.push(testCommand);

  // Kill (Optional)
  let killBrowser = vscode.commands.registerCommand(
    `${globalContext.namespace}.kill`,
    async () => kill(state, globalContext),
  );
  context.subscriptions.push(killBrowser);
}
