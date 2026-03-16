import * as path from "path";
import * as vscode from "vscode";
import { execSync } from "child_process";

export default function generateTests() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) return;

  const problemDir = path.dirname(editor.document.fileName);
  const outputChannel = vscode.window.createOutputChannel("CF Generator");
  outputChannel.show();

  try {
    outputChannel.appendLine("Compiling Generator...");
    execSync(`javac -d bin Gen.java`, { cwd: problemDir });

    outputChannel.appendLine("Running Generator...");
    execSync(`java -cp bin Gen`, { cwd: problemDir });
    outputChannel.appendLine("Test Cases Generated.");

    vscode.window.showInformationMessage("Custom test cases generated..");
  } catch (err: any) {
    outputChannel.appendLine(`Generation Failed: ${err.message}`);
  }
}
