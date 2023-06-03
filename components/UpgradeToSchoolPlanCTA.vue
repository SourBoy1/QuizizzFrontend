<template>
  <div class="rounded bg-violet-faded p-2.5 mt-1">
    <div class="mb-1.5 flex items-center justify-center">
      <img src="https://cf.quizizz.com/image/School Icon_v2 (1) 1.png" />
      <p class="font-bold text-violet text-[13px] leading-4 ml-1.5">
        {{ getHeader }}
      </p>
    </div>
    <p class="text-dark-50% text-[10px]">
      <span class="">
        {{ getBody }}
      </span>
      <span
        class="font-bold text-violet cursor-pointer"
        @click="handleCTAClick"
      >
        Quizizz for Schools
        <FA
          icon="far fa-angle-right"
          class="text-lilac align-middle"
        />
      </span>
    </p>
  </div>
</template>

<script>

export default {

  props: {
  },

  computed: {
    getHeader() {
      return this.$i18n('Upgraded out of pocket?');
    },

    getBody() {
      return this.$i18n('Upgrade every teacher and get 100% reimbursement with');
    },
  },

  methods: {
    handleCTAClick() {
      const eventName = this.$webEvents.HOME_PAGE_TO_SCHOOL_PRICING_PAGE;
      this.$analytics.logEvent(eventName, {
        userId: this.$user.id,
      });
      this.$router.push('/school-pricing?source=nav');
    },
  },
};
</script>
