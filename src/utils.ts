import { BannerType, BaseState, Colors, GlobalContext } from "./types";

export function updateStatusBar(props: {
  state: BaseState;
  globalContext: GlobalContext;
}) {
  if (props.globalContext.ui.components.cfIsActive_StatusItem) {
    if (props.state.browserContext) {
      props.globalContext.ui.components.cfIsActive_StatusItem.text = `$(browser) CF: Active`;
      props.globalContext.ui.components.cfIsActive_StatusItem.color = "#4ec9b0"; // Green
      props.globalContext.ui.components.cfIsActive_StatusItem.tooltip =
        "Codeforces session is active. Click to re-launch.";
    } else {
      props.globalContext.ui.components.cfIsActive_StatusItem.text = `$(circle-slash) CF: Inactive`;
      props.globalContext.ui.components.cfIsActive_StatusItem.color = "#f44336"; // Red
      props.globalContext.ui.components.cfIsActive_StatusItem.tooltip =
        "No active CF session. Click to Login.";
    }
    props.globalContext.ui.components.cfIsActive_StatusItem.show();
  }
}

export function normalizeOutput(str: string) {
  return str
    .split(/\s+/)
    .filter((token) => token.length > 0)
    .join(" ");
}

export const injectBanner = async (
  page: any,
  text: string,
  accentColor: string,
  showDismiss: boolean = true,
) => {
  try {
    await page.evaluate(
      async ({ text, accentColor, showDismiss }: BannerType) => {
        // 1. Robust check for body existence (Wait up to 2.5s)
        let checks = 0;
        while (!document.body && checks < 25) {
          await new Promise((r) => setTimeout(r, 100));
          checks++;
        }

        if (!document.body || document.getElementById("cf-extension-banner"))
          return;
        if (sessionStorage.getItem("cf-banner-dismissed")) return;

        // 2. Inject Animation Styles
        const styleId = "cf-extension-banner-style";
        if (!document.getElementById(styleId)) {
          const style = document.createElement("style");
          style.id = styleId;
          style.innerHTML = `
            @keyframes bannerSlideDown {
              from { transform: translateY(-100%); opacity: 0; }
              to { transform: translateY(0); opacity: 1; }
            }
          `;
          document.head.appendChild(style);
        }

        const banner = document.createElement("div");
        banner.id = "cf-extension-banner";
        banner.innerHTML = `
          <div style="display: flex; align-items: center; justify-content: space-between; width: 100%; max-width: 1200px; margin: 0 auto; gap: 20px;">
            <div style="display: flex; align-items: center; gap: 12px;">
              <div style="background: ${accentColor}; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-size: 14px; color: white;">ℹ</div>
              <div style="line-height: 1.4; text-align: left;">
                <span style="font-weight: 600; display: block; font-size: 14px; color: #f8fafc;">Codeforces Assistant</span>
                <span style="font-size: 13px; color: #94a3b8;">${text}</span>
              </div>
            </div>
            ${showDismiss ? `<button id="close-cf-banner" style="background: #334155; border: none; color: #f8fafc; cursor: pointer; padding: 6px 12px; border-radius: 4px; font-size: 12px; font-weight: 600;">Dismiss</button>` : ""}
          </div>
        `;

        Object.assign(banner.style, {
          position: "fixed",
          top: "0",
          left: "0",
          width: "100%",
          backgroundColor: "#0f172a",
          color: "#f8fafc",
          padding: "12px 20px",
          zIndex: "9999999",
          fontFamily: "Inter, system-ui, sans-serif",
          boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
          borderBottom: "1px solid #1e293b",
          // APPLY ANIMATION
          animation:
            "bannerSlideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        });

        document.body.prepend(banner);
        document.body.style.marginTop = "60px";

        if (showDismiss) {
          document
            .getElementById("close-cf-banner")
            ?.addEventListener("click", () => {
              banner.remove();
              document.body.style.marginTop = "0px";
              sessionStorage.setItem("cf-banner-dismissed", "true");
            });
        }
      },
      { text, accentColor, showDismiss },
    );
  } catch (e) {
    // Page might have navigated away during injection
  }
};
