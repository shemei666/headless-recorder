<template>
  <div
    v-if="show"
    class="block p-6 rounded-lg shadow-lg bg-white max-w-sm"
    id="headless-recorder-labelform"
  >
    <form>
      <div class="form-group mb-6">
        <label class="form-label inline-block mb-2 text-gray-700">Label:</label>
        <input
          v-model="label"
          class="form-control
        block
        w-full
        px-3
        py-1.5
        text-base
        font-normal
        text-gray-700
        bg-white bg-clip-padding
        border border-solid border-gray-300
        rounded
        transition
        ease-in-out
        m-0
        focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
        />
      </div>
      <div class="form-group mb-6">
        <label class="form-label inline-block mb-2 text-gray-700">Slug:</label>
        <input
          v-model="slug"
          class="form-control block
        w-full
        px-3
        py-1.5
        text-base
        font-normal
        text-gray-700
        bg-white bg-clip-padding
        border border-solid border-gray-300
        rounded
        transition
        ease-in-out
        m-0
        focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
        />
      </div>
      <div class="form-group mb-6">
        <label class="form-label inline-block mb-2 text-gray-700">Type:</label>
        <select
          v-model="type"
          class="
          form-select appearance-none
          block
          w-full
          px-3
          py-1.5
          text-base
          font-normal
          text-gray-700
          bg-white bg-clip-padding bg-no-repeat
          border border-solid border-gray-300
          rounded
          transition
          ease-in-out
          m-0
          focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
        >
          <option disabled value="">Please select</option>
          <option>Link</option>
          <option>Input</option>
          <option>Button</option>
          <option>Textarea</option>
          <option>Select</option>
          <option>Text</option>
        </select>
      </div>
      <div class="form-group mb-6">
        <label class="form-label inline-block mb-2 text-gray-700">Sub-Type:</label>
        <select
          v-model="subtype"
          class="
          form-select appearance-none
          block
          w-full
          px-3
          py-1.5
          text-base
          font-normal
          text-gray-700
          bg-white bg-clip-padding bg-no-repeat
          border border-solid border-gray-300
          rounded
          transition
          ease-in-out
          m-0
          focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
        >
          <option disabled value="">Please select</option>
          <option v-for="sub of subtypes" :key="sub">{{ sub }}</option>
        </select>
      </div>
      <div class="form-group mb-6">
        <label class="form-label inline-block mb-2 text-gray-700">Tags:</label>
        <input
          v-model="tags"
          class="form-control block
        w-full
        px-3
        py-1.5
        text-base
        font-normal
        text-gray-700
        bg-white bg-clip-padding
        border border-solid border-gray-300
        rounded
        transition
        ease-in-out
        m-0
        focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
        />
      </div>
      <button
        @click="sendElementMetaData"
        type="button"
        class="
      px-6
      py-2.5
      bg-blue-600
      text-white
      font-medium
      text-xs
      leading-tight
      uppercase
      rounded
      shadow-md
      hover:bg-blue-700 hover:shadow-lg
      focus:bg-blue-700 focus:shadow-lg focus:outline-none focus:ring-0
      active:bg-blue-800 active:shadow-lg
      transition
      duration-150
      ease-in-out"
      >
        Submit
      </button>
    </form>
  </div>
</template>

<script>
import { headlessActions } from '@/modules/code-generator/constants'
import { mapState } from 'vuex'
import storage from '@/services/storage'
export default {
  name: 'LabelForm',
  data() {
    return {
      show: false,
      selected: null,
      type: '',
      subtype: '',
      subtypes: [
        'Button',
        'Checkbox',
        'Color',
        'Date',
        'Datetime-local',
        'Email',
        'File',
        'Hidden',
        'Image',
        'Month',
        'Number',
        'Password',
        'Radio',
        'Range',
        'Reset',
        'Search',
        'Submit',
        'Tel',
        'Text',
        'Time',
        'Url',
        'Week',
      ],
    }
  },
  computed: {
    ...mapState([
      'isPaused',
      'isStopped',
      'screenshotMode',
      'darkMode',
      'hasRecorded',
      'isCopying',
      'recording',
    ]),
  },
  mounted() {
    window.addEventListener('click', this.triggerFormPopup)
    this.show = this.isPaused ? true : false
    this.selected = storage.get(['selected']).selected
  },
  methods: {
    sendElementMetaData() {
      if (!this.label || !this.slug) {
        alert('Label and Slug is needed!')
        return
      }
      this.$store.commit('unpause')
      const { attributes, pagetitle } = storage.get(['attributes', 'pagetitle'])
      chrome.runtime.sendMessage({
        selector: this.selected,
        action: headlessActions.ELEMENTMETADATA,
        label: this.label,
        slug: this.slug,
        type: this.type,
        subtype: this.subtype,
        tags: this.tags,
        pagetitle: pagetitle,
        attributes: attributes,
      })

      this.show = false
    },
    triggerFormPopup() {
      if (this.currentSelector) {
        this.label = ''
        this.slug = ''
        this.type = ''
        this.subtype = ''
        this.tags = ''
        this.show = true
        this.selected = this.currentSelector
        let attributes = {}
        let element = document.querySelector(this.selected)
        for (const attr of element.attributes) {
          attributes[attr.name] = attr.value
        }
        storage.set({
          selected: this.selected,
          attributes: attributes,
          pagetitle: document.querySelector('title').innerHTML,
        })
        this.$store.commit('pause')
      }
    },
  },
}
</script>

<style>
#headless-recorder-labelform {
  border: 1px solid;
  border-color: grey;
  border-radius: 10px;
  background-color: white;
  color: black;
  position: fixed;
  z-index: 1000;
  bottom: 20%;
  left: 40%;
  padding: 5px;
  /* display: none; */
}
</style>
