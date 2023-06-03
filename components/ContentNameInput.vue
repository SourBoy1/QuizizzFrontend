<template>
  <div
    class="w-60 flex rounded"
    @mouseenter="isInputHovered = true"
    @mouseleave="isInputHovered = false"
  >
    <Input
      ref="content-name-input"
      :value="isDefaultName ? '' : name"
      :inputClasses="inputClasses"
      :placeholder="placeholder"
      :ticon="!(isValidName) && isTyping ? 'fas fa-exclamation-circle' : ''"
      ticonClasses="w-6 h-6 text-sm text-red-faded"
      :ticonSize="14"
      :maxlength="$constants.ContentNameMaxLength"
      autocomplete="off"
      :noRing="true"
      :showCharLimit="isTyping && isValidName"
      textColorClass=" text-light-3"
      @input="handleInputChange"
      @blur="onBlur"
      @keydown="onKeydown"
      @focus="onFocus"
    />
    <div
      v-if="!isTyping"
      class="flex items-center rounded-r"
      :class="isInputHovered ? 'bg-light-10%' : ''"
    >
      <div class="separator w-px mr-1 h-4 self-center bg-light-10% rounded-sm mx-2" />
      <button
        class="w-6 h-6 ml-2 mr-2.5 rounded "
        :class="isInputHovered ? '' : 'bg-light-10%'"
        @click="handleEditNameClick"
      >
        <FA
          class="text-light-3"
          icon="fas fa-pen"
          :size="14"
        />
      </button>
    </div>
  </div>
</template>

<script>
import { ContentDefaultName } from '../config/DefaultCopies';

export default {

  props: {
    name: {
      type: String,
      default: '',
    },

    placeholder: {
      type: String,
      default: '',
    },
  },

  emits: ['change', 'blur', 'keydown', 'focus'],

  data() {
    return {
      isInputHovered: false,
      isValidName: true,
      isTyping: false,
    };
  },

  computed: {
    isDefaultName() {
      return [ContentDefaultName.LESSON_NAME, ContentDefaultName.QUIZ_NAME].includes(this.name);
    },

    inputClasses() {
      let cls = `content-name-input border-none focus:ring-2 focus:ring-offset-0 focus:rounded text-ellipsis${this.isInputHovered ? ' bg-light-10% rounded-r-none' : ' bg-purple'}`;
      if (this.isValidName && this.isTyping) {
        cls += ' focus:ring-lilac';
      } else {
        cls += ' focus:ring-red-dark';
      }
      return cls;
    },
  },

  methods: {
    handleInputChange(value) {
      this.isTyping = true;
      if (value.length < 4) {
        this.isValidName = false;
      } else {
        this.isValidName = true;
      }
      this.$emit('change', value, this.isValidName, this.isTyping);
    },

    handleEditNameClick() {
      this.isTyping = true;
      this.$nextTick(() => {
        this.$refs['content-name-input']?.$refs?.input?.focus();
      });
    },

    onBlur() {
      this.isTyping = false;
      this.isValidName = true;
      this.$emit('blur', this.isTyping);
    },

    onKeydown(ev) {
      this.isTyping = false;
      this.isValidName = true;
      this.$emit('keydown', ev, this.isTyping);
    },

    onFocus() {
      this.isTyping = true;
      if (this.name.length < 4) {
        this.isValidName = false;
      }
      this.$emit('focus', this.isTyping);
    },
  },

};

</script>
