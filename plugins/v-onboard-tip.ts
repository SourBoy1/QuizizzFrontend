import {
  nextTick, createVNode, render, DirectiveBinding,
} from 'vue';
import isEmpty from 'lodash/isEmpty';

import { getUUID } from '~/services/UIDService';
import $store from '~/services/StoreService';
import OnboardingTooltip from '~/components/OnboardingTooltip.vue';

interface AnyObject {
  [key: string]: any;
}

function storeCurrentContext(context: AnyObject | string) {
  try {
    localStorage.setItem('q-onbrd-context', JSON.stringify(context));
  } catch (e) {
    // nothing to do here for now
  }
}

function getStoredContext() {
  try {
    const context = localStorage.getItem('q-onbrd-context') || '{}';
    return JSON.parse(context);
  } catch (e) {
    return {};
  }
}

function saveShownTooltipToStorage(tooltipName: string) {
  if (!tooltipName) {
    return;
  }

  const context = getStoredContext();
  context[tooltipName] = true;
  storeCurrentContext(context);
}

async function showTooltip(tooltipProps: AnyObject, target: HTMLElement, callbacks: AnyObject) {
  if (!target) {
    return;
  }

  const tooltipNode = createVNode(OnboardingTooltip, {
    ...tooltipProps,
    targetElement: target,
  });

  tooltipNode.props!.onNext = () => {
    if (!isEmpty(callbacks)) {
      callbacks.onNext();
    }
    // @ts-ignore
    tooltipNode.component.ctx.hide();
    tooltipNode.el?.parentNode.removeChild(tooltipNode.el);
  };

  render(tooltipNode, target);
  await nextTick();
  // @ts-ignore
  tooltipNode.component.ctx.show();
}

const listenerMap = new Map();
// Directive definition
const vOnboardTooltip = {
  beforeMount(el: HTMLElement, binding: DirectiveBinding<any>) {
    if (!binding.value) {
      return;
    }
    const {
      name,
      position,
      title,
      description,
      customElements,
      order,
      containerClasses,
      tooltipOffset,
      showImmediate,
      showAfterDelay,
    } = binding.value;

    // By default all tooltips will be shown once
    let { showOnce } = binding.value;
    if (showOnce === undefined) {
      showOnce = true;
    }

    // Check if tooltip has been shown previously
    if (showOnce) {
      const storageContext = getStoredContext();
      if (storageContext[name]) {
        return;
      }
    }

    let unwatch: any;
    const tooltipId = getUUID();
    const tooltipProps = {
      title,
      description,
      position,
      customElements,
      containerClasses,
      tooltipOffset,
    };

    const callbacks = {
      onNext() {
        $store().dispatch('onboardingTooltip/showNext');
        if (typeof binding.value.onNext === 'function') {
          binding.value.onNext();
        }
        if (typeof unwatch === 'function') {
          unwatch();
        }
      },
    };

    if (showImmediate || showAfterDelay) {
      setTimeout(() => {
        showTooltip(tooltipProps, el, callbacks);
        saveShownTooltipToStorage(name);
      }, showImmediate ? 0 : showAfterDelay);
    } else if ($store().getters['root/isDesktop']) {
      $store().dispatch('onboardingTooltip/addTooltip', {
        id: tooltipId,
        name,
        order: order || 0,
      });

      unwatch = $store().watch((state) => state.onboardingTooltip.activeTooltip?.id, (val) => {
        if (val === tooltipId) {
          showTooltip(tooltipProps, el, callbacks);
          saveShownTooltipToStorage(name);
        }
      });
      listenerMap.set(el, [unwatch]);
    }
  },
  beforeUnmount(el: HTMLElement) {
    if (!listenerMap.has(el)) {
      return;
    }

    const handlers = listenerMap.get(el);
    listenerMap.delete(el);
    if (!handlers) {
      return;
    }

    handlers.forEach((handler: unknown) => {
      if (typeof handler === 'function') {
        handler();
      }
    });
  },
};

export default vOnboardTooltip;
