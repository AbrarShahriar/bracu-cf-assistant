import { BaseState, GlobalContext } from "../types";
import { updateStatusBar } from "../utils";
import * as vscode from "vscode";

export default async function kill(
  state: BaseState,
  globalContext: GlobalContext,
) {
  if (state.browserContext) {
    await state.browserContext.close();
    state.browserContext = null;
    updateStatusBar({ state, globalContext });
    vscode.window.showInformationMessage("CF Browser closed.");
  }
}
