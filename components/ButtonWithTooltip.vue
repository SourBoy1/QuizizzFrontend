<template>
  <Tooltip
    v-bind="tooltipProps"
    @tooltipClicked="onTooltipClick"
  >
    <Button
      v-bind="{ ...$props }"
      @click="$emit('click')"
    />
  </Tooltip>
</template>

<script>
import has from 'lodash/has';

import Button from './Button.vue';

export default {

  props: {
    ...Button.props,

    tooltip: {
      type: Object,
      required: true,
      validator: (val) => has(val, 'text'),
    },
  },
  emits: ['tooltipClicked', 'click'],

  computed: {
    tooltipProps() {
      return {
        ...this.tooltip,
      };
    },
  },

  methods: {
    onTooltipClick(...args) {
      this.$emit('tooltipClicked', ...args);
    },
  },
};
</script>
