/* eslint-disable no-param-reassign */
import QLogger from '~/services/QLogger';
// --------------------------------------------------------------
// This is not the final code.
// For now this is used to solve the immediate bug in migration
// We will enhance this post migration with additional use cases as we face them
// --------------------------------------------------------------

const vAutoPositionPlugin = {
  // do not use beforeMount because getBoundingClientRect will not provide expect results before element is mounted
  mounted(el: HTMLElement) {
    if (!el) {
      QLogger.warn('HTMLElement is missing for v-auto-position');
      return;
    }
    const elementRect = el.getBoundingClientRect();
    const parentContainer = el?.parentElement;
    const parentRect: DOMRect = parentContainer?.getBoundingClientRect() || {} as DOMRect;
    const parentRectProxy = new Proxy(parentRect, {
      get(target, property) {
        // @ts-ignore
        return target[property] || 0;
      },
    });
    const isThereSpaceInRight = elementRect.left + elementRect.width <= window.innerWidth;
    if (!isThereSpaceInRight) {
      el.style.zIndex = '10000';
      const newPositionOfEl = `${-elementRect.width + parentRectProxy.width}px`;
      el.style.left = newPositionOfEl;
    }
  },
};

export default vAutoPositionPlugin;
