import {
  Uri,
  window,
  Disposable,
  languages,
  StatusBarItem,
  TextEditor,
  TextEditorSelectionChangeEvent,
  DiagnosticChangeEvent,
} from 'vscode';


interface IDiagnosticMessage {
  message: string;
  severity: number;
  line: number;
}

export class DiagnosticBar implements Disposable {
  private _statusBarItem: StatusBarItem;
  private _disposables: Disposable[];
  private _currentDocURI: Uri;
  private _currentDiagnostics: Map<string, IDiagnosticMessage[]>;

  constructor(item: StatusBarItem) {
    this._disposables = [];
    this._currentDiagnostics = new Map();
    this._statusBarItem = item;
    this._currentDocURI = window.activeTextEditor ? window.activeTextEditor.document.uri : Uri.file('.');

    this._disposables.push(Disposable.from(this._statusBarItem));
    this._disposables.push(languages.onDidChangeDiagnostics((e) => this.diagnosticChangedListener(e)));
  }

  public activeEditorChanged(editor: TextEditor): void {
    const issues = languages.getDiagnostics(this._currentDocURI);
    const dMessage: IDiagnosticMessage[] = issues.map((e) => {
      return {
        line: e.range.start.line,
        severity: e.severity,
        message: `[${e.source}] ${e.message}`,
      };
    });

    this._currentDocURI = editor.document.uri;
    this._currentDiagnostics.set(editor.document.uri.path, dMessage);
  }

  public cursorSelectionChangedListener(selection: TextEditorSelectionChangeEvent): void {
    const messages = this._currentDiagnostics.get(this._currentDocURI.path);
    const cursorLine = selection.selections[ 0 ].active.line;

    if (!messages || messages.length === 0) { return; }

    const lintMessage = messages.find((elem) => elem.line === cursorLine);
    if (!!lintMessage) {
      this._statusBarItem.text = lintMessage.message;
      this._statusBarItem.show();

    } else {
      this._statusBarItem.hide();
    }
  }

  public dispose(): void {
    for (const _dispose of this._disposables) {
      _dispose.dispose();
    }
  }

  private diagnosticChangedListener(diagnostic: DiagnosticChangeEvent): void {
    for (const uri of diagnostic.uris) {
      const issues = languages.getDiagnostics(uri);
      const dMessage: IDiagnosticMessage[] = issues.map((e) => {
        return {
          line: e.range.start.line,
          severity: e.severity,
          message: `[${e.source}] ${e.message}`,
        };
      });

      this._currentDiagnostics.set(uri.path, dMessage);
    }
  }
}
