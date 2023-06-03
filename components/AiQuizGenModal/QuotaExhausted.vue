<template>
  <transition
    appear
    enter-active-class="animate__animated animate__zoomIn animation-duration-300"
    leave-active-class="animate__animated animate__zoomOut animation-duration-200"
  >
    <div>
      <div class="icon flex justify-center">
        <Lottie
          src="https://cf.quizizz.com/animations/lottie/charging_robot.json"
          :loop="true"
          class="h-56"
        />
      </div>
      <div class="description text-center">
        <div class="title font-bold text-2xl text-dark-2">
          <i18n>You’ve exceeded your limit</i18n>
        </div>
        <div class="subtitle mt-2 text-dark-3 max-w-[516px]">
          <i18n :injections="[dailyLimit]">
            You can only use this feature {$1} times per week. Come back again on
          </i18n>
          <span class="font-semibold">{{ quotaRenewalDate }}</span>
          <i18n> to start using again</i18n> :)
        </div>
      </div>
      <Button
        type="primary"
        size="lg"
        class="mt-8 mx-auto"
        :title="$i18n('CREATE QUIZ WITHOUT AI')"
        @click="$emit('createManual')"
      />
    </div>
  </transition>
</template>

<script>
export default {
  props: {
    dailyLimit: {
      type: Number,
      default: 5,
    },
    quotaRenewalDate: {
      type: Date,
      default: '',
    },
  },
  emits: ['createManual'],
};
</script>
