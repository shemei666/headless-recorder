<template>
  <div
    v-if="show"
    class="block p-6 rounded-lg shadow-lg bg-grey max-w-sm"
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
        focus:text-gray-700 focus:bg-white focus:border-blue focus:outline-none"
        />
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
        focus:text-gray-700 focus:bg-white focus:border-blue focus:outline-none"
        />
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
          focus:text-gray-700 focus:bg-white focus:border-blue focus:outline-none"
        >
          <option disabled value="">Please select</option>
          <option>Link</option>
          <option>Input</option>
          <option>Button</option>
          <option>Textarea</option>
          <option>Select</option>
          <option>Text</option>
        </select>
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
          focus:text-gray-700 focus:bg-white focus:border-blue focus:outline-none"
        >
          <option disabled value="">Please select</option>
          <option v-for="sub of subtypes" :key="sub">{{ sub }}</option>
        </select>
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
        focus:text-gray-700 focus:bg-white focus:border-blue focus:outline-none"
        />
        <button
          @click="sendElementMetaData"
          type="button"
          class="
              px-6
              py-2.5
              bg-blue
              text-white
              font-medium
              text-xs
              leading-tight
              uppercase
              rounded
              shadow-md
              hover:bg-blue hover:shadow-lg
              focus:bg-blue focus:shadow-lg focus:outline-none focus:ring-0
              active:bg-blue active:shadow-lg
              transition
              duration-150
              ease-in-out"
        >
          Submit
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import { headlessActions } from '@/modules/code-generator/constants'
import storage from '@/services/storage'

import '../../assets/tailwind.css'

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
  mounted() {
    window.addEventListener('click', this.triggerFormPopup)
    const { selected, showLabelForm } = storage.get(['selected', 'showLabelForm'])
    this.selected = selected
    this.show = showLabelForm
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
      storage.set({ showLabelForm: this.show })
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
          showLabelForm: this.show,
        })
        this.$store.commit('pause')
      }
    },
  },
}
</script>

<style>
#headless-recorder-labelform {
  /* border: 1px solid;
  border-color: grey;
  border-radius: 10px; */
  background-color: white;
  color: black;
  position: fixed;
  z-index: 1000;
  bottom: 20%;
  left: 40%;
  /* padding: 5px; */
  /* display: none; */
}
button {
  margin-top: 5px;
}
</style>
