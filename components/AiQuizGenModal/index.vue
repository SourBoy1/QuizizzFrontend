<template>
  <Modal
    ref="aiQuizGenModal"
    :fixedHeight="false"
    type="custom"
    zeroMargin
    containerClasses="ai-quiz-gen-bg w-full h-full p-6 overflow-y-auto grid grid-cols-12 gap-4 "
    :shouldCloseOnEscape="true"
    :showCloseModalBtn="false"
    :disableDefaultFocus="true"
    closeBtnClasses="none"
    size="custom"
  >
    <Button
      type="secondary"
      class="absolute rounded-sm top-0 left-0 w-18"
      size="sm"
      rounded="full"
      licon="fas fa-arrow-left"
      :title="$i18n('Back')"
      @click="onClose"
    />
    <div
      v-if="isDropdownOpen"
      class="fixed top-0 left-0 w-screen h-screen z-10"
      @click="handleOverlayClick"
    />
    <div class="relative flex-col justify-start items-start w-max h-full m-auto col-span-10">
      <template v-if="showUploadPage">
        <!-- <img src="https://cf.quizizz.com/img/QuizizzBot/default.png" class="h-21 object-contain"> -->
        <div class="flex flex-col gap-10">
          <div class="header text-center mt-6">
            <div class="title flex items-center justify-center text-2xl font-bold text-dark-2">
              {{ getQuizGeneratorTitle }}
              <Lozenge
                v-tooltip="betaTooltipData"
                :title="$i18n('BETA')"
                size="xs"
                class="ml-3 bg-dark-10% h-min px-2 py-0.5 text-dark-3"
              />
            </div>
            <div class="subtitle inline-flex font-normal text-base text-dark-4 mt-3 max-w-150">
              {{ getQuizGeneratorSubTitle }}
            </div>
          </div>
          <div class="w-full">
            <div class="w-full flex justify-center -mb-0.5">
              <TabsV2
                :value="quizGenView"
                class="flex justify-center gap-2"
                :class="[(validQuizGenTabsToShow.length > 1) ? 'w-78' : 'w-37']"
                tabPadding="px-3 py-2.5"
                :tabs="validQuizGenTabsToShow"
                fontSize="text-base"
                :iconSize="14"
                :showSliderArrow="false"
                @input="handleQuizGenViewChange"
              />
            </div>

            <div
              v-if="currentQuizGenView.viewName === $constants.AiQuizGenModes.USING_FILE_UPLOAD"
              class="input-container relative w-full flex flex-col justify-center items-center max-w-150 min-h-44 border-2 border-dashed border-dark-20% rounded-2xl gap-2"
            >
              <!-- <img src="https://cf.quizizz.com/animations/upload_file.png" class="ai-quiz-gen-input-bg object-contain"> -->
              <div
                v-if="fileType"
                class="flex flex-col gap-8 justify-center items-center"
              >
                <div class="flex flex-col gap-2 justify-center items-center">
                  <span class="ai-quiz-gen-input-bg object-contain text-lilac text-center">
                    <FA
                      :icon="documentIconDetails.icon"
                      :size="31"
                      :style="`color: ${documentIconDetails.color}`"
                    />
                  </span>
                  <div class="text-sm text-dark-4 text-center font-semibold">
                    <span>
                      "{{ fileName }}"
                    </span>
                    <i18n class="font-normal">
                      selected
                    </i18n>
                  </div>
                </div>
                <div class="text-xs text-dark-4 text-center">
                  <i18n class="font-normal">
                    Now Click on Generate Questions button to start creating Quiz
                  </i18n>
                </div>
              </div>
              <div
                v-else
                class="flex flex-col gap-2 justify-center items-center"
              >
                <span class="ai-quiz-gen-input-bg object-contain text-lilac text-center">
                  <FA
                    icon="fa-light fa-upload"
                    size="24"
                    class="font-light"
                  />
                </span>
                <div class="text-xxs text-dark-4 max-w-64 text-center font-semibold">
                  <i18n class="font-normal">
                    Drag & Drop your file
                  </i18n> .PDF, .DOC <i18n class="font-normal">
                    or
                  </i18n>
                  .PPT <i18n class="font-normal">
                    here OR Browse to Upload
                  </i18n>
                </div>
                <div class="action">
                  <Button
                    :title="$i18n('Browse')"
                    size="md"
                    type="primary"
                    rounded="sm"
                    titleClasses="text-sm"
                    buttonClasses="py-3"
                    @click="onUploadClick"
                  />
                </div>
              </div>

              <input
                ref="fileInput"
                :class="['absolute top-0 w-full h-full opacity-0', isUploadDisabled ? 'cursor-not-allowed' : 'cursor-pointer']"
                type="file"
                accept="application/pdf,application/vnd.ms-powerpoint,
                    application/vnd.openxmlformats-officedocument.presentationml.slideshow,
                    application/vnd.openxmlformats-officedocument.presentationml.presentation,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                :disabled="isUploadDisabled"
                @input="handleInput"
              />
            </div>

            <div
              v-if="currentQuizGenView.viewName === $constants.AiQuizGenModes.USING_OPEN_TEXT"
              class="input-container relative w-full flex flex-col justify-center items-center max-w-150 min-h-44"
            >
              <TipTapMiniEditor
                ref="tiptap"
                :value="getTextForQuizGeneration()"
                class="tiptap-mini-for-quiz-gen w-150 h-44 bg-dark-2% p-6 shadow-inner rounded-lg text-sm resize-none font-semibold text-dark-2"
                :theme="tipTapThemeClasses"
                :placeholder="$i18n('Write here. You can copy paste your existing content or start typing your own...')"
                :shouldEmitEventOnFocus="false"
                type="text"
                editorId="quiz-gen-editor"
                @input="handleTextInput"
              />
              <span
                v-if="!isTextLengthforQuizGenerationValid"
                class="flex gap-1 text-xs font-normal text-red w-full justify-end items-center pt-2"
              >
                <FA
                  icon="fas fa-warning"
                  size="11"
                  class="font-light"
                />
                {{ textLimitErrorState }}
              </span>
            </div>

            <div
              class="flex items-end mt-4"
              :class="[canShowNoOfQuestionSelection ? 'justify-between' : 'justify-center']"
            >
              <div
                v-if="canShowNoOfQuestionSelection"
                class="flex flex-col gap-2"
              >
                <span class="font-normal text-dark-3 text-xxs">
                  <i18n>
                    Number of Questions
                  </i18n>
                </span>
                <Dropdown
                  ref="noOfQuestionsDropdown"
                  :aria-label="$i18n('Choose no of questions to generate')"
                  class="z-999 border-1 rounded border-dark-6 text-base"
                  size="sm"
                  type="custom"
                  autoPosition
                  :shouldShowToggleButton="true"
                  :title="getNoOfQuestionsDropdownTitle"
                  @open="isDropdownOpen = true"
                  @close="isDropdownOpen = false"
                >
                  <ul
                    class="text-dark w-45 text-sm flex flex-col items-start bg-light-3 border-1 border-dark-6 rounded shadow-md relative -left-16"
                  >
                    <button
                      v-for="noOfQuestions in noOfQuestionsSelectList"
                      :key="noOfQuestions.title"
                      class="w-full flex gap-1 p-2 items-center justify-between hover:bg-dark-2%"
                      :class="[noOfQuestions.value === 0 ? '' : 'border-t-1 border-dark-6']"
                      @click="handleSelectNoOfQuestions(noOfQuestions.value)"
                    >
                      <div class="flex gap-1">
                        <FA
                          v-if="noOfQuestionsToGenerate === noOfQuestions.value"
                          icon="fas fa-check"
                          size="12"
                        />
                        <span class="font-semibold text-sm">{{ noOfQuestions.title }}</span>
                      </div>

                      <span
                        v-tooltip="{
                          content: $i18n('QuizGPT will use AI to automatically determine the appropriate number of questions to generate.'),
                          placement: 'bottom-start',
                          classes: 'w-72',
                        }"
                      >
                        <FA
                          v-if="noOfQuestions.value === 0"
                          icon="far fa-circle-info"
                          size="14"
                        />
                      </span>
                    </button>
                  </ul>
                </Dropdown>
              </div>
              <div>
                <Button
                  :title="$i18n('GENERATE QUESTIONS')"
                  size="lg"
                  type="primary"
                  rounded="sm"
                  licon="fas fa-sparkles"
                  titleClasses="text-sm"
                  buttonClasses="py-3 px-8"
                  :disabled="!canGenerateQuiz"
                  @click="onGenerateQuizClicked"
                />
              </div>
            </div>
          </div>
        </div>
        <p
          v-if="showAttemptsRemainingMessage"
          v-tooltip="attemptsTooltipData"
          class="attempts mt-7 px-2 py-1 bg-yellow-10% text-dark-3 text-xxs rounded w-max mx-auto"
        >
          <span class="font-semibold">{{ attemptsRemaining }}</span>
          <i18n>attempts remaining</i18n>
        </p>
      </template>

      <FileUploadingLoader
        v-else-if="fileUploading"
        class="h-full flex flex-col justify-center"
        :percent="fileUploadPercent"
        :documentType="documentType"
      />

      <NoQuestionGeneratedVue
        v-else-if="showNoQuestionsGenerated"
        :quizGenView="currentQuizGenView?.viewName"
        @tryAgain="onRetryQuizGenClick"
      />

      <QuotaExhausted
        v-else
        :dailyLimit="quotaLimit"
        :quotaRenewalDate="formattedQuotaRenewalDate"
        @createManual="onCreateManual"
      />

      <Modal
        v-if="shouldShowCloseConfirmationModal"
        :title="$i18n('Are you sure you want to exit?')"
        :subtitle="$i18n('We’ll keep processing your request in the background and add the quiz to your library once it’s generated')"
        :button1="{
          title: $i18n('Cancel'),
          type: 'other',
          rounded: 'sm',
        }"
        :button2="{
          title: $i18n('Confirm'),
          type: 'danger',
          rounded: 'sm',
        }"
        :dismissOnOverlayClick="true"
        @close="showCloseConfirmationModal = false"
        @button1-click="showCloseConfirmationModal = false"
        @button2-click="close"
      />
    </div>
  </Modal>
</template>

<script>
import get from 'lodash/get';
import { mapGetters } from 'vuex';
import ObjectID from 'bson-objectid';

import once from 'lodash/once';

import SuggestionService from '~/services/SuggestionService';
import HotjarService, { HotjarEvents } from '~/services/HotjarService';
import removeHTMLTags from '~/utils/removeHTMLTags';
import NoQuestionGeneratedVue from './NoQuestionGenerated.vue';
import FileUploadingLoader from './FileUploadingLoader.vue';
import QuotaExhausted from './QuotaExhausted.vue';

export default {
  components: {
    FileUploadingLoader,
    NoQuestionGeneratedVue,
    QuotaExhausted,
  },

  props: {
    source: {
      type: String,
      default: 'ai-quiz-gen-modal',
    },

    quizId: {
      type: String,
      default: null,
    },

    versionId: {
      type: String,
      default: null,
    },
  },

  data() {
    return {
      uid: ObjectID().toHexString(),
      fileUploading: false,
      fileUploadPercent: 0,
      isDropdownOpen: false,
      fileUploadStarted: false,
      fileName: '',
      fileType: '',
      uploadedUrl: '',
      validSourcesForQuizGenExtraction: ['bulk-import-create-flow', 'bulk-import-quiz-editor', 'banner-quiz-editor', 'import-options-quiz-editor'],
      textForQuizGeneration: {
        text: '',
        isEmpty: true,
        isFocused: false,
        didTextChange: false,
      },

      sanitizedTextForQuizGen: '',
      textLengthLimitForQuizGeneration: 500,
      isCharacterCountLimitFetched: false,
      isTextLengthforQuizGenerationValid: true,
      quizGenView: 0,
      validQuizGenViews: [
        {
          viewName: this.$constants.AiQuizGenModes.USING_OPEN_TEXT,
          title: this.$i18n('Text to Quiz'),
          name: this.$constants.AiQuizGenModes.USING_OPEN_TEXT,
          icon: 'far fa-copy',
        },
        {
          viewName: this.$constants.AiQuizGenModes.USING_FILE_UPLOAD,
          title: this.$i18n('Upload a File'),
          name: this.$constants.AiQuizGenModes.USING_FILE_UPLOAD,
          icon: 'far fa-file-upload',
        },
      ],

      noOfQuestionsToGenerate: 0,
      noOfQuestionsSelectList: [
        {
          title: this.$i18n('Automatic'),
          value: 0,
        },
        {
          title: this.$i18n('5 Questions'),
          value: 5,
        },
        {
          title: this.$i18n('8 Questions'),
          value: 8,
        },
        {
          title: this.$i18n('10 Questions'),
          value: 10,
        },
        {
          title: this.$i18n('15 Questions'),
          value: 15,
        },
      ],

      mapFileType: {
        'application/pdf': 'pdf',
        'application/vnd.ms-powerpoint': 'ppt',
        'application/vnd.openxmlformats-officedocument.presentationml.slideshow': 'pptx',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
        '.doc': 'doc',
        '.docx': 'docx',
        'application/msword': 'doc',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
      },

      totalQuestionsGenerated: 0,

      loadingQuota: false,
      quotaLimit: 0,
      quotaUsed: 0,
      quotaRenewalDate: '',
      showCloseConfirmationModal: false,
      closed: false,
    };
  },

  async created() {
    await this.fetchAIQuota();
  },

  computed: {
    ...mapGetters('uiManager', ['isContentCreationModalVisible']),

    tipTapThemeClasses() {
      return ['hide-scrollbar', !this.isTextLengthforQuizGenerationValid ? 'border-1 border-red-20%' : ''].join(' ');
    },

    textLimitErrorState() {
      let roundedTextLimit = Math.round(this.textLengthLimitForQuizGeneration / 100) * 100;
      roundedTextLimit = `${~~(roundedTextLimit / 1000)}k`;
      return this.$i18n('Your text exceeded the character limit, quiz will be generated on the first {$1} characters.', [roundedTextLimit]);
    },

    isValidViewForQuizExtraction() {
      return this.validSourcesForQuizGenExtraction.includes(this.source);
    },

    getQuizGeneratorTitle() {
      if (this.isValidViewForQuizExtraction) {
        return this.$i18n('Convert Questions into a Quiz using AI');
      }
      return this.$i18n('QuizGPT: Create Quiz using AI');
    },

    getQuizGeneratorSubTitle() {
      if (this.isValidViewForQuizExtraction) {
        return this.$i18n('Upload a file with questions in it and convert it into a quiz with a single click.');
      }
      return this.$i18n("Whether you're a teacher, trainer, or content creator, QuizGPT can help you easily create engaging quizzes from any text or document");
    },

    getNoOfQuestionsDropdownTitle() {
      let title = '';
      this.noOfQuestionsSelectList.forEach((item) => {
        if (item.value === this.noOfQuestionsToGenerate) {
          title = item.title;
        }
      });
      return title;
    },

    validQuizGenTabsToShow() {
      const quizGenViews = this.validQuizGenViews;
      if (this.isValidViewForQuizExtraction) {
        this.setQuizGenView(1);
        return quizGenViews;
      }
      return quizGenViews;
    },

    canShowNoOfQuestionSelection() {
      return !this.isValidViewForQuizExtraction;
    },

    documentIconDetails() {
      switch (this.documentType) {
        case 'pdf': return {
          icon: 'fas fa-file-lines',
          color: '#CB0606',
        };
        case 'word': return {
          icon: 'fas fa-file-word',
          color: '#7D3AB5',
        };
        case 'ppt': return {
          icon: 'fas fa-file-powerpoint',
          color: '#F5B912',
        };
        default: return {};
      }
    },

    currentQuizGenView() {
      return this.validQuizGenViews[this.quizGenView];
    },

    canGenerateQuiz() {
      const currentView = this.validQuizGenViews[this.quizGenView];

      if (currentView?.viewName === this.$constants.AiQuizGenModes.USING_OPEN_TEXT) {
        return this.sanitizedTextForQuizGen?.length > 0;
      }
      if (currentView?.viewName === this.$constants.AiQuizGenModes.USING_FILE_UPLOAD) {
        return this.fileName?.length > 0 && this.fileType?.length > 0;
      }
      return false;
    },

    betaTooltipData() {
      return {
        content: this.$i18n('This is a BETA release. Results might not be 100% accurate.'),
        placement: 'top-start',
        offset: 8,
        classes: 'tooltip-light-theme',
      };
    },

    attemptsTooltipData() {
      return {
        content: this.$i18n('You can use this feature {$1} times per week', [this.quotaLimit]),
        placement: 'right-start',
        offset: 8,
        classes: 'tooltip-light-theme',
      };
    },

    documentType() {
      const currentView = this.validQuizGenViews[this.quizGenView];

      if (currentView && currentView?.viewName === this.$constants.AiQuizGenModes.USING_OPEN_TEXT) {
        return this.$constants.AiQuizGenModes.USING_OPEN_TEXT;
      }
      if (this.fileType.includes('pdf')) {
        return 'pdf';
      } if (this.fileType.includes('ppt')) {
        return 'ppt';
      }
      return 'word';
    },

    showUploadPage() {
      return !this.fileUploadStarted && !this.fileUploading && (this.loadingQuota || !this.quotaExhausted);
    },

    attemptsRemaining() {
      return this.quotaLimit - this.quotaUsed;
    },

    quotaExhausted() {
      return this.attemptsRemaining <= 0;
    },

    showAttemptsRemainingMessage() {
      return !this.loadingQuota && this.attemptsRemaining <= 3;
    },

    isUploadDisabled() {
      return this.loadingQuota || this.quotaExhausted;
    },

    showNoQuestionsGenerated() {
      return this.fileUploadStarted && !this.fileUploading && !this.totalQuestionsGenerated && (this.loadingQuota || !this.quotaExhausted);
    },

    shouldShowCloseConfirmationModal() {
      return this.showCloseConfirmationModal && this.fileUploading;
    },

    formattedQuotaRenewalDate() {
      return this.$dayjs(this.quotaRenewalDate).format('DD-MMM-YYYY');
    },

    eventData() {
      const data = {
        source: this.source,
        fileName: this.fileName,
        fileType: this.fileType,
        fileUrl: this.uploadedUrl ? this.uploadedUrl : '',
        uid: this.uid,
        quizGenView: this.currentQuizGenView?.viewName,
        isExtraction: this.isValidViewForQuizExtraction,
      };

      if (this.isValidViewForQuizExtraction) {
        data.noOfQuestionsToGenerate = this.noOfQuestionsToGenerate;
      }
      if (!this.loadingQuota) {
        data.quotaLimit = this.quotaLimit;
        data.quotaUsed = this.quotaUsed;
      }

      return data;
    },
  },

  mounted() {
    this.$analytics.logEvent(this.$webEvents.QUIZ_GEN_MODAL_OPEN, this.eventData);
    this.$router.push({ query: {} });
    this.getCharacterLimitForQuizGen = once(async (text) => {
      const result = await SuggestionService.getTextCharacterLimitForAiQuizGen(text);
      const textValueForGeneration = this.textForQuizGeneration;

      if (result.success) {
        const characterCountLimit = result.data.characterCount;
        this.textLengthLimitForQuizGeneration = result.data.characterCount;
        this.isCharacterCountLimitFetched = true;
        const validText = text.substring(0, characterCountLimit);
        const notValidText = text.substring(characterCountLimit, text.length);
        const textToDisplay = `<p> ${validText} <span style="color: #B6B6B6">${notValidText}</span></p>`;
        textValueForGeneration.text = textToDisplay;

        if (notValidText.length > 0) {
          this.isTextLengthforQuizGenerationValid = false;
          if (text.length > characterCountLimit) {
            this.focusTimeOut = setTimeout(() => {
              this.$refs.tiptap.editor?.commands.focus(characterCountLimit);
              this.$refs.tiptap.editor?.commands.scrollIntoView();
            }, 500);
          }
        }
        this.textForQuizGeneration = textValueForGeneration;
      }
      this.$analytics.logEvent(this.$webEvents.QUIZ_GEN_CHARACTER_COUNT_FETCHED, { result });
    });

    if (this.currentQuizGenView?.viewName === this.$constants.AiQuizGenModes.USING_OPEN_TEXT) {
      this.$refs.tiptap.editor?.commands.focus();
    }
  },

  beforeUnmount() {
    if (this.focusTimeOut) {
      clearTimeout(this.focusTimeOut);
    }
    if (this.focusTimeOutAfterInput) {
      clearTimeout(this.focusTimeOutAfterInput);
    }
  },

  methods: {
    setQuizGenView(value) {
      this.quizGenView = value;
    },

    handleOverlayClick() {
      this.$refs.noOfQuestionsDropdown?.close(true);
    },

    handleSelectNoOfQuestions(value) {
      this.noOfQuestionsToGenerate = value;
      this.$refs.noOfQuestionsDropdown.close();
    },

    handleQuizGenViewChange(quizGenViewTab) {
      this.quizGenView = quizGenViewTab.index;
    },

    getTextForQuizGeneration() {
      return this.textForQuizGeneration;
    },

    handleTextInput(value) {
      const textValueForGeneration = value;
      const rawText = value.text;
      const sanitizedText = removeHTMLTags(rawText);
      if (this.sanitizedTextForQuizGen === sanitizedText) {
        return;
      }
      this.sanitizedTextForQuizGen = sanitizedText;

      if (sanitizedText?.length > this.textLengthLimitForQuizGeneration) {
        if (this.isCharacterCountLimitFetched) {
          const textValueForGeneration = this.textForQuizGeneration;
          const characterCountLimit = this.textLengthLimitForQuizGeneration;
          const validText = sanitizedText.substring(0, characterCountLimit);
          const notValidText = sanitizedText.substring(characterCountLimit, sanitizedText.length);
          const textToDisplay = `<p> ${validText} <span style="color: #B6B6B6">${notValidText}</span></p>`;
          textValueForGeneration.text = textToDisplay;
          if (notValidText.length > 0) {
            this.isTextLengthforQuizGenerationValid = false;
          } else {
            this.isTextLengthforQuizGenerationValid = true;
          }

          if (sanitizedText.length > this.textLengthLimitForQuizGeneration) {
            this.focusTimeOutAfterInput = setTimeout(() => {
              this.$refs.tiptap.editor?.commands.focus(characterCountLimit);
              this.$refs.tiptap.editor?.commands.scrollIntoView();
            }, 500);
          }
          this.textForQuizGeneration = textValueForGeneration;
          return;
        }
        this.getCharacterLimitForQuizGen(sanitizedText);
      } else {
        this.isTextLengthforQuizGenerationValid = true;
      }
      this.textForQuizGeneration = textValueForGeneration;
    },

    async fetchAIQuota() {
      this.loadingQuota = true;
      const response = await SuggestionService.getAiGeneratedQuizQuota();

      if (response.success) {
        this.quotaLimit = response?.data.quotaLimit;
        this.quotaUsed = response?.data.quotaUsed;
        this.quotaRenewalDate = response?.data.dateToRenewQuota;
        this.textLengthLimitForQuizGeneration = response?.data.checkCharacterLength ?? 500;
      }
      this.loadingQuota = false;
    },

    isValidFileType(type) {
      return ['application/pdf',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.slideshow',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        '.doc',
        '.docx',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(type);
    },

    async onGenerateQuizClicked() {
      const currentView = this.validQuizGenViews[this.quizGenView];
      this.$analytics.logEvent(this.$webEvents.QUIZ_GEN_GENERATE_BUTTON_CLICKED, this.eventData);

      if (currentView?.viewName === this.$constants.AiQuizGenModes.USING_OPEN_TEXT) {
        await this.generateQuizUsingOpenText();
      }
      if (currentView?.viewName === this.$constants.AiQuizGenModes.USING_FILE_UPLOAD) {
        await this.generateQuizUsingFileUpload();
      }
    },

    handleInput(ev) {
      HotjarService.triggerEvent(HotjarEvents.QFW_AI_QUIZ_GEN);

      if (this.isUploadDisabled) {
        this.$toasts.add({
          type: this.$constants.ToastTypes.ERROR,
          icon: 'fas fa-times-circle',
          title: this.$i18n('Your daily quota has exhausted'),
        });
        return;
      }

      const fileFormat = get(ev, 'target.files[0].type');
      const MAX_CHAR_FOR_QUIZ_TITLE = 64;

      this.fileName = get(ev, 'target.files[0].name', '').slice(0, MAX_CHAR_FOR_QUIZ_TITLE);
      this.fileType = this.mapFileType[fileFormat];

      if (get(ev, 'target.files.length') === 0 || !this.isValidFileType(fileFormat)) {
        this.$toasts.add({
          type: this.$constants.ToastTypes.ERROR,
          icon: 'fas fa-times-circle',
          title: this.$i18n('File is not supported!'),
        });
      }
    },

    async generateQuizUsingFileUpload() {
      this.fileUploading = true;
      this.fileUploadStarted = true;

      const fileRef = this.$refs.fileInput;
      let result = null;
      try {
        await this.uploadFile(fileRef);
        result = await this.generateQuiz();

        if (result.success) {
          const docScannedPercent = get(result, 'data.percentageFileProcessed', 0);
          const noOfQuestionsGenerated = get(result, 'data.quiz.draft.questions.length', 0) || get(result, 'data.quiz.questions.length', 0);
          this.totalQuestionsGenerated = noOfQuestionsGenerated;

          if (this.closed) {
            this.$toasts.add({
              type: this.$constants.ToastTypes.SUCCESS,
              icon: 'fas fa-check-circle',
              title: this.$i18n('Quiz successfully generated by AI, available in My Library section'),
            });
          } else {
            this.$store.dispatch('contentEditor/setAIGenerated', { documentScannedByAIPercent: docScannedPercent, aiGenerationType: this.$constants.AiQuizGenModes.USING_FILE_UPLOAD, isAIGeneratedFromExtraction: this.isValidViewForQuizExtraction });

            if (this.isValidViewForQuizExtraction && this.quizId && this.versionId) {
              window.location.reload();
              return;
            }
            this.$router.push(`/quiz/creator/${result?.data.quiz._id}/edit`);

            if (this.isContentCreationModalVisible) {
              this.toggleQuizCreationModal();
            }
          }
        }
      } catch (err) { }

      setTimeout(() => {
        this.fileUploading = false;

        if (result?.success) {
          this.$emit('close');
        }
      }, 100);
    },

    async uploadFile(ev) {
      try {
        this.$analytics.logEvent(this.$webEvents.QUIZ_GEN_FILE_UPLOAD_STARTED, this.eventData);

        this.uploadedUrl = await this.$fileUpload.uploadFileToS3(get(ev, 'files[0]'), {
          destination: 'uploadedFiles',
          folder: '_quizGenDocs',
          metadata: {
            'Content-Type': get(ev, 'files[0].type'),
          },
          config: {
            onUploadProgress: (event) => {
              this.fileUploadPercent = (event.loaded / event.total) * 100;
            },
          },
        });

        this.$analytics.logEvent(this.$webEvents.QUIZ_GEN_FILE_UPLOADED_SUCCESSFULLY, this.eventData);
      } catch (err) {
        this.$toasts.add({
          type: this.$constants.ToastTypes.ERROR,
          icon: 'fas fa-times-circle',
          title: this.$i18n('Something went wrong while uploading the file!'),
        });

        this.$analytics.logEvent(this.$webEvents.QUIZ_GEN_FILE_UPLOAD_FAILED, this.eventData);

        throw new Error('Errored while uploading file');
      }

      return this.uploadedUrl;
    },

    async generateQuiz() {
      const fileNameWithoutExtension = this.fileName?.split('.')
        .slice(0, -1)
        .join('.');

      let result = null;
      if (this.isValidViewForQuizExtraction) {
        result = await SuggestionService.getAiExtractGeneratedQuiz(this.uploadedUrl, this.fileType, fileNameWithoutExtension, this.quizId, this.versionId);
      } else {
        result = await SuggestionService.getAiGeneratedQuiz(this.uploadedUrl, this.fileType, fileNameWithoutExtension, this.noOfQuestionsToGenerate);
      }

      if (!result.success) {
        this.$toasts.add({
          type: this.$constants.ToastTypes.ERROR,
          icon: 'fas fa-times-circle',
          title: this.$i18n('Something went while generating quiz!'),
        });

        this.$analytics.logEvent(this.$webEvents.QUIZ_GEN_GENERATION_FAILED, { ...this.eventData, errorMessage: result.data.message });
      } else {
        this.$analytics.logEvent(this.$webEvents.QUIZ_GEN_GENERATION_SUCCESSFULL, { quizId: result?.data.quiz._id, ...this.eventData });
      }

      return result;
    },

    async generateQuizUsingOpenText() {
      this.fileUploading = true;
      this.fileUploadStarted = true;
      const text = this.sanitizedTextForQuizGen;
      let result = null;

      if (this.isValidViewForQuizExtraction) {
        result = await SuggestionService.getAiExtractQuizFromOpenText(text, this.quizId, this.versionId);
      } else {
        result = await SuggestionService.getAiGeneratedQuizFromOpenText(text, this.noOfQuestionsToGenerate);
      }

      if (!result.success) {
        this.$toasts.add({
          type: this.$constants.ToastTypes.ERROR,
          icon: 'fas fa-times-circle',
          title: this.$i18n('Something went while generating quiz!'),
        });

        this.$analytics.logEvent(this.$webEvents.QUIZ_GEN_GENERATION_FAILED, { ...this.eventData, errorMessage: result.data.message });
      }

      if (result.success) {
        const docScannedPercent = get(result, 'data.percentageFileProcessed', 0);
        const noOfQuestionsGenerated = get(result, 'data.quiz.draft.questions.length', 0) || get(result, 'data.quiz.questions.length', 0);
        this.totalQuestionsGenerated = noOfQuestionsGenerated;
        this.$analytics.logEvent(this.$webEvents.QUIZ_GEN_GENERATION_SUCCESSFULL, { quizId: result?.data.quiz._id, ...this.eventData });

        if (this.closed) {
          this.$toasts.add({
            type: this.$constants.ToastTypes.SUCCESS,
            icon: 'fas fa-check-circle',
            title: this.$i18n('Quiz successfully generated by AI, available in My Library section'),
          });
        } else {
          this.$store.dispatch('contentEditor/setAIGenerated', { documentScannedByAIPercent: docScannedPercent, aiGenerationType: this.$constants.AiQuizGenModes.USING_OPEN_TEXT, isAIGeneratedFromExtraction: this.isValidViewForQuizExtraction });

          if (this.isValidViewForQuizExtraction && this.quizId && this.versionId) {
            window.location.reload();
            return;
          }
          this.$router.push(`/quiz/creator/${result?.data.quiz._id}/edit`);

          if (this.isContentCreationModalVisible) {
            this.toggleQuizCreationModal();
          }
        }
      }

      setTimeout(() => {
        this.fileUploading = false;

        if (result?.success) {
          this.$emit('close');
        }
      }, 100);
    },

    onUploadClick() {
      if (this.isUploadDisabled) {
        return;
      }
      this.$refs.fileInput.click();
    },

    onRetryQuizGenClick() {
      this.$analytics.logEvent(this.$webEvents.QUIZ_GEN_RETRY, this.eventData);
      this.resetState();
    },

    toggleQuizCreationModal() {
      this.$store.dispatch('uiManager/toggleContentCreationModal');
    },

    onCreateManual() {
      this.$analytics.logEvent(this.$webEvents.QUIZ_GEN_CREATE_MANUAL, this.eventData);

      if (!this.isContentCreationModalVisible) {
        this.toggleQuizCreationModal();
      }

      this.$emit('close');
    },

    onClose() {
      this.showCloseConfirmationModal = true;

      if (!this.shouldShowCloseConfirmationModal) {
        this.close();
      }
    },

    close() {
      this.$analytics.logEvent(this.$webEvents.QUIZ_GEN_MODAL_CLOSE, { ...this.eventData, generationInProgress: this.fileUploading });
      if (!this.shouldShowCloseConfirmationModal) {
        this.$router.push({ query: { ...this.$route.query, [this.isValidViewForQuizExtraction ? 'showQuizExtractModal' : 'showQuizGenModal']: false } });
      }
      this.closed = true;
      this.$emit('close');
    },

    resetState() {
      this.fileUploadStarted = false;
      this.fileUploading = false;
      this.fileUploadPercent = 0;
      this.fileName = '';
      this.fileType = '';
      this.uploadedUrl = '';
      this.totalQuestionsGenerated = 0;
    },
  },
};
</script>

<style lang="scss">
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}

/* Hide scrollbar for IE, Edge and Firefox */
.hide-scrollbar {
  -ms-overflow-style: none;
  /* IE and Edge */
  scrollbar-width: none;
  /* Firefox */
}

#quiz-gen-editor {
  height: 100%;
  overflow: auto !important;
}

.ai-quiz-gen-input-bg {
  width: 38%;
}

.quiz-gen-close-btn {
  left: 97%;
}

.ai-quiz-gen-bg {
  background: linear-gradient(180deg, #EDE6F6 0%, rgba(237, 230, 246, 0) 200px);
  background-color: white;
}

.tooltip-light-theme {
  box-shadow: 0px 4px 6px -2px rgba(0, 0, 0, 0.05), 0px 10px 15px -3px rgba(0, 0, 0, 0.1);

  .tooltip-inner {
    @apply bg-light text-purple-dark;
  }

  .tooltip-arrow {
    @apply border-light;
  }
}

.tiptap-mini-for-quiz-gen {
  .ProseMirror {
    >.is-editor-empty {
      &:first-child::before {
        content: attr(data-placeholder);
        float: left;
        color: #B6B6B6 !important;
        pointer-events: none;
        height: 0;
        font-size: 14px;
        text-align: inherit;
        width: 100%;
      }
    }
  }
}
</style>
