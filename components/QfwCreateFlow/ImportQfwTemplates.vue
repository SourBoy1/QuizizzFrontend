<template>
  <Modal
    :zeroPadding="true"
    :zeroMargin="true"
    :showCloseModalBtn="true"
    size="custom"
    containerClasses="px-3 md:px-6 xs:max-w-[650px] md:max-w-[880px]"
    @close="closeImportQfwTemplatesModal"
  >
    <div class="flex flex-col md:max-h-[600px] overflow-hidden">
      <div class="flex items-center gap-2 border-b-1 border-light-2 pb-3">
        <div class="rounded-50% bg-lilac-faded hover:bg-dark-6 w-8 h-8 flex items-center justify-center cursor-pointer">
          <FA
            icon="fa-regular fa-retweet"
            class="text-lilac"
            size="14"
          />
        </div>
        <span class="text-xs xs:text-base md:text-lg font-bold"><i18n>Select a template and get started</i18n></span>
      </div>
      <div class="flex flex-col md:flex-row overflow-hidden">
        <div class="flex md:flex-col md:min-w-40 md:h-[500px] gap-4 pt-3 pb-6">
          <div
            v-for="tab in tabs"
            :key="tab.id"
            class="text-xs cursor-pointer flex flex-col md:flex-row justify-between items-stretch px-1 gap-1"
            :class="[selectedTab === tab.id ? 'font-bold text-lilac' : 'font-normal text-dark-4']"
            @click="selectTemplateTab(tab)"
          >
            <span>{{ tab.name }}</span>
            <span
              class="w-full h-1 md:h-full md:w-1"
              :class="[selectedTab === tab.id ? 'bg-lilac' : 'bg-none']"
            />
          </div>
        </div>
        <div class="bg-light-2 w-full px-3 md:px-7 py-3 max-h-[700px] overflow-scroll">
          <Templates
            :quizList="quizList"
            :disableRedirection="true"
            :selectedTab="selectedTab"
          />
        </div>
      </div>
    </div>
  </Modal>
</template>
<script>
import { getTemplateData } from '~/utils/QfwHomeUtils';
import Templates from './Templates.vue';

export default {
  components: { Templates },
  props: {
    closeImportQfwTemplatesModal: {
      type: Function,
      default: () => false,
    },
  },

  data() {
    return {
      selectedTab: 'all',
      tabs: [
        { name: this.$i18n('All Templates'), id: 'all' },
        { name: this.$i18n('Employee Training'), id: 'employee-training' },
        { name: this.$i18n('Employee Engagement'), id: 'employee-engagement' },
      ],

      rawQuizList: [],
      section: {
        quizzes: getTemplateData(),
      },
    };
  },

  computed: {
    quizList() {
      return this.rawQuizList.map((quiz) => ({
        ...quiz,
        url: `http://quizizz.com/admin/${quiz.type}/${quiz._id}/${this.makeSlug(quiz.info.name)}?createFlowRecommended=true`,
        isExternal: true,
      }));
    },
  },

  mounted() {
    this.$analytics.logEvent(this.$webEvents.QFW_CREATE_USE_TEMPLATE_MODAL_OPEN);
    this.rawQuizList = getTemplateData();
  },

  methods: {
    makeSlug(name) {
      return this.$urlUtils.toSlug(name);
    },

    selectTemplateTab(tab) {
      this.selectedTab = tab.id;
      if (tab.id === 'all') {
        this.rawQuizList = getTemplateData();
      } else {
        this.rawQuizList = getTemplateData().filter((quiz) => quiz.quizType === tab.id);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.selected-tab {
  font-weight: 700;
}

</style>
