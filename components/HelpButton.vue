<template>
  <div
    v-click-outside="() => { showMenu = false; }"
    :class="[
      'quizizz-help-button fixed right-4 bottom-4 bg-purple-light text-light-3 w-10 h-10 rounded-full flex justify-center items-center cursor-pointer',
      isHelpButtonVisible && hasLoaded ? '' : 'hidden',
    ]"
    :style="helpButtonOffsetStyles + ' ' + helpButtonZIndexStyles"
  >
    <button
      v-tooltip.top="$i18n('Help and Resources')"
      class="w-full h-full flex justify-center items-center rounded-full"
      @click.stop="handleButtonClick"
    >
      <FA
        icon="fa fa-question"
        :size="20"
      />
    </button>
    <Menu
      v-show="showMenu"
      ref="menu"
      class="absolute z-9999 mb-12 shadow-lg"
      :style="`transform-origin:bottom right; bottom: ${menuBottom}px; right: ${menuRight}px;`"
      :items="menuItems"
      :theme="helpButtonTheme"
      textSize="text-sm"
      @menuItemClick="handleMenuItemClick"
    />
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

import zendeskUtils from '~/utils/ZendeskUtils';

export default {
  data() {
    return {
      hasLoaded: false,
      showMenu: false,
      scaleFactor: 0,
      menuBottom: 0,
      menuRight: 0,
      menuItems: [
        {
          title: this.$i18n('Help Center'),
          key: 'help-center',
          isVisible: true,
        },
        {
          title: this.$i18n('Contact support'),
          key: 'contact-support',
          isVisible: true,
        },
        {
          title: this.$i18n('Teacher Wish List'),
          key: 'teacher-whishlist',
          isVisible: !this.isCorporate(),
        },
        {
          title: this.$i18n('Teacher Resources'),
          key: 'teacher-resources',
          isVisible: !this.isCorporate(),
        },
      ],
    };
  },

  head() {
    return {
      script: [
        {
          id: 'ze-snippet',
          src: zendeskUtils.zendeskScriptSrc(this.$user),
        },
      ],
    };
  },

  computed: {
    ...mapGetters('root', ['helpButtonOffset', 'shouldShowHelpButton', 'helpButtonTheme', 'helpButtonZIndex']),
    helpButtonOffsetStyles() {
      return `margin-bottom: ${this.helpButtonOffset.y}px; margin-right: ${this.helpButtonOffset.x}px;`;
    },

    helpButtonZIndexStyles() {
      return `z-index: ${this.showMenu ? 9999 : this.helpButtonZIndex};`;
    },

    isHelpButtonVisible() {
      return this.shouldShowHelpButton;
    },
  },

  mounted() {
    window.zESettings = {
      webWidget: {
        offset: {
          horizontal: '2000px',
        },
      },
    };

    const interval = setInterval(() => {
      if (window.zE) {
        this.hasLoaded = true;
        zendeskUtils.moveWidgetOutOfViewport();
        clearInterval(interval);
        window.zE('webWidget:on', 'close', () => {
          zendeskUtils.moveWidgetOutOfViewport();
        });
        zendeskUtils.initConfigs(this.$user);
      }
    }, 1000);
  },

  methods: {
    isCorporate() {
      return this.$user.isCorporate;
    },

    handleButtonClick() {
      this.showMenu = !this.showMenu;
    },

    handleOpenLink(url) {
      const otherWindow = window.open();
      otherWindow.opener = null;
      otherWindow.location = url;
    },

    handleMenuItemClick(key) {
      this.showMenu = false;
      const helpCenterLink = this.isCorporate()
        ? 'https://forwork-support.quizizz.com/hc/en-us'
        : 'https://support.quizizz.com/hc/en-us';

      switch (key) {
        case 'help-center':
          this.handleOpenLink(helpCenterLink);
          break;
        case 'contact-support':
          zendeskUtils.openWebWidget();
          break;
        case 'teacher-whishlist':
          this.handleOpenLink('https://feedback.quizizz.com/');
          break;
        case 'teacher-resources':
          this.handleOpenLink('https://quizizz.com/home/resources');
          break;
        default:
          break;
      }
    },
  },
};
</script>
