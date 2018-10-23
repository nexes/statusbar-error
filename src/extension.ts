import { DiagnosticBar } from './DiagnosticBar';
import {
  ExtensionContext,
  commands,
  window,
  workspace,
  TextEditor,
  StatusBarAlignment,
  TextEditorSelectionChangeEvent,
  ConfigurationChangeEvent,
} from 'vscode';


const diagnosticBar = new DiagnosticBar(window.createStatusBarItem(StatusBarAlignment.Left, -1));

export function activate(context: ExtensionContext) {
  const settings = workspace.getConfiguration('statusbarerror');

  diagnosticBar.setColors(
    settings.get('color.info') || '#41e086',
    settings.get('color.hint') || '#35b1f4',
    settings.get('color.warning') || '#f4b81f',
    settings.get('color.error') || '#f41f1f',
  );

  diagnosticBar.setIcons(
    settings.get('icon.info') || '',
    settings.get('icon.hint') || '',
    settings.get('icon.warning') || '',
    settings.get('icon.error') || '',
  );

  const toggleCmd = commands.registerCommand('sb.toggle', () => {
    // TODO
    window.showInformationMessage('hello from start');
  });

  const activeEditorDisposable = window.onDidChangeActiveTextEditor(activeTextEditorChange);
  const selectionEditorDisposable = window.onDidChangeTextEditorSelection(selectionTextEditorChange);
  const settingsChangeDisposable = workspace.onDidChangeConfiguration(settingsValueChanged);

  context.subscriptions.push(toggleCmd);
  context.subscriptions.push(diagnosticBar);
  context.subscriptions.push(activeEditorDisposable);
  context.subscriptions.push(selectionEditorDisposable);
  context.subscriptions.push(settingsChangeDisposable);
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

function settingsValueChanged(event: ConfigurationChangeEvent): void {
  if (event.affectsConfiguration('statusbarerror')) {
    const settings = workspace.getConfiguration('statusbarerror');

    diagnosticBar.setColors(
      settings.get('color.info') || '#41e086',
      settings.get('color.hint') || '#35b1f4',
      settings.get('color.warning') || '#f4b81f',
      settings.get('color.error') || '#f41f1f',
    );

    diagnosticBar.setIcons(
      settings.get('icon.info') || '',
      settings.get('icon.hint') || '',
      settings.get('icon.warning') || '',
      settings.get('icon.error') || '',
    );
  }
}
