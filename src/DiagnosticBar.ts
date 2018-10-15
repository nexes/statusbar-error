import {
  Disposable,
  StatusBarItem,
  TextEditor,
  TextEditorSelectionChangeEvent,
} from 'vscode';


enum Severity {
  INFO,
  WARNING,
  ERROR,
}

export class DiagnosticBar implements Disposable {
  private _statusBarItem: StatusBarItem;
  private _disposables: Disposable[];

  constructor(item: StatusBarItem) {
    this._disposables = [];
    this._statusBarItem = item;

    this._disposables.push(Disposable.from(this._statusBarItem));
  }

  public show(): void {
    this._statusBarItem.show();
  }

  public hide(): void {
    this._statusBarItem.hide();
  }

  public activeEditorChanged(editor: TextEditor): void {
    console.log('activeEditorChanged called');
  // const uriId = editor.document.uri;
  // console.log(languages.getDiagnostics(uriId));
  }

  public selectionEditorChanged(selection: TextEditorSelectionChangeEvent): void {
    console.log('selectionEditorChanged called');
  }

  public dispose(): void {
    console.log('diagnostic bar dispose called');

    for (const _dispose of this._disposables) {
      _dispose.dispose();
    }
  }
}
