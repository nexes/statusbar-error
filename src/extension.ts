import { DiagnosticBar } from './DiagnosticBar';
import { DiagnosticGutter } from './DiagnosticGutter';
import { DiagnosticLine } from './DiagnosticLine';
import {
  ExtensionContext,
  window,
  workspace,
  TextEditor,
  TextDocument,
  StatusBarAlignment,
  TextEditorSelectionChangeEvent,
  ConfigurationChangeEvent,
} from 'vscode';


export function activate(context: ExtensionContext) {
  const settings = workspace.getConfiguration('statusbarerror');

  const diagnosticBar = new DiagnosticBar(
    window.createStatusBarItem(StatusBarAlignment.Left, -1),
    new DiagnosticGutter(),
    new DiagnosticLine(),
  );

  // start reading the user settings and set initial colors, icons, and gutter settings.
  diagnosticBar.setColors(
    settings.get('color.info', '#41e086'),
    settings.get('color.hint', '#35b1f4'),
    settings.get('color.warning', '#f4b81f'),
    settings.get('color.error', '#f41f1f'),
  );

  diagnosticBar.setIcons(
    settings.get('icon.info', ''),
    settings.get('icon.hint', ''),
    settings.get('icon.warning', ''),
    settings.get('icon.error', ''),
  );

  diagnosticBar.setWholeLine(
    settings.get('wholeLine.show', false),
    settings.get('wholeLine.errorColor', '#d32f2f88'),
    settings.get('wholeLine.warningColor', '#ff980088'),
    settings.get('wholeLine.errorFontColor', '#e3e3e3'),
    settings.get('wholeLine.warningFontColor', '#000000'),
    settings.get('wholeLine.length', 0),
  );

  diagnosticBar.setGutterDecorator(settings.get('gutter.error.show', true),
                                   settings.get('gutter.warning.show', true),
                                   settings.get('gutter.hint.show', true),
                                   settings.get('gutter.info.show', true));
  diagnosticBar.setStatusBarVisibility(settings.get('statusbar.show', true));
  // done reading the user settings and set initial colors, icons, and gutter settings.

  context.subscriptions.push(window.onDidChangeActiveTextEditor((editor: TextEditor | undefined) => {
    diagnosticBar.clearStatusBarText();

    if (!!editor) {
      diagnosticBar.activeEditorChanged(editor);
    }
  }));

  context.subscriptions.push(workspace.onDidChangeConfiguration((event: ConfigurationChangeEvent) => {
    if (event.affectsConfiguration('statusbarerror')) {
      const _settings = workspace.getConfiguration('statusbarerror');

      diagnosticBar.setColors(
        _settings.get('color.info', '#41e086'),
        _settings.get('color.hint', '#35b1f4'),
        _settings.get('color.warning', '#f4b81f'),
        _settings.get('color.error', '#f41f1f'),
      );

      diagnosticBar.setIcons(
        _settings.get('icon.info', ''),
        _settings.get('icon.hint', ''),
        _settings.get('icon.warning', ''),
        _settings.get('icon.error', ''),
      );

      diagnosticBar.setWholeLine(
        _settings.get('wholeLine.show', false),
        _settings.get('wholeLine.errorColor', '#d32f2f88'),
        _settings.get('wholeLine.warningColor', '#ff980088'),
        _settings.get('wholeLine.errorFontColor', '#e3e3e3'),
        _settings.get('wholeLine.warningFontColor', '#000000'),
        _settings.get('wholeLine.length', 0),
      );

      diagnosticBar.setGutterDecorator(_settings.get('gutter.error.show', true),
                                       _settings.get('gutter.warning.show', true),
                                       _settings.get('gutter.hint.show', true),
                                       _settings.get('gutter.info.show', true));
      diagnosticBar.setStatusBarVisibility(_settings.get('statusbar.show', true));
    }
  }));

  context.subscriptions.push(window.onDidChangeTextEditorSelection((selection: TextEditorSelectionChangeEvent) => {
    diagnosticBar.cursorSelectionChangedListener(selection);
  }));

  context.subscriptions.push(workspace.onDidCloseTextDocument((editor: TextDocument) => {
    diagnosticBar.textDocumentClosedListener(editor.uri);
  }));

  context.subscriptions.push(diagnosticBar);
}

export function deactive() {
  // TODO when needed
}
