<template>
  <div
    ref="toggleContainer"
    class="mb-2 absolute"
    :class="[
      isDesktop && !forPreview ? '-top-10 w-full' : 'right-1 top-1',
    ]"
    @click.stop
  >
    <div class="flex items-center justify-center">
      <div
        class="flex items-center justify-between bg-light-20% py-2 px-1 rounded relative"
        :class="[isDesktop ? 'h-9' : 'h-8']"
      >
        <div
          class="flex items-center cursor-pointer"
          :class="
            [
              isDegreeSelected ? `rounded ${isDesktop ? 'h-7' : 'h-6'} bg-light justify-between` : `${isDesktop ? 'h-7' : 'h-5'} rounded-l justify-center`,
              isDesktop ? 'w-20 px-2 py-1' : 'w-14 px-1 py-0',
              isRadianSelected ? 'translate-x-full' : '',
              {
                'text-xs': !isDesktop,
              },
            ]
          "
          @click="toggleAngleMode($constants.AngleMode.DEGREE)"
        />
        <div
          class="absolute flex items-center cursor-pointer "
          :class="[isDesktop ? 'w-20' : 'w-14', isDegreeSelected ? 'justify-evenly' : 'justify-center', {
            'text-xs': !isDesktop,
          }]"
          @click="toggleAngleMode($constants.AngleMode.DEGREE)"
        >
          <FA
            v-if="isDegreeSelected"
            icon="fa-solid fa-grip-lines-vertical"
            class="text-dark-20%"
          />
          <span
            :class="[
              isDegreeSelected ? 'text-dark-3' : 'text-light-3',
            ]"
          >
            Deg <sup><span>&#176;</span></sup>
          </span>
          <FA
            v-if="isDegreeSelected"
            icon="fa-solid fa-grip-lines-vertical"
            class="text-dark-20%"
          />
        </div>
        <div
          class="flex items-center px-2 py-1 cursor-pointer"
          :class="
            [
              isRadianSelected ? `rounded ${isDesktop ? 'h-7' : 'h-6'} bg-light justify-between` : `${isDesktop ? 'h-7' : 'h-5'} rounded-r justify-center`,
              isDesktop ? 'w-20 px-2 py-1' : 'w-14 px-1 py-0',
              {
                'text-xs': !isDesktop,
              },
            ]
          "
          @click="toggleAngleMode($constants.AngleMode.RADIAN)"
        />
        <div
          class="absolute flex items-center right-1 cursor-pointer"
          :class="[isDesktop ? 'w-20' : 'w-14', isRadianSelected ? 'justify-evenly' : 'justify-center', {
            'text-xs': !isDesktop,
          }]"
          @click="toggleAngleMode($constants.AngleMode.RADIAN)"
        >
          <FA
            v-if="isRadianSelected"
            icon="fa-solid fa-grip-lines-vertical"
            class="text-dark-20%"
          />
          <span
            :class="[
              isRadianSelected ? 'text-dark-3' : 'text-light-3',
              {
                'text-xs': !isDesktop,
              },
            ]"
          >
            Rad
          </span>
          <FA
            v-if="isRadianSelected"
            icon="fa-solid fa-grip-lines-vertical"
            class="text-dark-20%"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

import Constants from '~/config/Constants';

export default {

  props: {
    selectedAngleMode: {
      type: String,
      default: 'degree',
    },

    toggleAngleMode: {
      type: Function,
      default: () => {},
    },

    forPreview: {
      type: Boolean,
      default: false,
    },
  },

  computed: {
    ...mapGetters('root', ['deviceProps', 'isDesktop']),
    isDegreeSelected() {
      return this.selectedAngleMode === Constants.AngleMode.DEGREE;
    },

    isRadianSelected() {
      return this.selectedAngleMode === Constants.AngleMode.RADIAN;
    },
  },
};
</script>

<style lang="scss" scoped>
</style>
