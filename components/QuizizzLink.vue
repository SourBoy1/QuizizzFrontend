<template>
  <a
    :href="to"
    :class="rootClasses"
    @click="handleRouting"
  >
    <slot />
  </a>
</template>

<script>
export default {

  props: {
    isExternal: {
      type: Boolean,
      default: false,
    },
    rootClasses: {
      type: String,
      default: '',
    },
    to: {
      type: String,
      required: true,
      default: '#',
    },
    replace: {
      type: Boolean,
      default: false,
    },
    disableRedirection: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['click'],

  methods: {
    handleRouting(event) {
      event.preventDefault();
      event.stopPropagation();

      if (this.disableRedirection) {
        this.$emit('click', this.to);
        return;
      }

      if (!this.isExternal) {
        this.replace
          ? this.$router.replace(this.to)
          : this.$router.push(this.to);
      } else {
        window.open(this.to, '_self');
      }
    },
  },
};
</script>
