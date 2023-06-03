<template>
  <Peekaboo
    :heading="$i18n('Tell us what you want')"
    :subheading="$i18n('Want to see a new feature? Suggest it to us or vote on ideas from other teachers.')"
    :buttonText="$i18n('Vote for features')"
    theme="dark"
    backgroundColor="bg-dark-2"
    buttonLink="https://feedback.quizizz.com/"
    imgUrl="https://cf.quizizz.com/img/peekaboo/peekaboo.png"
    @peekabooClose="closePeekaboo"
    @peekabooLinkClicked="linkClicked"
  />
</template>

<script>
import { peekabooClose, peekabooLinkClicked } from '~/services/PeekabooService';
import { getPageTitleForInhouseEvents } from '~/config/PageTitles';

export default {

  created() {
    this.$analytics.logEvent(this.$webEvents.FEEDBACK_PEEKABOO_SHOW, {
      page: getPageTitleForInhouseEvents(this.$route.path),
      url: this.$route.path,
    });
  },

  methods: {
    closePeekaboo() {
      this.$analytics.logEvent(this.$webEvents.FEEDBACK_PEEKABOO_CLOSED, {
        page: getPageTitleForInhouseEvents(this.$route.path),
        url: this.$route.path,
      });
      peekabooClose();
    },

    linkClicked() {
      this.$analytics.logEvent(this.$webEvents.FEEDBACK_PEEKABOO_LINK_CLICKED, {
        page: getPageTitleForInhouseEvents(this.$route.path),
        url: this.$route.path,
      });
      peekabooLinkClicked();
    },
  },
};
</script>
