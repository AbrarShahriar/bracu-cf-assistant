import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";

export default class FileManager {
  public dirPath: string = "";
  private history: string[] = [];

  constructor() {
    if (!this.isWorkspaceOpened()) {
      vscode.window.showErrorMessage("Open a workspace first!");
    }
  }

  isWorkspaceOpened(): boolean {
    if (!vscode.workspace.workspaceFolders) {
      return false;
    }
    return true;
  }

  changeDirOrCreate(dirName: string) {
    if (!this.isWorkspaceOpened) {
      vscode.window.showErrorMessage("Open a workspace first!");
      return;
    }

    const folders = vscode.workspace.workspaceFolders;
    this.dirPath = path.join(folders![0].uri.fsPath, dirName);
    if (!fs.existsSync(this.dirPath))
      fs.mkdirSync(this.dirPath, { recursive: true });
    this.history.push(this.dirPath);
  }

  goBack() {
    this.history.pop();
    this.dirPath = this.history[this.history.length - 1];
  }

  workingDir() {
    return this.history[this.history.length - 1];
  }

  write(fileName: string, content: string) {
    fs.writeFileSync(path.join(this.dirPath, fileName), content, {
      encoding: "utf-8",
    });
  }

  writeFiles(files: { fileName: string; content: string }[]) {
    files.forEach((file) => {
      this.write(file.fileName, file.content);
    });
  }

  async openInVscode(fileName: string) {
    const doc = await vscode.workspace.openTextDocument(
      path.join(this.dirPath, `${fileName}`),
    );
    await vscode.window.showTextDocument(doc);
  }
}
