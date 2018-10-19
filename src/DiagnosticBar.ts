import {
  Uri,
  window,
  Disposable,
  languages,
  StatusBarItem,
  TextEditor,
  TextEditorSelectionChangeEvent,
  DiagnosticChangeEvent,
  Diagnostic,
} from 'vscode';


enum Severity {
  INFO,
  WARNING,
  ERROR,
}

export class DiagnosticBar implements Disposable {
  private _statusBarItem: StatusBarItem;
  private _disposables: Disposable[];
  private _currentDiagnostics: Diagnostic[];
  private _currentDocURI: Uri;

  constructor(item: StatusBarItem) {
    this._disposables = [];
    this._currentDiagnostics = [];
    this._statusBarItem = item;
    this._currentDocURI = window.activeTextEditor ? window.activeTextEditor.document.uri : Uri.file('.');

    this._disposables.push(Disposable.from(this._statusBarItem));
    this._disposables.push(languages.onDidChangeDiagnostics(this.diagnosticChangedListener));
  }

  public activeEditorChanged(editor: TextEditor): void {
    this._currentDocURI = editor.document.uri;
    this._currentDiagnostics = languages.getDiagnostics(this._currentDocURI);
  }

  public cursorSelectionChangedListener(selection: TextEditorSelectionChangeEvent): void {
    for (const diagnostic of this._currentDiagnostics) {
      if (diagnostic.range.contains(selection.selections[0].active)) {
        // todo setup message
        this._statusBarItem.text = diagnostic.message;
        this._statusBarItem.show();
      }
    }
  }

  public dispose(): void {
    for (const _dispose of this._disposables) {
      _dispose.dispose();
    }
  }

  private diagnosticChangedListener(diagnostic: DiagnosticChangeEvent): void {
    for (const uri of diagnostic.uris) {
      if (!!this._currentDocURI.path.match(uri.path)) {
        this._currentDiagnostics = languages.getDiagnostics(uri);
      }
    }
  }
}
