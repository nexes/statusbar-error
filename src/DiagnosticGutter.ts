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
  private _gutterShow: boolean;

  constructor() {
    const dirPath = extensions.getExtension('JoeBerria.statusbarerror')!.extensionPath;

    this._gutterItems = new Map();
    this._disposables = [];
    this._gutterShow = true;
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
      gutterIconSize: '80%',
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

    if (!!window.activeTextEditor) {
      const gutterItems = this._gutterItems.get(uri.path);
      const errorOptions: DecorationOptions[] = [];
      const warningOptions: DecorationOptions[] = [];
      const hintOptions: DecorationOptions[] = [];
      const infoOptions: DecorationOptions[] = [];

      if (!!gutterItems) {
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

        if (this._gutterShow) {
          window.activeTextEditor.setDecorations(this.getDecorator(DiagnosticSeverity.Error), errorOptions);
          window.activeTextEditor.setDecorations(this.getDecorator(DiagnosticSeverity.Warning), warningOptions);
          window.activeTextEditor.setDecorations(this.getDecorator(DiagnosticSeverity.Hint), hintOptions);
          window.activeTextEditor.setDecorations(this.getDecorator(DiagnosticSeverity.Information), infoOptions);
        }
      }
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

  public updateSettings(show: boolean): void {
    this._gutterShow = show;
  }
}
