<template>
  <PopoverInfo
    trigger="hover"
    :placement="placement"
  >
    <FA
      icon="far fa-circle-question"
      :size="iconSize"
      :class="iconClasses"
    />
    <template #popover-content>
      <div class="popover-info relative p-4 w-80 h-72">
        <p class="font-semibold text-dark-2 text-sm">
          <i18n>What is math equivalence?</i18n>
        </p>
        <p class="text-xs">
          <i18n>If the student’s response is equivalent to your answer, it will be marked as correct.</i18n>
        </p>
        <br>
        <p class="text-xs text-dark-4">
          <i18n>For e.g. 1½, 3/2, 1.5 are all correct.</i18n>
        </p>
        <br>
        <p class="text-xs text-dark-4">
          <i18n>Similarly each of these would be marked correct</i18n>
          <ul class="ml-5">
            <li>(x-5)(x-5)</li>
            <li>(x-5)²</li>
            <li>x² - 10x + 25</li>
          </ul>
        </p>

        <br>
        <p class="text-dark-4 font-bold text-xs">
          <i18n>If you turn off mathematical equivalence students will have to enter the EXACT response.</i18n>
        </p>
      </div>
    </template>
  </PopoverInfo>
</template>

<script>
export default {

  props: {
    placement: {
      type: String,
      default: 'auto',
      validator: (val) => (['auto', 'auto-start', 'auto-end', 'top', 'top-start', 'top-end', 'right', 'right-start', 'right-end', 'bottom', 'bottom-start', 'bottom-end', 'left', 'left-start', 'left-end']).includes(val),
    },

    iconSize: {
      type: Number,
      default: 12,
    },

    iconClasses: {
      type: String,
      default: '',
    },
  },
};

</script>
