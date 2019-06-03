import {
  Disposable,
  DiagnosticSeverity,
  TextEditorDecorationType,
  window,
  Range,
  Uri,
  DecorationOptions,
} from 'vscode';


export interface ILineOptions {
  severity: DiagnosticSeverity;
  message: string;
  range: Range;
}

export class DiagnosticLine implements Disposable {
  private _lineDecorators: Map<DiagnosticSeverity, TextEditorDecorationType>;
  private _lineDecoratorOpt: Map<string, ILineOptions[]>;
  private _defaultGutterDecoration: TextEditorDecorationType;
  private _disposables: Disposable[];
  private _showLine: boolean;
  private _maxLineLength: number;

  constructor() {
    this._lineDecorators = new Map();
    this._lineDecoratorOpt = new Map();
    this._showLine = false;
    this._disposables = [];
    this._maxLineLength = 0;
    this._defaultGutterDecoration = window.createTextEditorDecorationType({});

    for (const [ , value ] of this._lineDecorators) {
      this._disposables.push(value);
    }
  }

  public updateSettings(show: boolean,
                        errorColor: string,
                        warnColor: string,
                        errFontColor: string,
                        warnFontColor: string,
                        length: number): void {
    this._showLine = show;
    this._maxLineLength = length;
    this._lineDecorators.clear();

    this._lineDecorators.set(
      DiagnosticSeverity.Error,
      window.createTextEditorDecorationType({
        isWholeLine: true,
        after: {
          margin: '40px',
          backgroundColor: errorColor,
          color: errFontColor,
        },
      }),
    ).set(
      DiagnosticSeverity.Warning,
      window.createTextEditorDecorationType({
        isWholeLine: true,
        after: {
          margin: '40px',
          backgroundColor: warnColor,
          color: warnFontColor,
        },
      }),
    );
  }

  public updateForTextDocument(uri: Uri, opts: ILineOptions[]): void {
    this._lineDecoratorOpt.set(uri.path, opts);
  }

  public showLineDecoratorForDocument(uri: Uri): void {
    if (!this._showLine) { return; }

    const opts = this._lineDecoratorOpt.get(uri.path);

    if (!!opts && !!window.activeTextEditor) {
      const errDecOpts: DecorationOptions[] = [];
      const warnDecOpts: DecorationOptions[] = [];

      for (const lineOpt of opts) {
        let message = lineOpt.message;

        if (this._maxLineLength > 0 && message.length > this._maxLineLength) {
          message = message.substring(0, this._maxLineLength) + '...';
        }

        if (lineOpt.severity === DiagnosticSeverity.Error) {
          errDecOpts.push({ range: lineOpt.range, renderOptions: { after: { contentText: message } } });
        }
        if (lineOpt.severity === DiagnosticSeverity.Warning) {
          warnDecOpts.push({ range: lineOpt.range, renderOptions: { after: { contentText: message } } });
        }
      }

      window.activeTextEditor.setDecorations(this.getDecorator(DiagnosticSeverity.Error), errDecOpts);
      window.activeTextEditor.setDecorations(this.getDecorator(DiagnosticSeverity.Warning), warnDecOpts);
    }
  }

  public getDecorator(severity: DiagnosticSeverity): TextEditorDecorationType {
    return this._lineDecorators.get(severity) || this._defaultGutterDecoration;
  }

  public removeForTextDocument(uri: Uri): void {
    this._lineDecoratorOpt.delete(uri.path);
  }

  public dispose(): void {
    for (const _dispose of this._disposables) {
      _dispose.dispose();
    }
  }
}
