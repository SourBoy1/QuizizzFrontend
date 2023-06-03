<template>
  <Modal
    :title="title"
    :subtitle="subtitle"
    :icon="icon"
    :fixedHeight="false"
    :fullScreenOnMobile="true"
    stickToBottom
    hideFooter
    @close="$emit('close')"
  >
    <div class="image-search-container">
      <GoogleImageSearch
        ref="googleImageSearch"
        :searchTerm="searchTerm"
        :closeOnBackClick="true"
        :actionsBarStickToBottom="true"
        :showCancelBtn="false"
        :fullScreenImgContainer="true"
        imagePreviewWidth="524px"
        @onSearchStart="handleOnGoogleSearchStart"
        @onImagePick="setMeditToEdit"
        @close="$emit('close')"
      />
    </div>
    <template v-if="!searchStarted">
      <div class="w-full flex items-center justify-center empty-container p-4 bg-dark-5% border-1 rounded border-dark-6">
        <p class="text-sm text-dark-4 text-center">
          <i18n>Search images or GIFs using Google SafeSearch</i18n>
        </p>
      </div>
      <div class="w-full p-4 fixed left-0 bottom-0 flex justify-between">
        <Button
          :title="$i18n('Back')"
          type="other"
          :aria-label="$i18n('Back')"
          @click="$emit('close')"
        />
        <Button
          :title="$i18n('Insert')"
          :aria-label="$i18n('Insert')"
          :disabled="!searchStarted"
        />
      </div>
    </template>
  </Modal>
</template>

<script>
export default {

  props: {
    title: {
      type: String,
      default: '',
    },
    subtitle: {
      type: String,
      default: '',
    },
    icon: {
      type: String,
      default: '',
    },
  },
  emits: ['close', 'onImagePick'],

  data() {
    return {
      searchTerm: '',
      searchStarted: false,
    };
  },

  methods: {
    handleOnGoogleSearchStart() {
      this.searchStarted = true;
    },

    setMeditToEdit(media) {
      const { url } = media;
      this.$emit('onImagePick', url);
    },

    close() {
      this.$emit('close');
    },
  },

};
</script>

<style scoped>
.empty-container {
  height: calc(100vh - 200px);
}
</style>
