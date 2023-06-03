<template>
  <div class="bg-light-75% absolute h-full w-full z-10 flex flex-col justify-center items-center">
    <div class="bg-light-3 p-6 rounded shadow-sm border border-dark-6 w-116 mx-4 max-w-full">
      <div class="flex items-center mb-4">
        <div class="bg-lilac-faded rounded-full flex justify-center items-center min-h-10 min-w-10">
          <FA
            icon="far fa-user-lock"
            class="text-lilac"
            :size="18"
          />
        </div>
        <div class="mx-2">
          <div class="font-semibold text-base text-dark-2">
            <i18n>Want to keep using Quizizz?</i18n>
          </div>
          <div class="text-dark-4 text-xs">
            <i18n>Your trial expired but you can unlock your account by choosing the plan that’s right for you.</i18n>
          </div>
        </div>
      </div>
      <div class="flex items-center my-2 text-dark-4 text-xs">
        <FA
          icon="far fa-check"
          class="mr-2"
        />
        <i18n>Access your activities and reports.</i18n>
      </div>
      <div class="flex items-center my-2 text-dark-4 text-xs">
        <FA
          icon="far fa-check"
          class="mr-2"
        />
        <i18n>Create and host unlimited activities.</i18n>
      </div>
      <div class="flex items-center my-2 text-dark-4 text-xs">
        <FA
          icon="far fa-check"
          class="mr-2"
        />
        <i18n>Engage everyone, no matter where they are.</i18n>
      </div>
      <Button
        class="w-full mt-4"
        :title="$i18n('Continue')"
        ticon="far fa-arrow-right"
        @click="redirectToCorporatePricing"
      />
    </div>
    <div class="bg-light-3 p-6 rounded shadow-sm border border-dark-6 w-116 mx-4 max-w-full relative mt-12">
      <div class="flex justify-center items-center bg-dark-6 rounded-full h-14 w-14 absolute -top-6 left-50">
        <img
          src="https://cf.quizizz.com/img/marketing/annelise%20testimonial.png"
          alt="person"
          class="h-10 w-10 rounded-full"
        />
      </div>
      <div class="text-dark-2 text-sm my-2 text-center">
        <i18n>
          A member of our steering committee was skeptical at first.
          We took him through a demo quiz and at the end he said
        </i18n>
        <br />
        “<i18n>this is phenomenal</i18n>”
      </div>
      <div class="text-dark-3 text-xs text-center">
        ANNELISE EEMAN,<br />
        <i18n>Change Management Coordinator</i18n>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  emits: [],
  created() {
    this.$eventBus.$emit('sidebar:disable', true);
    this.$eventBus.$emit('mainHeaderSearchBar:disable', true);
  },

  methods: {
    redirectToCorporatePricing() {
      // this.$router.push('/forwork/plans?source=trial-expired');
      this.$eventBus.$emit('qfwPricingModal:show', { source: 'trial-expired' });
    },
  },
};
</script>
