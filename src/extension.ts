import {StatusBarAlignment, window, workspace} from 'vscode';
import initLoad from './initLoad';
import log from './log';

export async function activate() {
  const status = window.createStatusBarItem(StatusBarAlignment.Left, 200);
  status.text = 'acss enable success~';
  status.show(); // 显示状态栏项
  const cwd = workspace.workspaceFolders?.[0].uri.fsPath; // 打开的工作区的第一个文件夹的绝对路径
  if(!cwd) {
    return log.appendLine('❌ 当前工作区并不是一个文件夹~');
  }
	initLoad(cwd);
}

// This method is called when your extension is deactivated
export function deactivate() {}
