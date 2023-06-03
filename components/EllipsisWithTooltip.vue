<template>
  <div ref="title">
    <span
      v-if="isTextOverflowing"
      v-tooltip.right="name"
      :style="{ width: width }"
      class="inline-block truncate align-bottom"
    >
      {{ name }}
    </span>
    <span
      v-else
      class="inline-block truncate align-bottom max-w-42 text-ellipsis"
    >
      {{ name }}
    </span>
  </div>
</template>

<script>
import get from 'lodash/get';

export default {
  props: {
    name: {
      type: String,
      default: '',
    },
  },

  data() {
    return {
      isTextOverflowing: false,
      width: 0,
    };
  },

  mounted() {
    const clientWidth = get(this.$refs, 'title.clientWidth', 0);
    const parentWidth = get(this.$refs, 'title.parentNode.parentNode.clientWidth', 0);

    if (clientWidth > parentWidth) {
      this.isTextOverflowing = true;
      this.width = `${parentWidth - 10}px`;
    }
  },
};
</script>
