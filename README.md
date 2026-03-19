# BRACU Codeforces Assistant 🚀

**BRACU Codeforces Assistant** is a VS Code extension designed to streamline the competitive programming experience for students at BRAC University. It automates the tedious parts of Codeforces contests—like logging in, fetching problem statements, and running your Java solutions—so you can focus on the logic.

## ✨ Features

- **One-Click Login:** Automates the Codeforces login process using a stealth-enabled browser session.
- **Problem Puller:** Instantly fetches problem descriptions and sample test cases directly into your workspace.
- **Local Test Runner:** Run your Java solutions against fetched sample tests with a single click or keyboard shortcut.
- **Custom Test Cases:** Easily add your own test cases to verify edge cases.
- **Status Bar Integration:** Real-time visibility of your Codeforces session status (Active/Inactive).
- **Kill Session:** Quickly close the background browser instance to save system resources.

---

## 🛠 Prerequisites

To ensure the extension works perfectly on your machine, you need:

1. **A Supported Browser:** Google Chrome or Microsoft Edge must be installed.
2. **Java Environment:** [Extension Pack for Java](https://marketplace.visualstudio.com/items?itemName=vscjava.vscode-java-pack) and a JDK (Java Development Kit) installed.
3. **Active Session:** Use the `Login` command to start a session before pulling problems.

---

## 🚀 How to Use

### 1. Login

Press `Ctrl+Shift+P` and search for **BRACU-CF: Login**. A browser window will handle the authentication. The status bar will turn green once active.

### 2. Pull Problems

While on a Codeforces problem page, run **BRACU-CF: Pull Current Problem**. The extension will scrape the samples and prepare your Java environment.

### 3. Run Tests

For `.java` files, you will see a **Play Icon** in the editor title bar.

- **Click the Play Icon** or press `Ctrl + R` (Cmd + R on Mac) to run your code against all sample test cases.
- Results will be displayed in the output terminal, showing **Passed** or **Failed** (with actual vs. expected output comparisons).

---

## ⚙️ Configuration

You can customize which browser the extension uses:

1. Open VS Code **Settings** (`Ctrl + ,`).
2. Search for `BRACU Codeforces Assistant`.
3. Change the **Browser Channel** to either `chrome` or `msedge`.

---

## ⌨️ Keyboard Shortcuts

| Feature             | Shortcut           | Condition                 |
| :------------------ | :----------------- | :------------------------ |
| **Run Tests**       | `Ctrl + R`         | Only inside `.java` files |
| **Command Palette** | `Ctrl + Shift + P` | Search "BRACU-CF"         |

---

## 📦 Installation

Since this extension is optimized for BRACU students, you can install it via the `.vsix` file:

1. Download the latest `.vsix` from the [GitHub Releases](https://github.com/AbrarShahriar/bracu-cf-assistant/releases) page.
2. In VS Code, go to the **Extensions** view (`Ctrl+Shift+X`).
3. Click the `...` (three dots) in the top right and select **Install from VSIX...**.
4. Select the downloaded file and you're good to go!

---

## 🛡 Disclaimer

_This tool is intended for educational purposes and to assist in contest management. Always ensure your use of automation tools complies with Codeforces' terms of service._

**Developed by Abrar Shahriar**
