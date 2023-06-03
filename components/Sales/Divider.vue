<template>
  <hr
    class="divider w-full h-px bg-dark-6 border-0 my-6"
    :class="className"
  />
</template>

<script>
export default {
  props: {
    noMarginTop: {
      type: Boolean,
      default: false,
    },
    noMarginBottom: {
      type: Boolean,
      default: false,
    },
  },

  computed: {
    className() {
      return (this.noMarginTop ? 'mt-0' : '') + (this.noMarginBottom ? ' mb-0' : '');
    },
  },

  created() {
  },
};
</script>
