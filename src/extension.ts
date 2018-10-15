import * as vscode from 'vscode';


export function activate(context: vscode.ExtensionContext) {
  const startDis = vscode.commands.registerCommand('sb.start', () => {
    vscode.window.showInformationMessage('hello from start');
  });

  const offDis = vscode.commands.registerCommand('sb.off', () => {
    vscode.window.showInformationMessage('hello from off');
  });

  context.subscriptions.push(startDis);
  context.subscriptions.push(offDis);
}
