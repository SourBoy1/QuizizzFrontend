import has from 'lodash/has';
import get from 'lodash/get';

import { mapGetters } from 'vuex';

import GoogleFormsService from '~/services/apis/GoogleFormsService';
import QuizService from '~/services/apis/QuizService';

import QuestionOption from '~/models/QuestionOption';
import Media from '~/models/Media';
import Structure from '~/models/Structure';
import QuestionQuery from '~/models/QuestionQuery';
import Question from '~/models/Question';

const GOOGLE_CLIENT_ID = '58172892053-hh2k290hilpi3edodu8lrv3cag3pop0f.apps.googleusercontent.com';
const GOOGLE_API_KEY = 'AIzaSyD0xyjgp01kEzXr4aSfvQh5ikHMyfyUbyg';

const SCOPES = 'https://www.googleapis.com/auth/drive.readonly';

export default {
  data() {
    return {
      importFormsLoading: false,
      oauthToken: null,
      accept: 'application/vnd.google-apps.form',
      progressBarInterval: null,
      currentProgress: 0,
    };
  },

  computed: {
    ...mapGetters('uiManager', ['shouldPublishImportForm']),

    clientId() {
      return GOOGLE_CLIENT_ID;
    },

    apiKey() {
      return GOOGLE_API_KEY;
    },

    scopes() {
      return SCOPES;
    },
  },

  methods: {

    showToast({ type = this.$constants.ToastTypes.ERROR, title = '', time = 5000 }) {
      let icon = 'fas fa-times-circle';
      switch (type) {
        case this.$constants.ToastTypes.ERROR:
          icon = 'fas fa-times-circle';
          break;
        case this.$constants.ToastTypes.SUCCESS:
          icon = 'fas fa-check-circle';
          break;
        case this.$constants.ToastTypes.DEFAULT:
          icon = 'fas fa-check';
          break;
        default:
          break;
      }
      if (type === this.$constants.ToastTypes.ERROR) {
        this.$router.push({
          query: {
            ...this.$route.query,
            formImport: 'failed',
          },
        });
      }
      this.$toasts.add({
        type,
        icon,
        title,
        time,
      });
      this.$store.dispatch('uiManager/toggleGoogleFormsImport', { isShowing: false, publish: false });
      this.importFormsLoading = false;
      if (this.progressBarInterval) {
        clearInterval(this.progressBarInterval);
      }
    },

    loadPicker() {
      if (!window.gapi) {
        this.showToast({ type: this.$constants.ToastTypes.ERROR, title: this.$i18n('Please enable popups or refresh the page') });
        return;
      }
      window.gapi.load('auth2', this.onAuthLoad);
    },

    onAuthLoad() {
      window.gapi.auth2.authorize(
        {
          client_id: this.clientId,
          scope: this.scopes,
          immediate: false,
        },
        this.handleAuthResult,
      );
    },

    handleAuthResult(authResult) {
      if (authResult) {
        if (!authResult.error) {
          this.oauthToken = authResult.access_token;
          window.gapi.load('picker', {
            callback: this.createPicker,
            onerror: () => {
              this.showToast({ type: this.$constants.ToastTypes.ERROR, title: this.$i18n('Please enable pop ups for Quizizz.com') });
            },
          });
        } else {
          this.showToast({ type: this.$constants.ToastTypes.ERROR, title: this.$i18n('Import failed! Try again.') });
        }
      }
    },

    createPicker() {
      if (window.google) {
        const { google } = window;
        const view = new google.picker.View(google.picker.ViewId.FORMS);
        view.setMimeTypes(this.accept);
        const picker = new google.picker.PickerBuilder()
          .enableFeature(google.picker.Feature.NAV_HIDDEN)
          .setAppId(this.appId)
          .setOAuthToken(this.oauthToken)
          .addView(view)
          .addView(new google.picker.DocsUploadView())
          .setDeveloperKey(this.apiKey)
          .setCallback(this.afterFilePick)
          .build();

        picker.setVisible(true);
      }
    },

    async afterFilePick(data) {
      if (data.action === window.google.picker.Action.PICKED) {
        const formId = data.docs[0].id;
        this.importFormsLoading = true;
        // Progress bar interval
        let progressRemaining = 0;
        this.progressBarInterval = setInterval(() => {
          progressRemaining += 1;
          this.currentProgress = progressRemaining;
          if (progressRemaining === this.$constants.LessonImport.TOTAL_PROGRESS) {
            clearInterval(this.progressBarInterval);
          }
        }, 350);
        const response = await GoogleFormsService.getForm({ formId, apiKey: GOOGLE_API_KEY, token: this.oauthToken });
        if (response.success) {
          const formData = response.data;
          const {
            info: {
              title,
              documentTitle,
            },
            items: questions,
          } = formData;

          await this.importQuiz({ title: title ?? documentTitle, questions });
        } else {
          this.showToast({ type: this.$constants.ToastTypes.ERROR, title: this.$i18n('Import failed! Try again.') });
        }
      } else if (data.action === window.google.picker.Action.CANCEL) {
        this.showToast({ type: this.$constants.ToastTypes.ERROR, title: this.$i18n('Import failed! Try again.') });
      }
    },

    async uploadToS3(url) {
      try {
        const s3URL = await this.$fileUpload.uploadURLToS3(url, { destination: this.$constants.ImageUploadTypes.QUIZZES });
        return { success: true, url: s3URL.result };
      } catch (error) {
        return { success: false, error };
      }
    },

    async getDefaultOptionStructure({ option }) {
      let mediaObj = null;

      if (option?.image) {
        const imageUrlResponse = await this.uploadToS3(option.image.contentUri);
        if (imageUrlResponse) {
          mediaObj = Media({
            url: imageUrlResponse.url,
            type: 'image',
            meta: {
              width: option.image.properties.width,
              text: option.value,
            },
          });
        }
      }
      const optionObj = QuestionOption({
        type: mediaObj ? 'image' : 'text',
        text: mediaObj ? '' : option.value,
        media: mediaObj ? [mediaObj] : [],
      });
      if (option?.matcher) {
        return { ...optionObj, matcher: option.matcher };
      }
      return optionObj;
    },

    async getOptionsAndAnswer({ choices, grading, questionType }) {
      let correctOption = [];
      let processedChoices = [...choices];
      const correctChoices = [];
      const incorrectChoices = [];
      if (this.questionType !== this.$constants.QuestionTypes.BLANK && grading && has(grading, 'correctAnswers')) {
        const correctAnswers = grading.correctAnswers.answers;
        correctAnswers.forEach((answer) => {
          const correctIndex = choices.findIndex((option) => option.value === answer.value);
          correctOption.push(correctIndex);
        });
      }
      if (choices.length > 5) {
        correctOption = correctOption.splice(0, 5);
        choices.forEach((item, index) => {
          if (correctOption.includes(index)) {
            correctChoices.push(item);
          } else {
            incorrectChoices.push(item);
          }
        });

        processedChoices = [...correctChoices, ...incorrectChoices].splice(0, 5);
        if (this.questionType !== this.$constants.QuestionTypes.BLANK && grading && has(grading, 'correctAnswers')) {
          const correctAnswers = grading.correctAnswers.answers;

          correctOption = [];
          correctAnswers.forEach((answer) => {
            const correctIndex = processedChoices.findIndex((option) => option.value === answer.value);
            correctOption.push(correctIndex);
          });
        }
      }
      const options = await Promise.all(processedChoices.map(async (item, idx) => {
        let option = {};
        if (questionType === this.$constants.QuestionTypes.BLANK) {
          option = { ...item, matcher: 'exact' };
        } else {
          option = { ...item };
        }
        return await this.getDefaultOptionStructure({ option });
      }));

      if (this.questionType === this.$constants.QuestionTypes.BLANK) {
        correctOption = [];
      } else {
        correctOption = correctOption.length === 0 ? -1 : questionType === 'MSQ' ? correctOption : correctOption[0];
      }

      return {
        options, correctOption,
      };
    },

    getChoiceQuestionType(question, grading) {
      let questionType = this.$constants.QuestionTypes.MCQ;

      if (question.type === this.$constants.GoogleFormsChoiceQuestions.RADIO || question.type === this.$constants.GoogleFormsChoiceQuestions.DROP_DOWN) {
        if (grading && has(grading, 'correctAnswers')) {
          if (grading.correctAnswers.answers.length > 1) {
            questionType = this.$constants.QuestionTypes.MSQ;
          } else {
            questionType = this.$constants.QuestionTypes.MCQ;
          }
        } else {
          questionType = this.$constants.QuestionTypes.MCQ;
        }
      } else if (question.type === this.$constants.GoogleFormsChoiceQuestions.CHECKBOX) {
        questionType = this.$constants.QuestionTypes.MSQ;
      }
      return questionType;
    },

    getScaleQuestionSubtitle({ scaleQuestion }) {
      return `(${scaleQuestion.lowLabel} = ${scaleQuestion?.low ? scaleQuestion.low : 0}, ${scaleQuestion.highLabel} = ${(scaleQuestion.high - (scaleQuestion?.low ?? 0)) >= 5 ? (scaleQuestion?.low ?? 0) === 0 ? 4 : 5 : scaleQuestion.high})`;
    },

    async addGoogleFormsQuestion({ questionObj, type }) {
      let mediaObj = null;
      if (questionObj.questionItem?.image) {
        const { image } = questionObj.questionItem;
        const imageUrlResponse = await this.uploadToS3(image?.contentUri);
        if (imageUrlResponse.success) {
          mediaObj = Media({
            url: imageUrlResponse.url,
            type: 'image',
            meta: {
              width: image.properties.width,
            },
          });
        }
      }

      let questionTitle = questionObj.title;

      if (type === this.$constants.GoogleFormsSupportedQuestions.SCALE_QUESTION) {
        questionTitle = `${questionObj.title} <br/> ${this.getScaleQuestionSubtitle({ scaleQuestion: questionObj.questionItem.question.scaleQuestion })}`;
      }

      const queryObj = QuestionQuery({
        type: mediaObj ? 'text_image' : 'text',
        media: mediaObj ? [mediaObj] : [],
        text: questionTitle,
      });

      let questionType = this.$constants.QuestionTypes.MCQ;
      let result = {
        options: [],
        correctOption: [],
      };
      let hasCorrectAnswer = false;
      let gradingObj = null;
      if (type === this.$constants.GoogleFormsSupportedQuestions.CHOICE_QUESTION) {
        const { question: { choiceQuestion, grading = null } } = questionObj.questionItem;
        questionType = this.getChoiceQuestionType(choiceQuestion, grading);
        result = await this.getOptionsAndAnswer({ choices: choiceQuestion.options, grading, questionType });
        if (grading) {
          if (has(grading, 'correctAnswers')) {
            hasCorrectAnswer = true;
          }
          gradingObj = grading;
        }
      } else if (type === this.$constants.GoogleFormsSupportedQuestions.TEXT_QUESTION) {
        const { question: { grading, textQuestion } } = questionObj.questionItem;
        if (!get(textQuestion, 'paragraph', false) && grading && has(grading, 'correctAnswers')) {
          questionType = this.$constants.QuestionTypes.BLANK;
          if (grading) {
            if (has(grading, 'correctAnswers')) {
              hasCorrectAnswer = true;
            }
            gradingObj = grading;
          }
          result = await this.getOptionsAndAnswer({ choices: grading.correctAnswers.answers, grading, questionType });
        } else {
          if (grading) {
            if (has(grading, 'correctAnswers')) {
              hasCorrectAnswer = true;
            }
            gradingObj = grading;
          }
          questionType = this.$constants.QuestionTypes.OPEN;
        }
      } else if (type === this.$constants.GoogleFormsSupportedQuestions.DATE_QUESTION || type === this.$constants.GoogleFormsSupportedQuestions.TIME_QUESTION) {
        const { question: { grading } } = questionObj.questionItem;
        if (grading) {
          if (has(grading, 'correctAnswers')) {
            hasCorrectAnswer = true;
          }
          gradingObj = grading;
        }
        questionType = this.$constants.QuestionTypes.OPEN;
      } else if (type === this.$constants.GoogleFormsSupportedQuestions.SCALE_QUESTION) {
        const { question: { grading, scaleQuestion } } = questionObj.questionItem;
        questionType = this.$constants.QuestionTypes.MCQ;
        hasCorrectAnswer = false;
        if (grading) {
          gradingObj = grading;
        }
        const choiceArr = Array.from(Array(scaleQuestion.high + 1).keys()).splice(scaleQuestion.low, 5);
        const choices = choiceArr.map((choice) => ({ value: String(choice) }));
        result = await this.getOptionsAndAnswer({ choices, grading, questionType });
      }

      let correctMarks = 0;
      if (hasCorrectAnswer && gradingObj && has(gradingObj, 'pointValue')) {
        correctMarks = gradingObj.pointValue > 20 ? 20 : gradingObj.pointValue;
      }

      const structureObj = Structure({
        options: result.options,
        answer: result.correctOption,
        query: queryObj,
        kind: questionType,
        marks: {
          correct: correctMarks,
          incorrect: 0,
        },
        settings: hasCorrectAnswer
          ? {}
          : { hasCorrectAnswer: false },
      });
      return Question({
        type: questionType,
        structure: structureObj,
      });
    },

    importGoogleForm() {
      this.loadPicker();
    },

    isSupportedQuestion(question) {
      const questionType = Object.values(this.$constants.GoogleFormsSupportedQuestions).find((type) => {
        if (has(question, type)) {
          return true;
        } return false;
      });
      if (questionType) {
        return { supported: true, questionType };
      }
      return { supported: false };
    },

    async importQuiz({ title, questions }) {
      try {
        const questionsArray = [];
        for (const questionObj of questions) {
          let questionStructure = null;
          let questionSupported = null;

          if (questionObj?.questionItem) {
            questionSupported = this.isSupportedQuestion(questionObj?.questionItem.question);
            if (questionSupported.supported) {
              questionStructure = await this.addGoogleFormsQuestion({ questionObj, type: questionSupported.questionType });
            }
          }

          if (questionStructure) {
            questionsArray.push(questionStructure);
          }
        }
        if (this.shouldPublishImportForm) {
          await this.publishQuiz({ title, questions: questionsArray });
        } else {
          const result = await this.$store.dispatch('contentEditor/createMultipleQuizQuestion', { questions: questionsArray });
          if (!result.success) {
            this.showToast({ type: this.$constants.ToastTypes.ERROR, title: this.$i18n('Unable to add questions. Please try again.') });
          } else {
            this.$analytics.logEvent(
              this.$webEvents.IMPORT_GOOGLE_FORMS_SUCCESS,
              {
                quizId: this.$route.params?.id,
              },
            );
            this.$router.push({
              query: {
                ...this.$route.query,
                formImport: 'success',
              },
            });
            this.showToast({ type: this.$constants.ToastTypes.DEFAULT, title: this.$i18n('Questions added to your quiz') });
          }
        }
      } catch (error) {
        this.showToast({ type: this.$constants.ToastTypes.ERROR, title: this.$i18n('Import failed! Try again') });
      }
    },

    async publishQuiz({ title, questions }) {
      const quizData = {
        name: title,
        type: 'quiz',
        subjects: ['others'],
      };
      const draftQuiz = await QuizService.createQuiz(quizData);
      const {
        quiz: {
          _id: quizId,
          draft: { _id: draftId },
        },
      } = draftQuiz;

      const saveQuestionsResponse = await QuizService.createMultipleNewQuestions(draftId, questions, 0, quizId);
      if (saveQuestionsResponse.success) {
        const publishResponse = await QuizService.publish(quizId, draftId);
        if (publishResponse.success) {
          this.showToast({ type: this.$constants.ToastTypes.SUCCESS, title: this.$i18n('Google Form imported successfully') });
          this.$analytics.logEvent(
            this.$webEvents.IMPORT_GOOGLE_FORMS_SUCCESS,
            {
              quizId,
              publish: true,
            },
          );
          this.$router.push({
            path: `/admin/quiz/${quizId}`,
            query: {
              formImport: 'success',
            },
          });
        }
      } else {
        this.showToast({ type: this.$constants.ToastTypes.ERROR, title: this.$i18n('Import failed! Try again.') });
      }
    },
  },
};
