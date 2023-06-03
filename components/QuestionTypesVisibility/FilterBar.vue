<template>
  <div class="flex items-center justify-between">
    <div class="flex p-3 gap-1.5">
      <Button
        v-for="(category, index) in getVisibileFilters"
        :key="index"
        :title="category.title"
        :type="category.selected ? 'primary' : 'other'"
        @click="handleFilterCategoryClick(category)"
      />
    </div>
    <ExploreExamplesCTA
      v-if="qTypeVisibilityExp1"
      :allQuestionTypesList="allQuestionTypesList"
      :questionTypesFromTemplate="questionTypesFromTemplate"
      @questionTypeClickForPreview="handleQuestionTypeClickForPreview"
    />
    <div
      v-else-if="qTypeVisibilityExp2"
      class="w-60 mr-3"
    >
      <Input
        inputClasses="w-full h-8"
        ticonWrapperClasses="top-0.5"
        ticon="fa fa-search"
        :placeholder="$i18n('Search')"
        :value="searchText"
        @input="handleSearchTextChange"
        @focus="logSearchIntentEvent"
      />
    </div>
  </div>
</template>

<script>
import { addSurvicateQueryParam } from '~/utils/SurvicateUtils.js';
import ExploreExamplesCTA from './ExploreExamplesCTA.vue';

export default {

  components: {
    ExploreExamplesCTA,
  },
  props: {
    allQuestionTypesList: {
      type: Object,
      default: () => {},
    },
    questionTypesFromTemplate: {
      type: Array,
      default: () => [],
    },
  },
  emits: ['filterCategoryClicked', 'questionTypeClickForPreview', 'searchTextChange'],

  data() {
    const QuestionTypesFilterCategories = [
      {
        title: this.$i18n('All'),
        value: 'all',
        selected: true,
        visible: true,
      },
      {
        title: this.$i18n('Auto graded'),
        value: 'autoGraded',
        selected: false,
        visible: true,
      },
      {
        title: this.$i18n('Flexible grading'),
        value: 'flexibleGrading',
        selected: false,
        visible: true,
      },
      {
        title: this.$i18n('Ungraded'),
        value: 'ungraded',
        selected: false,
        visible: true,
      },
      {
        title: this.$i18n('Free'),
        value: 'free',
        selected: false,
        visible: (!this.$user.isSuper && !this.$user.isPartOfAnOrganization),
      },
    ];
    return {
      questionTypesFilterCategories: [...QuestionTypesFilterCategories],
      openExamplesDropdown: false,
      searchText: '',
    };
  },

  computed: {
    qTypeVisibilityExp1() {
      return this.$featureFlags.getFeatureValue(this.$constants.FeatureFlagsTypes.QTYPE_VISIBILITY) === 'explore_variant';
    },

    qTypeVisibilityExp2() {
      return this.$featureFlags.getFeatureValue(this.$constants.FeatureFlagsTypes.QTYPE_VISIBILITY) === 'search_variant';
    },

    getVisibileFilters() {
      return this.questionTypesFilterCategories.filter((category) => category.visible);
    },
  },

  mounted() {
    let variant = '';
    if (this.qTypeVisibilityExp1) {
      variant = 'explore';
    } else if (this.qTypeVisibilityExp2) {
      variant = 'search';
    }
    addSurvicateQueryParam(this.$router, this.$route.query, variant);
  },

  methods: {
    handleFilterCategoryClick(category) {
      this.questionTypesFilterCategories.forEach((category) => {
        category.selected = false;
      });
      category.selected = true;
      this.$emit('filterCategoryClicked', category);
    },

    handleQuestionTypeClickForPreview(index) {
      this.$emit('questionTypeClickForPreview', index);
    },

    handleSearchTextChange(value) {
      this.searchText = value;
      this.$emit('searchTextChange', value);
    },

    logSearchIntentEvent() {
      this.$analytics.logEvent(this.$webEvents.QTYPE_VISIBILITY_SEARCH_INTENT);
    },
  },

};
</script>

<style lang="scss" scoped>

</style>
