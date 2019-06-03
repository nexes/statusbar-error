import { DiagnosticGutter, IGutterItem } from './DiagnosticGutter';
import { DiagnosticLine, ILineOptions } from './DiagnosticLine';
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
  source: string;
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
  private _visible: boolean;
  private _statusBarItem: StatusBarItem;
  private _disposables: Disposable[];
  private _currentDocURI: Uri;
  private _currentDiagnostics: Map<string, IDiagnosticMessage[]>;
  private _currentColors: IDiagnosticColor;
  private _currentIcons: IDiagnosticIcon;
  private _gutterDecorator: DiagnosticGutter;
  private _lineDecorator: DiagnosticLine;

  constructor(item: StatusBarItem, gutterDecorator: DiagnosticGutter, lineDecorator: DiagnosticLine) {
    this._visible = true;
    this._disposables = [];
    this._statusBarItem = item;
    this._currentDiagnostics = new Map();
    this._gutterDecorator = gutterDecorator;
    this._lineDecorator = lineDecorator;
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

    this._disposables.push(this._gutterDecorator);
    this._disposables.push(this._lineDecorator);
    this._disposables.push(Disposable.from(this._statusBarItem));
    this._disposables.push(languages.onDidChangeDiagnostics((e) => this.diagnosticChangedListener(e)));
  }

  public activeEditorChanged(editor: TextEditor): void {
    this.updateDiagnosticList(editor.document.uri);
    this._currentDocURI = editor.document.uri;

    this._gutterDecorator.showGutterIconsForDocument(this._currentDocURI);
    this._lineDecorator.showLineDecoratorForDocument(this._currentDocURI);
    this.updateStatusbarMessage(editor.selection.active.line);
  }

  public cursorSelectionChangedListener(selection: TextEditorSelectionChangeEvent): void {
    const cursorLine = selection.selections[ 0 ].active.line;
    this.updateStatusbarMessage(cursorLine);
  }

  public textDocumentClosedListener(uri: Uri): void {
    if (this._currentDiagnostics.has(uri.path)) {
      this._currentDiagnostics.delete(uri.path);
      this._gutterDecorator.removeForTextDocument(this._currentDocURI);
      this._lineDecorator.removeForTextDocument(this._currentDocURI);
      this._statusBarItem.hide();
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

  public setGutterDecorator(showErr: boolean, showWarn: boolean, showHint: boolean, showInfo: boolean): void {
    this._gutterDecorator.updateSettings(showErr, showWarn, showHint, showInfo);
    this._gutterDecorator.showGutterIconsForDocument(this._currentDocURI);
  }

  public setWholeLine(show: boolean, errorColor: string, warnColor: string, errorFontColor: string, warnFontColor: string, length: number): void {
    this._lineDecorator.updateSettings(show, errorColor, warnColor, errorFontColor, warnFontColor, length);
    this._lineDecorator.showLineDecoratorForDocument(this._currentDocURI);
  }

  public clearStatusBarText() {
    this._statusBarItem.text = '';
  }

  public setStatusBarVisibility(visible: boolean) {
    this._visible = visible;

    if (!this._visible) { this._statusBarItem.hide(); }
    if (this._visible) { this._statusBarItem.show(); }
  }

  public dispose(): void {
    for (const _dispose of this._disposables) {
      _dispose.dispose();
    }
  }

  private diagnosticChangedListener(diagnostic: DiagnosticChangeEvent): void {
    for (const uri of diagnostic.uris) {
      this.updateDiagnosticList(uri);
    }

    if (window.activeTextEditor) {
      this._gutterDecorator.showGutterIconsForDocument(this._currentDocURI);
      this._lineDecorator.showLineDecoratorForDocument(this._currentDocURI);
      this.updateStatusbarMessage(window.activeTextEditor.selection.active.line);
    }
  }

  private updateDiagnosticList(uri: Uri): void {
    const gutterIcons: IGutterItem[] = [];
    const lineOpts: ILineOptions[] = [];
    const issues = languages.getDiagnostics(uri);
    const dMessage: IDiagnosticMessage[] = issues.map((e) => {

      gutterIcons.push({
        icon: this._gutterDecorator.getDecorator(e.severity),
        range: e.range,
      });

      lineOpts.push({
        severity: e.severity,
        message: e.message,
        range: e.range,
      });

      return {
        line: e.range.start.line,
        severity: e.severity,
        source: e.source || '',
        message: e.message,
      };
    });

    this._gutterDecorator.updateForTextDocument(uri, gutterIcons);
    this._lineDecorator.updateForTextDocument(uri, lineOpts);
    this._currentDiagnostics.set(uri.path, dMessage);
  }

  private updateStatusbarMessage(cursorLine: number): void {
    const messages = this._currentDiagnostics.get(this._currentDocURI.path);
    if (!messages || messages.length === 0) {
      this._statusBarItem.hide();
      return;
    }

    const lintMessage = messages.find((elem) => elem.line === cursorLine);
    if (!!lintMessage && this._visible) {
      switch (lintMessage.severity) {
        case 0:
          this._statusBarItem.color = this._currentColors.error;
          this._statusBarItem.text = `${this._currentIcons.error} ${lintMessage.source} - ${lintMessage.message}`;
          break;
        case 1:
          this._statusBarItem.color = this._currentColors.warning;
          this._statusBarItem.text = `${this._currentIcons.warning} ${lintMessage.source} - ${lintMessage.message}`;
          break;
        case 2:
          this._statusBarItem.color = this._currentColors.info;
          this._statusBarItem.text = `${this._currentIcons.info} ${lintMessage.source} - ${lintMessage.message}`;
          break;
        case 3:
          this._statusBarItem.color = this._currentColors.hint;
          this._statusBarItem.text = `${this._currentIcons.hint} ${lintMessage.source} - ${lintMessage.message}`;
          break;
        default:
          this._statusBarItem.text = `${lintMessage.source} - ${lintMessage.message}`;
      }
      this._statusBarItem.show();

    } else {
      this._statusBarItem.hide();
    }
  }
}
