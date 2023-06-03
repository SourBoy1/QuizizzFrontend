<template>
  <transition
    :name="transitionToUse"
    appear
  >
    <div
      ref="modal-mask"
      data-cy="modal-mask"
      translate="no"
      :tabindex="0"
      :class="['modal-mask fixed top-0 left-0 h-screen w-screen bg-dark-80% z-overlay flex justify-center items-center', { 'pt-6 px-6': !zeroMargin }, { 'overflow-auto': allowOverflowScrolling }]"
      @keydown.enter="triggerSubmit"
      @keydown.esc="close('esc')"
      @click.stop="onOverlayClick"
      @keydown="interceptKey"
      @keyup="interceptKey"
    >
      <ModalContainer
        v-if="isCustomModal"
        ref="modal-container"
        :class="containerClasses ? '' : 'py-6 px-4'"
        :data-cy="modalDataCy"
        size="custom"
        v-bind="modalContainerProps"
      >
        <slot />
      </ModalContainer>

      <ModalContainer
        v-else
        ref="modal-container"
        :data-cy="modalDataCy"
        v-bind="modalContainerProps"
      >
        <slot name="top-panel" />
        <ModalBody
          v-bind="modalBodyProps"
          @close="close"
        >
          <ModalHeader
            v-if="!hideHeader"
            v-bind="modalHeaderProps"
          >
            <template #title>
              <slot name="title">
                {{ title }}
              </slot>
            </template>
            <template #subtitle>
              <slot name="subtitle-text">
                {{ subtitle }}
              </slot>
            </template>
          </ModalHeader>

          <ModalContent
            v-if="$slots.default"
            v-bind="modalContentProps"
          >
            <slot />
          </ModalContent>

          <ModalFooter
            v-if="!hideFooter"
            v-bind="modalFooterProps"
            v-on="modalFooterEvents"
          >
            <slot name="footer-text" />
          </ModalFooter>
        </ModalBody>
        <ModalSidePanel
          v-if="sidePanel.show"
          :class="[
            `transition-all duration-${sidePanel.animationDuration}`,
            {
              'opacity-0': !isSidePanelInDom,
              'opacity-100': isSidePanelInDom,
              '-translate-x-75': isSidePanelHidden,
              'translate-x-0': !isSidePanelHidden,
            },
          ]"
        >
          <slot name="side-panel" />
        </ModalSidePanel>
      </ModalContainer>
    </div>
  </transition>
</template>

<script>
import { mapGetters } from 'vuex';
import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import isFunction from 'lodash/isFunction';

import { enumProps } from '~/config/Atoms';

import QLogger from '~/services/QLogger';

import { setFocusOnFirstElement } from '~/utils/Utilities';

export default {

  props: {
    dismissOnOverlayClick: {
      type: Boolean,
      default: false,
    },

    transition: {
      type: String,
      default: 'slide',
      validator: (val) => enumProps.Modal.transition.includes(val),
    },

    modalDataCy: {
      type: String,
      default: 'modal-container',
    },

    type: {
      type: String,
      default: 'default',
      validator: (val) => (['default', 'blocker', 'custom'].includes(val)),
    },

    shouldCloseOnEscape: {
      type: Boolean,
      default: false,
    },

    shouldSubmitOnEnter: {
      type: Boolean,
      default: false,
    },

    firstElementToFocusRef: {
      type: Object,
      default: () => ({}),
    },

    disableDefaultFocus: {
      type: Boolean,
      default: false,
    },

    sidePanel: {
      type: Object,
      default: () => ({
        show: false,
        timer: 100,
        animationDuration: 200,
      }),
    },

    disableOverflow: {
      type: Boolean,
      default: false,
    },

    // ! modal container props
    size: {
      type: String,
      default: 'md',
      validator(size) {
        return enumProps.Modal.size.includes(size);
      },
    },

    backgroundColor: {
      type: String,
      default: 'bg-light-3',
    },

    containerClasses: {
      type: String,
      default: '',
    },

    bodyClasses: {
      type: String,
      default: '',
    },

    footerClasses: {
      type: String,
      default: '',
    },

    // ! modal header props
    showCloseModalBtn: {
      type: Boolean,
      default: true,
    },

    icon: {
      type: String,
      default: '',
    },

    img: {
      type: String,
      default: '',
    },

    title: {
      type: String,
      default: '',
    },

    subtitle: {
      type: String,
      default: '',
    },

    closeBtnClasses: {
      type: String,
      default: '',
    },

    headerCustomClasses: {
      type: String,
      default: '',
    },

    titleCustomClasses: {
      type: String,
      default: '',
    },

    subtitleCustomClasses: {
      type: String,
      default: '',
    },

    iconCustomClasses: {
      type: String,
      default: '',
    },

    hideHeader: {
      type: Boolean,
      default: false,
    },

    // ! footer props
    hideFooter: {
      type: Boolean,
      default: false,
    },

    button1: {
      type: Object,
      default() {
        return null;
      },
    },

    button2: {
      type: Object,
      default() {
        return null;
      },
    },

    // ! modal UI Props
    stickToBottom: {
      type: Boolean,
      default: false,
    },

    stickToTop: {
      type: Boolean,
      default: false,
    },

    fixedHeight: {
      type: Boolean,
      default: true,
    },

    fullScreenOnMobile: {
      type: Boolean,
      default: false,
    },

    zeroPadding: {
      type: Boolean,
      default: false,
    },

    zeroMargin: {
      type: Boolean,
      default: false,
    },

    zeroContentMargin: {
      type: Boolean,
      default: false,
    },

    fullWidth: {
      type: Boolean,
      default: true,
    },

    theme: {
      type: String,
      default: 'default',
      validator: (val) => enumProps.Modal.theme.includes(val),
    },

    fullWidthFooter: {
      type: Boolean,
      default: false,
    },

    // this props is to stop keys inputs other than the enter and esc key
    stopOtherKeys: {
      type: Boolean,
      default: false,
    },

    allowOverflowScrolling: {
      type: Boolean,
      default: false,
    },

    bgImage: {
      type: String,
      default: '',
    },

    showCustomCloseModalBtn: {
      type: Boolean,
      default: false,
    },

    customCloseBtnClasses: {
      type: String,
      default: '',
    },

    customCloseBtnClick: {
      type: Function,
      default: () => {},
    },
  },
  emits: ['bottomNavigationMobile:toggle', 'close', 'button1-click', 'button2-click'],

  data() {
    return {
      settingFocusTimeout: null,
      lastActiveElement: null,
      isSidePanelInDom: false,
      isSidePanelHidden: true,
      sidePanelTimer: null,
      sidePanelAnimationTimer: null,
      sidePanelHideTimer: null,
      sidePanelCloseTimer: null,
    };
  },

  computed: {
    ...mapGetters('root', ['deviceProps', 'isDesktop']),

    transitionToUse() {
      if (this.transition === 'none') {
        return '';
      }

      return this.transition;
    },

    modalHeaderProps() {
      return {
        showCloseModalBtn: this.showCloseModalBtn,
        isBlockerModal: this.isBlockerModal,
        closeBtnClasses: this.closeBtnClasses,
        icon: this.icon,
        img: this.img,
        headerCustomClasses: this.headerCustomClasses,
        titleCustomClasses: this.titleCustomClasses,
        subtitleCustomClasses: this.subtitleCustomClasses,
        iconCustomClasses: this.iconCustomClasses,
        theme: this.theme,
        title: this.title,
        subtitle: this.subtitle,
        zeroPadding: this.zeroPadding,
      };
    },

    modalContainerProps() {
      return {
        size: this.size,
        backgroundColor: this.backgroundColor,
        stickToBottom: this.stickToBottom,
        stickToTop: this.stickToTop,
        theme: this.theme,
        containerClasses: this.containerClasses,
        hasSidePanel: this.sidePanel.show,
        type: this.type,
        fullWidth: this.fullWidth,
        fixedHeight: this.fixedHeight,
        fullScreenOnMobile: this.fullScreenOnMobile,
        bgImage: this.bgImage,
      };
    },

    modalBodyProps() {
      return {
        backgroundColor: this.backgroundColor,
        showCloseModalBtn: this.showCloseModalBtn,
        isBlockerModal: this.isBlockerModal,
        closeBtnClasses: this.closeBtnClasses,
        bodyClasses: this.bodyClasses,
        stickToBottom: this.stickToBottom,
        size: this.size,
        zeroPadding: this.zeroPadding,
        showCustomCloseModalBtn: this.showCustomCloseModalBtn,
        customCloseBtnClasses: this.customCloseBtnClasses,
        customCloseBtnClick: this.customCloseBtnClick,
      };
    },

    modalContentProps() {
      return {
        stickToBottom: this.stickToBottom,
        disableOverflow: this.disableOverflow,
        fixedHeight: this.fixedHeight,
        zeroPadding: this.zeroPadding,
        zeroMargin: this.zeroContentMargin,
      };
    },

    modalFooterProps() {
      return {
        button1: this.button1,
        button2: this.button2,
        stickToBottom: this.stickToBottom,
        footerClasses: this.footerClasses,
        fullWidthFooter: this.fullWidthFooter,
      };
    },

    modalFooterEvents() {
      return {
        button1Click: this.button1Click,
        button2Click: this.button2Click,
      };
    },

    isBlockerModal() {
      return this.type === 'blocker';
    },

    isCustomModal() {
      return this.type === 'custom';
    },
  },

  watch: {
    firstElementToFocusRef(newVal, oldVal) {
      if (newVal && newVal !== oldVal && !this.disableDefaultFocus) {
        this.setFocusOnFirstElement();
      }
    },
  },

  mounted() {
    this.lastActiveElement = get(
      window,
      'document.activeElement',
      null,
    );

    const modalMask = this.$refs['modal-mask'];

    if (modalMask) {
      modalMask.focus();
    }

    if (this.stickToBottom && this.stickToTop) {
      QLogger.error(
        '[stickToBottom && stickToTop]: only one of the positions must be used',
      );
    }

    if (this.stickToBottom) {
      this.$eventBus.$emit('bottomNavigationMobile:toggle');
    }

    if (this.sidePanel.show) {
      this.sidePanelTimer = setTimeout(() => {
        this.isSidePanelInDom = true;
      }, this.sidePanel.timer);
      this.sidePanelAnimationTimer = setTimeout(() => {
        this.isSidePanelHidden = false;
      }, this.sidePanel.timer + 300);
    }

    this.settingFocusTimeout = setTimeout(() => {
      if (!this.disableDefaultFocus) {
        this.setFocusOnFirstElement();
      }
    }, 300);
  },

  beforeUnmount() {
    const modal = this.$refs['modal-container'];

    if (this.stickToBottom) {
      this.$eventBus.$emit('bottomNavigationMobile:toggle');
    }
    if (isEmpty(modal)) {
      return;
    }

    if (
      this.lastActiveElement
      && this.isDesktop
      && isFunction(this.lastActiveElement)
    ) {
      this.$nextTick(() => {
        this.lastActiveElement.focus();
      });
    }

    if (this.settingFocusTimeout) {
      clearTimeout(this.settingFocusTimeout);
    }

    if (this.sidePanelTimer) {
      clearTimeout(this.sidePanelTimer);
    }

    if (this.sidePanelAnimationTimer) {
      clearTimeout(this.sidePanelAnimationTimer);
    }

    if (this.sidePanelHideTimer) {
      clearTimeout(this.sidePanelHideTimer);
    }

    if (this.sidePanelCloseTimer) {
      clearTimeout(this.sidePanelCloseTimer);
    }
  },

  methods: {
    setFocusOnFirstElement() {
      if (!this.isDesktop) {
        return;
      }

      const modal = this.$refs['modal-container'];
      const firstElementToFocus = this.firstElementToFocusRef;

      setFocusOnFirstElement(modal?.$el, firstElementToFocus);
    },

    onOverlayClick() {
      if (this.dismissOnOverlayClick) {
        this.close();
      }
    },

    interceptKey(ev) {
      if (this.stopOtherKeys) {
        ev.preventDefault();
        ev.stopImmediatePropagation();
      }
    },

    close(source = 'click') {
      if (this.isBlockerModal) {
        return;
      }

      if (source === 'esc' && !this.shouldCloseOnEscape) {
        return;
      }

      if (this.sidePanel.show) {
        this.isSidePanelHidden = true;

        this.sidePanelHideTimer = setTimeout(() => {
          this.isSidePanelInDom = false;
        }, 300);
        this.sidePanelHideTimer = setTimeout(() => {
          this.$emit('close');
        }, 300 + this.sidePanel.animationDuration);

        return;
      }

      this.$emit('close');
    },

    triggerSubmit() {
      if (!this.shouldSubmitOnEnter) {
        return;
      }

      this.button2Click();
    },

    button1Click() {
      this.$emit('button1-click');
    },

    button2Click() {
      this.$emit('button2-click');
    },
  },
};
</script>

<style lang="scss" scoped>
$transitionTiming: 0.3s;

.modal-mask {
  animation-duration: $transitionTiming;
}

// For Slide Transition
.slide-enter.modal-mask,
.slide-leave-active.modal-mask {
  background-color: rgba(0, 0, 0, 0);
  transition: $transitionTiming cubic-bezier(0.215, 0.61, 0.355, 1)
    background-color;
}

.slide-enter-active.modal-mask,
.slide-leave-active.modal-anim {
  transition: $transitionTiming cubic-bezier(0.215, 0.61, 0.355, 1)
    background-color;
}

.slide-enter-active .modal-anim {
  animation: modalSlideInUp;
  animation-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
  animation-duration: $transitionTiming !important;
  animation-fill-mode: both;
}

.slide-leave-active .modal-anim {
  animation: modalSlideOutDown;
  animation-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
  animation-duration: $transitionTiming !important;
  animation-fill-mode: both;
}

// For Fade Transition
.fade-enter.modal-mask,
.fade-leave-active.modal-mask {
  background-color: rgba(0, 0, 0, 0);
  transition: $transitionTiming cubic-bezier(0.215, 0.61, 0.355, 1)
    background-color;
}

.fade-enter-active.modal-mask,
.fade-leave-active.modal-anim {
  transition: $transitionTiming cubic-bezier(0.215, 0.61, 0.355, 1)
    background-color;
}

.fade-enter-active .modal-anim {
  animation: modalFadeIn;
  animation-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
  animation-duration: $transitionTiming !important;
  animation-fill-mode: both;
}

.fade-leave-active .modal-anim {
  animation: modalFadeOut;
  animation-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
  animation-duration: $transitionTiming !important;
  animation-fill-mode: both;
}

@keyframes modalSlideInUp {
  from {
    opacity: 0.3;
    transform: translate3d(0, 100%, 0);
    visibility: visible;
  }

  to {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
}

@keyframes modalSlideOutDown {
  from {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }

  to {
    opacity: 0.2;
    visibility: hidden;
    transform: translate3d(0, 150%, 0);
  }
}

@keyframes modalFadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@keyframes modalFadeOut {
  from {
    opacity: 1;
  }

  to {
    opacity: 0;
  }
}

.no-padding {
  padding: 0px !important;
}
</style>
