<template>
  <div
    :class="[
      'lock-icon-wrapper border border-solid flex align-center justify-center rounded-sm inline-block relative',
      spacing, backgroundColor, borderColor, iconColor,
    ]"
  >
    <FA
      icon="fas fa-lock"
      :size="size"
    />
  </div>
</template>

<script>
export default {
  props: {
    isAbsolute: {
      type: Boolean,
      default: true,
    },
    size: {
      type: Number,
      default: 9,
    },
    spacing: {
      type: String,
      default: 'px-1',
    },
    backgroundColor: {
      type: String,
      default: 'bg-lilac-faded',
    },
    borderColor: {
      type: String,
      default: 'border-lilac',
    },
    iconColor: {
      type: String,
      default: 'text-lilac',
    },
  },
};
</script>

<style lang="scss" scoped>
.lock-icon-wrapper {
  padding-top: 0.219rem;
  padding-bottom: 0.219rem;
}
</style>
