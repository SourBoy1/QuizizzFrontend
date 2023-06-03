<template>
  <div class="ease-linear main-wrapper overflow-x-hidden">
    <a href="#pricingMain">Skip to main content</a>
    <QfwPricingNavbar />
    <RouterView v-slot="{ Component }">
      <Transition
        name="fade"
        mode="out-in"
        appear
      >
        <component :is="Component" />
      </Transition>
    </RouterView>
  </div>
</template>
<script>

import PageTitles from '~/config/PageTitles';

import FontService from '~/services/FontService.js';
import IdleQueueService from '~/services/IdleQueueService.js';
import Fonts from '~/config/Fonts.js';
import $axios from '~/services/AxiosService.js';
import $store from '../services/StoreService.js';

export default {

  head() {
    return {
      title: this.$i18n('Quizizz for Work: Plans'),
    };
  },

  created() {
    this.idleQueue = new IdleQueueService();
    this.idleQueue.addTask(FontService.loadFont.bind(null, Fonts.Quicksand));
    $store(this.$store);
    $axios(this.$axios);

    const pageTitle = PageTitles[this.$route.name];

    // eslint-disable-next-line quote-props
    this.$gtag.customMap({ 'dimension2': 'plan', 'dimension3': 'occupation' });
    this.$gtag.query('set', 'user_properties', { plan_dimension: this.$user.plan || 'null', occupation_dimension: this.$user.occupation || 'null' });

    if (pageTitle) {
      this.$gtag.pageview({
        page_title: pageTitle,
        page_path: this.$route.path,
        page_location: this.$route.fullPath,
      });
    }
  },
};
</script>

<style>
.main-wrapper{
  font-family: 'Quicksand';
}
</style>
