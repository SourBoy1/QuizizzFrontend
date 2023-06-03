<template>
  <ul class="py-1">
    <button
      v-for="lineHeight in lineHeights"
      :key="lineHeight.id"
      class="w-full flex text-dark-3 py-1.5 px-3 hover:bg-dark-5% active:bg-dark-10% justify-between"
      @click="onLineHeightSelected(lineHeight)"
    >
      <div class="flex">
        <span class="text-xs text-dark-3 font-semibold">{{ lineHeight.title }}</span>
      </div>
    </button>
  </ul>
</template>

<script>
export default {
  emits: ['onLineHeightSelected'],

  data() {
    return {
      lineHeights: [
        {
          id: '1em',
          title: this.$i18n('Single'),
        },
        {
          id: '1.2em',
          title: this.$i18n('1.2'),
        },
        {
          id: '1.5em',
          title: this.$i18n('1.5'),
        },
        {
          id: '2em',
          title: this.$i18n('Double'),
        },
      ],
    };
  },

  methods: {
    onLineHeightSelected(lineHeight) {
      this.$emit('onLineHeightSelected', lineHeight);
    },
  },
};
</script>
