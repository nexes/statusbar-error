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

  constructor(gutter: Map<DiagnosticSeverity, TextEditorDecorationType>) {
    this._gutterDecorations = gutter;
    this._gutterItems = new Map();
    this._disposables = [];

    // this will act as our default gutter icon for the time being
    this._defaultGutterDecoration = window.createTextEditorDecorationType({
      isWholeLine: false,
      gutterIconPath: `${extensions.getExtension('JoeBerria.statusbarerror')!.extensionPath}/images/error.svg`,
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
    if (!!window.activeTextEditor) {
      const gutterItems = this._gutterItems.get(uri.path);

      const errorOptions: DecorationOptions[] = [];
      const warningOptions: DecorationOptions[] = [];
      if (!!gutterItems) {
        for (const gutterItem of gutterItems) {
          if (gutterItem.icon === this._gutterDecorations.get(DiagnosticSeverity.Error)) {
            errorOptions.push({ range: gutterItem.range });
          }
          if (gutterItem.icon === this._gutterDecorations.get(DiagnosticSeverity.Warning)) {
            warningOptions.push({ range: gutterItem.range });
          }
        }

        window.activeTextEditor.setDecorations(this.getDecorator(DiagnosticSeverity.Error), errorOptions);
        window.activeTextEditor.setDecorations(this.getDecorator(DiagnosticSeverity.Warning), warningOptions);
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
}
