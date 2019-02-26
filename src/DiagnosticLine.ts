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
  range: Range;
}

export class DiagnosticLine implements Disposable {
  private _lineDecorators: Map<DiagnosticSeverity, TextEditorDecorationType>;
  private _lineDecoratorOpt: Map<string, ILineOptions[]>;
  private _defaultGutterDecoration: TextEditorDecorationType;
  private _disposables: Disposable[];
  private _showLine: boolean;

  constructor() {
    this._lineDecorators = new Map();
    this._lineDecoratorOpt = new Map();
    this._showLine = false;
    this._disposables = [];
    this._defaultGutterDecoration = window.createTextEditorDecorationType({});

    for (const [ , value ] of this._lineDecorators) {
      this._disposables.push(value);
    }
  }

  public updateSettings(show: boolean, errorColor: string, warnColor: string): void {
    this._showLine = show;

    this._lineDecorators.clear();
    this._lineDecorators.set(
      DiagnosticSeverity.Error,
      window.createTextEditorDecorationType({
        backgroundColor: errorColor,
        isWholeLine: true,
      }),
    ).set(
      DiagnosticSeverity.Warning,
      window.createTextEditorDecorationType({
        backgroundColor: warnColor,
        isWholeLine: true,
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
        if (lineOpt.severity === DiagnosticSeverity.Error) {
          errDecOpts.push({ range: lineOpt.range });
        }
        if (lineOpt.severity === DiagnosticSeverity.Warning) {
          warnDecOpts.push({ range: lineOpt.range });
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
