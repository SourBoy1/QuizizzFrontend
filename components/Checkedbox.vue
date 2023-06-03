<template>
  <div
    class="checkedbox flex items-center"
    :class="size"
    :style="accent === 'light' ? `--bg: ${colors.light.DEFAULT}; --fg: ${colors.lilac.DEFAULT}; --border: ${colors.dark['10%']};` : ''"
  />
</template>

<script>
import { colors } from '~/config/TailwindConstants.js';

export default {
  props: {
    size: {
      type: String,
      default: 'sm',
    },
    accent: {
      type: String,
      default: '',
    },
  },

  data() {
    return { colors };
  },
};
</script>

<style lang="scss" scoped>
@import '~/assets/scss/extends.scss';
/* label::before is the custom input box */
/* label::after is the custom check mark */
.checkedbox {
  &::before {
    content: '';
    position: relative;
    display: inline-block;
    border-radius: 2px;
    background: var(--bg);
    border: 1px solid var(--border);
  }
    &::after {
    content: '';
    position: absolute;
    border-left: 2px solid var(--fg);
    border-bottom: 2px solid var(--fg);
    height: 4px;
    width: 7.8px;
    transform: rotate(-45deg);
  }
}

/* md */
.checkedbox.md::before {
  width: 16px;
  height: 16px;
}
.checkedbox.md::after {
  left: 4px;
}

/* sm */
.checkedbox.sm::before {
  width: 12px;
  height: 12px;
}
.checkedbox.sm::after {
  top: 3px;
  left: 2px;
}
</style>
