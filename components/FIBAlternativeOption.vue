<template>
  <div class="flex gap-2">
    <div
      class="flex flex-1 gap-0.5"
      :class="{ 'flex-col': !isContainerDeviceDesktop }"
    >
      <Dropdown
        ref="dropdown"
        class="rounded-l bg-light-10% text-light-3 h-12 w-31"
        titleStyles="text-lg"
        type="custom"
        :size="isContainerDeviceDesktop ? 'lg' : 'sm'"
        :title="getMatcherName"
      >
        <ul class="flex flex-col gap-2 p-2 items-start">
          <button
            v-for="matcher in allMatchers"
            :key="matcher.tile"
            class="text-dark text-lg text-semibold"
            @click="handleMatcherClick(matcher.key)"
          >
            {{ matcher.title }}
          </button>
        </ul>
      </Dropdown>
      <div class="flex flex-1 gap-2">
        <Input
          :value="currentOptiontext"
          :inputClasses="`bg-light-10% focus:ring-light-3 h-12 ${isContainerDeviceDesktop ? 'text-xl' : 'text-base'}`"
          :placeholder="$i18n('Type an answer here...')"
          textColorClass="text-light-3"
          autocomplete="off"
          :maxlength="40"
          showCharLimit
          @focus="isInputFocused = true"
          @blur="isInputFocused = false"
          @input="handleInput"
        />
        <Button
          buttonClasses="h-12 w-12"
          licon="fas fa-trash-alt"
          type="transparent"
          theme="dark"
          @click="handleDeleteClick"
        />
      </div>
    </div>
  </div>
</template>

<script>
export default {

  props: {
    option: {
      type: Object,
      default: () => ({}),
    },
    isContainerDeviceDesktop: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      isInputFocused: false,
      currentOptiontext: '',
      currentSelectedMatcher: '',
      allMatchers: [
        {
          key: this.$constants.AllBlankQuestionMatchers.EXACT,
          title: this.$i18n('is exactly'),
        },
        {
          key: this.$constants.AllBlankQuestionMatchers.CONTAINS,
          title: this.$i18n('contains'),
        },
      ],
    };
  },

  computed: {
    getMatcherName() {
      const selectedMatcher = this.allMatchers.find((matcher) => matcher.key === this.currentSelectedMatcher);
      return selectedMatcher?.title ?? '';
    },
  },

  watch: {
    option: {
      handler(val) {
        this.currentOptiontext = val?.text ?? '';
        this.currentSelectedMatcher = val?.matcher;
      },
      deep: true,
      immediate: true,
    },
  },

  methods: {
    handleMatcherClick(key) {
      this.currentSelectedMatcher = key;
      this.$emit('update-option', {
        ...this.option,
        text: this.currentOptiontext,
        matcher: this.currentSelectedMatcher,
      });
      this.$refs?.dropdown?.close();
    },

    handleInput(text) {
      this.currentOptiontext = text;
      this.$emit('update-option', {
        ...this.option,
        text,
        matcher: this.currentSelectedMatcher,
      });
    },

    handleDeleteClick() {
      this.$emit('delete-option');
    },
  },

};
</script>
