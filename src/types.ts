import { BrowserContext, BrowserType } from "playwright-core";
import { PlaywrightExtraClass } from "playwright-extra";
import * as vscode from "vscode";

export type BaseState = {
  context: vscode.ExtensionContext | null;
  browserContext: BrowserContext | null;
  chromium: (PlaywrightExtraClass & BrowserType<{}>) | null;
};

export type Colors = {
  SUCCESS: string;
  ERROR: string;
  INFO: string;
  WARNING: string;
  Green: string;
  Red: string;
};

export type GlobalContext = {
  ui: {
    components: {
      cfIsActive_StatusItem: vscode.StatusBarItem | null;
    };
    colors: Colors;
  };
  config: vscode.WorkspaceConfiguration;
};

export type VariableRange = {
  variable: string;
  min: string;
  max: string;
};

export type BannerType = {
  text: string;
  accentColor: string;
  showDismiss: boolean;
};
