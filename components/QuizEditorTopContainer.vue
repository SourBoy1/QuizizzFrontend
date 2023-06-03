<template>
  <div
    class="question-editor-top-container mb-4 sticky z-50 top-12 left-0"
    translate="no"
  >
    <div
      v-if="isCurrentStateEdit"
      class="flex w-100 max-w-160 md:mx-2 md:w-full p-4 border border-solid rounded-b-lg border-dark-6 bg-light-3 shadow-soft-low-high"
    >
      <template v-if="isDesktop">
        <div :class="['flex flex-col left-content mr-0']">
          <p class="mb-2 text-base font-semibold text-center text-dark-2 md:text-left">
            <i18n>Teleport from the Quizizz library</i18n>
          </p>

          <form
            ref="search-form"
            class="flex"
            @submit.prevent="onSearchTeleport"
          >
            <Input
              :placeholder="isDesktop ? $i18n('Search from millions of questions') : $i18n('Search for questions')"
              licon="far fa-search"
              :value="teleportSearchTerm"
              :disabled="isQuestionLimitReached"
              readonly
              :button="{
                title: $i18n('Search'),
                type: 'secondary',
                size: 'md',
                disabled: isQuestionLimitReached,
                applyDisabled: false,
              }"
              disableButtonWidth
              @focus="onSearchFocus"
              @buttonClicked="onSearchTeleport"
              @input="onTeleportSearchInputChange"
            />
          </form>
        </div>

        <div
          v-if="questions.length"
          class="relative flex-1 ml-6 right-content"
        >
          <p class="mb-2 text-base font-semibold text-dark-2">
            <i18n>Create a question</i18n>
          </p>
          <Button
            class="w-full new-question-btn"
            :title="$i18n('New question')"
            :aria-label="$i18n('Hide question media selector')"
            size="md"
            type="secondary"
            licon="far fa-plus-circle"
            :disabled="isQuestionLimitReached"
            :applyDisabled="false"
            @click="toggleNewQuestionList"
          />
        </div>
      </template>
      <div
        v-else
        class="flex gap-x-2 w-full"
      >
        <Button
          class="flex-1 new-question-btn"
          :title="isMobile ? $i18n('Search questions') : $i18n('Search from the Quizizz library')"
          size="md"
          type="secondary"
          licon="far fa-search"
          :disabled="isQuestionLimitReached"
          :applyDisabled="false"
          @click="onSearchTeleport"
        />
        <Button
          v-if="questions.length"
          class="flex-1 new-question-btn"
          :title="$i18n('New question')"
          size="md"
          type="secondary"
          licon="far fa-plus-circle"
          :disabled="isQuestionLimitReached"
          :applyDisabled="false"
          @click="toggleNewQuestionList"
        />
      </div>
    </div>

    <div
      v-else
      class="flex justify-between p-4 border border-solid rounded-b-lg border-dark-6 bg-light-3 shadow-soft-lowest"
      :class="{
        'flex-col max-w-160': !isDesktop,
        'w-160': isDesktop,
        'mt-3': isFlaggedCorporateUser,
      }"
    >
      <p :class="[!isDesktop ? 'text-center mb-2' : 'flex items-center justify-center']">
        <i18n>Drag questions to reorder.</i18n>
      </p>

      <div class="flex">
        <PopoverConfirmer
          v-if="haveQuestionsBeenReordered"
          type="warn"
          placement="top"
          :content="{
            title: $i18n('Are you sure?'),
            subTitle: $i18n('Changes you made may not be saved.'),
          }"
          :button1="{
            title: $i18n('Keep changes'),
          }"
          :button2="{
            title: $i18n('Discard changes'),
          }"
          @button2Clicked="onRevertReorderClicked"
        >
          <Button
            class="w-full h-8"
            :title="$i18n('Cancel')"
            :aria-label="$i18n('Revert reorder changes')"
            size="md"
            type="other"
          />
        </PopoverConfirmer>
        <Button
          v-else
          class="w-full h-8"
          :title="$i18n('Cancel')"
          :aria-label="$i18n('Revert reorder changes')"
          size="md"
          type="other"
          @click="onRevertReorderClicked"
        />

        <Button
          class="w-full h-8 ml-4"
          :title="$i18n('Save')"
          :aria-label="$i18n('Apply reorder changes')"
          size="md"
          type="primary"
          :loading="isUpdateReorderQuestionsInProgress"
          @click="handledReorderChanges"
        />
      </div>
    </div>
  </div>
</template>

<script>

import { mapGetters } from 'vuex';

import HotjarService, { HotjarEvents } from '~/services/HotjarService';

export default {
  props: {
    currentState: {
      type: String,
      default: 'edit',
      validator: (val) => ['edit', 'reorder'].includes(val),
    },

    isUpdateReorderQuestionsInProgress: {
      type: Boolean,
      default: false,
    },

    questions: {
      type: Array,
      default: () => [],
    },

    isQuestionLimitReached: {
      type: Boolean,
      default: false,
    },

    haveQuestionsBeenReordered: {
      type: Boolean,
      default: false,
    },

  },
  emits: ['onQuestionsReordered', 'changeCurrentState', 'onSearchTeleport', 'toggleNewQuestionList', 'toggleQuestionLimitModal'],

  data() {
    return {
      showNewQuestionList: false,
      teleportSearchTerm: '',
    };
  },

  computed: {
    ...mapGetters('root', ['deviceProps', 'isDesktop', 'serverData', 'isMobile']),
    isCurrentStateEdit() {
      return this.currentState === 'edit';
    },
    isDesktop() {
      return this.deviceProps.type === this.$constants.DeviceTypes.DESKTOP;
    },

    isCorporateUser() {
      return this.$user.isCorporate;
    },

    isFlaggedCorporateUser() {
      if (this.isCorporateUser) {
        return this.$featureFlags.isEnabled(this.$constants.FeatureFlagsTypes.QFW_CREATE_FLOW);
      }
      return false;
    },
  },

  methods: {
    handledReorderChanges() {
      this.$emit('onQuestionsReordered');
    },

    onRevertReorderClicked() {
      this.$emit('changeCurrentState', 'edit');
    },

    onTeleportSearchInputChange(value) {
      if (this.isQuestionLimitReached) {
        this.toggleQuestionLimitModal();
      } else {
        this.teleportSearchTerm = value;
      }
    },

    logTeleportSearchEvent(source) {
      const eventName = this.$webEvents.getQuizEditorEvent(this.$constants.ContentType.QUIZ, this.$webEvents.EDITOR_TELEPORT_SEARCH);
      this.$analytics.logEvent(eventName, {
        term: this.teleportSearchTerm,
        quizId: this.quizId,
        previous_source: source,
      });
    },

    onSearchFocus() {
      if (this.$user.occupation === 'corporate_teacher') {
        HotjarService.triggerEvent(HotjarEvents.TELEPORT_SEARCH);
      }
      this.logTeleportSearchEvent('search_bar');
      this.$emit('onSearchTeleport', this.teleportSearchTerm);
    },

    onSearchTeleport() {
      this.logTeleportSearchEvent('search_button_outside');
      this.$emit('onSearchTeleport', this.teleportSearchTerm);
    },

    toggleNewQuestionList() {
      if (this.isQuestionLimitReached) {
        this.toggleQuestionLimitModal();
      } else {
        this.$emit('toggleNewQuestionList');
      }
    },

    toggleQuestionLimitModal() {
      this.$emit('toggleQuestionLimitModal');
    },
  },
};
</script>

<style scoped lang="scss">
  .question-editor-top-container {
    display: flex;
    justify-content: center;
    width: 100%;
  }
  .left-content {
    flex: 2;
  }
  .right-content {
    flex: 1;
  }
  .new-question-btn {
    height: 40px;
  }
  .backdrop-shadow {
    box-shadow: 0px 0px 0px 9999px rgba(0, 0, 0, 0.5);
  }
  .banner-image {
    position: absolute;
    top: -110px;
    left:0;
  }
</style>
