<template>
  <div class="theme-modal-container pointer-events-auto">
    <Modal
      class="themes-modal"
      img="https://cf.quizizz.com/img/illustrations/lesson.png"
      :title="getThemeTranslation"
      :subtitle="isCorporateUser ? $i18n('Make your presentation stand out with our free exciting themes.') : $i18n('Make your lesson stand out with our free exciting themes.')"
      size="lg"
      :disabled="hasUploadStarted && !hasUploaded && !hasUploadFailed"
      :button1="isNewLesson ? {
        title: $i18n('Skip'),
        type: 'other',
        size: 'md',
        dataCy: 'skip-theme-selection-button',
        disabled: nextLoader,
        loading: skipLoader,
        layout: 'default',
      } : undefined"
      :button2="isNewLesson ? {
        title: $i18n('Next'),
        type: 'primary',
        size: 'md',
        disabled: skipLoader,
        loading: nextLoader,
        layout: 'default',
      } : undefined"
      @close="isNewLesson ? onSkip() : onCancel()"
      @button1-click="onSkip"
      @button2-click="applyTheme"
    >
      <div class="flex text-xs modal-content text-dark-4">
        <div class="flex flex-col w-1/2 mr-6 preview h-72">
          <h3><i18n>Preview</i18n></h3>
          <div class="flex items-center justify-center flex-grow w-full mt-1 preview-space bg-dark-3">
            <div class="relative w-64 overflow-hidden h-36">
              <SlidePreview
                :question="fillInUserNameAndDate(question)"
                :isThemeModalPreview="true"
                :supersedingTheme="question.structure.theme"
                :bgGif="previewBgGif"
              />
            </div>
          </div>
        </div>
        <div class="w-1/2 overflow-auto themes h-72">
          <h3><i18n>Themes</i18n></h3>
          <div class="flex flex-wrap basic-themes">
            <ThemeTileV2
              v-for="(theme, index) in basicThemes"
              :key="theme.id"
              v-bind="theme"
              class="mt-2 mr-2"
              :aria-label="$i18n('Theme {$1}', [index + 1])"
              :checked="theme.id === pickedTheme.id"
              size="lg"
              @onThemePick="pickTheme(theme)"
            />
          </div>
          <div class="flex flex-wrap crafted-themes">
            <ThemeTileV2
              v-for="(theme, index) in craftedThemes"
              :key="theme.id"
              v-bind="theme"
              class="mt-2 mr-2"
              :aria-label="$i18n('Theme {$1}', [basicThemes.length + index + 1])"
              :checked="theme.id === pickedTheme.id"
              size="lg"
              @onThemePick="pickTheme(theme)"
            />
          </div>
          <h3 class="mt-4">
            <i18n>Animated themes</i18n>
          </h3>
          <div class="flex flex-wrap animated-themes">
            <ThemeTileV2
              v-for="(theme, index) in animatedThemes"
              :key="theme.id"
              v-bind="theme"
              class="mt-2 mr-2"
              :aria-label="$i18n('Animated theme {$1}', [index + 1])"
              :checked="theme.id === pickedTheme.id"
              size="lg"
              @onThemePick="pickTheme(theme)"
            />
          </div>
        </div>
      </div>
      <template #footer-text>
        <div class="flex items-center">
          <Button
            v-if="!isNewLesson"
            :title="$i18n('Cancel')"
            type="other"
            size="md"
            @click="onCancel"
          />
          <SelectBox
            v-if="!isNewLesson"
            v-model="selectedThemeSaveOption"
            autoPosition
            :aria-label="$i18n('Theme save options')"
            class="ml-2 theme-save-options"
            type="button"
            size="md-s"
            arrowIcon="fas fa-caret-down"
            arrowIconClasses="text-light-1"
            :list="themeSaveOptions"
            @submit="applyOrApplyAll"
          />
        </div>
      </template>
    </Modal>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import cloneDeep from 'lodash/cloneDeep';

import themes from '~/config/ThemesForSlidesWithShapes';
import Constants from '~/config/Constants';
import question from '~/config/ThemePickerV2Preview';

let slidePreviewResizeTimeout;

const defaultTheme = themes.basicThemes[0];
const initialTheme = {
  id: defaultTheme.id,
  fontFamily: defaultTheme.fontFamily,
  titleFontFamily: defaultTheme.titleFontFamily,
  fontColor: {
    text: defaultTheme.textColor,
  },
  background: {
    color: defaultTheme.bgColor,
    image: '',
    video: '',
  },

  shape: {
    largeShapeColor: defaultTheme.largeShapeColor,
    smallShapeColor: defaultTheme.smallShapeColor,
  },
};

export default {
  props: {
    isNewLesson: {
      type: Boolean,
      default: false,
    },
    lessonName: {
      type: String,
      default: 'Everthing but the kitchen sink',
    },
    selectedSubjects: {
      type: Array,
      default: () => [],
    },
  },
  emits: ['themeSaved', 'close'],

  data() {
    return {
      question: cloneDeep(question),
      basicThemes: themes.basicThemes,
      craftedThemes: themes.craftedThemes,
      animatedThemes: themes.animatedThemes,
      previewBgGif: '',
      pickedTheme: '',
      oldTheme: '',
      previewedThemes: [],
      selectedThemeSaveOption: 'current',
      skipLoader: false,
      nextLoader: false,

      // dummy variables
      hasUploadStarted: false,
      hasUploaded: false,
      hasUploadFailed: false,
    };
  },

  computed: {
    ...mapGetters('slideEditor', ['currentTheme']),
    ...mapGetters('contentEditor', ['quizId', 'sortedQuestions', 'selectedSlide', 'draft']),
    ...mapGetters('root', ['user']),

    themeSaveOptions() {
      return [
        { title: this.$i18n('Apply to this slide'), value: 'current' },
        { title: this.$i18n('Apply to all'), value: 'all' },
      ];
    },

    userTitle() {
      if (this.user.firstName && this.user.lastName) {
        return `${this.user.firstName} ${this.user.lastName}`;
      }

      return '';
    },

    title() {
      return this.draft?.name || this.lessonName;
    },

    areThereNoQuestions() {
      return this.sortedQuestions.length === 0;
    },

    subjects() {
      if (this.draft?.subjects?.length > 0) {
        return this.draft.subjects.join(' | ');
      }
      return this.selectedSubjects.join(' | ');
    },

    isCorporateUser() {
      return this.$user.isCorporate;
    },

    getThemeTranslation() {
      return !this.isNewLesson ? this.$i18n('Update theme') : this.$i18n('Select a theme');
    },
  },

  created() {
    if (this.isNewLesson) {
      this.pickedTheme = initialTheme;
      this.previewedThemes = [initialTheme.id];
    } else {
      this.pickedTheme = this.currentTheme;
    }
    this.setSlidePreviewTheme(this.pickedTheme);
  },

  mounted() {
    slidePreviewResizeTimeout = setTimeout(() => {
      this.$eventBus.$emit('slidePreview:resize');
    }, 1000);
  },

  beforeUnmount() {
    slidePreviewResizeTimeout && clearTimeout(slidePreviewResizeTimeout);
  },

  methods: {
    removeQuotes(str) {
      return str.replace('"', '');
    },

    fillInUserNameAndDate(json) {
      return JSON.parse(JSON.stringify(json), (key, value) => {
        if (typeof value !== 'string') {
          return value;
        }
        if (value.includes('$title')) {
          return value.replace('$title', this.draft?.name || this.lessonName);
        }
        if (value.includes('$username')) {
          return value.replace('$username', this.userTitle);
        }
        if (value.includes('$subjects')) {
          return value.replace('$username', this.subjects);
        }
        return value;
      });
    },

    applyOrApplyAll() {
      const haveNoQuestions = this.areThereNoQuestions;
      if (this.selectedThemeSaveOption === 'current' && !haveNoQuestions) {
        this.applyTheme();
      } else if (this.selectedThemeSaveOption === 'all' && !haveNoQuestions) {
        this.applyThemeToAll();
      }
      this.closeModal();
    },

    onSkip() {
      this.skipLoader = true;
      this.$store.dispatch('slideEditor/setCurrentTheme', initialTheme);
      this.$emit('themeSaved');

      const eventName = this.$webEvents.getQuizEditorEvent(Constants.ContentType.PRESENTATION, this.$webEvents.EDITOR_INITIAL_THEME_MODAL_SKIP);
      this.$analytics.logEvent(eventName, {
        quizId: this.quizId,
      });
    },

    onCancel() {
      if (this.isNewLesson) {
        this.redirectToHomePage();
        return;
      }
      this.closeModal();
    },

    closeModal() {
      this.$emit('close');
    },

    redirectToHomePage() {
      window.location.pathname = '/admin';
    },

    applyTheme() {
      this.nextLoader = true;
      this.$store.dispatch('slideEditor/setCurrentTheme', this.pickedTheme);
      if (this.isNewLesson) {
        const eventName = this.$webEvents.getQuizEditorEvent(Constants.ContentType.PRESENTATION, this.$webEvents.EDITOR_INITIAL_THEME_MODAL_SAVE);
        this.$analytics.logEvent(eventName, {
          theme: this.pickedTheme,
          themePreviewCount: this.previewedThemes.length,
          quizId: this.quizId,
        });
        this.$emit('themeSaved');
      } else {
        this.$store.dispatch('contentEditor/setTheme', { questionId: this.selectedSlide, theme: this.pickedTheme });
      }

      const eventName = this.$webEvents.getQuizEditorEvent(Constants.ContentType.PRESENTATION, this.$webEvents.EDITOR_THEME_APPLY);
      this.$analytics.logEvent(eventName, {
        quizId: this.quizId,
        oldTheme: this.oldTheme?.id,
        newTheme: this.pickedTheme.id,
        type: 'onlySlide',
      });
    },

    applyThemeToAll() {
      this.nextLoader = true;
      this.$store.dispatch('contentEditor/setThemeAll', this.pickedTheme);
      this.$store.dispatch('slideEditor/setCurrentTheme', this.pickedTheme);

      const eventName = this.$webEvents.getQuizEditorEvent(Constants.ContentType.PRESENTATION, this.$webEvents.EDITOR_THEME_APPLY);
      this.$analytics.logEvent(eventName, {
        quizId: this.quizId,
        oldTheme: this.oldTheme?.id,
        newTheme: this.pickedTheme.id,
        type: 'All',
      });
    },

    pickTheme(theme) {
      this.setPickedTheme(theme);
      if (this.isNewLesson && !this.previewedThemes.includes(theme.id)) {
        this.previewedThemes.push(theme.id);
      }
    },

    setPickedTheme(theme) {
      const pickedTheme = {
        id: theme.id,
        fontFamily: theme.fontFamily,
        titleFontFamily: theme.titleFontFamily,
        fontColor: {
          text: theme.textColor,
        },
        background: {
          color: theme.bgColor || '',
          image: theme.bgImage || '',
          video: theme.bgVideo || '',
        },

        shape: {
          largeShapeColor: theme.largeShapeColor,
          smallShapeColor: theme.smallShapeColor,
        },
      };

      this.previewBgGif = theme.bgGif;
      this.oldTheme = this.pickedTheme;
      this.pickedTheme = pickedTheme;
      this.setSlidePreviewTheme(pickedTheme);
    },

    setSlidePreviewTheme(pickedTheme) {
      this.question.structure.theme = cloneDeep(pickedTheme);
    },
  },
};
</script>

<style scoped>
.theme-modal {
  width: 640px;
  height: 460px;
}
</style>
