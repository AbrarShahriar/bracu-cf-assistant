import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
import { execSync } from "child_process";
import { normalizeOutput } from "../utils";

export async function testLocal() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) return;

  const filePath = editor.document.fileName;
  if (!filePath.endsWith(".java")) return;

  const problemDir = path.dirname(filePath);
  const className = path.basename(filePath, ".java");
  const testDir = path.join(problemDir, "tests");

  if (!fs.existsSync(testDir)) {
    vscode.window.showErrorMessage("No tests folder found for this problem.");
    return;
  }

  const outputChannel = vscode.window.createOutputChannel("CF Judge");
  outputChannel.clear();
  outputChannel.show();

  try {
    outputChannel.appendLine(`Compiling ${className}.java...`);
    execSync(`javac -d bin "${filePath}"`, { cwd: problemDir });

    const inputs = fs.readdirSync(testDir).filter((f) => f.startsWith("input"));

    for (const inputFile of inputs) {
      const testId = inputFile.replace("input", "").replace(".txt", "");
      const inputPath = path.join(testDir, inputFile);
      const expectedPath = path.join(testDir, `expected${testId}.txt`);
      const expectedOutput = fs.readFileSync(expectedPath, "utf8").trim();

      outputChannel.appendLine(`--- Running Test ${testId} ---`);

      // Execute the Java class and pipe the input file
      const startTime = Date.now();
      const solutionOutput = execSync(
        `java -cp bin ${className} < "${inputPath}"`,
        {
          cwd: problemDir,
          encoding: "utf8",
          timeout: 2000, // 2 second safety timeout
        },
      ).trim();
      const duration = Date.now() - startTime;

      // Custom Tests
      if (expectedOutput === "MANUAL_CHECK") {
        outputChannel.appendLine(`Output:\n${solutionOutput}`);
        outputChannel.appendLine(`Execution Time: ${duration}ms`);
        outputChannel.appendLine(
          `------------------------------------------\n`,
        );
        continue;
      }

      const solutionNormalized = normalizeOutput(solutionOutput);
      const expectedNormalized = normalizeOutput(expectedOutput);

      if (solutionNormalized === expectedNormalized) {
        outputChannel.appendLine(
          `Result: Test ${testId} PASSED ✅ (${duration}ms)`,
        );
      } else {
        outputChannel.appendLine(`Expected:\n${expectedOutput}`);
        outputChannel.appendLine(`Your Output:\n${solutionOutput}`);
        outputChannel.appendLine(`Result: Test ${testId} FAILED ❌`);
        break;
      }
    }
  } catch (err: any) {
    outputChannel.appendLine(`Error: ${err.message}`);
  }
}
