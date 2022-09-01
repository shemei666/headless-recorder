<p align="center">
  <img width="200px" src="./assets/logo.png" alt="Headless Recorder" />
</p>

## 🧩 Install Locally

1. Open chrome and navigate to extensions page using this URL: [`chrome://extensions`](chrome://extensions).
1. Make sure "**Developer mode**" is enabled.
1. Click "**Load unpacked extension**" button, browse the `headless-recorder/dist` directory and select it.

![](./assets/dev-guide.png)

<br>

## Usage

1. Click on the extension.
1. Goto settings and then fill in AWS access id , key, bucketname and bucket region.
1. Complete the form given.
1. Press the record button.
1. Click on any element and then the element form will appear. Complete that.
1. 👉 Hit <kbd>tab</kbd> after you finish typing in an `input` element. 👈
1. Click on links, inputs and other elements.
1. Wait for full page load on each navigation.
1. Click Pause when you want to navigate without recording anything. Hit Resume to continue recording.
1. Press stop and open extension again.
1. Press Upload To AWS.

## 🖥️ Development

After cloning the project, open the terminal and navigate to project root directory.

```bash
$ npm i # install dependencies

$ npm run serve # run development mode

$ npm run test # run test cases

$ npm run lint # run and fix linter issues

$ npm run build # build and zip for production
```

<br>

## Examples

<br>

### ⌨️ Shortcuts

- `alt + k`: Toggle overlay
- `alt + shift + F`: Take full page screenshot
- `alt + shift + E`: Take element screenshot

<br>

## More
Visit [Headless-Recorder](https://github.com/checkly/headless-recorder)
<br>

## 🙏 Credits

Headless recorder is the spiritual successor & love child of segment.io's [Daydream](https://github.com/segmentio/daydream) and [ui recorder](https://github.com/yguan/ui-recorder).

<br>

## 📄 License

[MIT](https://github.com/checkly/headless-recorder/blob/main/LICENSE)

