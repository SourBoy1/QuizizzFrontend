<template>
  <section class="flex flex-col">
    <div
      ref="tagInputContainer"
      v-tooltip="{
        triggers: [],
        shown: showTooltip,
        content: tooltipContent,
      }"
      :class="{
        'flex-wrap': !isScrollable,
        'overflow-x-auto flex-col': isScrollable,
        'border-lilac': isInFocus,
        'border-dark-6': !isInFocus,
        'min-h-10': !showInput,
        'bg-light-1': disabled,
      }"
      class="border border-solid rounded flex tag-input-wrapper p-2 gap-1"
      v-on="!showInput ? { click: handleFocus } : {}"
    >
      <Tag
        v-for="(tag, index) in tags"
        :key="`tag-${index}`"
        class="w-fit"
        :title="tag"
        size="sm"
        :type="validator(tag) ? 'secondary' : 'danger'"
        :hideDelete="disabled"
        @delete="deleteTag(index)"
      >
        {{ tag }}
      </Tag>
      <Input
        v-if="shouldShowInput"
        id="inputField"
        ref="inputField"
        :placeholder="placeholder"
        :noRing="true"
        :noBorder="true"
        class="tag-input-field-wrapper ml-2"
        inputId="tag-input-field"
        :textColorClass="searchTextStyles.searchText"
        :autocomplete="autocomplete"
        :options="options"
        :value="value"
        :selectedOption="selectedOption"
        :disabled="disabled"
        @input="handleInput"
        @keydown="handleKeydown"
        @blur="handleBlur"
        @focus="handleFocus"
        @optionSelected="handleOptionSelected"
        @paste="onPaste"
        @paste.prevent
      />
    </div>
    <Dropdown
      v-show="searchDropdown.enabled && dropdownList.length > 0"
      ref="searchDropdown"
      class="mr-2 min-w-40"
      size="md"
      type="default"
      listWidth="w-90"
      title=""
      :shouldShowToggleButton="false"
      :autoPosition="searchDropdown.optionType === 'userInfoList'"
      :openDirection="searchDropdown.openDirection"
    >
      <ul
        v-if="searchDropdown.optionType === 'userInfoList'"
        class="p-2 space max-h-50 overflow-y-auto overflow-x-hidden"
        tabindex="0"
      >
        <button
          v-for="tag in dropdownList"
          :key="tag.value"
          type="button"
          tabindex="0"
          class="w-full flex flex-col p-2 hover:bg-dark-10% outline-none text-left"
          :aria-label="tag.title"
          role="button"
          @click="addTag(tag.value)"
        >
          <div class="flex items-center">
            <div class="bg-red-faded text-red-light rounded-full w-8 h-8 flex items-center justify-center mr-2">
              <FA
                icon="fas fa-user"
                :size="18"
              />
            </div>
            <div class="flex flex-col justify-center text-xs">
              <span class="font-semibold"> {{ tag.title }}</span>
              <span class="text-dark-4"> {{ tag.value }}</span>
            </div>
          </div>
        </button>
      </ul>
      <ul
        v-else
        class="py-1 space max-h-50 overflow-y-auto overflow-x-hidden"
        tabindex="0"
      >
        <button
          v-for="tag in dropdownList"
          :key="tag.text"
          tabindex="0"
          class="w-full flex flex-col p-2 hover:bg-dark-10% outline-none text-left"
          :aria-label="tag.text"
          role="button"
          @click="addTag(tag.value)"
        >
          <span class="text-dark-2 text-sm">
            {{ tag.title }}
          </span>
        </button>
      </ul>
    </Dropdown>

    <div v-if="showInvalidEmailEntered">
      <slot
        name="invalid-input-error"
        :input="erroredInput"
      />
    </div>

    <div
      v-if="listSelector.enabled && isInFocus"
      class="flex flex-wrap border border-solid border-dark-6 rounded-lg p-2 gap-y-3 gap-x-2 min-h-11 mt-1"
    >
      <Tag
        v-for="(tag, index) in listSelectorRemainingTags"
        :key="`tag-${index}`"
        :title="tag.title"
        size="sm"
        class="text-xs font-normal p-1 cursor-pointer"
        :hideDelete="true"
        @click="addTag(tag.value)"
      >
        {{ tag }}
      </Tag>
    </div>
  </section>
</template>

<script>
import isEmpty from 'lodash/isEmpty';
import debounce from 'lodash/debounce';

import i18n from '~/services/i18n';

export default {
  emits: ['input', 'inputFocus', 'inputBlur', 'invalidTag', 'setTags', 'optionSelected', 'filterUserList'],

  props: {
    placeholder: {
      type: String,
      default: i18n('Add tags'),
    },

    isInFocus: {
      type: Boolean,
      default: true,
    },

    /**
   * Structure:
   * [
   *  {
   *    title: 'text', // text to show in dropdown
   *    value: 'val', // value to push into the tag
   *  }
   * ]
   */
    existingTags: {
      type: Array,
      default: () => [],
    },

    isScrollable: {
      type: Boolean,
      default: false,
    },

    singleLineToolTip: {
      type: Boolean,
      default: false,
    },

    maxTagsAllowed: {
      type: Number,
      default: 5,
    },

    validator: {
      type: Function,
      default: () => true,
    },

    selectedOption: {
      type: String,
      default: '',
    },

    errorOnValidationFail: {
      type: String,
      default: i18n('Please enter a valid value'),
    },

    errorOnMaxTags: {
      type: String,
      default: i18n('You can not add any more tags'),
    },

    delimiters: {
      type: Array,
      default: () => [' ', 'Enter'],
    },

    addTagOnBlur: {
      type: Boolean,
      default: false,
    },

    searchDropdown: {
      type: Object,
      default: () => ({
        optionType: null,
        enabled: false,
        dropdownTags: [],
        openDirection: 'bottom',
        emitForFiltering: false,
      }),
    },

    disabled: {
      type: Boolean,
      default: false,
    },

    searchTextStyles: {
      type: Object,
      default: () => ({
        searchText: 'text-dark-2',
      }),
    },

    listSelector: {
      type: Object,
      default: () => ({
        enabled: false,
        dropdownTags: [],
      }),
    },

    allowDuplicates: {
      type: Boolean,
      default: false,
    },

    autocomplete: {
      type: String,
      default: 'off',
    },

    options: {
      type: Array,
      default: () => [],
    },

    showInput: {
      type: Boolean,
      default: true,
    },

    emitInvalidTag: {
      type: Boolean,
      default: true,
    },

    /** whether this component is in controlled mode, ref: https://react.dev/learn/sharing-state-between-components#controlled-and-uncontrolled-components */
    controlledTags: {
      type: Array,
      default: () => [],
    },
  },

  data() {
    return {
      tags: [],
      currentInput: '',
      erroredInput: '',
      showTooltip: false,
      tooltipContent: '',
      value: '',
      emitInputLater: null,
      dropdownList: [],
      showInvalidEmailEntered: false,
    };
  },

  computed: {

    shouldShowInput() {
      if (this.tags.length >= this.maxTagsAllowed) {
        return false;
      }

      return this.showInput;
    },

    listSelectorRemainingTags() {
      const remainingTags = this.listSelector.dropdownTags.filter((tag) => !this.tags.includes(tag.value));
      if (this.currentInput) {
        return remainingTags.filter((tag) => tag.title.toLowerCase().includes(this.currentInput.toLowerCase()));
      }
      return remainingTags;
    },
  },

  watch: {
    currentInput: {
      handler(newCurrentInputValue, oldVal) {
        if (this.searchDropdown.optionType === 'userInfoList') {
          this.debouncedFilterUserList(newCurrentInputValue);
          return;
        }

        if (newCurrentInputValue === '') {
          this.dropdownList = [];
          return;
        }

        this.dropdownList = this.searchDropdown.dropdownTags.filter((tag) => tag.value.includes(this.currentInput));
        this.handleDroplistOpen();
      },
    },

    controlledTags(newValue) {
      if (this.controlledTags?.length > 0) {
        this.showInvalidEmailEntered = false;
        this.tags = newValue;
      }
    },

    searchDropdown: {
      handler(newValue, _oldVal) {
        if (newValue.emitForFiltering) {
          this.dropdownList = newValue.dropdownTags;
          if (this.dropdownList.length) {
            this.handleDroplistOpen();
          }
        }
      },
    },
  },

  created() {
    this.debouncedFilterUserList = debounce(this.filterUserList, 300);
  },

  mounted() {
    if (this.existingTags.length > 0) {
      this.tags.push(...this.existingTags);
    }
  },

  beforeUnmount() {
    if (this.tooltipDestroyTimeout) {
      clearTimeout(this.tooltipDestroyTimeout);
    }
  },

  methods: {
    getCurrentInputValue() {
      return this.currentInput;
    },

    handleInput(input) {
      this.currentInput = input;

      if (this.showInvalidEmailEntered) {
        this.showInvalidEmailEntered = false;
      }

      this.$emit('input', input);
    },

    handleKeydown(ev) {
      const { key } = ev;
      this.showInvalidEmailEntered = false;

      if (this.delimiters.includes(key)) {
        this.addTag();
        this.clearInputField(ev);
      }

      if (key === 'Backspace' && !this.currentInput) {
        this.deleteTag(this.tags.length - 1);
      }
    },

    handleFocus() {
      this.$emit('inputFocus', { key: this.$.vnode.key });
    },

    handleBlur() {
      this.$emit('inputBlur', { key: this.$.vnode.key });
      if (this.addTagOnBlur) {
        this.addTag();
      }
    },

    addTag(val) {
      let tag = val || this.currentInput;

      if (this.delimiters.includes(' ')) {
        tag = tag?.trim();
      }

      if (!tag && isEmpty(this.currentInput?.trim())) {
        return;
      }

      if (!tag && isEmpty(this.currentInput?.trim())) {
        return;
      }

      if (this.tags.length >= this.maxTagsAllowed) {
        this.tooltipContent = this.errorOnMaxTags;
        this.triggerTooltip();
        return;
      }

      if (!this.validator(tag) || !tag) {
        this.erroredInput = tag;
        if (!this.emitInvalidTag) {
          if (this.searchDropdown.enabled) {
            this.showInvalidEmailEntered = true;
          }
          return;
        }
        this.$emit('invalidTag', true);
      } else {
        this.$emit('invalidTag', false);
      }

      if (!this.allowDuplicates) {
        if (this.tags.includes(tag)) {
          return;
        }
      }

      this.tags.push(tag);
      this.$emit('setTags', this.tags);

      this.clearInputField();

      if (this.isScrollable && this.$refs.inputField) {
        this.$nextTick(() => {
          const inputField = this.$refs.inputField.$el;
          inputField.scrollIntoView({
            behavior: 'smooth',
          });
        });
      }
    },

    clearInputField(ev) {
      ev?.preventDefault();
      this.$refs.inputField?.clear();
      this.currentInput = '';
    },

    clearTags() {
      this.clearInputField();
      this.tags = [];
    },

    deleteTag(tagIndex) {
      this.tags.splice(tagIndex, 1);
      this.$emit('setTags', this.tags);
    },

    triggerTooltip() {
      this.showTooltip = true;
      this.tooltipDestroyTimeout = setTimeout(() => {
        this.showTooltip = false;
        this.tooltipContent = '';
      }, 3000);
    },

    handleOptionSelected(option) {
      this.$emit('optionSelected', option);
    },

    filterUserList(queryText) {
      if (this.searchDropdown.emitForFiltering) {
        this.$emit('filterUserList', queryText);
        return;
      }

      if (queryText === '') {
        this.dropdownList = [];
        return;
      }

      const lowerCasedInput = queryText.toLowerCase();
      this.dropdownList = this.searchDropdown.dropdownTags.filter((user) => this.$stringUtils.emailValidator(user?.value) && (user?.value.toLowerCase().includes(lowerCasedInput) || user?.title.toLowerCase().includes(lowerCasedInput)));
      this.handleDroplistOpen();
    },

    handleDroplistOpen() {
      if (!this.$refs.searchDropdown.open && this.dropdownList.length > 0) {
        setTimeout(() => {
          this.$refs.searchDropdown.toggleOpen();
        }, 50);
      }
    },

    onPaste(evt) {
      const emails = evt.clipboardData.getData('text');
      const cleanEmails = emails.split(/[ ,]+/).map((email) => email.trim());
      cleanEmails.forEach((email) => this.addTag(email));
    },

  },
};
</script>

<style lang="scss" scoped>
.tag-input-wrapper {
  .tag-input-field-wrapper {
    flex: 1;
    min-width: 3rem;
  }
}
</style>

<style lang="scss">
  .tag-input-wrapper {
    .tag-input-field-wrapper {
      & input {
        padding: 0;
        height: 1.5rem;
      }
    }
  }
</style>
