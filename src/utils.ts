import { BaseState, GlobalContext } from "./types";

export function updateStatusBar(props: {
  state: BaseState;
  globalContext: GlobalContext;
}) {
  if (props.globalContext.ui.cfIsActive_StatusItem) {
    if (props.state.browserContext) {
      props.globalContext.ui.cfIsActive_StatusItem.text = `$(browser) CF: Active`;
      props.globalContext.ui.cfIsActive_StatusItem.color = "#4ec9b0"; // Green
      props.globalContext.ui.cfIsActive_StatusItem.tooltip =
        "Codeforces session is active. Click to re-launch.";
    } else {
      props.globalContext.ui.cfIsActive_StatusItem.text = `$(circle-slash) CF: Inactive`;
      props.globalContext.ui.cfIsActive_StatusItem.color = "#f44336"; // Red
      props.globalContext.ui.cfIsActive_StatusItem.tooltip =
        "No active CF session. Click to Login.";
    }
    props.globalContext.ui.cfIsActive_StatusItem.show();
  }
}

export function normalizeOutput(str: string) {
  return str
    .split(/\s+/)
    .filter((token) => token.length > 0)
    .join(" ");
}
