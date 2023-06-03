<template>
  <div class="flex h-12 items-center">
    <Button
      v-if="isImageMediaMode"
      v-tooltip.bottom="$i18n('Crop image')"
      type="transparent"
      :title="$i18n('Crop image')"
      size="sm"
      licon="fas fa-crop-alt"
      class="bg-purple-dark hover:bg-light-5% ml-auto border-light-10% border border-solid mr-2"
    />

    <Button
      type="transparent"
      :title="$i18n('Replace media')"
      size="sm"
      licon="fas fa-brush"
      class="bg-purple-dark hover:bg-light-5% ml-auto border-light-10% border border-solid"
      @click="$emit('replaceMedia')"
    />
  </div>
</template>

<script>
export default {
  props: {
    currentMode: {
      type: String,
      default: '',
    },
  },
  emits: ['replaceMedia'],

  computed: {
    isImageMediaMode() {
      return this.currentMode === this.$constants.EditModes.IMAGE_MEDIA;
    },
  },
};
</script>
