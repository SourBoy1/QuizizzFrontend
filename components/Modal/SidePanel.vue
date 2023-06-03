<template>
  <div
    class="side-panel absolute left-full top-0 h-full flex items-center"
    @click.stop
  >
    <div class="bg-light-2 w-72 p-6 rounded-r-lg">
      <slot />
    </div>
  </div>
</template>

<script>
export default {

};
</script>

<style lang="scss" scoped>
.side-panel {
  z-index: 10001;
}
</style>
