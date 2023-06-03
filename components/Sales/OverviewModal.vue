<template>
  <Modal
    size="lg"
    :title="$i18n('{$1}', [title])"
    subtitle=""
    @close="$emit('close')"
  >
    <div>
      <SalesDivider class="m-0-important" />
      <SalesOverview
        :details="details"
        :isModal="true"
      />
    </div>
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
    details: {
      type: Array,
      default: () => [],
    },
  },
  emits: ['close'],
};
</script>
