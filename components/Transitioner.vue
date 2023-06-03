<template>
  <div
    class="transitioner"
    v-on="allEventsToBindToParent"
  >
    <template v-if="keepAliveComponents">
      <transition
        :name="currentTransitionName"
        :mode="transitionMode"
        :appear="appear"
        v-on="allEventsToBindToTransition"
      >
        <keep-alive>
          <component :is="componentToRender" />
        </keep-alive>
      </transition>
    </template>

    <template v-else>
      <transition
        :name="currentTransitionName"
        :mode="transitionMode"
        :appear="appear"
        v-on="allEventsToBindToTransition"
      >
        <component :is="componentToRender" />
      </transition>
    </template>
  </div>
</template>

<script>
import includes from 'lodash/includes';
import pick from 'lodash/pick';
import reduce from 'lodash/reduce';
import pickBy from 'lodash/pickBy';
import isEmpty from 'lodash/isEmpty';
import forEach from 'lodash/forEach';
import isNaN from 'lodash/isNaN';
import findIndex from 'lodash/findIndex';
import range from 'lodash/range';

import QLogger from '../services/QLogger';

/**
 * NOTE:- Some of the following transitions has been commented because these transitions are not being used anywhere.
 * Please uncomment when these transitions start getting used somewhere
 */
export const TransitionsList = {
  NONE: 'none',
  FADE_IN: 'fadeIn',
  ZOOM_IN: 'zoomIn',
  SLIDE_HORIZONTALLY_FORWARD: 'slideHorizontallyForward',
  SLIDE_HORIZONTALLY_BACKWARD: 'slideHorizontallyBackward',
  Q_FADE_SCALE_LEFT: 'qFadeScaleLeft',
  Q_FADE_SCALE_RIGHT: 'qFadeScaleRight',
};

const TransitionsMode = {
  // [ TransitionsList.FLIP_CARD_FORWARD ]: 'out-in',
  // [ TransitionsList.FLIP_CARD_BACKWARD ]: 'out-in',
};

const TransitionerItemKey = {
  PREFIX: 'transitionerItem',
  DELIMITER: '_',
  WHEN_SAME_COMPONENT: 'transitionerCommonItem',
};

const VueTransitionElementEvents = ['before-enter', 'before-leave', 'before-appear', 'enter', 'leave', 'appear', 'after-enter', 'after-leave', 'after-appear', 'enter-cancelled', 'leave-cancelled', 'appear-cancelled'];

export default {

  props: {
    keepAliveComponents: {
      type: Boolean,
      default: false,
    },
    areAllItemsSameComponent: {
      type: Boolean,
      default: false,
    },
    areItemsCyclic: {
      type: Boolean,
      default: false,
    },

    maxItems: {
      type: Number,
      required: true,
    },
    visibleItemNumber: {
      type: Number,
      required: true,
    },
    forwardTransition: {
      type: String,
      required: true,
      validator: (val) => includes(TransitionsList, val),
    },

    backwardTransition: {
      type: String,
      default: TransitionsList.NONE,
      validator: (val) => includes(TransitionsList, val),
    },

    appear: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      itemIndexToShow: this.visibleItemNumber,
      currentTransitionName: this.forwardTransition,
    };
  },

  computed: {
    transitionMode() {
      return TransitionsMode[this.currentTransitionName] || '';
    },

    componentToRender() {
      const keyDetails = this.getKeyDetailsForSlotItem(this.itemIndexToShow);

      QLogger.invariant(keyDetails.isValid, `Transitioner: no valid slot item for visibleItemNumber (${this.itemIndexToShow}). Falling back to itemNumber (${this.previousItemIndexToShow})`);

      const itemIndexToUse = keyDetails.isValid ? this.itemIndexToShow : this.previousItemIndexToShow;
      const keyToUse = keyDetails.isValid ? keyDetails.key : this.getKeyDetailsForSlotItem(itemIndexToUse).key;
      const activeComp = this.$slots[keyToUse]?.()[0] ?? {};
      const componentCurrentKey = activeComp.key || '';

      activeComp.key = `${componentCurrentKey}_item_${itemIndexToUse}`;

      return {
        functional: true,
        render: () => activeComp,
      };
    },

    allEventsToBindToTransition() {
      const listenersToBind = pick(this.$attrs, VueTransitionElementEvents);

      return reduce(listenersToBind, (result, handler, eventName) => {
        result[eventName] = handler.bind(null, this.visibleItemNumber);

        return result;
      }, {});
    },

    allEventsToBindToParent() {
      return pickBy(this.$attrs, (eventHandler, eventName) => !includes(VueTransitionElementEvents, eventName));
    },
  },

  watch: {
    visibleItemNumber(newVal, oldVal) {
      const isValidVisibleItem = newVal <= this.maxItems && newVal >= 1;

      QLogger.invariant(isValidVisibleItem, `Transitioner: Invalid visibleItemNumber set as ${newVal} whereas it should be b/w 1 & ${this.maxItems}`);

      const animDirection = animationDirection(oldVal, newVal, this.maxItems, this.areItemsCyclic);

      if (animDirection === 'forward') {
        this.currentTransitionName = this.forwardTransition;
      } else {
        this.currentTransitionName = this.backwardTransition;
      }

      this.previousItemIndexToShow = this.itemIndexToShow;
      this.itemIndexToShow = newVal;
    },

    maxItems(newVal, oldVal) {
      this.$nextTick(() => {
        validateTransitionerSlots(this.$slots, newVal, this.areAllItemsSameComponent, this.itemIndexToShow);
      });
    },
  },

  created() {
    this.itemIndexToShow = this.visibleItemNumber;
    this.previousItemIndexToShow = 0;
  },

  mounted() {
    validateTransitionerSlots(this.$slots, this.maxItems, this.areAllItemsSameComponent, this.itemIndexToShow);
  },

  methods: {
    getKeyDetailsForSlotItem(itemIndexToShow = this.itemIndexToShow, areAllItemsSameComponent = this.areAllItemsSameComponent) {
      let key = '';

      if (areAllItemsSameComponent) {
        key = TransitionerItemKey.WHEN_SAME_COMPONENT;
      } else {
        key = `${TransitionerItemKey.PREFIX}${TransitionerItemKey.DELIMITER}${itemIndexToShow}`;
      }

      if (!key || isEmpty(this.$slots[key])) {
        return { isValid: false, key };
      }

      return { isValid: true, key };
    },
  },
};

// Helper Functions
function animationDirection(currentItemNumber, nextItemNumber, maxItems, areItemsCyclic) {
  if (!areItemsCyclic) {
    return (nextItemNumber - currentItemNumber) > 0 ? 'forward' : 'backward';
  }

  const cycle = getRoundRobinCycle(currentItemNumber, maxItems);
  const indexOfCurrentItem = findIndex(cycle, (num) => num === currentItemNumber);
  const indexOfNextItem = findIndex(cycle, (num) => num === nextItemNumber);

  if (cycle.length <= 2) {
    return 'forward';
  }

  return (indexOfNextItem - indexOfCurrentItem) > 0 ? 'forward' : 'backward';
}

function getRoundRobinCycle(currentItemNumber, maxItems) {
  const cycle = range(1, maxItems + 1);
  const indexOfMiddle = Math.ceil((maxItems - 1) / 2);
  const indexOfCurrentItem = currentItemNumber - 1;
  const diffInMiddleAndCurrent = indexOfMiddle - indexOfCurrentItem;

  for (let i = 0; i < Math.abs(diffInMiddleAndCurrent); i++) {
    const methodToRemove = diffInMiddleAndCurrent > 0 ? 'pop' : 'shift';
    const methodToAdd = diffInMiddleAndCurrent > 0 ? 'unshift' : 'push';
    const itemRemoved = cycle[methodToRemove]();
    cycle[methodToAdd](itemRemoved);
  }

  return cycle;
}

function validateTransitionerSlots($slots, maxItems, areAllItemsSameComponent, currentVisibleItem) {
  if (QLogger.isEnvProd) {
    return;
  }
  const defaultSlotIsNotPresent = isEmpty($slots.default);

  QLogger.invariant(defaultSlotIsNotPresent, `Transitioner: default slots are not allowed for transitioner. Either name them individually using "${TransitionerItemKey.PREFIX}${TransitionerItemKey.DELIMITER}[number]" or use "${TransitionerItemKey.WHEN_SAME_COMPONENT}" for common component`);

  if (areAllItemsSameComponent) {
    const isCommonComponentSlotPresent = !isEmpty($slots[TransitionerItemKey.WHEN_SAME_COMPONENT]);

    QLogger.invariant(isCommonComponentSlotPresent, `Transitioner: when all items use the same component - slot name ${TransitionerItemKey.WHEN_SAME_COMPONENT} is required but not found`);

    return;
  }

  forEach($slots, (slotItems, slotName) => {
    const slotNameSplits = slotName.split(TransitionerItemKey.DELIMITER);
    const isValidPrefix = slotNameSplits[0] && slotNameSplits[0] === TransitionerItemKey.PREFIX;
    const suffixNumber = parseInt(slotNameSplits[1], 10);
    const isValidSuffix = !isNaN(suffixNumber) && (suffixNumber >= 1 && suffixNumber <= maxItems);

    QLogger.invariant(isValidPrefix && isValidSuffix, `
      Transitioner: the slot name (${slotName}) is not valid.
      1. Prefix should be "${TransitionerItemKey.PREFIX}" but received (${slotNameSplits[0]}).
      2. Suffix should be a number n equivalent: 1 <= n <= ${maxItems} but received (${slotNameSplits[1]})
    `);
  });
}
</script>

<style lang="scss" scoped>
$defaultTransitionTime: 0.45s;

/**
 * These transitions are used in the Transitioner component and structured accordingly
 * Transitions here use AnimatedCSS - https://daneden.github.io/animate.css
*/

@mixin animationName($animName) {
  -webkit-animation-name: $animName;
  animation-name: $animName;
}

@mixin animationDuration($duration) {
  -webkit-animation-duration: $duration;
  animation-duration: $duration;
}

@mixin defaultAnimDuration() {
  @include animationDuration($defaultTransitionTime);
}

/**
 * NOTE:- The following has been commented because these transitions are not being used anywhere.
 * Please uncomment when these transitions start getting used somewhere
 */

.slideHorizontallyForward {
  &-enter-active {
    @include animationName(slideInLeft);
    @include animationDuration(0.8s);
  }

  &-leave-active {
    @include animationName(slideOutRight);
    @include animationDuration(0.8s);
  }

  &-leave-to {
    transform: translateY(-100%);
  }
}

.slideHorizontallyBackward {
  &-enter-active {
    @include animationName(slideInRight);
    @include animationDuration(0.8s);
  }

  &-leave-active {
    @include animationName(slideOutLeft);
    @include animationDuration(0.8s);
  }

  &-leave-to {
    transform: translateY(-100%);
  }
}

.fadeIn {
  &-enter-active {
    @include animationName(fadeIn);
    @include animationDuration(0.4s);
  }

  &-leave-active {
    @include animationName(fadeOut);
    @include animationDuration(0.4s);
  }
}

.zoomIn {
  &-enter-active {
    @include animationName(zoomIn);
    @include animationDuration(0.3s);
    transform-origin: bottom left;
  }

  &-leave-active {
    @include animationName(zoomOut);
    @include animationDuration(0.6s);
    transform-origin: bottom left;
  }
}

.qFadeScaleLeft {
  &-enter-active {
    opacity: 0;
    animation-name: qFadeScaleInLeft;
    animation-timing-function: cubic-bezier(0.25, 0.1, 0.25, 0.1);
    @include defaultAnimDuration();
    animation-delay: 0.3s;
  }

  &-leave-active {
    animation-name: qFadeScaleOutLeft;
    animation-timing-function: cubic-bezier(0.25, 0.1, 0.25, 0.1);
    @include defaultAnimDuration();
  }
}

.qFadeScaleRight {
  &-enter-active {
    opacity: 0;
    animation-name: qFadeScaleInRight;
    animation-timing-function: cubic-bezier(0.25, 0.1, 0.25, 0.1);
    @include defaultAnimDuration();
    animation-delay: 0.3s;
  }

  &-leave-active {
    animation-name: qFadeScaleOutRight;
    animation-timing-function: cubic-bezier(0.25, 0.1, 0.25, 0.1);
    @include defaultAnimDuration();
  }
}

// KEYFRAMES
@keyframes qFadeScaleOutLeft {
  0% {
    transform: translateX(0) scale(1);
    opacity: 1;
  }

  33% {
    transform: translateX(0);
    opacity: 1;
  }

  66% {
    transform: scale(0.9);
  }

  100% {
    transform: translateX(-10%) scale(0.9);
    opacity: 0;
  }
}

@keyframes qFadeScaleInLeft {
  0% {
    transform: translateX(10%) scale(0.9);
    opacity: 0;
  }

  33% {
    transform: translateX(10%) scale(0.9);
    opacity: 0;
  }

  66% {
    transform: translateX(0);
    opacity: 1;
  }

  100% {
    transform: translateX(0) scale(1);
    opacity: 1;
  }
}

@keyframes qFadeScaleOutRight {
  0% {
    transform: translateX(0) scale(1);
    opacity: 1;
  }

  33% {
    transform: translateX(0);
    opacity: 1;
  }

  66% {
    transform: scale(0.9);
  }

  100% {
    transform: translateX(10%) scale(0.9);
    opacity: 0;
  }
}

@keyframes qFadeScaleInRight {
  0% {
    transform: translateX(-10%) scale(0.9);
    opacity: 0;
  }

  33% {
    transform: translateX(-10%) scale(0.9);
    opacity: 0;
  }

  66% {
    transform: translateX(0);
    opacity: 1;
  }

  100% {
    transform: translateX(0) scale(1);
    opacity: 1;
  }
}
</style>
