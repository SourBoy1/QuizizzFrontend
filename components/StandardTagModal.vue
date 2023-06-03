<template>
  <div>
    <div class="close-btn z-10 absolute top-2 right-3">
      <Button
        type="transparent-floating-dark"
        size="sm"
        rounded="full"
        ticon="far fa-times"
        :aria-label="$i18n('Close')"
        @click="onCloseClick"
      />
    </div>
    <div class="flex">
      <div class="mt-1">
        <i18n>Tag this question with a Standard to get more detailed reporting</i18n>
        <div class="font-normal mt-1 cursor-pointer w-fit">
          <i18n>Learn More</i18n>
        </div>
      </div>
      <img
        src="https://cf.quizizz.com/image/Data_Graph_Polls.png"
        width="100"
        height="100"
      />
    </div>
    <div class="absolute w-0 h-0 border-t-[13px] border-t-transparent  border-b-transparent border-r-[11px] right-[100%] top-[56%] translate-y-[-50%] border-r-lilac-faded" />
  </div>
</template>
<script>
export default {
  emits: ['onCloseClick'],

  methods: {
    onCloseClick() {
      this.$emit('onCloseClick');
    },
  },
};
</script>
