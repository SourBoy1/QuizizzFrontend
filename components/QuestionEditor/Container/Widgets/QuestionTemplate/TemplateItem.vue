<template>
  <div class="flex flex-col justify-center items-center rounded px-2 mt-4 cursor-pointer">
    <div
      class="flex-1 mb-1 relative item-wrapper-with-hover"
      tabindex="0"
      @mouseover.capture="$emit('template-hovered')"
      @mouseleave.capture="$emit('template-hover-canceled')"
      @click.capture.stop="handleItemClick"
    >
      <img
        :src="templateItem.image"
        class="flex-1 h-auto rounded template-image"
      />
      <div
        class="hovered-button hidden absolute h-full w-full top-0 left-0 justify-center items-center bg-dark-30%"
      >
        <Button
          type="white"
          buttonClasses="cursor-pointer"
          :title="$i18n('Use Template')"
          :loading="isLoading"
        />
      </div>
    </div>
    <span class="text-sm">{{ templateItem.description }}</span>
  </div>
</template>

<script>
export default {

  props: {
    templateItem: {
      type: Object,
      required: true,
    },
  },
  emits: ['template-hovered', 'template-hover-canceled', 'template-selected'],

  data() {
    return {
      isLoading: false,
    };
  },

  beforeUnmount() {
    if (this.loadingTimer) {
      clearTimeout(this.loadingTimer);
    }
  },

  methods: {
    handleItemClick() {
      this.isLoading = true;
      this.loadingTimer = setTimeout(() => {
        this.isLoading = false;
      }, 500);
      this.$emit('template-selected');
    },
  },
};
</script>

<style scoped>
.item-wrapper-with-hover:hover .hovered-button {
  display: flex;
}
</style>
