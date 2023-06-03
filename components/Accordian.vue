<template>
  <div
    class="w-full"
    :class="[accordianContainerClasses]"
    @click="toggleAccordian"
  >
    <div
      :class="[collapsedAccordianClasses]"
      class="flex items-center justify-between cursor-pointer"
    >
      <div class="flex items-center gap-2">
        <div v-if="shouldShowIcon">
          <FA
            v-if="accordianIcon"
            :icon="accordianIcon"
            class="w-14 h-14"
            :class="[accordianIconClasses]"
          />
          <img
            v-else
            class="w-14 h-14"
            :class="[accordianIconClasses]"
            src="https://cf.quizizz.com/img/qfs/pricing_asset_05.png"
            alt=""
          />
        </div>

        <div
          v-if="accordianTitle.length > 0"
          class="cursor-pointer"
        >
          {{ accordianTitle }}
        </div>
        <template v-else-if="$slots.title">
          <slot name="title" />
        </template>
        <div v-else>
          <i18n>Please Check Accordian Component</i18n>
        </div>
      </div>
      <FA
        icon="far cursor-pointer"
        :class="[isOpen ? accordianOpenIcon : accordianCloseIcon]"
      />
    </div>
    <div
      v-if="isOpen"
      :class="[accordianContentClasses]"
    >
      <slot />
    </div>
  </div>
</template>
<script>

export default {
  props: {
    accordianContainerClasses: {
      type: String,
      default: '',
    },
    collapsedAccordianClasses: {
      type: String,
      default: '',
    },
    accordianTitle: {
      type: String,
      default: '',
    },
    accordianContentClasses: {
      type: String,
      default: '',
    },
    shouldShowIcon: {
      type: Boolean,
      default: false,
    },
    accordianIcon: {
      type: String,
      default: '',
    },
    accordianIconClasses: {
      type: String,
      default: '',
    },
    accordianOpenIcon: {
      type: String,
      default: 'fa-minus-circle',
    },
    accordianCloseIcon: {
      type: String,
      default: 'fa-plus-circle',
    },
    isOpened: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['openChanged'],

  data() {
    return {
      isOpen: this.isOpened,
    };
  },

  watch: {
    isOpen(newValue) {
      this.$emit('openChanged', { isOpen: newValue });
    },
  },

  methods: {
    toggleAccordian() {
      this.isOpen = !this.isOpen;
    },
  },
};
</script>
