<template>
  <footer class=" fixed w-full bottom-0 bg-purple flex justify-between py-4 px-16">
    <Button
      :title="$i18n('EXIT')"
      type="secondary"
      @click="exit"
    />
    <div class="flex gap-x-3">
      <Button
        v-if="newSubStepIndex > 0"
        :title="$i18n('PREV')"
        type="primary"
        @click="onPreviousClick"
      />
      <Button
        v-if="newSubStepIndex < 2 && !(newSubStepIndex === 1 && isInternationalOrMisc)"
        :title="$i18n('NEXT')"
        type="primary"
        :disabled="!newSubStepsCompleted"
        @click="onNextClick"
      />
      <Button
        v-if="newSubStepIndex === 2 || (newSubStepIndex === 1 && isInternationalOrMisc)"
        :title="$i18n('CONFIRM')"
        type="primary"
        :disabled="!newSubStepsCompleted"
        @click="onConfirm"
      />
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
    ...mapGetters('sales', ['newSubStepsCompleted', 'newSubStepIndex', 'pickedPlanType']),
    isInternationalOrMisc() {
      return this.pickedPlanType === this.planTypes['K-12'].INTERNATIONAL || this.pickedPlanType === this.planTypes.Others.MISC;
    },
  },

  mounted() {
    this.$eventBus.$on('schoolUnlinked', this.schoolUnlinked);

    this.$eventBus.$on('schoolLinked', this.schoolLinked);

    this.$eventBus.$on('warningChecked', this.warningChecked);
    // this.$eventBus.$on('errorMessageCheck', this.handleErrorMessageCheck);
  },

  beforeUnmount() {
    this.$eventBus.$off('schoolUnlinked', this.schoolUnlinked);

    this.$eventBus.$off('schoolLinked', this.schoolLinked);

    this.$eventBus.$off('warningChecked', this.warningChecked);
    // this.$eventBus.$off('errorMessageCheck', this.handleErrorMessageCheck);
  },

  methods: {
    exit() {
      this.$emit('exit');
    },
    onPreviousClick() {
      this.$eventBus.$emit('sales:previousClick');
    },
    onNextClick() {
      this.$eventBus.$emit('sales:nextClick');
    },
    onConfirm() {
      this.$eventBus.$emit('sales:confirm');
    },
    schoolLinked() {
      this.isNextDisabled = false;
    },
    schoolUnlinked() {
      if ([this.planTypes['K-12'].SCHOOL, this.planTypes['K-12'].DEPARTMENT].includes(this.pickedPlanType)) {
        this.isNextDisabled = true;
      }
    },

    warningChecked(val) {
      this.isNextDisabled = !val;
    },
    // handleErrorMessageCheck (msg) {
    //   this.isConfirmBtnDisabled = msg.length > 0;
    // },
  },

};
</script>

<style lang="scss" scoped>
</style>
