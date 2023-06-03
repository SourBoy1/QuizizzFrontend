<template>
  <Modal
    :button1="{
      ariaLabel: 'Cancel',
      title: $i18n('Cancel'),
      type: 'other',
      size: isDesktop ? 'md' : 'sm',
    }"
    :button2="{
      ariaLabel: $i18n('Save'),
      title: $i18n('Save'),
      type: 'primary',
      disabled: isSaveBtnDisabled,
      loading: isAwaitingApiResponse,
      size: isDesktop ? 'md' : 'sm',
    }"
    :subtitle="$i18n('Get student performance in ‘Reports’ aggregated by each tag')"
    :title="$i18n('Add tags')"
    :shouldCloseOnMaskClick="true"
    dismissOnOverlayClick
    :stickToBottom="isStuckToBottom"
    icon="fas fa-tags"
    :size="isDesktop ? 'xl' : 'sm'"
    @button1-click="$emit('close')"
    @button2-click="handleSaveTags"
    @close="$emit('close')"
  >
    <TagInput
      v-if="!shouldShowStandardTagging"
      ref="tagInput"
      :placeholder="$i18n('Add tags')"
      :validator="validateTag"
      :errorOnValidationFail="tagValidationFailError"
      :errorOnMaxTags="$i18n('You can add only a maximum of 5 tags per question')"
      :delimiters="['Enter']"
      :addTagOnBlur="false"
      :searchDropdown="{
        enabled: true,
        dropdownTags,
      }"
      :allowDuplicates="false"
      :existingTags="existingTags"
      @setTags="setTags"
    />

    <template
      v-if="shouldShowStandardTagging"
      #title
    >
      <div class="flex items-center text-sm md:text-md">
        <i18n>Add standards from </i18n>
        <SelectBox
          :key="selectedCurriculumId"
          v-model="selectedCurriculumId"
          :isLoading="listLoading"
          icon="far fa-graduation-cap"
          class="w-1/2 m-1 overflow-hidden text-ellipsis"
          listContainerClasses="max-w-100"
          size="sm"
          :list="selectBoxCurriculums"
          :aria-label="$i18n('Select a curriculum')"
          :placeholder="$i18n('Curriculum')"
          :enableSearch="true"
        />
      </div>
    </template>
    <span
      v-if="!shouldShowStandardTagging"
      class="text-xs font-semibold text-dark-5"
    >
      <i18n>Hit 'Enter' to add a tag</i18n>
    </span>

    <!-- Snd upsell -->
    <div
      v-if="!$user.paidOrganization && !isCorporateUser && showTagBanner"
      class="flex mt-2 items-center border border-super-20% rounded p-4"
    >
      <img
        class="mr-2"
        height="36.15"
        width="40"
        src="https://cf.quizizz.com/img/reports/s%26d.png"
        alt="snd-logo"
      />
      <div>
        <div class="text-sm font-semibold text-dark-2">
          <i18n>Upgrade to our School and District plan</i18n>
        </div>
        <div class="text-xs font-semibold text-dark-4">
          <i18n>Unlock our library of standards and get student-level reporting</i18n>
        </div>
      </div>
      <Button
        class="ml-auto"
        :title="$i18n('Get a quote')"
        type="super-secondary"
        size="sm"
        role="link"
        @click="onSndAdCTAClick"
      />

      <span
        class="flex items-center justify-center w-4 h-4 ml-3 cursor-pointer text-dark-4"
        @click="closeTagBanner"
      >
        <FA
          :size="14"
          icon="far fa-times"
        />
      </span>
    </div>
    <!-- Snd upsell ends -->

    <StandardTaggingPanel
      v-if="shouldShowStandardTagging"
      ref="standardTagging"
      :existingTags="tags"
      :searchTerm="searchTerm"
      :selectedTags="selectedTags"
      @delete="handleRemovalOfStandard"
      @resetSearch="handleSearchTermInput(null)"
      @resetTags="setTags([], false)"
      @selected="handleStateStandardTagInput"
    >
      <template #search-box>
        <TagInput
          v-if="shouldShowStandardTagging"
          ref="tagInput"
          class="my-2"
          :placeholder="$i18n('Search for standards or add tags')"
          :validator="validateTag"
          :errorOnValidationFail="tagValidationFailError"
          :errorOnMaxTags="$i18n('You can add only a maximum of 5 tags per question')"
          :addTagOnBlur="false"
          :allowDuplicates="false"
          :delimiters="[]"
          :searchTextStyles="{
            searchText: 'text-dark-2',
          }"
          :existingTags="existingTags"
          @input="handleSearchTermInput"
          @setTags="setTags"
        />
      </template>
    </StandardTaggingPanel>
  </Modal>
</template>

<script>
import { h as hydrate } from 'vue';
import { mapGetters } from 'vuex';
import get from 'lodash/get';
import debounce from 'lodash/debounce';

import CurriculumService from '~/services/apis/CurriculumService';
import QuizService from '~/services/apis/QuizService';

import FA from '~/components/FA.vue';

import MoengageService from '~/services/MoengageService';
import LifecycleEventService from '~/services/LifecycleEventService';
import LocalStorage from '~/services/LocalStorage';

import { OpenSnDPlansPage } from '~/utils/Redirection';

export default {

  props: {
    existingTags: {
      type: Array,
      default: () => [],
    },

    allUserTags: {
      type: Array,
      default: () => [],
    },

    showMobileLayout: {
      type: Boolean,
      default: false,
    },

    isAwaitingApiResponse: {
      type: Boolean,
      default: false,
    },

    tagAllQuestion: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['close', 'save', 'tagAll'],

  data() {
    return {
      tagValidationFailError: '',
      tags: [],
      showTagBanner: true,
      originalTags: [],
      selectedTags: [],
      searchTerm: null,
      curriculumList: [],
      listLoading: false,
    };
  },

  computed: {
    ...mapGetters('root', ['isDesktop']),
    ...mapGetters('contentEditor', ['showCurriculumSelection', 'getCurriculum', 'chosenStandards', 'quizId', 'draftId', 'savedStandards']),

    isCorporateUser() {
      return this.$user.isCorporate;
    },

    isSaveBtnDisabled() {
      return (this.tags.length > 5);
    },

    dropdownTags() {
      return this.allUserTags.map((val) => ({ title: val, value: val }));
    },

    isStuckToBottom() {
      return this.showMobileLayout && !this.isDesktop;
    },

    shouldShowStandardTagging() {
      return !!this.$user.paidOrganization && this.showCurriculumSelection && (!!get(this.$user, 'preferences.curriculum.default', null) || !!this.getCurriculum);
    },

    dropdownIcon() {
      return {
        render() {
          return hydrate(FA, {
            icon: 'fas fa-alt-down',
            size: 11,
          });
        },
      };
    },

    selectedCurriculumId: {
      get() {
        return this.getCurriculum?._id;
      },
      set(curriculumId) {
        const filteredList = this.curriculumList
          .filter((cur) => cur._id === curriculumId);
        const curriculum = filteredList.length ? filteredList[0] : {};
        this.$store.dispatch('contentEditor/setPreviousFilter', { subject: '', grade: '' });
        this.$store.dispatch('contentEditor/setCurriculum', curriculum);
      },
    },

    selectBoxCurriculums() {
      // format list to be accepted by SelectBox
      return this.curriculumList.map((curriculum) => this.selectBoxCurriculumMapper(curriculum));
    },
  },

  async created() {
    await this.loadCurriculumsList();

    this.handleSearchTermInput = debounce(this.handleSearch, 600);
  },

  mounted() {
    if (this.existingTags.length > 0) {
      this.originalTags.push(...this.existingTags);
      this.tags.push(...this.existingTags);
    }
  },

  beforeUnmount() {
    if (this.tags === 0) {
      this.$analytics.logEvent('no_standard_tag', {});
    }
  },

  methods: {
    setTags(tags, shouldClearTagInput = false) {
      if (shouldClearTagInput) {
        this.$refs.tagInput.clearTags();
      }
      this.tags = tags;
    },

    selectBoxCurriculumMapper(curriculum) {
      // map curriculum to SelectBox object
      const {
        description, name: title, state, country, _id,
      } = curriculum;
      const subtitle = [description, state?.join(', '), country?.join(', ')]
        .filter(Boolean)
        .join(' | ');
      return {
        _id,
        value: _id,
        title,
        subtitle,
      };
    },

    closeTagBanner() {
      this.showTagBanner = false;
    },

    async loadCurriculumsList() {
      this.listLoading = true;
      const curriculumList = await CurriculumService.getCurriculumList();
      this.curriculumList = curriculumList?.data?.data?.curriculums || [];
      this.listLoading = false;
    },

    async handleSaveTags() {
      const currentInputValue = this.$refs.tagInput.getCurrentInputValue();
      if (currentInputValue) {
        this.tags.push(currentInputValue.trim());
      }

      if (this.$refs.standardTagging) {
        this.$store.dispatch('contentEditor/setPreviousStandards', this.$refs.standardTagging.selectedStandards);
        this.$store.dispatch('contentEditor/setPreviousFilter', { grade: this.$refs.standardTagging.grade, subject: this.$refs.standardTagging.subject });
        const standards = { ...this.savedStandards };

        [...this.$refs.standardTagging.selectedStandards].forEach((standard) => {
          standards[standard._id] = {
            id: standard._id,
            short_code: standard.short_code,
            title: standard.title,
            description: standard.description,
          };
        });

        LocalStorage.setItem('standardList', this.selectedTags);

        await QuizService.update(this.quizId, this.draftId, { stateStandards: standards });

        this.$store.dispatch('contentEditor/setStateStandards', standards);
        this.$emit('save', this.tags, this.$refs.standardTagging.selectedStandards);

        if (this.tagAllQuestion) {
          this.$emit('tagAll', this.$refs.standardTagging.selectedStandards[0]);
        }
        return;
      }

      this.$emit('save', this.tags);
    },

    validateTag(tag) {
      if (!tag) {
        this.tagValidationFailError = this.$i18n('Please enter a valid tag');
        return false;
      }

      if (tag.length > 50) {
        this.tagValidationFailError = this.$i18n('A topic can have a maximum of {$1} characters', [50]);
        return false;
      }

      return true;
    },

    handleSearch(text) {
      this.searchTerm = text;
    },

    handleStateStandardTagInput(tag) {
      if (!this.selectedTags.includes(tag._id) && tag._id !== tag.short_code) {
        this.selectedTags.push({ id: tag._id, code: tag.short_code });
      }
      this.$refs.tagInput.addTag(tag.short_code);
    },

    setSelectedCurriculum(curriculum) {
      this.$store.dispatch('contentEditor/setCurriculum', curriculum);

      this.$refs.curriculumDropdown.close();
    },

    handleRemovalOfStandard(standard) {
      this.$refs.tagInput.deleteTag(this.tags.indexOf(standard));
    },

    onSndAdCTAClick() {
      MoengageService.triggerEvent(this.$user, 'event', 'SD Interest');
      LifecycleEventService.triggerEvent(this.$constants.LifecycleEventServices.BRAZE, this.$user, 'event', 'SD Interest');
      OpenSnDPlansPage(this.$constants.FeatureTypes.TOPIC_TAGS, 'snd-click');
    },
  },
};
</script>
