<template>
  <div
    class="animate-spin absolute"
  >
    <div>
      <FA
        icon="far fa-sync"
        :size="size"
      />
    </div>
  </div>
</template>

<script>
export default {
  props: {
    size: {
      type: Number,
      default: 60,
    },
  },
};
</script>
