<template>
  <Modal
    v-if="shouldShow"
    title=""
    subtitle=""
    :button2="null"
    :button1="null"
    :shouldCloseOnMaskClick="true"
    :zeroPadding="true"
    modalDataCy="super-upsell-modal"
    :hideHeader="true"
    containerClasses="max-w-qmd super-upsell z-10 p-0"
    closeBtnClasses="text-dark-4 text-base"
    :stickToBottom="isMobile"
    backgroundColor="bg-light-3"
    :zeroContentMargin="true"
    :showFooter="false"
    :fixedHeight="false"
    @close="close"
  >
    <div
      v-click-outside="() => onOutsideClicked()"
      class="p-4"
    >
      <ReferralProgramWrapper
        :feat="feat"
        :options="options"
        @close="close"
      />
    </div>
  </Modal>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

import SuperUpsell from '~/utils/SuperUpsellUtils';
import referralMixin from '~/mixins/referralMixin';

export default {

  mixins: [referralMixin],
  emits: [],

  data() {
    return {
      feat: '',
      options: {},
      shouldShow: false,
    };
  },

  computed: {
    ...mapGetters('root', ['deviceProps', 'isDesktop']),

    isMobile() {
      return this.deviceProps.type === this.$constants.DeviceTypes.PHONE;
    },
  },

  watch: {
    plan() {
      this.updatePlans({
        plan: this.plan,
        plans: this.allPlans,
      });
    },
  },

  mounted() {
    this.$eventBus.$on('superUpsellReferral:show', this.show);
  },

  beforeUnmount() {
    this.$eventBus.$off('superUpsellReferral:show', this.show);
  },

  methods: {
    ...mapActions('products', ['updatePlans']),

    onOutsideClicked() {
      this.close();
    },

    show({ type, options = {} }) {
      this.feat = options.feat;
      this.options = SuperUpsell.getOptions(type, options);
      this.shouldShow = true;
      this.$analytics.logEvent(this.$webEvents.REFERRAL_SUPER_UPSELL_SHOWN, options);
    },

    close() {
      this.feat = '';
      this.options = {};
      this.shouldShow = false;
      this.$eventBus.$emit('superUpsell:dismiss');
    },
  },
};
</script>

<style scoped lang="scss">
  :deep() {
    .close-btn {
      color: #6D6D6D;
    }
    .footer {
      display: none;
    }
    .super-upsell {
      height: auto;
    }
  }
  .bg-refer-btn {
    background-color: #9A4292;
  }
  .slick-slider {
    .slick-arrow {
      @apply top-1.5 absolute leading-5 cursor-pointer;

      &::before {
        @apply text-light px-1 py-0.5 rounded-lg bg-super;
      }

      &.slick-prev {
        @apply z-1;
      }
    }
  }

  .slick-prev:hover,
  .slick-prev:focus,
  .slick-next:hover,
  .slick-next:focus {
    color: transparent;
    outline: none;
    background: transparent;
  }
  .slick-prev:hover:before,
  .slick-prev:focus:before,
  .slick-next:hover:before,
  .slick-next:focus:before {
    opacity: 1;
  }
  .slick-prev.slick-disabled:before,
  .slick-next.slick-disabled:before {
    @apply hidden;
  }

  .slick-prev {
    left: -25px;
  }
  [dir='rtl'] .slick-prev {
    right: -25px;
    left: auto;
  }
  .slick-next {
    right: -25px;
  }
  [dir='rtl'] .slick-next {
    right: auto;
    left: -25px;
  }
</style>
