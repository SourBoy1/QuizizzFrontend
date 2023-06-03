<template>
  <div class="w-full">
    <slot
      v-if="isDesktop || forceShowDesktop"
      name="desktop"
    />
    <slot
      v-else
      name="mobile"
    />
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  props: {
    forceShowDesktop: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['deviceTypeChanged'],

  computed: {
    ...mapGetters('root', ['deviceProps', 'isDesktop']),

    deviceType() {
      return this.deviceProps.type;
    },
  },

  watch: {
    deviceType(newVal, oldVal) {
      this.$emit('deviceTypeChanged');
    },
  },
};
</script>
