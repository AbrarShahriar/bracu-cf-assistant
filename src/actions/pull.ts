import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
import { BaseState, VariableRange } from "../types";
import { getFastIOContent } from "../generators/fastioContent";
import { getJavaTemplate } from "../generators/javaTemplate";
import { generateMarkdown } from "../generators/markdown";

export default async function pull(state: BaseState) {
  if (!state.browserContext) {
    vscode.window.showErrorMessage("Browser not launched!");
    return;
  }

  const pages = state.browserContext.pages();
  const page = pages[pages.length - 1];

  const data = await page.evaluate(() => {
    const getElText = (sel: string) =>
      document.querySelector(sel)?.textContent?.trim() || "";

    // 1. Get Title and Label (e.g., "F. Coprime Graph")
    const fullTitle = getElText(".header .title");
    const label = fullTitle.split(".")[0] || "A";

    // 2. Comprehensive Description Extraction
    // Codeforces descriptions are often multiple divs before the input specification
    const statement = document.querySelector(".header + div");
    const descriptionDivs = statement
      ? Array.from(statement.children)
          .map((child) => child.textContent?.trim())
          .join("\n\n")
      : "";

    const inputSpec = getElText(".input-specification");
    const outputSpec = getElText(".output-specification");
    const note = getElText(".note");

    const timeLimit = getElText(".time-limit")
      .replace("time limit per test", "")
      .trim();
    const memoryLimit = getElText(".memory-limit")
      .replace("memory limit per test", "")
      .trim();

    const inputs = Array.from(document.querySelectorAll(".input pre")).map(
      (el) => el.textContent?.trim(),
    );
    const outputs = Array.from(document.querySelectorAll(".output pre")).map(
      (el) => el.textContent?.trim(),
    );

    // function extractConstraints() {
    //   const results: VariableRange[] = [];
    //   const latex = Array.from(
    //     document.querySelectorAll(`script[type="math/tex"]`),
    //   )
    //     .filter((el) => el.textContent.includes("leq"))
    //     .map((el) => el.textContent)
    //     .join("\n");

    //   const normalized = latex
    //     .replace(/\\leq/g, "≤")
    //     .replace(/\\le/g, "≤")
    //     .replace(/\s+/g, " ");

    //   // Split constraints by comma only if it separates different constraints
    //   const segments = normalized
    //     .replace(/[()]/g, "")
    //     .split(/,(?=\s*\d|\s*[a-zA-Z])/)
    //     .map((s) => s.trim())
    //     .filter(Boolean);

    //   for (const seg of segments) {
    //     const match = seg.match(/^(.+?)≤(.+?)≤(.+)$/);

    //     if (!match) continue;

    //     const min = match[1].trim();
    //     const varsPart = match[2].trim();
    //     const max = match[3].trim();

    //     const variables = varsPart
    //       .split(",")
    //       .map((v) => v.trim())
    //       .filter(Boolean);

    //     for (const variable of variables) {
    //       results.push({
    //         variable,
    //         min,
    //         max,
    //       });
    //     }
    //   }

    //   return results;
    // }

    return {
      title: fullTitle,
      label,
      timeLimit,
      memoryLimit,
      description: descriptionDivs,
      inputSpec: inputSpec.slice(5, inputSpec.length),
      outputSpec: outputSpec.slice(6, outputSpec.length),
      note,
      inputs,
      outputs,
      // constraints: extractConstraints(),
    };
  });

  // --- FILE SYSTEM LOGIC ---
  const folders = vscode.workspace.workspaceFolders;
  if (!folders)
    return vscode.window.showErrorMessage("Open a workspace first!");

  const problemFolderName = data.title.replace(/[:*?"<>|]/g, ""); // Sanitize
  const problemDirPath = path.join(folders[0].uri.fsPath, problemFolderName);

  if (!fs.existsSync(problemDirPath))
    fs.mkdirSync(problemDirPath, { recursive: true });

  // 1. Generate Markdown
  fs.writeFileSync(
    path.join(problemDirPath, "Instructions.md"),
    generateMarkdown(data),
  );

  // 2. Generate Java Solution Template
  fs.writeFileSync(
    path.join(problemDirPath, `${data.label}.java`),
    getJavaTemplate(data.label),
  );

  // 3. Generate FastIO Utility
  fs.writeFileSync(
    path.join(problemDirPath, `FastIO.java`),
    getFastIOContent(),
  );

  // 4. Generate Test Case Files Collected From Codeforces
  const testDir = path.join(problemDirPath, "tests");
  if (!fs.existsSync(testDir)) fs.mkdirSync(testDir);

  let testcaseId = 1;
  for (let i = 0; i < data.inputs.length; i++) {
    const input = data.inputs[i];
    const output = data.outputs[i];
    fs.writeFileSync(path.join(testDir, `input${testcaseId}.txt`), input || "");
    fs.writeFileSync(
      path.join(testDir, `expected${testcaseId}.txt`),
      output || "",
    );
    testcaseId++;
  }

  // Generate Test Case Files Collected From Constraints
  // const constraints = data.constraints;
  // for (let i = 1; i <= 5; i++) {
  //   let customInput = "";
  //   constraints.forEach((c) => {
  //     const maxVal = eval(c.max); // Be careful with eval, or use a simple parser
  //     const rand = Math.floor(Math.random() * maxVal) + 1;
  //     customInput += rand + " ";
  //   });

  //   fs.writeFileSync(
  //     path.join(testDir, `input${testcaseId}.txt`),
  //     customInput.trim(),
  //   );
  //   fs.writeFileSync(
  //     path.join(testDir, `expected${testcaseId}.txt`),
  //     "MANUAL_CHECK",
  //   );
  //   testcaseId++;
  // }

  // Open the Java file automatically
  const javaDoc = await vscode.workspace.openTextDocument(
    path.join(problemDirPath, `${data.label}.java`),
  );
  await vscode.window.showTextDocument(javaDoc);

  vscode.window.showInformationMessage(`Pulled ${data.title} successfully!`);
}
