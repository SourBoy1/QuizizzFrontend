<template>
  <Modal
    v-if="showModal"
    :zeroPadding="true"
    :zeroMargin="true"
    :hideHeader="true"
    :fixedHeight="false"
    :showCloseModalBtn="false"
    containerClasses="w-full"
    size="custom"
  >
    <div class="relative h-full min-h-screen modal-bg">
      <div class="pl-12 pt-10">
        <Lozenge
          class="bg-super-20% text-super ml-auto px-4 py-2 border-1 border-super text-base"
          size="md"
          :title="$i18n('Recommended')"
        />
        <div class="w-1/2 mt-5">
          <div class="text-5xl font-bold">
            <span><i18n>Upgrade to  </i18n><span class="text-super px-2"><i18n> Quizizz School Plan </i18n></span><i18n> to access all premium features</i18n></span>
          </div>
        </div>
        <div class="text-lg font-normal mt-5 w-1/2 text-dark-4">
          <i18n>At no cost out-of-pocket, get all premium tools. Connect us with your admin to help unlock Quizizz premium for you and every teacher at your school.</i18n>
        </div>
        <div class="mt-8">
          <ul class="list-disc list-inside marker:text-super text-xl font-semibold">
            <li
              v-for="(point, index) in planPoints"
              :key="index"
              class="mt-4 text-dark-2"
            >
              {{ point.title }} <span
                v-if="point.description"
                class="text-base font-normal text-dark-4"
              > ({{ point.description }})</span>
            </li>
          </ul>
          <div class="mt-4 ml-6">
            <span class="text-dark-50% text-base flex items-center"><i class="fa-solid fa-plus text-base" /> <span class="ml-2 font-semibold"><i18n>many more</i18n></span></span>
          </div>
        </div>
        <div class="mt-10 flex items-center">
          <Button
            type="super"
            size="xl"
            buttonClasses="focus:outline-none"
            :aria-label="$i18n('Get a Quote')"
            :title="$i18n('Get a Quote')"
            @click="handleShareAdminClick"
          />
          <div
            class="text-lg font-semibold ml-6 cursor-pointer"
            @click="close"
          >
            <i18n>Skip for now</i18n>
          </div>
        </div>
      </div>
    </div>
  </Modal>
</template>

<script>
import { OpenTypeForm } from '~/utils/Redirection';
import LocalStorage from '~/services/LocalStorage';

export default {
  data() {
    return {
      showModal: false,
      planPoints: [
        {
          title: this.$i18n('Automatic grade and roster sync with LMS integrations'),
        },
        {
          title: this.$i18n('In-depth data reporting'),
          description: this.$i18n('activity, class and student-level progress data'),
        },
        {
          title: this.$i18n('Higher-order thinking tools'),
          description: this.$i18n('10+ question types, multiple activity modes'),
        },
        {
          title: this.$i18n('Enhanced collaboration'),
          description: this.$i18n('with tools like Shared School Library'),
        },
        {
          title: this.$i18n('Access to 1.8M+ premium resources'),
        },
        {
          title: this.$i18n('Standards aligned content and reporting'),
        },
      ],
    };
  },

  mounted() {
    this.$eventBus.$on('superSchoolUpsellSignupV2:show', this.show);
  },

  unmounted() {
    this.$eventBus.$off('superSchoolUpsellSignupV2:show', this.show);
  },

  methods: {
    show() {
      this.showModal = true;
      this.$analytics.logEvent(this.$webEvents.SCHOOL_UPSELL_OPEN, {});
    },

    close() {
      this.showModal = false;
      this.$analytics.logEvent(this.$webEvents.SKIP_NOW_CLICK, {});
      LocalStorage.setItem('canShowPostSingupSchoolUpsell', false);
    },

    handleShareAdminClick() {
      OpenTypeForm({
        source: 'post-signup-school-upsell',
        feat: 'post-signup-school-upsell',
      });
      this.$analytics.logEvent(this.$webEvents.GET_A_QUOTE_BUTTON_CLICK, {});
      this.showModal = false;
    },

  },
};
</script>

<style scoped lang="scss">
  .modal-bg {
    background-image: url('https://cf.quizizz.com/image/Upsellmodal.png');
    background-size: cover;
    background-position: right bottom;
  }
</style>
