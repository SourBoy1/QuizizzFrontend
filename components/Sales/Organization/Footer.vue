<template>
  <footer class="fixed w-full bottom-0 bg-dark-6 py-4 px-16">
    <div class="footer-inner-container">
      <Button
        :title="$i18n('EXIT')"
        type="dark"
        @click="exit"
      />
      <div class="flex gap-x-3">
        <Button
          v-if="hasPrevState"
          title="PREV"
          type="primary"
          @click="onPreviousClick"
        />
        <Button
          v-if="hasNextState"
          :loading="isNextLoading"
          :title="$i18n('CONFIRM & NEXT')"
          type="primary"
          @click="onNextClick"
        />
        <Button
          v-if="isFinalState"
          :title="$i18n('SAVE')"
          type="primary"
          :loading="isFinalLoading"
          @click="onSave"
        />
      </div>
    </div>
  </footer>
</template>

<script>
import { mapGetters } from 'vuex';

import salesConstants from '~/config/Sales';

export default {
  emits: ['exit'],
  data() {
    return {
      planTypes: salesConstants.planTypes,
      isNextDisabled: false,
      // isConfirmBtnDisabled: false,
    };
  },

  computed: {
    ...mapGetters('orgDashboard', ['hasPrevState', 'hasNextState', 'isFinalState', 'isFinalLoading', 'isNextLoading']),
  },

  methods: {
    exit() {
      this.$emit('exit');
    },
    onPreviousClick() {
      this.$eventBus.$emit('orgDashboard:previousClick');
    },
    onNextClick() {
      this.$eventBus.$emit('orgDashboard:nextClick');
    },
    onSave() {
      this.$eventBus.$emit('orgDashboard:save');
    },
  },

};
</script>

<style lang="scss" scoped>
.footer-inner-container{
  @apply flex justify-between max-w-260 mx-auto;
}
</style>
