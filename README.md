## Status Bar Error
---
Visual Studio Code extensions that will display the linter message of the currently active line in the status bar. A gutter icon will also be displayed when when an error or warning is shown.

![](./images/extensionexample.gif)

### Install
---
Install [StatusBarError](https://marketplace.visualstudio.com/items?itemName=JoeBerria.statusbarerror) from the Visual Studio Code extension gallery.

### Options
---
You can change the color of the font for Errors, Warnings, Info and Hints. You can change the message unicode icon for the different messages.

```json
{
  "statusbarerror.color.error": "#ff0000",
  "statusbarerror.icon.error": "🛑",

  "statusbarerror.color.info": "#00ff00",
  "statusbarerror.icon.info": "🔥",
  ...
}
```

### More to come
* setting to turn on or off the gutter decoration
* setting to color the line with the error or warning

### Contribute
---
StatusBarError's [repository](https://github.com/nexes/statusbar-error.git) is here.
