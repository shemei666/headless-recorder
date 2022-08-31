import Block from '@/modules/code-generator/block'
import { headlessActions, eventsToRecord } from '@/modules/code-generator/constants'
import { overlayActions } from '../overlay/constants'

export const defaults = {
  wrapAsync: false,
  headless: true,
  waitForNavigation: true,
  waitForSelectorOnClick: true,
  blankLinesBetweenBlocks: true,
  dataAttribute: '',
  showPlaywrightFirst: true,
  keyCode: 9,
}

export default class BaseGenerator {
  constructor(options) {
    this._options = Object.assign(defaults, options)
    this._blocks = []
    this._frame = 'page'
    this._frameId = 0
    this._allFrames = {}
    this._screenshotCounter = 0
    this.substituteRef = {}

    this._hasNavigation = false
  }

  generate() {
    throw new Error('Not implemented.')
  }

  _getHeader() {
    let hdr = this._options.wrapAsync ? this._wrappedHeader : this._header
    hdr = this._options.headless ? hdr : hdr?.replace('launch()', 'launch({ headless: false })')
    return hdr
  }

  _getFooter() {
    return this._options.wrapAsync ? this._wrappedFooter : this._footer
  }

  _parseEvents(events) {
    let result = ''

    if (!events) return result
    console.log('generator', events)
    let pageMetaData = null
    let elementMetaData = {}

    let functionName = ''
    let isRootPage = true
    for (let i = 0; i < events.length; i++) {
      const { action, value } = events[i]
      console.log('action', action, value)
      if (action === headlessActions.PAGEMETADATA) {
        console.log('message', events[i])
        const {
          title,
          subtitle,
          category,
          subcategory,
          purpose,
          description,
          iconurl,
          tags,
        } = value

        pageMetaData = {
          title: title,
          subTitle: subtitle,
          category: category,
          subCategory: subcategory,
          purpose: purpose,
          description: description,
          iconURL: iconurl,
          tags: tags,
        }
        functionName = `${title}${subtitle}${category}${subcategory}`.replace(/[^a-zA-Z0-9]/g, '')
      } else if (action === headlessActions.ELEMENTMETADATA) {
        const { selector, label, slug, type, subtype, tags, pagetitle, attributes } = events[i]
        const escapedSelector = selector ? selector?.replace(/\\/g, '\\\\') : selector
        elementMetaData[`${slug}${type}`] = {
          label: label,
          slug: slug,
          type: type,
          subType: subtype,
          tags: tags,
          pageTitle: pagetitle,
          attributes: attributes,
          Query: escapedSelector,
        }
        this.substituteRef[escapedSelector] = `ElementsMetaData["${slug}${type}"].Query`
      }
    }
    result += `\nexport default function ${functionName}(input,callback){\n`
    this._blocks.push(this._handleElementMetaData(elementMetaData))
    this._blocks.push(this._handlePageMetaData(pageMetaData))
    this._blocks.push(this._beforeGeneratedCode())

    for (let i = 0; i < events.length; i++) {
      const { action, selector, value, href, keyCode, tagName, frameId, frameUrl } = events[i]
      const escapedSelector = selector ? selector?.replace(/\\/g, '\\\\') : selector

      // we need to keep a handle on what frames events originate from
      this._setFrames(frameId, frameUrl)
      switch (action) {
        case 'keydown':
          if (keyCode === this._options.keyCode) {
            this._blocks.push(this._handleKeyDown(escapedSelector, value, keyCode))
          }
          break
        case 'click':
          this._blocks.push(this._handleClick(escapedSelector, events))
          break
        case 'change':
          if (tagName === 'SELECT') {
            this._blocks.push(this._handleChange(escapedSelector, value))
          }
          break
        case headlessActions.PAGEMETADATA:
          break
        case headlessActions.GOTO:
          this._blocks.push(this._handleGoto(href, frameId))
          if (isRootPage) {
            this._blocks.push(this._rootPageData())
            isRootPage = false
          }
          break
        case headlessActions.VIEWPORT:
          this._blocks.push(this._handleViewport(value.width, value.height))
          break
        case headlessActions.NAVIGATION:
          this._blocks.push(this._handleWaitForNavigation())
          this._hasNavigation = true
          break
        case headlessActions.SCREENSHOT:
          this._blocks.push(this._handleScreenshot(value))
          break
      }
    }

    if (this._hasNavigation && this._options.waitForNavigation) {
      const block = new Block(this._frameId, {
        type: headlessActions.NAVIGATION_PROMISE,
        value: 'const navigationPromise = page.waitForNavigation()',
      })
      this._blocks.unshift(block)
    }

    this._blocks.push(this._afterGeneratedCode())
    this._postProcess()

    const indent = this._options.wrapAsync ? '  ' : ''
    const newLine = `\n`

    for (let block of this._blocks) {
      const lines = block.getLines()
      for (let line of lines) {
        result += indent + line.value + newLine
      }
    }
    // console.log(result)
    return result
  }

  _setFrames(frameId, frameUrl) {
    if (frameId && frameId !== 0) {
      this._frameId = frameId
      this._frame = `frame_${frameId}`
      this._allFrames[frameId] = frameUrl
    } else {
      this._frameId = 0
      this._frame = 'page'
    }
  }

  _postProcess() {
    // when events are recorded from different frames, we want to add a frame setter near the code that uses that frame
    if (Object.keys(this._allFrames).length > 0) {
      this._postProcessSetFrames()
    }

    if (this._options.blankLinesBetweenBlocks && this._blocks.length > 0) {
      this._postProcessAddBlankLines()
    }
  }
  _handleElementMetaData(metadata) {
    const block = new Block(this._frameId)
    block.addLine({
      type: overlayActions.ELEMENTMETADATA,
      value: `let ElementsMetaData = ${JSON.stringify(metadata)}`,
    })
    return block
  }

  _handlePageMetaData(metadata) {
    const block = new Block(this._frameId)
    block.addLine({
      type: overlayActions.PAGEMETADATA,
      value: `let ScriptMetaData = ${JSON.stringify(metadata)}`,
    })
    return block
  }

  _rootPageData() {
    const block = new Block(this.frameId)
    block.addLine({
      type: null,
      value: 'let pageSource = await page.evaluate(() => document.body.innerHTML)',
    })
    block.addLine({
      type: null,
      value: 'let pageData = URIencode(pageSource)',
    })
    return block
  }
  _beforeGeneratedCode() {
    const block = new Block(this.frameId)
    block.addLine({
      type: null,
      value:
        'if(input.return==="meta") return {\n"elements": ElementsMetaData,\n"script": ScriptMetaData\n}',
    })
    block.addLine({
      type: null,
      value: 'let startTime = Date.now()',
    })
    return block
  }

  _afterGeneratedCode() {
    const block = new Block(this.frameId)
    block.addLine({
      type: null,
      value: 'let endTime = Date.now()\nlet timeElapse = endTime-startTime',
    })
    block.addLine({
      type: null,
      value: 'const {totalJSHeapSize,usedJSHeapSize,jsHeapSizeLimit} = window.performance.memory',
    })
    block.addLine({
      type: null,
      value: `callback({
  "status": "done",
  "data": pageData,
  "elements": ElementsMetaData,
  "script": ScriptMetaData,
  "report":{startTime,endTime,timeElapse}
  "memory":{totalJSHeapSize,usedJSHeapSize,jsHeapSizeLimit}
  })
}`,
    })
    return block
  }

  _handleKeyDown(selector, value) {
    const block = new Block(this._frameId)
    block.addLine({
      type: eventsToRecord.KEYDOWN,
      value:
        this.substituteRef[selector] !== undefined
          ? `await ${this._frame}.type(${this.substituteRef[selector]}, '${this._escapeUserInput(
              value
            )}')`
          : `await ${this._frame}.type('${selector}', '${this._escapeUserInput(value)}')`,
    })
    return block
  }

  _handleClick(selector) {
    const block = new Block(this._frameId)
    if (this._options.waitForSelectorOnClick) {
      block.addLine({
        type: eventsToRecord.CLICK,
        value:
          this.substituteRef[selector] !== undefined
            ? `await ${this._frame}.waitForSelector(${this.substituteRef[selector]})`
            : `await ${this._frame}.waitForSelector('${selector}')`,
      })
    }
    block.addLine({
      type: eventsToRecord.CLICK,
      value:
        this.substituteRef[selector] !== undefined
          ? `await ${this._frame}.click(${this.substituteRef[selector]})`
          : `await ${this._frame}.click('${selector}')`,
    })
    return block
  }

  _handleChange(selector, value) {
    return new Block(this._frameId, {
      type: eventsToRecord.CHANGE,
      value:
        this.substituteRef[selector] !== undefined
          ? `await ${this._frame}.select(${this.substituteRef[selector]}, '${value}')`
          : `await ${this._frame}.select('${selector}', '${value}')`,
    })
  }

  _handleGoto(href) {
    return new Block(this._frameId, {
      type: headlessActions.GOTO,
      value: `await ${this._frame}.goto('${href}')`,
    })
  }

  _handleViewport() {
    throw new Error('Not implemented.')
  }

  _handleScreenshot(value) {
    this._screenshotCounter += 1

    if (value) {
      return new Block(this._frameId, {
        type: headlessActions.SCREENSHOT,
        value: `const element${this._screenshotCounter} = await page.$('${value}')
await element${this._screenshotCounter}.screenshot({ path: 'screenshot_${this._screenshotCounter}.png' })`,
      })
    }

    return new Block(this._frameId, {
      type: headlessActions.SCREENSHOT,
      value: `await ${this._frame}.screenshot({ path: 'screenshot_${this._screenshotCounter}.png', fullPage: true })`,
    })
  }

  _handleWaitForNavigation() {
    const block = new Block(this._frameId)
    if (this._options.waitForNavigation) {
      block.addLine({
        type: headlessActions.NAVIGATION,
        value: `await navigationPromise`,
      })
    }
    return block
  }

  _postProcessSetFrames() {
    for (let [i, block] of this._blocks.entries()) {
      const lines = block.getLines()
      for (let line of lines) {
        if (line.frameId && Object.keys(this._allFrames).includes(line.frameId.toString())) {
          const declaration = `const frame_${line.frameId} = frames.find(f => f.url() === '${
            this._allFrames[line.frameId]
          }')`
          this._blocks[i].addLineToTop({
            type: headlessActions.FRAME_SET,
            value: declaration,
          })
          this._blocks[i].addLineToTop({
            type: headlessActions.FRAME_SET,
            value: 'let frames = await page.frames()',
          })
          delete this._allFrames[line.frameId]
          break
        }
      }
    }
  }

  _postProcessAddBlankLines() {
    let i = 0
    while (i <= this._blocks.length) {
      const blankLine = new Block()
      blankLine.addLine({ type: null, value: '' })
      this._blocks.splice(i, 0, blankLine)
      i += 2
    }
  }

  _escapeUserInput(value) {
    return value?.replace(/\\/g, '\\\\')?.replace(/'/g, "\\'")
  }
}
