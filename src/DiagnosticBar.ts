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

interface IDiagnosticColor {
  warning: string;
  info: string;
  error: string;
  hint: string;
}

interface IDiagnosticIcon {
  warning: string;
  info: string;
  error: string;
  hint: string;
}

export class DiagnosticBar implements Disposable {
  private _statusBarItem: StatusBarItem;
  private _disposables: Disposable[];
  private _currentDocURI: Uri;
  private _currentDiagnostics: Map<string, IDiagnosticMessage[]>;
  private _currentColors: IDiagnosticColor;
  private _currentIcons: IDiagnosticIcon;


  constructor(item: StatusBarItem) {
    this._disposables = [];
    this._currentDiagnostics = new Map();
    this._statusBarItem = item;
    this._currentDocURI = window.activeTextEditor ? window.activeTextEditor.document.uri : Uri.file('.');
    this._currentColors = {
      warning: '#f4b81f',
      info: '#41e086',
      error: '#f41f1f',
      hint: '#35b1f4',
    };
    this._currentIcons = {
      warning: '',
      info: '',
      error: '',
      hint: '',
    };

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
    this._currentDiagnostics.set(this._currentDocURI.path, dMessage);
  }

  public cursorSelectionChangedListener(selection: TextEditorSelectionChangeEvent): void {
    const messages = this._currentDiagnostics.get(this._currentDocURI.path);
    const cursorLine = selection.selections[ 0 ].active.line;

    if (!messages || messages.length === 0) { return; }

    const lintMessage = messages.find((elem) => elem.line === cursorLine);
    if (!!lintMessage) {
      switch (lintMessage.severity) {
        case 0:
          this._statusBarItem.color = this._currentColors.error;
          this._statusBarItem.text = `${this._currentIcons.error} \t${lintMessage.message}`;
          break;
        case 1:
          this._statusBarItem.color = this._currentColors.warning;
          this._statusBarItem.text = `${this._currentIcons.warning} \t${lintMessage.message}`;
          break;
        case 2:
          this._statusBarItem.color = this._currentColors.info;
          this._statusBarItem.text = `${this._currentIcons.info} \t${lintMessage.message}`;
          break;
        case 3:
          this._statusBarItem.color = this._currentColors.hint;
          this._statusBarItem.text = `${this._currentIcons.hint} \t${lintMessage.message}`;
          break;
        default:
          this._statusBarItem.text = `${lintMessage.message}`;
      }
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

  public setIcons(info: string, hint: string, warning: string, error: string): void {
    this._currentIcons = {
      info,
      hint,
      warning,
      error,
    };
  }

  public setColors(info: string, hint: string, warning: string, error: string): void {
    this._currentColors = {
      info,
      hint,
      warning,
      error,
    };
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
