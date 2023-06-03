<template>
  <Modal
    size="sm"
    title=""
    subtitle=""
    button1=""
    button2=""
    :showCloseModalBtn="false"
  >
    <div class="relative">
      <div class="mb-4 text-dark-2 font-semibold text-sm">
        <i18n>Switching to the old editor experience...</i18n>
      </div>

      <div class="relative w-8 h-8 left-1/2 transform -translate-x-1/2">
        <Loader :size="18" />
      </div>
    </div>
  </Modal>
</template>

<script>
export default {
  props: {

  },
};
</script>

<style lang="scss" scoped>
</style>
