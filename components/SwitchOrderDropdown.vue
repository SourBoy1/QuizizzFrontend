<template>
  <div class="switch-order-dropdown">
    <SelectBox
      v-model="selectedOrder"
      :direction="direction"
      :list="orderList"
      :showFixedPositionList="false"
      @input="$emit('onOrderSwitch', selectedOrder)"
    >
      <template
        #button="{
          toggleOpen, selectPrevious, selectNext, close, buttonId, ariaexpanded, ariahaspopup, arialabelledby, ...rest
        }"
      >
        <Button
          v-bind="rest"
          :id="buttonId"
          v-tooltip="{ content: $i18n('Set order of options') }"
          type="dark"
          class="dropdown-button w-full pl-2 pr-2 rounded"
          :licon="isContainingDeviceDesktop ? 'fas fa-signal-alt' : ''"
          ticon="fas fa-sort-down"
          ticonClasses="ml-auto"
          :title="selectedOrder === 'asc' ? $i18n('Ascending') : $i18n('Descending')"
          :aria-labelledby="arialabelledby"
          :aria-expanded="ariaexpanded"
          :aria-haspopup="ariahaspopup"
          :titleClasses="!isContainingDeviceDesktop ? 'w-full text-center' : ''"
          @click="toggleOpen"
          @keyup.up="selectPrevious"
          @keyup.down="selectNext"
          @blur="close"
          @keyup.esc="close"
        />
      </template>
    </SelectBox>
  </div>
</template>

<script>
import Constants from '~/config/Constants';

export default {

  props: {
    defaultValue: {
      type: String,
      default: Constants.OrderQuestionArrangement.ASC,
    },

    direction: {
      type: String,
      default: 'top',
    },

    forDevice: {
      type: String,
      default: Constants.DeviceTypes.DESKTOP,
    },
  },
  emits: ['onOrderSwitch'],

  data() {
    return {
      selectedOrder: 'asc',
      orderList: [
        {
          title: this.$i18n('Ascending'),
          value: 'asc',
        },
        {
          title: this.$i18n('Descending'),
          value: 'desc',
        },
      ],
    };
  },

  computed: {
    isContainingDeviceDesktop() {
      return this.forDevice === Constants.DeviceTypes.DESKTOP;
    },
  },

  created() {
    this.selectedOrder = this.defaultValue;
  },
};
</script>

<style lang="scss" scoped>
.dropdown-button{
  justify-content: start !important;
}
</style>
