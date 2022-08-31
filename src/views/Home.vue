<template>
  <div class="flex flex-col items-center rounded-md pt-10 h-150">
    <h3 class="text-gray-darkest text-xl font-semibold mb-3 dark:text-gray-lightest">
      No recorded events yet
    </h3>
    <p class="text-gray-dark text-xs mb-5 text-center w-44 dark:text-gray-light">
      Record browser events by clicking record button
    </p>
    <RoundButton :small="false" @click="$emit('start')" class="p-10 mt-12">
      <div class="bg-red w-21 h-21 rounded-full"></div>
    </RoundButton>
    <form>
      <div class="form-group mb-6">
        <label class="form-label inline-block mb-2 text-gray-700">Title:</label>
        <input
          v-model="title"
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
        <label class="form-label inline-block mb-2 text-gray-700">Sub-Title:</label>
        <input
          v-model="subtitle"
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
        <label class="form-label inline-block mb-2 text-gray-700">Category:</label>
        <select
          v-model="category"
          class="form-select appearance-none
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
          <option disabled value="">Please select one</option>
          <option>Click</option>
          <option>Scrape</option>
          <option>Submit</option>
          <option>Crawl</option>
        </select>
        <label class="form-label inline-block mb-2 text-gray-700">Sub-Category:</label>
        <select
          v-model="subcategory"
          class="form-select appearance-none
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
          <option disabled value="">Please select one</option>
          <option>Page</option>
          <option>Section</option>
          <option>Form</option>
          <option>Links</option>
        </select>
        <label class="form-label inline-block mb-2 text-gray-700">Purpose:</label>
        <select
          v-model="purpose"
          class="form-select appearance-none
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
          <option disabled value="">Please select one</option>
          <option>Scrape Page</option>
          <option>Submit Form</option>
          <option>Send Message</option>
          <option>Search Keyword</option>
          <option>Purchase Item</option>
        </select>
        <label class="form-label inline-block mb-2 text-gray-700">Description:</label>
        <textarea
          v-model="description"
          class="
          form-control
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
        ></textarea>
        <label class="form-label inline-block mb-2 text-gray-700">Icon-Url:</label>
        <input
          v-model="iconurl"
          class="
          form-control
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
        <label class="form-label inline-block mb-2 text-gray-700">Sub-Title:</label>
        <input
          v-model="tags"
          class="
          form-control
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
    </form>
  </div>
</template>

<script>
import RoundButton from '@/components/RoundButton'

export default {
  components: { RoundButton },
  data() {
    return {
      category: '',
      subcategory: '',
      purpose: '',
    }
  },
}
</script>

<style scoped>
input {
  border: 1px solid;
}

.bg-red {
  width: 50px;
  height: 50px;
}

.flex {
  padding-top: 0;
}
</style>
