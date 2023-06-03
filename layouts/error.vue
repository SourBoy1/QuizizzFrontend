<template>
  <Error404
    v-if="error.statusCode === 404"
    :error="error"
  />
  <ErrorDefault
    v-else
    :error="error"
  />
</template>

<script>
// This file is recommended way of handling errors, In case of any unhandled error is encountered then this layout will show up. Also other functionality like logToSentry etc should be added in future.
export default {
  props: {
    error: {
      type: Object,
      required: true,
    },
  },

  methods: {

  },
};
</script>

<style scoped lang="scss">

</style>
