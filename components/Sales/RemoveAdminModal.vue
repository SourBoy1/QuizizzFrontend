<template>
  <Modal
    title="Confirm Removal"
    subtitle=""
    size="md"
    :button1="{
      title: $i18n('Cancel'),
      type: 'transparent-floating-dark',
    }"
    :button2="{
      title: $i18n('Remove member'),
      type: 'danger',
    }"
    @close="$emit('close')"
    @button1-click="$emit('close')"
    @button2-click="handleRemoveAdmin"
  >
    <div class="h-14 flex align-center justify-center">
      <p class="text-base">
        {{ $i18n("Are you sure you want to remove {$1} from your organization?", [email]) }}
      </p>
    </div>
  </Modal>
</template>

<script>
import salesService from '~/services/apis/SalesService.js';

export default {

  props: {
    email: {
      type: String,
      default: 'test@mail.com',
    },
  },
  emits: ['close'],

  data() {
    return {
    };
  },

  methods: {
    handleRemoveAdmin() {
      this.$emit('close');
    },
  },
};
</script>

<style scoped></style>
