<template>
  <i
    class="flex items-center"
    :class="[icon]"
    :style="`font-size: ${size}px;`"
    @click="$emit('click')"
  />
</template>

<script>
export default {
  props: {
    icon: {
      type: String,
      default: '',
    },
    size: {
      type: [Number, String],
      default: 12,
    },
  },
  emits: ['click'],
};
</script>

<style scoped>
  i {
    display: inline-flex !important;
  }
</style>
