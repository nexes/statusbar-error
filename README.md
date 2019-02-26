## Status Bar Error
---
Choose to display linter warnings, errors and hint messages in the statusbar. Show gutter icons or display the linter messages on the line itself. All of the colors can be set within the extensions settings. You can also turn on or off the gutter icons and the whole line messages.
___

#### Show linter messages in the statusbar and display gutter icons.
![](./images/gutter_only.gif)

#### Show linter messages on the line itself and display gutter icons.
![](./images/gutter_wholeline.gif)

___

### Install
Install [StatusBarError](https://marketplace.visualstudio.com/items?itemName=JoeBerria.statusbarerror) from the Visual Studio Code extension gallery.

---
### Options
* Change statusbar font color
* Turn on/off gutter icons
* Turn on/off whole line linter messages
* Change the color of the whole line background and font color

```json
{
  "statusbarerror.color.error": "#ff0000",
  "statusbarerror.icon.error": "🛑",

  "statusbarerror.color.info": "#00ff00",
  "statusbarerror.icon.info": "🔥",
  ...
}
```

---
### Contribute
StatusBarError's [repository](https://github.com/nexes/statusbar-error.git) is here.
