<template>
  <div
    class="custom-response-controller mx-auto p-3 flex flex-col justify-between items-center bg-dark-20% border-2 border-light-10% rounded w-full md:px-4 md:border-super-40% md:rounded-lg md:py-2.5 md:my-4 md:mx-auto md:w-full"
  >
    <div class="w-full flex items-center mb-1">
      <div class="flex items-center md:flex-row-reverse">
        <SuperIcon
          :size="isDesktop ? 11 : 9"
        />
        <h3 class="font-bold text-xs text-light-3 ml-2 md:text-xl md:mr-2 md:ml-0">
          <i18n>Show your work</i18n>
        </h3>
      </div>
      <ForSuper
        :type="$constants.SuperUpsellTypes.CAN_SHOW_WORK"
        :feat="$constants.FeatureTypes.CAN_SHOW_WORK"
        class="ml-auto"
      >
        <Switchbox
          ref="switchbox"
          v-model="canSubmitCustomResponse"
          class="custom-response-toggler ml-4"
          :inputId="getUUID()"
          name="switches"
          aria-label="$i18n('Custom response')"
          size="md"
          theme="translucent"
        />
      </ForSuper>
    </div>
    <p class="w-full text-xxs text-light-50% md:text-base">
      <i18n :injections="[isCorporateUser ? 'Participants' : 'Students']">
        {$1} can upload images alongside their answers
      </i18n>
    </p>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

import { getUUID } from '~/services/UIDService.js';

export default {
  props: {
    receivedCanSubmitCustomResponse: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      canSubmitCustomResponse: false,
    };
  },

  computed: {
    ...mapGetters('root', ['isDesktop']),
    isCorporateUser() {
      return this.$user.isCorporate;
    },

    canAccessSuper() {
      return this.$user.isCorporate || this.$user.isSuper;
    },
  },

  watch: {
    canSubmitCustomResponse(newValue) {
      if (!this.canAccessSuper && newValue) {
        this.turnSwitchOff();
        return;
      }
      this.$store.dispatch('slideEditor/setCanSubmitCustomResponse', {
        canSubmitCustomResponse: newValue,
      });
      this.$store.dispatch('contentEditor/setQuizIsSuper');
    },
  },

  created() {
    // dummy - to start deployment again
    this.canSubmitCustomResponse = this.receivedCanSubmitCustomResponse;
  },

  methods: {
    getUUID() {
      return getUUID();
    },

    turnSwitchOff() {
      this.$refs.switchbox.uncheck();
      this.canSubmitCustomResponse = false;
    },
  },
};
</script>

<style scoped lang="scss">
.custom-response-controller {
  max-width: 600px;
}
</style>
