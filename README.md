# BRACU Codeforces Assistant 🚀

A lightweight VS Code extension designed for competitive programmers to bridge the gap between the browser and the editor.

## Features

- **Secure Stealth Login:** Uses a persistent session to handle Codeforces login and Cloudflare verifications smoothly.
- **Dynamic HUD:** In-browser instructions that guide you through problem selection.
- **Problem Pulling:** Pull test cases and problem statements directly into your workspace.
- **Browser Choice:** Supports Google Chrome and Microsoft Edge without downloading extra binaries.

## Setup & Requirements

This extension uses your **locally installed browser** to keep the installation size small.

1. Ensure you have **Google Chrome** (recommended) or **Microsoft Edge** installed.
2. If you use Edge, go to `Settings > Extensions > Codeforces Assistant` and change the Browser Channel.

## Usage

1. Run the command `CF: Login/Launch Browser`.
2. Navigate to your desired problem on Codeforces.
3. Once the green "Problem Detected" banner appears, return to VS Code.
4. Run `CF: Pull Problem`.

## Extension Settings

- `bracu-cf.browserChannel`: Switch between `chrome` and `msedge`.

---

_Developed for BRACU CSE Students._
