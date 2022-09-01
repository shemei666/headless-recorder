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
```javascript
const puppeteer = require('puppeteer');
const browser = await puppeteer.launch()
const page = await browser.newPage()
export default function aaClickPage(input,callback){

let ElementsMetaData = {"slugInput":{"label":"labels","slug":"slug","type":"Input","subType":"Text","tags":".....","Query":"#Inner > #Content > #Panes > div:nth-child(1) > p"},"slugSelect":{"label":"label","slug":"slug","type":"Select","subType":"Radio","tags":".....","Query":"#words"}}

let ScriptMetaData = {"title":"a","subTitle":"a","category":"Click","subCategory":"Page","purpose":"Scrape Page","description":"no","iconURL":"....","tags":"....."}

if(input.return==="meta") return {
"elements": ElementsMetaData,
"script": ScriptMetaData
}
let startTime = Date.now()

await page.goto('https://www.lipsum.com/')

let pageSource = await page.evaluate(() => document.body.innerHTML)
let pageData = URIencode(pageSource)

await page.setViewport({ width: 1292, height: 668 })

await page.waitForSelector(ElementsMetaData["slugInput"].Query)
await page.click(ElementsMetaData["slugInput"].Query)

await page.waitForSelector(ElementsMetaData["slugSelect"].Query)
await page.click(ElementsMetaData["slugSelect"].Query)

let endTime = Date.now()
let timeElapse = endTime-startTime
const {totalJSHeapSize,usedJSHeapSize,jsHeapSizeLimit} = window.performance.memory
callback({
  "status": "done",
  "data": pageData,
  "elements": ElementsMetaData,
  "script": ScriptMetaData,
  "report":{startTime,endTime,timeElapse}
  "memory":{totalJSHeapSize,usedJSHeapSize,jsHeapSizeLimit}
  })
}

await browser.close()
```
```javascript
const { chromium } = require('playwright');
const browser = await chromium.launch()
const page = await browser.newPage()
export default function titlesubClickPage(input,callback){

let ElementsMetaData = {"linkLink":{"label":"link","slug":"link","type":"Link","subType":"Url","tags":"notag","Query":".g:nth-child(10) > .kvH3mc > .Z26q7c > .yuRUbf > a > .LC20lb"}}

let ScriptMetaData = {"title":"title","subTitle":"sub","category":"Click","subCategory":"Page","purpose":"Submit Form","description":"no","iconURL":"nourl","tags":"notags"}

if(input.return==="meta") return {
"elements": ElementsMetaData,
"script": ScriptMetaData
}
let startTime = Date.now()

await page.goto('https://www.google.com/search?q=a&sxsrf=ALiCzsZzYT5_JQGAZuhBZ5g1SBkeWq-L0w%3A1662061018378&source=hp&ei=2gkRY9zaFOfX4-EP8ZGT6A0&iflsig=AJiK0e8AAAAAYxEX6tlSYvCDd3BqlQFw1CmOtZnhCRGG&ved=0ahUKEwjcr9_kq_T5AhXn6zgGHfHIBN0Q4dUDCAc&uact=5&oq=a&gs_lcp=Cgdnd3Mtd2l6EAMyBAgjECcyBAgjECcyBAgjECcyBQgAEJECMgUIABCRAjIRCC4QgAQQsQMQgwEQxwEQ0QMyCAguELEDEIMBMgsIABCABBCxAxCDATILCAAQgAQQsQMQgwEyCwguEIAEELEDEIMBUABYAGDRBWgAcAB4AIABywKIAcsCkgEDMy0xmAEAoAEBuAEB&sclient=gws-wiz')

let pageSource = await page.evaluate(() => document.body.innerHTML)
let pageData = URIencode(pageSource)

await page.setViewportSize({ width: 1292, height: 668 })

await page.waitForSelector(ElementsMetaData["linkLink"].Query)
await page.click(ElementsMetaData["linkLink"].Query)

let endTime = Date.now()
let timeElapse = endTime-startTime
const {totalJSHeapSize,usedJSHeapSize,jsHeapSizeLimit} = window.performance.memory
callback({
  "status": "done",
  "data": pageData,
  "elements": ElementsMetaData,
  "script": ScriptMetaData,
  "report":{startTime,endTime,timeElapse}
  "memory":{totalJSHeapSize,usedJSHeapSize,jsHeapSizeLimit}
  })
}

await browser.close()
```
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

