<template>
  <div v-if="show" class="form-style-2" id="headless-recorder-labelform">
    <form>
      <label><span>Label:</span></label>
      <input v-model="label" class="input-field" />
      <label><span>Slug:</span></label>
      <input v-model="slug" class="input-field" />
      <label><span>Type:</span></label>
      <select v-model="type" class="select-field">
        <option disabled value="">Please select</option>
        <option>Link</option>
        <option>Input</option>
        <option>Button</option>
        <option>Textarea</option>
        <option>Select</option>
        <option>Text</option>
      </select>
      <label><span>Sub-Type:</span></label>
      <select v-model="subtype" class="select-field">
        <option disabled value="">Please select</option>
        <option v-for="sub of subtypes" :key="sub">{{ sub }}</option>
      </select>
      <label class><span>Tags:</span></label>
      <input v-model="tags" class="input-field" />
      <button @click="sendElementMetaData" type="button">Submit</button>
    </form>
  </div>
</template>

<script>
import { headlessActions } from '@/modules/code-generator/constants'
import storage from '@/services/storage'
import { mapState } from 'vuex'

export default {
  name: 'LabelForm',
  data() {
    return {
      show: true,
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
  async mounted() {
    window.addEventListener('click', this.triggerFormPopup)
    const { selected, showLabelForm } = await storage.get(['selected', 'showLabelForm'])
    this.selected = selected
    this.show = this.isPaused ? showLabelForm : false
    console.log('console:....', this.selected, this.show)
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
      if (this.isPaused) return
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

<style scoped>
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
.form-style-2 {
  max-width: 500px;
  padding: 20px 12px 10px 20px;
  font: 13px Arial, Helvetica, sans-serif;
}
.form-style-2-heading {
  font-weight: bold;
  font-style: italic;
  border-bottom: 2px solid #ddd;
  margin-bottom: 20px;
  font-size: 15px;
  padding-bottom: 3px;
}
.form-style-2 label {
  display: block;
  margin: 0px 0px 15px 0px;
}
.form-style-2 label > span {
  width: 100px;
  font-weight: bold;
  float: left;
  padding-top: 8px;
  padding-right: 5px;
}
.form-style-2 span.required {
  color: red;
}
.form-style-2 .tel-number-field {
  width: 40px;
  text-align: center;
}
.form-style-2 input.input-field,
.form-style-2 .select-field {
  width: 48%;
}
.form-style-2 input.input-field,
.form-style-2 .tel-number-field,
.form-style-2 .textarea-field,
.form-style-2 .select-field {
  box-sizing: border-box;
  -webkit-box-sizing: border-box;
  -moz-box-sizing: border-box;
  border: 1px solid #c2c2c2;
  box-shadow: 1px 1px 4px #ebebeb;
  -moz-box-shadow: 1px 1px 4px #ebebeb;
  -webkit-box-shadow: 1px 1px 4px #ebebeb;
  border-radius: 3px;
  -webkit-border-radius: 3px;
  -moz-border-radius: 3px;
  padding: 7px;
  outline: none;
}
.form-style-2 .input-field:focus,
.form-style-2 .tel-number-field:focus,
.form-style-2 .textarea-field:focus,
.form-style-2 .select-field:focus {
  border: 1px solid #1e88e5;
}
.form-style-2 .textarea-field {
  height: 100px;
  width: 55%;
}
.form-style-2 button {
  border: none;
  padding: 8px 15px 8px 15px;
  background: #1e88e5;
  color: #fff;
  box-shadow: 1px 1px 4px #dadada;
  -moz-box-shadow: 1px 1px 4px #dadada;
  -webkit-box-shadow: 1px 1px 4px #dadada;
  border-radius: 3px;
  -webkit-border-radius: 3px;
  -moz-border-radius: 3px;
}
.form-style-2 button:hover {
  background: #1976d2;
  color: #fff;
}
</style>
