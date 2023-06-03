<template>
  <div class="flex justify-between items-center pb-3">
    <TemplateHeaderPencil @click="$emit('template-toggled')" />
    <span class="text-light-3 font-bold text-base"><i18n>Pick a template</i18n></span>
    <Button
      type="dark"
      licon="fas fa-chevrons-left"
      size="xs"
      @click="$emit('template-toggled')"
    />
  </div>
</template>

<script>
import TemplateHeaderPencil from './TemplateHeaderPencil.vue';

export default {

  components: {
    TemplateHeaderPencil,
  },
  emits: ['template-toggled'],
};
</script>
