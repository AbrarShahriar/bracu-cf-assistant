import { BrowserContext, BrowserType } from "playwright";
import { PlaywrightExtraClass } from "playwright-extra";
import * as vscode from "vscode";

export type BaseState = {
  context: vscode.ExtensionContext | null;
  browserContext: BrowserContext | null;
  chromium: (PlaywrightExtraClass & BrowserType<{}>) | null;
};

export type GlobalContext = {
  ui: {
    cfIsActive_StatusItem: vscode.StatusBarItem | null;
  };
};

export type VariableRange = {
  variable: string;
  min: string;
  max: string;
};
