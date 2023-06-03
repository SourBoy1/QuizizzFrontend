<template>
  <div class="sticky w-90">
    <div class="top-18 question-editor-settings-inner-container">
      <div class="p-4 mb-2 border border-solid border-dark-6 rounded-2xl ">
        <div class="mt-3 rounded-md">
          <div
            translate="no"
            class="relative mb-4 border border-dashed rounded w-82 h-38 border-dark-6 image-container"
          >
            <button
              v-if="hasTitleImage"
              :aria-label="$i18n('Delete')"
              class="bg-red-faded w-8 h-8 rounded-sm absolute right-1 top-1"
              type="button"
              @click="handleDeleteImage"
            >
              <FA
                class="text-red-dark"
                icon="fas fa-trash-alt"
                :size="14"
              />
            </button>

            <button
              v-if="!hasTitleImage"
              class="flex flex-col items-center justify-center w-full h-full"
              type="button"
              @click="toggleSettings"
            >
              <div
                class="inline-flex items-center justify-center w-16 h-16 rounded-full text-light-3"
                :class="[isCorporateUser ? 'bg-dark-10%' : 'bg-brand-b']"
              >
                <FA
                  icon="fas fa-image"
                  :size="28"
                />
              </div>
              <div class="flex flex-col items-center justify-center mt-4 text-xs text-center text-dark-4 w-50">
                <p class="text-xs text-dark-4">
                  <i18n>Click here to upload a quiz image</i18n>
                </p>
              </div>
            </button>

            <img
              v-if="hasTitleImage"
              :src="`${draft.image}?w=400&h=400`"
              alt=""
              class="object-contain w-full h-full"
            />
          </div>

          <div class="flex justify-between">
            <p class="text-lg font-semibold quiz-name-style text-dark-2 max-w-70">
              {{ draft.name }}
            </p>

            <Button
              translate="no"
              licon="fas fa-pen"
              type="other"
              size="xs"
              :aria-label="$i18n('Edit Quiz')"
              @click="toggleSettings"
            />
          </div>

          <div
            translate="no"
            class="flex items-center"
          >
            <template v-if="canShowCompleteQuizInfo">
              <button
                class="flex items-center text-lilac hover:text-lilac-light active:text-lilac-dark"
                type="button"
                @click="toggleSettings"
              >
                <FA
                  icon="far fa-eye"
                  :size="11"
                  class="mr-1"
                />
                <span class="text-xs font-semibold">{{ quizVisibilityTitle }}</span>
              </button>

              <span class="w-1 h-1 mx-2 rounded-full bg-lilac" />

              <button
                class="flex items-center text-lilac hover:text-lilac-light active:text-lilac-dark"
                type="button"
                @click="toggleSettings"
              >
                <FA
                  icon="far fa-language"
                  :size="11"
                  class="mr-1"
                />
                <span class="text-xs font-semibold">{{ draft.lang || $i18n('Set Language') }}</span>
              </button>

              <span class="w-1 h-1 mx-2 rounded-full bg-lilac" />
            </template>

            <Dropdown
              v-slot="scope"
              icon="fas fa-stopwatch"
              class="w-24"
              :iconComponent="timerDropdownIcon"
              size="xs"
              autoPosition
              type="custom"
              :customClasses="customClassesForDropdown"
              :title="getTimeTitle"
              :tooltip="{ content: $i18n('Set default time for all questions'), placement: 'top-left' }"
              openDirection="top"
              :ariaLabel="$i18n('Change time for all questions')"
              :selectedItem="getTimeTitle"
              :loading="isDefaultTimeChangeLoading"
            >
              <TimerDropdown
                class="overflow-y-auto h-50"
                @onTimeSelected="onTimeSelected"
                @closeDropdown="scope.closeDropdown"
              />
            </Dropdown>
            <!-- <PopoverConfirmer
              :open="shouldShowPointsPopoverInfo"
              trigger="manual"
              type="info"
              placement="top"
              :content="{
                title: $i18n('Change points for all questions'),
                subTitle: $i18n('Quickly edit and change the points awarded for all of your questions, in one go.'),
              }"
              :button2="{
                title: $i18n('Try now'),
              }"
              @button1Clicked="handlePopupInteraction"
              @button2Clicked="handlePopupInteraction"
            >
              <Dropdown
                v-slot="scope"
                icon="fas fa-stopwatch"
                class="w-24"
                :iconComponent="pointsDropdownIcon"
                size="xs"
                autoPosition
                type="custom"
                :customClasses="customClassesForDropdown"
                :title="getPointsTitle"
                :tooltip="{ content: $i18n('Set default points for all questions'), placement: 'top-left'}"
                openDirection="top"
                :ariaLabel="$i18n('Change points for all questions')"
                :selectedItem="getPointsTitle"
                :loading="isDefaultPointsChangeLoading"
              >
                <ul class="py-1 overflow-y-auto max-h-52">
                  <button
                    v-for="(points, index) in pointsList"
                    :key="index"
                    class="cursor-pointer active:bg-dark-10% py-2 pl-2 w-full text-sm flex items-center overflow-hidden text-left text-dark-3 max-h-80 font-semibold hover:bg-dark-5%"
                    @click="onPointsSelected(points, scope.closeDropdown)"
                  >
                    <span>
                      {{ getPointsListText(points) }}
                    </span>
                  </button>
                </ul>
              </Dropdown>
            </PopoverConfirmer> -->
          </div>

          <div
            translate="no"
            class="w-full h-px my-4 bg-dark-6"
          />

          <div class="import-wrapper mb-4">
            <p class="mb-3 text-sm font-semibold">
              Import from:
            </p>
            <button
              v-if="canShowAiQuizConverter"
              class="hover:bg-dark-5% rounded-sm hover:border-dark-5% active:text-dark-3 text-dark-2 flex w-full mb-2 justify-between items-center"
              type="button"
              @click="$emit('openQuizGeneratorModal')"
            >
              <div class="flex items-center">
                <div class="w-4 h-auto flex items-center justify-start mx-1">
                  <FA
                    icon="fa-solid fa-sparkles"
                    :size="12"
                  />
                </div>
                <span class="text-sm font-semibold">
                  <i18n>AI Quiz converter</i18n>
                </span>
                <span
                  class="min-w-8 min-h-4 flex justify-center items-center bg-red rounded text-tn text-light-3 font-semibold ml-2"
                >
                  <i18n>NEW</i18n>
                </span>
              </div>
              <FA
                icon="fas fa-upload"
                class="panel-icon w-7 h-7 p-2 bg-dark-5% rounded"
                :size="11"
              />
            </button>
            <button
              class="hover:bg-dark-5% rounded-sm hover:border-dark-5% active:text-dark-3 text-dark-2 flex w-full mb-2 justify-between items-center"
              type="button"
              @click="handleImportGoogleForms"
            >
              <div class="flex items-center">
                <div class="w-4 h-auto flex items-center justify-start mx-1">
                  <FA
                    icon="fa-solid fa-file-lines"
                    :size="12"
                  />
                </div>
                <span class="text-sm font-semibold">
                  <i18n>Google Forms</i18n>
                </span>
                <span
                  v-if="!canShowAiQuizConverter"
                  class="min-w-8 min-h-4 flex justify-center items-center bg-red rounded text-tn text-light-3 font-semibold ml-2"
                >
                  <i18n>NEW</i18n>
                </span>
              </div>
              <FA
                icon="fas fa-upload"
                class="panel-icon w-7 h-7 p-2 bg-dark-5% rounded"
                :size="11"
              />
            </button>
            <button
              class="hover:bg-dark-5% rounded-sm hover:border-dark-5% active:text-dark-3 text-dark-2 flex w-full mb-2 justify-between items-center"
              type="button"
              @click="toggleImportSpreadsheetModal"
            >
              <div class="flex">
                <div class="flex items-center justify-start w-4 h-auto mx-1">
                  <FA
                    icon="far fa-file-excel"
                    :size="12"
                  />
                </div>
                <span class="text-sm font-semibold">
                  <i18n>Spreadsheet</i18n>
                </span>
              </div>
              <FA
                icon="fas fa-upload"
                class="panel-icon w-7 h-7 p-2 bg-dark-5% rounded"
                :size="11"
              />
            </button>
          </div>

          <div
            translate="no"
            class="bg-dark-6 w-full h-px my-4"
          />

          <div
            translate="no"
            class="w-full"
          >
            <button
              v-if="canShowCompleteQuizInfo"
              translate="no"
              class="hover:bg-dark-5% rounded-sm hover:border-dark-5% active:text-dark-3 text-dark-2 flex w-full justify-between items-center mb-2"
              type="button"
              @click="toggleSettings"
            >
              <div class="flex">
                <div class="flex items-center justify-start w-4 h-auto mx-1">
                  <FA
                    icon="far fa-graduation-cap"
                    :size="12"
                  />
                </div>
                <span class="text-sm font-semibold">{{ hasGrade ? gradeLabel : $i18n('Add grades') }}</span>
              </div>

              <FA
                icon="fas fa-pen"
                class="panel-icon w-7 h-7 p-2 bg-dark-5% rounded"
                :size="11"
              />
            </button>

            <button
              v-if="canShowCompleteQuizInfo"
              translate="no"
              class="hover:bg-dark-5% rounded-sm hover:border-dark-5% active:text-dark-3 text-dark-2 flex w-full justify-between items-center"
              type="button"
              @click="toggleSettings"
            >
              <div class="flex">
                <div class="flex items-center justify-start w-4 h-auto mx-1">
                  <FA
                    icon="far fa-book"
                    :size="12"
                  />
                </div>
                <span class="subjects-title text-sm font-semibold">{{ hasSubjects ? subjectsList : $i18n('Add subject')
                }}</span>
              </div>

              <FA
                icon="fas fa-pen"
                class="panel-icon w-7 h-7 p-2 bg-dark-5% rounded"
                :size="11"
              />
            </button>
          </div>
        </div>
      </div>

      <div
        translate="no"
        class="relative flex flex-row items-center p-2 mb-0 border border-solid flex-start border-dark-6 rounded-t-2xl text-lilac-light bg-lilac-faded"
      >
        <div class="flex items-center justify-center flex-shrink-0 mr-2 min-w-10">
          <FA
            icon="fas fa-balance-scale-right"
            class="text-lilac-light"
            :size="24"
          />
        </div>
        <p class="text-sm font-semibold">
          <i18n>You can now customize the weightage of each question in your quiz.</i18n>
          <a
            href="https://support.quizizz.com/hc/en-us/articles/5981472562841-Manual-Grading-with-Customized-Scores?source=quiz-editor-rescore"
            rel="noopener noreferrer"
            class="font-bold underline"
          >
            <i18n>Learn more</i18n>
          </a>
        </p>
        <span
          class="absolute flex items-center justify-center font-semibold rounded new-snackbar min-w-8 min-h-4 -top-2 -left-2 bg-red text-tn text-light-3"
        >
          <i18n>NEW</i18n>
        </span>
      </div>

      <div
        translate="no"
        class="p-4 mb-4 border border-solid border-dark-6 rounded-b-2xl"
      >
        <p class="mb-1 text-sm font-semibold text-dark-4">
          <i18n>Total points</i18n>
        </p>
        <p class="mb-1 text-sm font-semibold text-dark-4">
          <span class="text-3xl">{{ getTotalQuizMarks }}</span>&nbsp;<i18n>points</i18n>,&nbsp;
          <span class="text-3xl">{{ getTotalGradedQuestions }}</span>&nbsp;<i18n>graded questions</i18n>
        </p>
      </div>

      <div
        translate="no"
        class="p-4 mb-2 border border-solid border-dark-6 rounded-2xl"
      >
        <h3 class="mb-1 text-sm font-semibold text-dark-2">
          <i18n>Quiz quality score</i18n>
        </h3>

        <p class="mb-1 text-sm font-semibold text-dark-4">
          <span class="text-3xl">{{ getQuizQualityScore }}</span>/10 {{ Number(getQuizQualityScore) === 10 ? '🎉' : '' }}
        </p>

        <div class="flex w-full h-2 mb-3 overflow-hidden rounded-2xl">
          <div
            :class="[getQuizScoreProgressBgClass, 'h-full']"
            :style="{ width: `${progressBarScoreWidth}%` }"
          />
          <div
            :class="['bg-dark-6 h-full']"
            :style="{ width: `${100 - progressBarScoreWidth}%` }"
          />
        </div>

        <div
          v-for="task, index in taskList"
          :key="index"
        >
          <div class="flex mb-3 pointer-events-none">
            <Checkbox
              :inputId="getUUID()"
              :aria-label="$i18n('{$1}', [task.title])"
              name="checkboxes"
              size="md"
              :checked="task.status"
            />
            <span :class="['font-semibold text-sm', task.status ? 'text-dark-4 line-through' : 'text-dark-2']">{{
              task.title }}</span>
          </div>
          <div
            v-if="task.isStandard && untagQuestionsCount"
            class="relative text-xs font-bold text-dark-4 w-fit left-6 bottom-2"
          >
            ({{ untagQuestionsCount }} <i18n>remaining</i18n>)
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { h as hydrate } from 'vue';
import { mapGetters } from 'vuex';
import isEmpty from 'lodash/isEmpty';
import values from 'lodash/values';

import { getUUID } from '~/services/UIDService';
import { makeAsideStickyAndScrollable } from '~/utils/Utilities';
import { ContentDefaultName } from '../config/DefaultCopies';

import FA from './FA.vue';

export default {
  emits: ['setDefaultPoints', 'togglePublishModal', 'togglePrecreateModal', 'toggleImportModal', 'setDefaultTime'],
  data() {
    return {
      startScroll: 0,
      currPos: 0,
      screenHeight: 0,
      sideBarHeight: 0,
      endScroll: 0,
      pointsList: Array.from(Array(21).keys()).slice(1),
      shouldShowConfirmer: true,
      localStorageKeyForBatchPoints: 'showPopupForBatchPoints',
    };
  },

  computed: {
    ...mapGetters('contentEditor', ['draft', 'sortedQuestions', 'getDraftPreferences', 'getTotalQuizMarks', 'getTotalGradedQuestions', 'isDefaultTimeChangeLoading', 'isDefaultPointsChangeLoading', 'quizId']),
    ...mapGetters('root', ['isMobile']),

    customClassesForDropdown() {
      return 'text-lilac hover:text-lilac-light active:text-lilac-dark';
    },

    canShowAiQuizConverter() {
      if (this.isMobile) {
        return false;
      }
      return this.$featureFlags.isEnabled(this.$constants.FeatureFlagsTypes.AI_QUIZ_GENERATOR);
    },

    hasTitleImage() {
      return !isEmpty(this.draft.image);
    },

    shouldShowPointsPopoverInfo() {
      if (!this.shouldShowConfirmer || localStorage.getItem(this.localStorageKeyForBatchPoints)) {
        return false;
      }

      return true;
    },

    quizVisibilityTitle() {
      return this.draft.visibility ? this.$i18n('Public') : this.$i18n('Private');
    },

    taskList() {
      const checkList = [
        {
          title: this.$i18n('Pick a relevant quiz name'),
          status: this.quizQualityFlags.quizName,
          isHidden: false,
        },
        {
          title: this.$i18n('Add a quiz image'),
          status: this.quizQualityFlags.quizImage,
          isHidden: false,
        },
        {
          title: this.$i18n('Add grades'),
          status: this.quizQualityFlags.quizGrades,
          isHidden: this.$user.isCorporate,
        },
        {
          title: this.$i18n('Add subject'),
          status: this.quizQualityFlags.quizSubject,
          isHidden: this.$user.isCorporate,
        },
        {
          title: this.$i18n('Add at least 4 questions'),
          status: this.quizQualityFlags.quesCount,
          isHidden: false,
        },
      ];
      if (this.$user.isPartOfAnOrganization) {
        checkList.push({
          title: this.$i18n('Tag all questions with a standard'),
          status: this.quizQualityFlags.isStandardTagged,
          isHidden: false,
          isStandard: true,
        });
      }
      return checkList.filter((task) => !task.isHidden);
    },

    gradeLabel() {
      return this.$stringUtils.gradeLabel(this.draft.grade);
    },

    defaultName() {
      return ContentDefaultName.QUIZ_NAME;
    },

    quizQualityFlags() {
      const flags = {};

      flags.quizName = this.draft.name && this.draft.name !== this.defaultName;
      flags.quizImage = !!(this.draft.image);
      flags.quesCount = !!(this.draft.questions.length >= 4);
      flags.quizSubject = !!(this.draft.subjects.length > 0);
      if (this.$user.isPartOfAnOrganization) {
        flags.isStandardTagged = this.draft.questions
          .filter((question) => question.standardIds?.length > 0)
          .length === this.draft.questions?.length;
      }
      if (!this.$user.isCorporate) {
        flags.quizGrades = !!(this.draft.grade.length > 0);
      }

      return flags;
    },

    hasGrade() {
      return this.draft.grade.length > 0;
    },

    hasSubjects() {
      return this.draft.subjects.length > 0;
    },

    untagQuestionsCount() {
      return this.draft.questions?.length - this.draft.questions?.filter((question) => question.standardIds?.length > 0).length;
    },

    getQuizQualityScore() {
      const flagsArray = values(this.quizQualityFlags);

      if (flagsArray.length) {
        const baseScore = 10 / flagsArray.length;
        const score = flagsArray.reduce((partSum, val) => partSum + Number(val) * baseScore, 0);
        return Math.round(score * 100) / 100;
      }
      return 0;
    },

    getQuizScoreProgressBgClass() {
      const progressWidth = (this.getQuizQualityScore / 10) * 100;

      if (progressWidth >= 66.66) {
        return 'bg-green-dark';
      } if (progressWidth >= 33.33) {
        return 'bg-yellow';
      }

      return 'bg-red';
    },

    progressBarScoreWidth() {
      return this.getQuizQualityScore * 10;
    },

    selectedTime() {
      let time = this.getDraftPreferences.time || -1;

      if (time < 0) {
        time = this.$constants.QuestionDefaultTimes[this.$constants.QuestionTypes.MCQ];
      }

      return time;
    },

    selectedPoint() {
      let points = this.getDraftPreferences.marks || -1;

      if (points < 0) {
        points = this.$constants.QuestionDefaultPoints;
      }

      return points;
    },

    getTimeTitle() {
      const inSecs = this.selectedTime / 1000;
      const inMinutes = inSecs / 60;

      if (inMinutes >= 1) {
        return `${inMinutes} m`;
      }

      return `${inSecs} s`;
    },

    getPointsTitle() {
      return `${this.selectedPoint} pt${this.selectedPoint === 1 ? '' : 's'}`;
    },

    subjectsList() {
      return this.draft.subjects.join(' | ');
    },

    timerDropdownIcon() {
      return {
        render() {
          return hydrate(FA, {
            icon: 'fas fa-stopwatch',
            size: 11,
          });
        },
      };
    },

    pointsDropdownIcon() {
      return {
        render() {
          return hydrate(FA, {
            icon: 'fas fa-check-circle',
            size: 11,
          });
        },
      };
    },

    isCorporateUser() {
      return this.$user.isCorporate;
    },

    canShowCompleteQuizInfo() {
      return !this.isCorporateUser;
    },
  },

  mounted() {
    this.cleanupHook = makeAsideStickyAndScrollable(this.$el, 72);
  },

  beforeUnmount() {
    this.cleanupHook();
  },

  methods: {
    getUUID() {
      return getUUID();
    },

    handleDeleteImage() {
      this.$store.dispatch('contentEditor/setImage', '');
      this.$store.dispatch('contentEditor/setQuizPreference', { preference: 'image', value: '' });
      const info = {
        image: '',
      };
      this.$store.dispatch('contentEditor/updateContentMetaInfo', { info });
    },

    getPointsListText(points) {
      const singlePointTitle = this.$i18n('pt');
      const multiPointsTitle = this.$i18n('pts');
      return `${points} ${points === 1 ? singlePointTitle : multiPointsTitle}`;
    },

    onPointsSelected(points, closeDropdown) {
      this.$analytics.logEvent('quiz_all_marks_updated', {
        quizId: this.quizId,
      });

      this.$emit('setDefaultPoints', points);
      if (closeDropdown) {
        closeDropdown();
      }
    },

    handlePopupInteraction() {
      localStorage.setItem(this.localStorageKeyForBatchPoints, true);
    },

    toggleSettings() {
      this.$emit('togglePublishModal', true);
    },

    togglePrecreate() {
      this.$emit('togglePrecreateModal', true);
    },

    toggleImportSpreadsheetModal() {
      const eventName = this.$webEvents.getQuizEditorEvent(this.quizType, this.$webEvents.IMPORT_SPREADSHEET_BTN);
      this.$analytics.logEvent(
        eventName,
        {
          quizId: this.quizId,
          buttonType: 'info and settings section button',
        },
      );

      this.$emit('toggleImportModal', true);
    },

    onTimeSelected(time) {
      const eventName = this.$webEvents.EDITOR_QUESTION_TIME_CHANGE_ALL;
      this.$analytics.logEvent(eventName, {
        userId: this.$user.id,
        quizId: this.quizId,
      });
      this.$emit('setDefaultTime', time);
    },

    handleImportGoogleForms() {
      this.$analytics.logEvent(
        this.$webEvents.IMPORT_GOOGLE_FORMS_BTN,
        {
          position: 'import_forms_creator_settings',
          quizId: this.$route.params?.id,
        },
      );
      this.$store.dispatch('uiManager/toggleGoogleFormsImport', { publish: false });
    },

    redirectTo(url) { window.open(url, '_blank'); },

    analyticsOtherPlatforms() {
      this.$analytics.logEvent(
        this.$webEvents.IMPORT_OTHER_PLATFORMS,
        {
          position: 'sidebar_import_from_platform_cta',
          quizId: this.$route.params?.id,
        },
      );
    },

  },
};
</script>

<style lang="scss" scoped>
.question-editor-settings-inner-container {
  height: calc(100% - 72px)
}

.subjects-title {
  max-width: 270px;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}

.image-container {
  border: 1px dashed #E5E5E5;
}

.sticky {
  position: sticky;
  position: -webkit-sticky;
  top: 0;
}

button:hover>.panel-icon {
  background: transparent;
}

.new-snackbar {
  transform: rotate(-15deg);
}

.quiz-name-style {
  word-break: break-word;
}
</style>
