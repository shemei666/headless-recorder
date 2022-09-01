<template>
  <div class="bg-gray-lightest dark:bg-black flex flex-col overflow-hidden">
    <Header @options="openOptions" @help="goHelp" @dark="toggleDarkMode" />

    <Home ref="home" v-if="!showResultsTab && !isRecording && !isWaiting" @start="toggleRecord" />
    <div v-if="isWaiting">
      <h1>Please Wait...</h1>
    </div>
    <Recording
      @stop="toggleRecord"
      @pause="togglePause"
      @restart="restart(true)"
      :is-recording="isRecording"
      :is-paused="isPaused"
      :dark-mode="options?.extension?.darkMode"
      v-show="!showResultsTab && isRecording"
    />

    <Results
      :puppeteer="code"
      :playwright="codeForPlaywright"
      :options="options"
      v-if="showResultsTab"
      v-on:update:tab="currentResultTab = $event"
    />

    <!-- TODO: Move this into its own component -->
    <div
      data-test-id="results-footer"
      class="flex py-2 px-3 justify-between bg-black-shady"
      v-show="showResultsTab"
    >
      <Button dark class="mr-2" @click="restart" v-show="code">
        <img src="/icons/dark/sync.svg" class="mr-1" alt="restart recording" />
        Restart
      </Button>
      <Button dark class="mr-2 w-34" @click="copyCode" v-show="code">
        <img
          v-show="!isCopying"
          src="/icons/dark/duplicate.svg"
          class="mr-1"
          alt="copy code to clipboard"
        />
        <span v-show="!isCopying">Copy to clipboard</span>
        <span v-show="isCopying">Copied!</span>
      </Button>
      <Button @click="run" v-show="code">
        <img src="/icons/light/zap.svg" class="mr-1" alt="thunder" />
        Run on Checkly
      </Button>
      <Button
        v-show="code && !noAWScreds"
        :disabled="isUploading || noAWScreds || uploadDone"
        class="mr-1"
        @click="upload"
      >
        <span v-if="uploadFailed">Retry</span>
        <span v-else-if="!(isUploading || noAWScreds || uploadDone)">Upload To AWS</span>
        <span v-else-if="isUploading">Uploading...</span>
        <span v-else-if="uploadDone">Done!</span>
      </Button>
    </div>

    <Footer v-if="!isRecording && !showResultsTab" />
  </div>
</template>

<script>
import browser from '@/services/browser'
import storage from '@/services/storage'
import analytics from '@/services/analytics'
import { popupActions, isDarkMode } from '@/services/constants'
import { headlessActions } from '@/modules/code-generator/constants'

import CodeGenerator from '@/modules/code-generator'

import Home from '@/views/Home.vue'
import Results from '@/views/Results.vue'
import Recording from '@/views/Recording.vue'

import Button from '@/components/Button.vue'
import Footer from '@/components/Footer.vue'
import Header from '@/components/Header.vue'
import AWS from 'aws-sdk'

let bus

const defaultOptions = {
  extension: {
    darkMode: isDarkMode(),
  },
  code: {},
}

export default {
  name: 'PopupApp',
  components: {
    Results,
    Recording,
    Home,
    Header,
    Footer,
    Button,
  },

  data() {
    return {
      isLoggedIn: false,
      showResultsTab: false,
      isRecording: false,
      isPaused: false,
      isCopying: false,
      isWaiting: false,
      noAWScreds: true,
      isUploading: false,
      uploadDone: false,
      uploadFailed: false,
      currentResultTab: null,

      liveEvents: [],
      recording: [],

      code: '',
      codeForPlaywright: '',
      options: defaultOptions,
    }
  },

  watch: {
    'options.extension.darkMode': {
      handler(newVal) {
        document.body.classList[newVal ? 'add' : 'remove']('dark')
      },
      immediate: true,
    },
  },

  async mounted() {
    this.loadState()
    bus = browser.getBackgroundBus()
    this.isLoggedIn = await browser.getChecklyCookie()
    AWS.config.update({
      region: this.options.bucketregion,
      accessKeyId: this.options.keyid,
      secretAccessKey: this.options.secret,
    })
    this.s3 = new AWS.S3()
    if (
      this.options.keyid &&
      this.options.secret &&
      this.options.bucketname &&
      this.options.bucketregion
    ) {
      this.noAWScreds = false
    }
  },

  methods: {
    toggleRecord(close = true) {
      if (this.isRecording) {
        this.stop()
      } else {
        if (
          !(
            this.$refs.home.title &&
            this.$refs.home.subtitle &&
            this.$refs.home.category &&
            this.$refs.home.subcategory
          )
        ) {
          alert('Title,SubTitle,Category&Subcategory is needed!')
          return
        }
        close && window.close()
        this.start()
      }

      this.isRecording = !this.isRecording
      this.storeState()
    },

    togglePause(stop = false) {
      bus.postMessage({ action: this.isPaused ? popupActions.UN_PAUSE : popupActions.PAUSE, stop })
      this.isPaused = !this.isPaused

      this.storeState()
    },
    upload() {
      if (this.uploadDone) return
      this.uploadFailed = false
      this.isUploading = true
      this.s3.putObject(
        {
          Body: this.code,
          Bucket: this.options.bucketname,
          Key: `${this.options.currentfilename}.js`,
        },
        err => {
          console.log(err)
          if (!err) {
            this.isUploading = false
            this.uploadDone = true
          } else {
            this.isUploading = false
            this.uploadFailed = true
            alert(err)
          }
        }
      )
    },

    start() {
      analytics.trackEvent({ options: this.options, event: 'Start' })
      this.cleanUp()
      bus.postMessage({ action: popupActions.START })
      bus.postMessage({
        action: headlessActions.PAGEMETADATA,
        value: {
          title: this.$refs.home.title,
          subtitle: this.$refs.home.subtitle,
          category: this.$refs.home.category,
          subcategory: this.$refs.home.subcategory,
          purpose: this.$refs.home.purpose,
          description: this.$refs.home.description,
          iconurl: this.$refs.home.iconurl,
          tags: this.$refs.home.tags,
        },
      })
      this.options.currentfilename =
        `${this.$refs.home.title || ''}${this.$refs.home.subtitle || ''}${this.$refs.home
          .category || ''}${this.$refs.home.subcategory || ''}`.replace(/[^a-zA-z0-9]/g, '') ||
        `${Date.now()}`
      storage.set({ options: this.options })
    },

    async stop() {
      analytics.trackEvent({ options: this.options, event: 'Stop' })
      bus.postMessage({ action: popupActions.STOP })

      await this.generateCode()
      this.storeState()
    },

    restart(stop = false) {
      this.cleanUp()
      bus.postMessage({ action: popupActions.CLEAN_UP, value: stop })
    },

    cleanUp() {
      this.recording = this.liveEvents = []
      this.code = ''
      this.codeForPlaywright = ''
      this.showResultsTab = this.isRecording = this.isPaused = false
      this.storeState()
    },

    async generateCode() {
      this.isWaiting = true
      const { recording, options = { code: {} } } = await storage.get(['recording', 'options'])
      const generator = new CodeGenerator(options.code)
      const { puppeteer, playwright } = generator.generate(recording)

      this.recording = recording
      this.code = puppeteer
      this.codeForPlaywright = playwright
      this.isWaiting = false
      this.showResultsTab = true
    },

    openOptions() {
      analytics.trackEvent({ options: this.options, event: 'Options' })
      browser.openOptionsPage()
    },

    async loadState() {
      const {
        controls = {},
        code = '',
        options,
        codeForPlaywright = '',
        recording,
        clear,
        pause,
        restart,
      } = await storage.get([
        'controls',
        'code',
        'options',
        'codeForPlaywright',
        'recording',
        'clear',
        'pause',
        'restart',
      ])

      this.isRecording = controls.isRecording
      this.isPaused = controls.isPaused
      this.options = options || defaultOptions

      this.code = code
      this.codeForPlaywright = codeForPlaywright

      if (this.isRecording) {
        this.liveEvents = recording

        if (clear) {
          this.toggleRecord()
          storage.remove(['clear'])
        }

        if (pause) {
          this.togglePause(true)
          storage.remove(['pause'])
        }

        if (restart) {
          this.cleanUp()
          this.toggleRecord(false)
          storage.remove(['restart'])
        }
      } else if (this.code) {
        this.generateCode()
      }
    },

    storeState() {
      storage.set({
        code: this.code,
        codeForPlaywright: this.codeForPlaywright,
        controls: { isRecording: this.isRecording, isPaused: this.isPaused },
      })
    },

    async copyCode() {
      this.isCopying = true
      await browser.copyToClipboard(this.getCode())
      setTimeout(() => (this.isCopying = false), 500)
    },

    goHelp() {
      browser.openHelpPage()
    },

    toggleDarkMode() {
      this.options.extension.darkMode = !this.options.extension.darkMode
      storage.set({ options: this.options })
    },

    getCode() {
      return this.currentResultTab === 'puppeteer' ? this.code : this.codeForPlaywright
    },

    run() {
      browser.openChecklyRunner({
        code: this.getCode(),
        runner: this.currentResultTab,
        isLoggedIn: this.isLoggedIn,
      })
    },
  },
}
</script>

<style>
html {
  width: 386px;
  height: 535px;
}
button {
  margin-left: 3px;
}

button:focus-visible {
  outline: none;
  box-shadow: 0 0 2px 2px #51a7e8;
}

button:focus {
  outline: 0;
}
</style>
