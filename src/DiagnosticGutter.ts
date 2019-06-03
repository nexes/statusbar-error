import {
  extensions,
  Disposable,
  DiagnosticSeverity,
  DecorationOptions,
  TextEditorDecorationType,
  Range,
  Uri,
  window,
} from 'vscode';


export interface IGutterItem {
  icon: TextEditorDecorationType;
  range: Range;
}

export class DiagnosticGutter implements Disposable {
  private _gutterDecorations: Map<DiagnosticSeverity, TextEditorDecorationType>;
  private _defaultGutterDecoration: TextEditorDecorationType;
  private _gutterItems: Map<string, IGutterItem[]>;
  private _disposables: Disposable[];
  private _gutterShow: Map<string, boolean>;

  constructor() {
    const dirPath = extensions.getExtension('JoeBerria.statusbarerror')!.extensionPath;

    this._gutterShow = new Map([
      ['error', true],
      ['warn', true],
      ['info`', true],
      ['hint', true],
    ]);
    this._gutterItems = new Map();
    this._disposables = [];
    this._gutterDecorations = new Map()
      .set(
        DiagnosticSeverity.Error,
        window.createTextEditorDecorationType({
          gutterIconPath: `${dirPath}/images/error.svg`,
        }),
      ).set(
        DiagnosticSeverity.Warning,
        window.createTextEditorDecorationType({
          gutterIconPath: `${dirPath}/images/warn.svg`,
        }),
      ).set(
        DiagnosticSeverity.Information,
        window.createTextEditorDecorationType({
          gutterIconSize: '80%',
          gutterIconPath: `${dirPath}/images/info.svg`,
        }),
      ).set(
        DiagnosticSeverity.Hint,
        window.createTextEditorDecorationType({
          gutterIconSize: '80%',
          gutterIconPath: `${dirPath}/images/info.svg`,
        }),
      );

    // this will act as our default gutter icon for the time being
    this._defaultGutterDecoration = window.createTextEditorDecorationType({
      gutterIconSize: '60%',
      gutterIconPath: `${extensions.getExtension('JoeBerria.statusbarerror')!.extensionPath}/images/info.svg`,
    });

    for (const [ , value ] of this._gutterDecorations) {
      this._disposables.push(value);
    }
  }

  public dispose(): void {
    for (const d of this._disposables) {
      d.dispose();
    }
  }

  public showGutterIconsForDocument(uri: Uri): void {
    if (!this._gutterShow) { return; }

    const gutterItems = this._gutterItems.get(uri.path);
    if (!!window.activeTextEditor && !!gutterItems) {
      const errorOptions: DecorationOptions[] = [];
      const warningOptions: DecorationOptions[] = [];
      const hintOptions: DecorationOptions[] = [];
      const infoOptions: DecorationOptions[] = [];

      for (const gutterItem of gutterItems) {
        if (gutterItem.icon === this._gutterDecorations.get(DiagnosticSeverity.Error)) {
          errorOptions.push({ range: gutterItem.range });
        }
        if (gutterItem.icon === this._gutterDecorations.get(DiagnosticSeverity.Warning)) {
          warningOptions.push({ range: gutterItem.range });
        }
        if (gutterItem.icon === this._gutterDecorations.get(DiagnosticSeverity.Hint)) {
          hintOptions.push({ range: gutterItem.range });
        }
        if (gutterItem.icon === this._gutterDecorations.get(DiagnosticSeverity.Information)) {
          infoOptions.push({ range: gutterItem.range });
        }
      }

      if (this._gutterShow.get('error')) { window.activeTextEditor.setDecorations(this.getDecorator(DiagnosticSeverity.Error), errorOptions); }
      if (this._gutterShow.get('warn')) { window.activeTextEditor.setDecorations(this.getDecorator(DiagnosticSeverity.Warning), warningOptions); }
      if (this._gutterShow.get('hint')) { window.activeTextEditor.setDecorations(this.getDecorator(DiagnosticSeverity.Hint), hintOptions); }
      if (this._gutterShow.get('info')) { window.activeTextEditor.setDecorations(this.getDecorator(DiagnosticSeverity.Information), infoOptions); }
    }
  }

  public removeForTextDocument(uri: Uri): void {
    this._gutterItems.delete(uri.path);
  }

  public updateForTextDocument(uri: Uri, items: IGutterItem[]): void {
    this._gutterItems.set(uri.path, items);
  }

  public getDecorator(severity: DiagnosticSeverity): TextEditorDecorationType {
    return this._gutterDecorations.get(severity) || this._defaultGutterDecoration;
  }

  public updateSettings(showErr: boolean, showWarn: boolean, showHint: boolean, showInfo: boolean): void {
    this._gutterShow
      .set('error', showErr)
      .set('warn', showWarn)
      .set('hint', showHint)
      .set('info', showInfo);
  }
}
