import { DiagnosticBar } from './DiagnosticBar';
import { DiagnosticGutter } from './DiagnosticGutter';
import {
  ExtensionContext,
  commands,
  window,
  workspace,
  TextEditor,
  TextDocument,
  StatusBarAlignment,
  TextEditorSelectionChangeEvent,
  ConfigurationChangeEvent,
  DiagnosticSeverity,
} from 'vscode';


export function activate(context: ExtensionContext) {
  const settings = workspace.getConfiguration('statusbarerror');

  // TODO wholeLine and color from settings for each one
  const gutterDecorators = new Map()
    .set(
      DiagnosticSeverity.Error,
      window.createTextEditorDecorationType({
        gutterIconPath: `${context.extensionPath}/images/error.svg`,
      }),
    ).set(
      DiagnosticSeverity.Warning,
      window.createTextEditorDecorationType({
        gutterIconPath: `${context.extensionPath}/images/warn.svg`,
      }),
    ).set(
      DiagnosticSeverity.Information,
      window.createTextEditorDecorationType({
        gutterIconSize: '80%',
        gutterIconPath: `${context.extensionPath}/images/info.svg`,
      }),
    ).set(
      DiagnosticSeverity.Hint,
      window.createTextEditorDecorationType({
        gutterIconSize: '80%',
        gutterIconPath: `${context.extensionPath}/images/info.svg`,
      }),
    );

  const diagnosticBar = new DiagnosticBar(
    window.createStatusBarItem(StatusBarAlignment.Left, -1),
    new DiagnosticGutter(gutterDecorators),
  );

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

  diagnosticBar.setGutterDecorator(
    settings.get('gutter.show'),
  );

  context.subscriptions.push(window.onDidChangeActiveTextEditor((editor: TextEditor | undefined) => {
    diagnosticBar.hide();

    if (!!editor) {
      diagnosticBar.activeEditorChanged(editor);
    }
  }));

  context.subscriptions.push(window.onDidChangeTextEditorSelection((selection: TextEditorSelectionChangeEvent) => {
    diagnosticBar.cursorSelectionChangedListener(selection);
  }));

  context.subscriptions.push(workspace.onDidChangeConfiguration((event: ConfigurationChangeEvent) => {
    if (event.affectsConfiguration('statusbarerror')) {
      const _settings = workspace.getConfiguration('statusbarerror');

      diagnosticBar.setColors(
        _settings.get('color.info') || '#41e086',
        _settings.get('color.hint') || '#35b1f4',
        _settings.get('color.warning') || '#f4b81f',
        _settings.get('color.error') || '#f41f1f',
      );

      diagnosticBar.setIcons(
        _settings.get('icon.info') || '',
        _settings.get('icon.hint') || '',
        _settings.get('icon.warning') || '',
        _settings.get('icon.error') || '',
      );

      diagnosticBar.setGutterDecorator(
        _settings.get('gutter.show'),
      );
    }
  }));

  context.subscriptions.push(workspace.onDidCloseTextDocument((editor: TextDocument) => {
    diagnosticBar.textDocumentClosedListener(editor.uri);
  }));

  const toggleCmd = commands.registerCommand('sb.toggle', () => {
    diagnosticBar.toggleActive();
  });

  context.subscriptions.push(toggleCmd);
  context.subscriptions.push(diagnosticBar);
}

export function deactive() {
  // TODO when needed
}
