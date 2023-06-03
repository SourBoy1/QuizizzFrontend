<template>
  <Button
    class="bg-transparent"
    type="dark"
    size="sm"
    rounded="full"
    @click="$emit('click')"
  >
    <template #title>
      <img
        src="https://cf.quizizz.com/image/template-pencil.jpg"
        class="h-6 w-6 rounded-full"
      >
    </template>
  </Button>
</template>

<script>
export default {

  emits: ['click'],
};
</script>
