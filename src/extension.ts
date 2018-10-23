import { DiagnosticBar } from './DiagnosticBar';
import {
  ExtensionContext,
  commands,
  window,
  TextEditor,
  StatusBarAlignment,
  TextEditorSelectionChangeEvent,
} from 'vscode';


const diagnosticBar = new DiagnosticBar(window.createStatusBarItem(StatusBarAlignment.Left, -1));

export function activate(context: ExtensionContext) {
  const toggleCmd = commands.registerCommand('sb.toggle', () => {
    // TODO
    window.showInformationMessage('hello from start');
  });

  const activeEditorDisposable = window.onDidChangeActiveTextEditor(activeTextEditorChange);
  const selectionEditorDisposable = window.onDidChangeTextEditorSelection(selectionTextEditorChange);

  context.subscriptions.push(toggleCmd);
  context.subscriptions.push(diagnosticBar);
  context.subscriptions.push(activeEditorDisposable);
  context.subscriptions.push(selectionEditorDisposable);
}

export function deactive() {
  // TODO
}

function selectionTextEditorChange(selection: TextEditorSelectionChangeEvent) {
  diagnosticBar.cursorSelectionChangedListener(selection);
}

function activeTextEditorChange(editor: TextEditor | undefined): void {
  if (!!editor) {
    diagnosticBar.activeEditorChanged(editor);
  }
}
