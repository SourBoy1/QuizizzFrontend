/**
 * All Atomic component props values that are defined need to be defined here so that they can be referenced in
 * Storybook stories as well.
 */

import Constants from './Constants';

export const enumProps = {
  Tag: {
    type: ['primary', 'secondary', 'default', 'danger', 'green'],
  },

  Button: {
    rounded: ['full', 'semi', 'md', 'sm', 'default', 'none'],
    size: ['xs', 'sm', 'md', 'lg', 'xl', 'custom'],
    type: ['cta', 'primary', 'secondary', 'transparent', 'other', 'super', 'super-faded', 'super-secondary', 'white', 'link', 'link-underline-blue', 'link-no-bg', 'danger', 'danger-transparent', 'danger-dark', 'selector', 'dark', 'transparent-floating-dark', 'transluscent-light', 'deep-transluscent-light', 'light-link', 'transparent-floating-light', 'floater', 'custom', 'special', 'super-special', 'transluscent-light-bright', 'deep-dark'],
    buttonType: ['button', 'submit', 'reset'],
    variants: ['default', 'shadow'],
  },

  Modal: {
    size: ['sm', 'md', 'lg', 'xl', 'custom'],
    transition: ['none', 'slide', 'fade'],
    theme: ['default', 'error', 'yellow', 'brand-c', 'dark'],
  },

  Checkbox: {
    size: ['xs', 'sm', 'md', 'custom'],
  },

  Radio: {
    size: ['xs', 'sm', 'md', 'lg'],
  },

  Input: {
    type: ['default', 'special', 'header'],
    inputType: ['date', 'datetime-local', 'email', 'month', 'number', 'password', 'tel', 'text', 'time', 'url', 'week'],
    theme: ['light', 'dark', 'semi-dark'],
    autocomplete: ['off', 'on', ''],
  },

  Lozenge: {
    size: ['xs', 'sm', 'md'],
  },

  MediaImage: {
    objectFit: ['fill', 'contain', 'cover', 'none', 'scale-down'],
  },

  MediaTile: {
    type: ['image', 'audio', 'video'],
    size: ['md', 'sm', 'tn', 'custom'],
    rounded: ['semi', 'default'],
  },

  SelectBox: {
    selectBy: ['value', 'index', 'title', 'subtitle'],
    size: ['xs', 'sm', 'md-s', 'md', 'lg'],
    type: ['default', 'header', 'add', 'button'],
    direction: ['top', 'bottom'],
  },

  SuperIcon: {
    size: [7, 9, 11, 12],
    color: ['super', 'white'],
  },

  Switchbox: {
    theme: ['default', 'translucent'],
    size: ['md', 'sm'],
  },

  Toast: {
    type: ['DEFAULT', 'ERROR', 'SUCCESS'],
  },
  Tooltip: {
    tooltipSize: ['sm', 'md', 'lg', '2xl'],
    position: ['top', 'right', 'bottom', 'left', 'top-right', 'top-left', 'bottom-right', 'bottom-left'],
    fallbackPosition: ['', 'top', 'right', 'bottom', 'left', 'top-right', 'top-left', 'bottom-right', 'bottom-left'],
    theme: ['error', 'error-light', 'dark', 'white', 'lilac', 'green', 'violet'],
  },

  ShareSnDPlanWithAdminEmail: {
    emailType: ['default', 'lead-gen', 'snd-coupon-ext'],
  },

  FileUploadingLoader: {
    documentType: ['pdf', 'powerpoint', 'word', Constants.AiQuizGenModes.USING_OPEN_TEXT],
  },
};
