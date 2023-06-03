<template>
  <div class="relative overflow-hidden">
    <div
      class="flex"
      :class="[isDesktop ? 'px-8' : 'justify-between px-2 w-full', addTopMargin ? 'pt-4' : '']"
    >
      <button
        v-for="(tab, index) in tabList"
        :ref="`tab-${index}`"
        :key="index"
        type="button"
        class="flex flex-col items-center justify-center font-semibold text-center cursor-pointer"
        :class="[
          inactiveTabClasses ? inactiveTabClasses : 'text-dark-4',
          {
            [`min-w-${tabMinWidth}`]: isDesktop,
            'flex-1': !isDesktop,
          }]"
        @click="selectCurrentTab(index)"
      >
        <span
          :class="[
            'my-2',
            index === finalValue ? (activeTabClasses ? activeTabClasses : 'text-lilac') : '',
            { 'text-xs': !isDesktop && !activeTabClasses && !inactiveTabClasses },
          ]"
        > <i18n :injections="[tab.title]">{$1}</i18n>
          {{ tabItemsTotalCountDisplay(tab.count) }}</span>
      </button>
    </div>
    <div
      ref="slider"
      :class="['absolute bottom-0 h-1 transition-all duration-200 ease-in-out', sliderClasses ? sliderClasses : 'bg-lilac']"
    />
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

import isEmpty from 'lodash/isEmpty';
import countBy from 'lodash/countBy';
import has from 'lodash/has';
import every from 'lodash/every';
import isNumber from 'lodash/isNumber';

export default {
  props: {
    tabList: {
      type: Array, // [{ title: String, queryParam: String, count: Number(default -1) }]
      required: true,
      validator: (tabList) => !isEmpty(tabList) && countBy(tabList, (val) => has(val, 'title')).true === tabList.length && every(tabList, (val) => has(val, 'count') && isNumber(val.count)),
    },

    value: {
      type: Number,
      default: 0,
    },

    modelValue: {
      type: Number,
      default: null,
    },

    tabMinWidth: {
      type: Number,
      default: 0,
    },

    sliderClasses: {
      type: String,
      default: '',
    },

    activeTabClasses: {
      type: String,
      default: '',
    },

    inactiveTabClasses: {
      type: String,
      default: '',
    },

    addTopMargin: {
      type: Boolean,
      default: true,
    },
  },
  emits: ['input', 'update:modelValue'],

  data() {
    return {
      sliderWidth: 0,
      paddingOffsetOnSlider: 0,
    };
  },

  computed: {
    ...mapGetters('root', ['deviceProps', 'isDesktop']),

    finalValue() {
      return this.modelValue ?? this.value;
    },

    deviceWidth() {
      return this.deviceProps.width;
    },
  },

  watch: {
    finalValue(newVal) {
      // Set slider's position with every value change
      if (this.$refs.slider) {
        this.$refs.slider.style.left = `${this.sliderWidth * newVal + this.paddingOffsetOnSlider}px`;
      }
    },

    deviceWidth() {
      this.setSliderDimensionAndPosition();
    },
  },

  mounted() {
    this.setSliderDimensionAndPosition();
  },

  methods: {
    tabItemsTotalCountDisplay(count) {
      if (count < 0) {
        return '';
      }
      return `(${count})`;
    },

    setSliderDimensionAndPosition() {
      this.paddingOffsetOnSlider = this.isDesktop ? 32 : 8;

      // Set slider's width and initial position
      this.sliderWidth = this.$refs[`tab-${this.finalValue}`][0].clientWidth; // All tabs have same width

      if (this.$refs.slider) {
        this.$refs.slider.style.width = `${this.sliderWidth}px`;
        this.$refs.slider.style.left = `${this.sliderWidth * this.finalValue + this.paddingOffsetOnSlider}px`;
      }
    },

    selectCurrentTab(index) {
      if (this.finalValue !== index) {
        this.$emit('update:modelValue', index);
        this.$emit('input', index);
      }
    },
  },
};
</script>
