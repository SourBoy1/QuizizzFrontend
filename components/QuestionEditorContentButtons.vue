<template>
  <div
    class="editor-content-btns z-20 flex"
    :class="{
      'ml-auto gap-2': isDesktop,
      'flex-col bg-dark': !isDesktop,
    }"
  >
    <template v-if="shouldShowParticipantViewButton">
      <Button
        type="transparent"
        :title="$i18n('Participants\' view')"
        licon="fa-regular fa-users"
        @click="$emit('showParticipantView')"
      />
      <div class="h-full mx-2 border-l border-dark-5" />
    </template>
    <PopoverConfirmer
      v-if="!showOnlySaveButton"
      class="content-button-popover-container flex-1 md:flex-initial"
      type="warn"
      placement="top"
      trigger="manual"
      :open="isCancelConfirmerVisible"
      :content="{
        title: $i18n('Are you sure?'),
        subTitle: '',
      }"
      :button1="{
        title: $i18n('No'),
      }"
      :button2="{
        title: $i18n('Yes'),
      }"
      @button2Clicked="onQuestionEditAction('cancel', 'popoverBtn')"
    >
      <Button
        :type="isDesktop ? 'dark' : 'transparent'"
        :size="isDesktop ? 'md' : 'lg'"
        class="w-full md:w-initial"
        :aria-label="$i18n('Cancel editing question')"
        :tabindex="155"
        :title="$i18n('Cancel')"
        :loading="isEditActionInProgress['cancel']"
        @click="onQuestionEditAction('cancel', 'btn')"
      />
    </PopoverConfirmer>

    <PopoverInfo
      trigger="click"
      class="flex-1 md:flex-intial content-button-popover-container"
      placement="top-end"
      type="danger"
      :show="!isCurrentQuestionValidated"
      :disabled="isCurrentQuestionValidated"
      :open="showSaveButtonPopover"
      :delay="tooltipDelay"
    >
      <Button
        v-tooltip.bottom="saveButtonTooltip"
        type="white"
        :size="isDesktop ? 'md' : 'lg'"
        :tabindex="150"
        data-cy="save-question-button"
        class="w-full md:w-initial"
        :aria-label="$i18n('Save question')"
        :licon="isDesktop ? 'fas fa-save' : ''"
        :applyDisabled="false"
        :title="isDesktop ? $i18n('Save') : $i18n('Done')"
        :loading="isEditActionInProgress['save']"
        :class="{
          'animate__animated animate__headShake animation-duration-600': isSaveBtnInErrorState,
          'bg-dark-6 text-dark-20%': !isCurrentQuestionValidated,
        }"
        @mouseover="onSaveButtonFocusIn()"
        @mouseout="onSaveButtonFocusOut()"
        @focus="onSaveButtonFocusIn()"
        @blur="onSaveButtonFocusOut()"
        @click="onSaveButtonClick()"
      />

      <template #popover-content>
        <div class="p-4 text-center body text max-w-64">
          <QuestionTypeErrorStrings :errorCodes="currentQuestionErrors" />
        </div>
      </template>
    </PopoverInfo>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

import { browserOS } from '~/utils/Utilities';
import { asyncDelay } from '~/services/PausableTimers';

export default {
  props: {
    isCancelConfirmerVisible: {
      type: Boolean,
      default: false,
    },

    isSaveBtnInErrorState: {
      type: Boolean,
      default: false,
    },

    isCurrentQuestionValidated: {
      type: Boolean,
      default: false,
    },

    isEditActionInProgress: {
      type: Object,
      default: () => ({
        cancel: false,
        save: false,
        disable: false,
      }),
    },

    currentQuestionErrors: {
      type: Array,
      default: () => ([]),
    },

    showOnlySaveButton: {
      type: Boolean,
      default: false,
    },

    generatedOptionsForCurrentSlide: {
      type: Array,
      default: () => ([]),
    },

    quizEditorDisplayType: {
      type: String,
      default: 'full',
    },
  },
  emits: ['showParticipantView', 'onQuestionEditAction', 'onSaveButtonFocused'],

  data() {
    return {
      showSaveButtonPopover: false,
      tooltipDelay: { show: 100, hide: 400 },
    };
  },

  computed: {
    ...mapGetters('root', ['isDesktop']),

    shouldShowParticipantViewButton() {
      const isParticipantViewEnabled = this.$featureFlags.isEnabled(this.$constants.FeatureFlagsTypes.PARTICIPANT_VIEW_ON_EDITOR) && this.quizEditorDisplayType === 'full';
      return this.isDesktop && isParticipantViewEnabled;
    },

    isOSMac() {
      return browserOS().isMac;
    },

    shortcutMetaKey() {
      return this.isOSMac ? '\u2318' : 'ctrl';
    },

    isAnyEditActionInProgress() {
      return this.isEditActionInProgress.save || this.isEditActionInProgress.cancel || this.isEditActionInProgress.disable;
    },

    saveButtonTooltip() {
      return this.isCurrentQuestionValidated ? { content: this.$i18n('Save question ({$1} + s)', [this.shortcutMetaKey]) } : null;
    },
  },

  watch: {
    currentQuestionErrors: {
      immediate: true,
      handler(current) {
        this.$store.dispatch('uiManager/setQuestionEditorValidations', current);
      },
    },
  },

  mounted() {
    window.addEventListener('keydown', this.onKeydownEvent);
  },

  beforeUnmount() {
    window.removeEventListener('keydown', this.onKeydownEvent);
  },

  methods: {
    async onKeydownEvent(event) {
      if (((!this.isOSMac && event.ctrlKey) || (this.isOSMac && event.metaKey)) && event.code === 'KeyS') {
        event.preventDefault();
        /* Added this wait intentionally to avoid save using ctrl + s while the question is being validated */
        await asyncDelay(800);
        this.onQuestionEditAction('save');
        this.onSaveButtonFocusIn();
      }
    },

    onQuestionEditAction(action, source) {
      this.$store.dispatch('analyticsManager/addBreadcrumb', `QT:${action}`);
      if (this.isAnyEditActionInProgress) {
        return;
      }
      this.$emit('onQuestionEditAction', action, source);
    },

    onSaveButtonClick() {
      this.onQuestionEditAction('save');
      this.onSaveButtonFocusIn();
    },

    onSaveButtonFocusIn() {
      this.$emit('onSaveButtonFocused', true);
      this.showSaveButtonPopover = true;
    },

    onSaveButtonFocusOut() {
      this.$emit('onSaveButtonFocused', false);
      this.showSaveButtonPopover = false;
    },
  },

};
</script>

<style lang="scss" scoped>
.content-button-popover-container {
  >.trigger {
    width: 100%;
  }
}
</style>
