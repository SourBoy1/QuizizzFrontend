<template>
  <div
    :class="['tabs flex relative', {
      'overflow-x-auto': isMobile,
      'bg-light': isMobile && !transparentBg,
      'border-b border-dark-6': showTabBorders,
    }]"
  >
    <div
      v-for="(tab, ind) in tabs"
      :ref="`tab-${ind}`"
      :key="ind"
      :class="[
        'relative flex-grow basis-0 font-semibold cursor-pointer text-center',
        tabPadding,
        tabFontSize,
        {
          'whitespace-nowrap': isMobile,
          'border-l border-dark-6': showTabBorders && ind,
          'font-semibold text-dark-5 cursor-not-allowed': isTabDisabled(ind),
        },
        useCustomColor ? `text-${getColor(ind)}` : 'text-dark-4',
        isSelected(ind) ? `text-${getColor(ind)}` : '',
      ]"
      @click="selectTab(ind)"
    >
      <FA
        v-if="tab.icon"
        class="mr-1"
        :icon="tab.icon"
        :size="iconSize"
      />
      <span>{{ tab.title }}</span>
      <span
        v-if="showLozenge(ind)"
        class="text-tn rounded-lg bg-red text-light-2 px-1 py-0.5 ml-2"
      >{{ tab.lozengeTitle }}</span>
    </div>
    <div
      ref="slider"
      :class="[
        `absolute bottom-0 transition-all duration-200 ease-in-out bg-${sliderColor} flex justify-center`,
        sliderHeight,
      ]"
    >
      <div
        v-if="showSliderArrow"
        :class="`arrow w-3 border-t-[12px] border-l-8 border-r-8 border-transparent border-t-${sliderColor}`"
      />
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import get from 'lodash/get';

export default {
  props: {
    tabs: {
      type: Array,
      default: () => [
        {
          title: 'Parent Reports',
          name: 'parent_reports',
          lozengeTitle: 'NEW',
          // icon: 'fas fa-circle-check'
          // color: 'lilac', // mention when want to use customColor for different tabs (with useCustomColor = true)
        },
        {
          title: 'Parent Reports',
          name: 'parent_reports',
          lozengeTitle: 'NEW',
          // icon: 'fas fa-circle-check'
          // color: 'dark-3', // mention when want to use customColor for different tabs (with useCustomColor = true)
        },
        {
          title: 'Parent Reports',
          name: 'parent_reports',
          lozengeTitle: 'NEW',
          // icon: 'fas fa-circle-check'
          // color: 'dark-50%', // mention when want to use customColor for different tabs (with useCustomColor = true)
        },
      ],
    },

    value: { // selected tab
      type: Number,
      default: 0,
    },
    fontSize: {
      type: String,
      default: '',
    },
    sliderHeight: {
      type: String,
      default: 'h-1',
    },
    sliderClasses: {
      type: String,
      default: '',
    },
    showSliderArrow: {
      type: Boolean,
      default: false,
    },
    showTabBorders: {
      type: Boolean,
      default: false,
    },
    tabPadding: {
      type: String,
      default: 'px-6 py-2',
    },
    activeColor: {
      type: String,
      default: 'lilac', // use: text-${activeColor}, bg-${activeColor}, border-${activeColor}
    },
    activeColorForMobile: {
      type: String,
      default: 'lilac-dark', // use: text-${activeColor}, bg-${activeColor}, border-${activeColor}
    },
    iconSize: {
      type: Number,
      default: 16,
    },
    useCustomColor: {
      type: Boolean,
      default: false,
    },
    transparentBg: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['input'],

  data() {
    return {
      sliderWidth: 0,
      sliderColor: 'lilac',
    };
  },

  computed: {
    ...mapGetters('root', ['deviceProps', 'isMobile']),

    deviceWidth() {
      return this.deviceProps.width;
    },

    tabFontSize() {
      return this.isMobile ? 'text-xs' : this.fontSize;
    },
  },

  watch: {
    value(newVal) {
      // Set slider's position with every value change
      if (this.$refs.slider) {
        this.setSliderDimensionAndPosition();
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
    getColor(index) {
      if (!this.useCustomColor) {
        return this.isMobile ? this.activeColorForMobile : this.activeColor;
      }

      return this.tabs[index]?.color || this.activeColor;
    },

    isSelected(index) {
      return this.value === index;
    },

    isTabDisabled(index) {
      return get(this.tabs[index], 'disabled', false);
    },

    showLozenge(index) {
      return get(this.tabs[index], 'lozengeTitle', '');
    },

    setSliderDimensionAndPosition() {
      // Set slider's width and initial position
      const firstTabElement = this.$refs[`tab-${0}`][0];
      const activeTabElement = this.$refs[`tab-${this.value}`][0];

      const tabX = activeTabElement.getBoundingClientRect().x;
      const firstTabX = firstTabElement.getBoundingClientRect().x;

      this.sliderWidth = activeTabElement.clientWidth; // All tabs have same width
      this.sliderColor = this.getColor(this.value);

      if (this.$refs.slider) {
        this.$refs.slider.style.width = `${this.sliderWidth}px`;
        this.$refs.slider.style.left = `${tabX - firstTabX}px`;
      }
    },

    selectTab(index) {
      if (this.value === index || this.isTabDisabled(index)) { return; }

      this.$emit('input', {
        index,
        name: get(this.tabs[index], 'name', ''),
      });
    },
  },
};
</script>

<style lang="scss" scoped>
// Hide scrollbar
.tabs::-webkit-scrollbar {
  display: none;
}

.tabs {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
