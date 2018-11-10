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
  private _hidden: boolean;
  private _isActive: boolean;
  private _statusBarItem: StatusBarItem;
  private _disposables: Disposable[];
  private _currentDocURI: Uri;
  private _currentDiagnostics: Map<string, IDiagnosticMessage[]>;
  private _currentColors: IDiagnosticColor;
  private _currentIcons: IDiagnosticIcon;


  constructor(item: StatusBarItem) {
    this._hidden = false;
    this._isActive = true;
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
    const issues = languages.getDiagnostics(editor.document.uri);
    const dMessage: IDiagnosticMessage[] = issues.map((e) => {
      return {
        line: e.range.start.line,
        severity: e.severity,
        message: `[${e.source}] ${e.message}`,
      };
    });

    this._currentDocURI = editor.document.uri;
    this._currentDiagnostics.set(this._currentDocURI.path, dMessage);

    if (!this._isActive) { return; }
    this.updateStatusbarMessage(editor.selection.active.line);
  }

  public cursorSelectionChangedListener(selection: TextEditorSelectionChangeEvent): void {
    if (!this._isActive) { return; }

    const cursorLine = selection.selections[ 0 ].active.line;
    this.updateStatusbarMessage(cursorLine);
  }

  public textDocumentClosedListener(uri: Uri): void {
    if (this._currentDiagnostics.has(uri.path)) {
      this._currentDiagnostics.delete(uri.path);
      this.hide();
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

  public hide(): void {
    if (!this._hidden) {
      this._hidden = true;
      this._statusBarItem.hide();
    }
  }

  public show(): void {
    if (this._hidden) {
      this._hidden = false;
      this._statusBarItem.show();
    }
  }

  public toggleActive(): void {
    this._isActive = !this._isActive;

    if (this._isActive) {
      const activeEditor = window.activeTextEditor;

      if (!!activeEditor) {
        this.updateStatusbarMessage(activeEditor.selection.active.line);
      }
    } else {
      this.hide();
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
          message: !!e.source ? `[ ${e.source} ] ${e.message}` : `${e.message}`,
        };
      });

      this._currentDiagnostics.set(uri.path, dMessage);
    }

    if (!this._isActive) { return; }
    if (window.activeTextEditor) { this.updateStatusbarMessage(window.activeTextEditor.selection.active.line); }
  }

  private updateStatusbarMessage(cursorLine: number): void {
    const messages = this._currentDiagnostics.get(this._currentDocURI.path);
    if (!messages || messages.length === 0) {
      this.hide();
      return;
    }

    const lintMessage = messages.find((elem) => elem.line === cursorLine);
    if (!!lintMessage) {
      switch (lintMessage.severity) {
        case 0:
          this._statusBarItem.color = this._currentColors.error;
          this._statusBarItem.text = `${this._currentIcons.error} ${lintMessage.message}`;
          break;
        case 1:
          this._statusBarItem.color = this._currentColors.warning;
          this._statusBarItem.text = `${this._currentIcons.warning} ${lintMessage.message}`;
          break;
        case 2:
          this._statusBarItem.color = this._currentColors.info;
          this._statusBarItem.text = `${this._currentIcons.info} ${lintMessage.message}`;
          break;
        case 3:
          this._statusBarItem.color = this._currentColors.hint;
          this._statusBarItem.text = `${this._currentIcons.hint} ${lintMessage.message}`;
          break;
        default:
          this._statusBarItem.text = `${lintMessage.message}`;
      }
      this.show();

    } else {
      this.hide();
    }
  }
}
