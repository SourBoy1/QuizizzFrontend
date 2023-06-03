<template>
  <Modal
    :icon="'far fa-check'"
    :title="title"
    :subtitle="null"
    :button1="{
      title: $user.isCorporate ? $i18n('View Folder') : $i18n('View Team'),
      type: 'other',
    }"
    :button2="{
      title: $i18n('Done'),
    }"
    :shouldCloseOnEscape="true"
    :shouldSubmitOnEnter="false"
    :dismissOnOverlayClick="true"
    :stickToBottom="!isDesktop"
    @button1-click="$emit('viewFolder')"
    @button2-click="$emit('close')"
    @close="$emit('close')"
  />
</template>

<script>
import { mapGetters } from 'vuex';

export default {

  props: {
    title: {
      type: String,
      default: 'Team',
    },
  },
  emits: ['viewFolder', 'close'],

  computed: {
    ...mapGetters('root', ['isDesktop']),
  },
};
</script>

<style lang="scss">
  .folders-container {
    scroll-behavior: smooth;
  }
</style>
