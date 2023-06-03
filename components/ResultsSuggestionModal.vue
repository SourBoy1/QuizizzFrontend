<template>
  <Modal
    :title="title"
    :fixedHeight="false"
    :fullScreenOnMobile="true"
    stickToBottom
    @close="$emit('close')"
  >
    <div class="w-full">
      <Input
        v-model="searchValue"
        :placeholder="placeholder"
        aria-required="true"
        licon="fas fa-search"
        inputClasses="mt-2 mb-2"
        liconClasses="mt-4 mb-0"
      />
      <div class="list-container mt-3 flex overflow-y-visible flex-col mb-14">
        <div
          v-for="subject in filteredList"
          :key="subject.title"
        >
          <div
            :id="`id-${subject.value}`"
            class="h-8 flex items-center border-b-1 border-dark-6"
            :class="selectedValueFromResults === subject.value ? 'bg-lilac-faded border-b-1' : ''"
            @click="(_) => handleValueClick(_, subject.value)"
          >
            <span
              class="text-sm font-semibold text-dark-4 p-2"
              :class="selectedValueFromResults === subject.value ? 'text-lilac' : ''"
            >{{ $i18n('{$1}', [subject.title]) }}</span>
          </div>
        </div>
      </div>
    </div>
    <div class="w-full px-6 flex fixed bottom-0 left-1/2 -translate-x-1/2 h-14 justify-between bg-light-3">
      <Button
        buttonClasses="mt-1"
        :title="$i18n('Back')"
        type="other"
        @click="$emit('close')"
      />
      <Button
        buttonClasses="mt-1"
        :title="$i18n('Done')"
        type="primary"
        @click="handleDoneClick"
      />
    </div>
  </Modal>
</template>

<script>

export default {

  props: {
    title: {
      type: String,
      default: '',
    },
    placeholder: {
      type: String,
      default: '',
    },
    list: {
      type: Array,
      default: () => [],
    },
    selectedValue: {
      type: String,
      default: '',
    },
  },
  emits: ['close', 'selectedValueFromResults'],

  data() {
    return {
      searchValue: '',
      selectedValueFromResults: '',
      element: null,
    };
  },

  computed: {
    filteredList() {
      return this.list.filter((subject) => subject.title.toLowerCase().includes(this.searchValue.toLowerCase()));
    },
  },

  mounted() {
    this.selectedValueFromResults = this.selectedValue;
    this.scrollToSelectedValue();
  },

  methods: {
    handleValueClick(_, value) {
      if (this.element) {
        this.element.style.removeProperty('background-color');
        this.element.firstChild.style.removeProperty('color');
      }
      this.selectedValueFromResults = value;
    },

    handleDoneClick() {
      this.$emit('selectedValueFromResults', this.selectedValueFromResults);
    },

    scrollToSelectedValue() {
      this.element = document.getElementById(`id-${this.selectedValue}`);
      if (this.element) {
        this.element.style.backgroundColor = '#EDE6F6';
        this.element.firstChild.style.color = '#8854C0';
        this.element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    },
  },

};
</script>

<style lang="scss" scoped>
  // calculate the height of the modal on mobile for bottom fixed buttons

.list-container {
  max-height: calc(100vh - 200px);
  overflow: auto;
}
</style>
