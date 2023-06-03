import get from 'lodash/get';
import compact from 'lodash/compact';
import clone from 'lodash/clone';
import isEmpty from 'lodash/isEmpty';
import map from 'lodash/map';
import cloneDeep from 'lodash/cloneDeep';
import isNumber from 'lodash/isNumber';

import Analytics from '~/services/EventLoggerService';
import WebEvents from '~/config/WebEvents';

import LocalStorage from '~/services/LocalStorage';

import Constants from '~/config/Constants';

import { getNetworkErrorType } from '~/utils/Utilities';

import { isPremiumContent, getQuestionDefaultMarks, getQuestionValidationErrors } from '~/utils/QuizUtils';

import { shouldExposeCoTeachingUsingFeatureFlag } from '~/utils/ExperimentUtils';
import $featureFlags from '../FeatureFlagsService';
import $store from '../StoreService';
import i18n from '../i18n';
import SessionStorage from '../SessionStorage';
import QLogger from '../QLogger';
import $axios from '../AxiosService';

export default class QuizService {
  static async createQuiz(data) {
    try {
      const response = await $axios().post('/quiz', data);
      const result = response.data;

      if (result.success) {
        return result.data;
      }
      return null;
    } catch (err) {
      QLogger.error('Error at QuizService.createQuiz', err);
    }
  }

  static async createQuizFromQuestions(data) {
    try {
      const response = await $axios().post('/quiz/create-with-questions', data);
      const result = response.data;

      if (result.success) {
        return result.data;
      }
      return null;
    } catch (err) {
      QLogger.error('Error at QuizService.createQuiz', err);
    }
  }

  static async getQuiz(quizId, rateLimitBypassToken = null, convertQuestions = false) {
    try {
      if (!quizId || quizId === 'undefined') {
        throw new Error('quizId is invalid!');
      }

      let axiosConfig = {};
      if (rateLimitBypassToken) {
        axiosConfig = {
          headers: {
            'x-get-quiz-bypass': rateLimitBypassToken,
          },
        };
      }

      let response;

      if (convertQuestions) {
        response = await $axios().get(`/quiz/${quizId}?convertQuestions=true`, axiosConfig);
      } else {
        response = await $axios().get(`/quiz/${quizId}`, axiosConfig);
      }
      const result = response.data;
      if (result.data?.quiz?.hasDraftVersion) {
        cleanElements(result.data?.draft?.questionDrafts);
      }

      if (result.success) {
        result.data.quiz.draft = result.data.draft;
        const isPremium = isPremiumContent(result.data.quiz);

        if (convertQuestions) {
          return { quiz: { ...result.data.quiz, isPremium }, convertedQuestions: result.data.convertedQuestions };
        }
        return { ...result.data.quiz, isPremium };
      }

      return null;
    } catch (err) {
      QLogger.error('Error at QuizService.getQuiz', err.response);
      if (!err?.response?.status) {
        return 'parsing.FAILED';
      }

      const error = get(err, 'response.data.error', '');
      if (error === 'user.ACCESS_NOT_ALLOWED' || error === 'rateLimiter.TOO_MANY_REQUESTS') {
        return error;
      }

      return null;
    }
  }

  static async getQuizGame(quizId) {
    try {
      const response = await $axios().get(`/game/${quizId}`);
      const result = response.data;
      if (result.success) {
        return { success: true, report: result.data, error: null };
      }

      return { success: false, error: null };
    } catch (err) {
      const errorType = getNetworkErrorType(err);
      QLogger.log(`Error at createQuizQuestion: ${errorType} with details -`, err);

      return { success: false, error: err };
    }
  }

  static async autoSave(versionId, questionDrafts, quizId) {
    try {
      const response = await $axios().put(`/version/${versionId}/question-drafts`, {
        questionDrafts,
        quizId,
      });
      const result = response.data;

      if (result.success) {
        return {
          success: true,
          data: result.data,
        };
      }
      return {
        success: false,
        error: get(response, 'error.response.data.error', null),
      };
    } catch (err) {
      QLogger.log('Error at QuizService.autoSave', err);
      return {
        success: false,
        error: get(err, 'response.data.error', ''),
      };
    }
  }

  static async update(quizId, versionId, data) {
    try {
      const response = await $axios().put(`/quiz/${quizId}/version/${versionId}`, data);
      const result = response.data;
      const updatedDraft = result.data.version;

      return { success: result.success, draft: updatedDraft };
    } catch (err) {
      QLogger.log('Error at QuizService.updateQuiz', err);

      return { success: false, error: err };
    }
  }

  static async quickEditMeta(isDraftState, metadata, quizId, versionId = '') {
    // Update published quiz metadata
    if (!isDraftState) {
      const data = {
        modifications: [
          {
            meta: {
              ...metadata,
            },
          },
        ],
      };

      try {
        const response = await $axios().post(`/quiz/${quizId}/quickEdit`, data);
        const result = response.data;
        const updatedDraft = result.data.version;

        return { success: result.success, draft: updatedDraft };
      } catch (err) {
        QLogger.log('Error at QuizService.updateQuiz', err);

        return { success: false, error: err };
      }
    }

    // Update Draft quiz metadata
    const data = {
      ...metadata,
    };

    return this.update(quizId, versionId, data);
  }

  static async publish(quizId, versionId) {
    try {
      const response = await $axios().post(`/quiz/${quizId}/version/${versionId}/publish`);
      const result = response.data;

      return { success: result.success };
    } catch (err) {
      QLogger.log('Error at QuizService.publish', err);
      return { sucess: false, error: err };
    }
  }

  static async makeQuizEditableAgain(quizId) {
    try {
      const response = await $axios().post(`/quiz/${quizId}/edit`);
      const result = response.data;

      if (result.data?.quiz?.hasDraftVersion) {
        cleanElements(result.data?.draft?.questionDrafts);
      }

      if (result.success) {
        result.data.quiz.draft = result.data.draft;
        return result.data.quiz;
      }
      return null;
    } catch (err) {
      QLogger.log('Error at QuizService.makeQuizEditableAgain', err);
    }
  }

  static async acquireQuizEditingLock(quizId) {
    try {
      await $axios().get(`/quiz/${quizId}/lock`);
      return true;
    } catch (err) {
      QLogger.log('Error at QuizService.acquireQuizEditingLock', err);

      const error = get(err, 'response.data.error', '');

      if (error === 'quiz.NOT_ALLOWED') {
        return error;
      }

      return false;
    }
  }

  static async releaseQuizEditingLock(quizId) {
    try {
      await $axios().get(`quiz/${quizId}/unlock`);

      return true;
    } catch (err) {
      QLogger.log('Error at QuizService.releaseQuizEditingLock', err);
      return false;
    }
  }

  static async toggleLoveForQuiz(quizId, isLoved = true) {
    try {
      if (isLoved) {
        await $axios().post(`quiz/${quizId}/love`);
      } else {
        await $axios().delete(`quiz/${quizId}/love`);
      }

      return {
        success: true,
        isLoved,
      };
    } catch (error) {
      QLogger.log('Error at QuizService.toggleLoveForQuiz', error);
      return {
        success: false,
        isLoved,
      };
    }
  }

  static async reportQuiz(payload) {
    try {
      await $axios().post('reportQuiz', payload);

      return true;
    } catch (error) {
      QLogger.log('Error at QuizService.reportQuiz', error);
      return false;
    }
  }

  static async getQuizPageRecommendations(quizId) {
    try {
      const response = await $axios().get(`quizPageRec?quizId=${quizId}`);
      const result = response.data;

      if (result.success) {
        return result.data;
      }
      return null;
    } catch (error) {
      QLogger.log('Error at QuizService.getQuizPageRecommendations', error);

      return false;
    }
  }

  static async uploadQuiz(key) {
    try {
      const response = await $axios().post('upload-quiz', { key });
      const result = response.data;

      return { success: true, extracted: result.data.extracted };
    } catch (err) {
      QLogger.log('Error at QuizService.uploadQuiz', err);
      return { success: false, error: get(err, 'response.data.message', 'Something went wrong while uploading the file!'), extracted: [] };
    }
  }

  static async processPDF(key, selectedSlides, isEditable) {
    try {
      const response = await $axios().post('process-pdf', { key, selectedSlides, isEditable });
      const result = response.data;

      return { success: true, extracted: result.data.extracted };
    } catch (err) {
      QLogger.log('Error at QuizService.uploadQuiz', err);
      return { success: false, error: get(err, 'response.data.message', 'Something went wrong while uploading the file!'), extracted: [] };
    }
  }

  static async createNewQuestion({
    question, quizDraftId, quizId, cloneInfo = {}, newTopics, translationLocale,
  }) {
    const body = this.addDefaultMarksToQuestion(this.cleanQuizQuestion(question));
    let tempStdArray = [];

    if (!isEmpty(cloneInfo)) {
      /**
       * `cloneInfo` is a data telling whether the question was cloned or not
       * which could happen by teleporting or duplicating the same question
       */
      body.clone = true;
      body.cloneFrom = cloneInfo.questionId;
      body.cloneSourceQuizId = cloneInfo.quizId;
    }

    if (newTopics && Array.isArray(newTopics) && newTopics.length > 0) {
      body.newTopics = newTopics;
    }

    const tempStdList = LocalStorage.getItem('standardList');
    if (tempStdList) {
      tempStdList?.forEach((ele) => {
        if (question.topics.includes(ele.code)) {
          tempStdArray.push(ele.id);
        }
      });
    } else {
      tempStdArray = question.standardIds;
    }
    LocalStorage.removeItem('standardList');
    body.standardIds = tempStdArray;

    if (quizId) {
      body.quizId = quizId;
    }

    if (translationLocale) {
      body.translationLocale = translationLocale;
    }

    QLogger.invariant(isNumber(body.index), [`createNewQuestion: index prop missing from question with id ${body.id}`, question]);

    try {
      const errors = await getQuestionValidationErrors(body);
      if (!isEmpty(errors)) {
        const crumbs = $store().getters['analyticsManager/breadcrumbs']();
        Analytics.logEvent('qc_validation_issue_trace', {
          errorList: errors.map((val) => val.errorCode),
          breadcrumbs: crumbs.breadcrumbs,
          mutations: crumbs.mutations,
          actions: crumbs.actions,
          flow: 'Create',
          quizId: body.quizId,
          questionId: body.id,
          versionId: quizDraftId,
        });
        QLogger.logOnSentry(
          [
            `QUESTION INVALID: ${errors.map((val) => val.errorCode).toString()}`,
            'FLOW: Create',
            `BREADCRUMBS: ${crumbs.breadcrumbs.toString()}`,
            `MUTATIONS: ${crumbs.mutations.toString()}`,
            `ACTIONS: ${crumbs.actions.toString()}`,
            `quizId: ${body.quizId}`,
            `questionId: ${body.id}`,
            `versionId: ${quizDraftId}`,
          ],
          'message',
        );
        const breakOnValidations = $featureFlags().isEnabled(Constants.FeatureFlagsTypes.BREAK_ON_VALIDATION_ERROR);
        if (breakOnValidations) {
          return { success: false, data: null, error: new Error(errors[0].errorCode) };
        }
      }
      const { data } = await $axios().post(`/version/${quizDraftId}/question`, body);

      return { success: true, data: data.data };
    } catch (error) {
      QLogger.error('Error at QuizService.createNewQuestion', error);
      return { success: false, data: null, error };
    }
  }

  static async createMultipleNewQuestions(quizDraftId, questions, index, quizId, params = {}) {
    const cleanedQuestions = map(questions, (q) => this.addDefaultMarksToQuestion(this.cleanQuizQuestion(q, { removeIndex: true })));

    try {
      const payload = {
        index,
        questions: cleanedQuestions,
        quizId,
      };

      if (params.translationLocale) {
        payload.translationLocale = params.translationLocale;
      }

      const { data } = await $axios().post(`/version/${quizDraftId}/questions`, payload);

      return { success: true, data: data.data };
    } catch (error) {
      QLogger.error('Error at QuizService.createMultipleNewQuestions', error);

      throw error;
    }
  }

  static async exportAsPresentation({ asDraft, quizId, versionId }) {
    try {
      const { data } = await $axios().post(`/quiz/${quizId}/version/${versionId}/exportAsPresentation`, {
        asDraft: asDraft || false,
      });

      return { success: true, data: data.data };
    } catch (error) {
      QLogger.log('Error at QuizService.exportAsPresentation', error);

      return { success: false, error };
    }
  }

  static async updateMultipleQuestionPoints({
    questionIds, quizDraftId, quizId, points,
  }) {
    const body = {
      quizId: quizId ?? null,
      questionIds: questionIds ?? [],
      points: points ?? null,
    };

    try {
      const { data } = await $axios().post(`/version/${quizDraftId}/questions/marks`, body);
      return { success: true, data: data.data };
    } catch (error) {
      QLogger.log('Error at QuizService.updateQuestionPoints', error);
      return { success: false, error };
    }
  }

  static async updateQuestion(question, quizDraftId, quizId, newTopics) {
    const body = this.addDefaultMarksToQuestion(this.cleanQuizQuestion(question));

    let tempStdArray = [];

    if (Array.isArray(newTopics) && newTopics.length > 0) {
      body.newTopics = newTopics;
    }

    if (quizId) {
      body.quizId = quizId;
    }

    const tempStdList = LocalStorage.getItem('standardList');
    if (tempStdList != null) {
      tempStdList?.forEach((ele) => {
        if (question.topics.includes(ele.code)) {
          tempStdArray.push(ele.id);
        }
      });
    } else {
      tempStdArray = cloneDeep(question.standardIds);
      const stdArr = [];
      tempStdArray.forEach((ele) => {
        if (typeof ele === 'object') {
          stdArr.push(ele._id);
        }
      });
      if (stdArr.length > 0) {
        tempStdArray = stdArr;
      }
    }

    question.standardIds.forEach((ele) => {
      if (typeof ele === 'object' && question.topics.includes(ele.short_code)) {
        tempStdArray.push(ele._id);
      }
    });
    LocalStorage.removeItem('standardList');
    body.standardIds = [...new Set(tempStdArray)];

    try {
      const errors = await getQuestionValidationErrors(body);
      if (!isEmpty(errors)) {
        const crumbs = $store().getters['analyticsManager/breadcrumbs']();
        Analytics.logEvent('qc_validation_issue_trace', {
          errorList: errors.map((val) => val.errorCode),
          breadcrumbs: crumbs.breadcrumbs,
          mutations: crumbs.mutations,
          actions: crumbs.actions,
          flow: 'Update',
          quizId: body.quizId,
          questionId: body.id,
          versionId: quizDraftId,
        });
        QLogger.logOnSentry(
          [
            `QUESTION INVALID: ${errors.map((val) => val.errorCode).toString()}`,
            'FLOW: Update',
            `BREADCRUMBS: ${crumbs.breadcrumbs.toString()}`,
            `MUTATIONS: ${crumbs.mutations.toString()}`,
            `ACTIONS: ${crumbs.actions.toString()}`,
            `quizId: ${body.quizId}`,
            `questionId: ${body.id}`,
            `versionId: ${quizDraftId}`,
          ],
          'message',
        );
        const breakOnValidations = $featureFlags().isEnabled(Constants.FeatureFlagsTypes.BREAK_ON_VALIDATION_ERROR);
        if (breakOnValidations) {
          return { success: false, data: null, error: new Error(errors[0].errorCode) };
        }
      }
      const { data } = await $axios().put(`/version/${quizDraftId}/question/${question._id}`, body);

      return { success: true, data: data.data };
    } catch (error) {
      QLogger.log('Error at QuizService.updateQuestion', error);

      return { success: false, error };
    }
  }

  static async updateQuestionWithoutDrafts(question, quizDraftId, quizId, newTopics) {
    const cleanedQuestion = this.addDefaultMarksToQuestion(this.cleanQuizQuestion(question));

    const body = {
      modifications: [
        {
          deletedQuestionId: question._id,
          addedQuestionBody: cleanedQuestion,
        },
      ],
    };

    try {
      const { data } = await $axios().post(`quiz/${quizId}/quickEdit`, body);

      return { success: true, data: data.data };
    } catch (error) {
      QLogger.log('Error at QuizService.updateQuestion', error);

      return { success: false, error };
    }
  }

  static async getAutoConvertVersions(questions) {
    try {
      const { data } = await $axios().post('convert-questions', { questions: [...questions] });

      return { success: true, data: data?.data };
    } catch (error) {
      QLogger.log('Error at QuizService.getAutoConvertVersions', error);

      return { success: false, error };
    }
  }

  static async saveQuizWithBulkAutoConverts(quizId, modifications) {
    try {
      const { data } = await $axios().post(`quiz/${quizId}/quickEdit`, { modifications });

      return { success: true, data: data.data };
    } catch (error) {
      QLogger.log('Error at QuizService.updateQuestion', error);

      return { success: false, error };
    }
  }

  static async reorderQuestions(questionIds, quizDraftId, quizId) {
    const body = { questions: questionIds };

    try {
      const { data } = await $axios().put(`/quiz/${quizId}/version/${quizDraftId}/reorder`, body);

      return { success: true, data: data.data };
    } catch (error) {
      QLogger.log('Error at QuizService.updateMultipleQuestions', error);

      return { success: false, error };
    }
  }

  static async deleteQuestion(question, quizDraftId, quizId) {
    try {
      // const { data } = await $axios().delete(`/version/${quizDraftId}/question/${question._id}`, {
      //   quizId,
      // });

      const { data } = await $axios().post(`/quiz/${quizId}/version/${quizDraftId}/question/${question._id}/remove`);

      return { success: true, data };
    } catch (error) {
      QLogger.error('Error at QuizService.deleteQuestion', error);

      throw error;
    }
  }

  static async handleResoucePermissions(type, payload) {
    try {
      const { data } = await $axios().post(`/resource-permissions/${type}`, payload);

      return { ...data, success: true };
    } catch (error) {
      QLogger.log('Error at QuizService.handleResoucePermissions', error);

      return { success: false, error };
    }
  }

  static async updateQuestionTimeForAll(quizId, quizDraftId, time) {
    try {
      await $axios().put(`/quiz/${quizId}/version/${quizDraftId}/qm`, {
        all: { time },
      });

      return { success: true };
    } catch (error) {
      QLogger.log('Error at QuizService.updateQuestionTimeForAll', error);

      return { success: false, error };
    }
  }

  static async cloneQuiz(quizId, publishedVersion, params = {}) {
    try {
      let queryParam = '';
      if (params && Object.keys(params).length > 0) {
        queryParam = new URLSearchParams(params).toString();
      }

      const { data } = await $axios().post(`/quiz/${quizId}/version/${publishedVersion}/clone${queryParam ? `?${queryParam}` : ''}`);

      return data;
    } catch (error) {
      QLogger.log('Error at QuizService.cloneQuiz', error);

      return { success: false, error };
    }
  }

  static async editQuiz(quizId, params = {}) {
    try {
      let queryParam = '';
      if (params && Object.keys(params).length > 0) {
        queryParam = new URLSearchParams(params).toString();
      }

      const { data } = await $axios().post(`/quiz/${quizId}/edit${queryParam ? `?${queryParam}` : ''}`);

      return data;
    } catch (error) {
      QLogger.log('Error at QuizService.editQuiz', error);

      return { success: false, error };
    }
  }

  // Meme services starts
  static async getMemesets(featured = true) {
    try {
      const { data } = await $axios().get(`/memesets?featured=${featured}`);

      return data;
    } catch (error) {
      QLogger.log('Error at QuizService.getMemesets', error);

      return { success: false, error };
    }
  }

  static async getUserMemesets(userId) {
    try {
      const { data } = await $axios().get(`/memesets/user/${userId}`);

      return data.data;
    } catch (error) {
      QLogger.log('Error at QuizService.getUserMemesets', error);

      return { success: false, error };
    }
  }

  static async getPrivateMemesets() {
    try {
      const { data } = await $axios().get('/memesets');
      return data;
    } catch (error) {
      QLogger.log('Error at QuizService.getPrivateMemesets', error);

      return { success: false, error };
    }
  }

  static async getMemeset(memesetId, isShowUser) {
    try {
      const { data } = await $axios().get(`/memeset/${memesetId}?showUser=${isShowUser}`);
      return { success: true, data };
    } catch (error) {
      QLogger.log('Error at QuizService.getMemeset', error);
      return { success: false, error };
    }
  }

  static async createMemeset(payload) {
    try {
      const { data } = await $axios().post('/memeset', payload);
      return { success: true, data };
    } catch (error) {
      QLogger.log('Error at QuizService.updateMemeset', error);
      return { success: false, error };
    }
  }

  static async updateMemeset(memesetId, payload) {
    try {
      const { data } = await $axios().put(`/memeset/${memesetId}`, payload);
      return { success: true, data };
    } catch (error) {
      QLogger.log('Error at QuizService.updateMemeset', error);
      return { success: false, error };
    }
  }

  static async cloneMemeset(memesetId) {
    try {
      const { data } = await $axios().get(`/memeset/${memesetId}/clone`);
      return { success: true, data };
    } catch (error) {
      QLogger.log('Error at QuizService.cloneMemeset', error);
      return { success: false, error };
    }
  }

  static async deleteMemeset(memesetId) {
    try {
      const { data } = await $axios().delete(`/memeset/${memesetId}`);
      return { success: true, data };
    } catch (error) {
      QLogger.log('Error at QuizService.deleteMemeset', error);
      return { success: false, error };
    }
  }

  static async createMeme(memeseId, payload) {
    try {
      const { data } = await $axios().post(`/meme/${memeseId}`, payload);
      return { success: true, data };
    } catch (error) {
      QLogger.log('Error at QuizService.uploadMeme', error);
      return { success: false, error };
    }
  }

  static async generateFinalMeme(memesetId, memeId, url) {
    const formData = new FormData();
    formData.append('finalURL', url);
    try {
      const { data } = await $axios().put(`/memeset/${memesetId}/meme/${memeId}/final`, formData);
      return { success: true, data };
    } catch (error) {
      QLogger.log('Error at QuizService.uploadMeme', error);
      return { success: false, error };
    }
  }

  static async deleteMeme(memeId, payload) {
    try {
      const { data } = await $axios().delete(`/meme/${memeId}`, { data: payload });
      return { success: true, data };
    } catch (error) {
      QLogger.log('Error at QuizService.deleteMeme', error);
      return { success: false, error };
    }
  }
  // meme services ends

  static async startGame(
    {
      info,
      gameOptions,
      brandingOptions,
      meta = {},
      groupIds = null,
      scheduledAt = null,
      expiry = 7200,
      assignedTo = {},
      startDate = null,
      locale = 'en',
      withMarks = true,
      paperModeRosterId = null,
      gameTranslation = null,
    },
  ) {
    try {
      const { quizId, hostId, type } = info;

      // TODO: Set the adaptive key as false/true depending on the toggle.

      // This is happening since gameOptions.adaptive is not getting set anywhere
      // and directly affecting the gameOption.questionsPerAttempt
      // if (!gameOptions.adaptive) {
      //   gameOptions.questionsPerAttempt = 0;
      // }

      // force jumble for adaptive learning
      if (gameOptions.questionsPerAttempt > 0) {
        gameOptions.jumble = true;
      }

      const payload = {
        quizId,
        hostId,
        type,
        assignedTo,
        brandingOptions,
        title: meta.title ?? null,
        description: meta.desc ?? null,
        scheduledAt,
        expiry, // Only for async games : deadlines
        gameOptions,
        grading: meta.grading ?? {
          isGraded: true,
          maxPoints: 100,
        },
        groupIds,
        locale,
        memeSet: gameOptions.memeset,
        withMarks,
      };

      if (paperModeRosterId) {
        payload.paperModeRosterId = paperModeRosterId;
      }

      if (startDate) {
        payload.startDate = startDate;
      }

      if (gameTranslation) {
        payload.gameTranslation = gameTranslation;
      }

      const { data } = await $axios().post('/game', payload);

      if (gameOptions.questionsPerAttempt > 0 || gameOptions.adaptive) {
        Analytics.logEvent(WebEvents.GAME_QUESTION_BANK_KEYS, {
          adaptive: gameOptions.adaptive,
          questionsPerAttempt: gameOptions.questionsPerAttempt,
        });
      }

      return data;
    } catch (error) {
      QLogger.log('Error at QuizService.startGame', error);

      return { success: false, error };
    }
  }

  static async startGameWithPayload(payload) {
    try {
      const { data } = await $axios().post('/game', payload);

      if (payload?.gameOptions.questionsPerAttempt > 0 || payload?.gameOptions.adaptive) {
        Analytics.logEvent(WebEvents.GAME_QUESTION_BANK_KEYS, {
          adaptive: payload.gameOptions.adaptive,
          questionsPerAttempt: payload.gameOptions.questionsPerAttempt,
        });
      }

      return data;
    } catch (error) {
      QLogger.log('Error at QuizService.startGame', error);

      return { success: false, error };
    }
  }

  static async getTags(type) {
    try {
      const { data } = await $axios().get(`/tags?type=${type}`);

      return data;
    } catch (error) {
      QLogger.log('Error at QuizService.getTags', error);

      return { success: false, error };
    }
  }

  static async getTagPublicCollection(tagId) {
    try {
      const { data } = await $axios().get(`/tags/${tagId}/public`);

      return data;
    } catch (error) {
      QLogger.log('Error at QuizService.getTags', error);

      return { success: false, error };
    }
  }

  static async addTags(payload) {
    try {
      const { data } = await $axios().post('/tags', payload);

      return data;
    } catch (error) {
      QLogger.log('Error at QuizService.addTags', error);

      return { success: false, error };
    }
  }

  static async deleteTag({ id }) {
    try {
      const { data } = await $axios().delete(`/tags/${id}`);

      return data;
    } catch (error) {
      QLogger.log('Error at QuizService.deleteTag', error);
      return { success: false, error };
    }
  }

  static async updateTag({
    id, name, type, visibility,
  }) {
    try {
      const { data } = await $axios().put(`/tags/${id}`, { name, type, visibility });

      return data;
    } catch (error) {
      QLogger.log('Error at QuizService.updateTag', error);
      return { success: false, error };
    }
  }

  static async getTagsForEntity(entities) {
    try {
      const { data } = await $axios().get(`/tags/entity?ids=${entities}`);

      return data;
    } catch (error) {
      QLogger.log('Error at QuizService.getTagsForEntity', error);

      return { success: false, error };
    }
  }

  static async getUserTags(userId, type) {
    try {
      const { data } = await $axios().get(`/tags/user/${userId}`, { params: { type } });

      return data;
    } catch (error) {
      QLogger.log('Error at QuizService.getTagsForEntity', error);

      return { success: false, error };
    }
  }

  static async toggleEntityFromTag(type, tagId, payload) {
    try {
      // Clear search results cache
      SessionStorage.setItem(Constants.SearchCacheKeys.FEATURE_PAGE_CACHE, null);
      SessionStorage.setItem(Constants.SearchCacheKeys.SEARCH_PAGE_CACHE, null);

      const { data } = await $axios().post(`/tags/${tagId}/${type}`, payload);

      return data;
    } catch (error) {
      QLogger.log('Error at QuizService.toggleEntityFromTag', error);

      return { success: false, error };
    }
  }

  static async getGroups() {
    try {
      let response = null;

      if (shouldExposeCoTeachingUsingFeatureFlag()) {
        response = await $axios().get('/v2/groups', { params: { from: 0, size: 1000 } });
        const result = response.data;
        if (result?.data?.groups) {
          const filteredGroups = result.data.groups?.filter((group) => !group.archived) ?? [];
          response.data.data.groups = filteredGroups;
        }
      } else {
        response = await $axios().get('/groups', { params: { from: 0, size: 1000 } });
      }
      const { data } = response;

      return data;
    } catch (error) {
      QLogger.log('Error at QuizService.getGroups', error);

      return { success: false, error };
    }
  }

  static async getGames() {
    try {
      const { data } = await $axios().get('/games');

      return data;
    } catch (error) {
      QLogger.log('Error at QuizService.getGames', error);

      return { success: false, error };
    }
  }

  static async deleteQuiz(quizId) {
    try {
      const { data } = await $axios().delete(`/quiz/${quizId}`);

      return data;
    } catch (error) {
      QLogger.log('Error at QuizService.deleteQuiz', error);

      return { success: false, error };
    }
  }

  static async getQuizzes(sectionId, page, pageSize, cacheKeyName) {
    try {
      const response = await $axios().get(`/v2/adminRecommend/${sectionId}?page=${page}&pageSize=${pageSize}`);

      const result = response.data;
      if (result.success) {
        try {
          SessionStorage.setItem(cacheKeyName, response.data.data);
          SessionStorage.setItem(`${cacheKeyName}Expiry`, Date.now() + 1000 * 60 * 60 * 24);
        } catch (err) { }

        return result;
      }
      return null;
    } catch (error) {
      QLogger.log('Error at QuizService.getQuizzes', error);
      return { success: false, error };
    }
  }

  static async updateTimeForMany(quizId, quizDraftId, questions) {
    try {
      await $axios().put(`/quiz/${quizId}/version/${quizDraftId}/qm`, {
        questions,
      });

      return { success: true };
    } catch (error) {
      QLogger.log('Error at QuizService.updateTimeForMany', error);
      return { success: false, error };
    }
  }

  static async getListOfStudentsForGroups(groupId) {
    try {
      const { data } = await $axios().get(`/group/${groupId}`);

      return { success: true, data };
    } catch (error) {
      QLogger.log('Error at QuizService.getListOfStudentsForGroups', error);
    }
  }

  static async saveUserPreference(payload) {
    try {
      const { data } = await $axios().put('/user/info', payload);

      return data;
    } catch (error) {
      QLogger.log('Error at QuizService.saveUserPreference', error);

      return { success: false, error };
    }
  }

  static async removeAllTagsFromEntity(quizId, opts = {
    shouldRemoveFromCollections: false,
  }) {
    try {
      const { shouldRemoveFromCollections } = opts;
      const { data } = await $axios().post('/tags/remove-all-tags', {
        quizId,
        shouldRemoveFromCollections,
      });

      return data;
    } catch (error) {
      QLogger.log('erroror at QuizService.removeAllTagsForUser', error);

      return { success: false, error };
    }
  }

  static async duplicateTag({ id }) {
    try {
      const { data } = await $axios().post(`/tags/duplicate/${id}`);

      return data;
    } catch (error) {
      QLogger.log('Error at QuizService.duplicateTag', error);
      return { success: false, error };
    }
  }

  static async shareEntity({
    type, entityId, redirect, shareWith,
  }) {
    try {
      const { data } = await $axios().post('/user/share', {
        type, entityId, redirect, shareWith,
      });

      return data;
    } catch (error) {
      QLogger.log('Error at QuizService.shareEntity', error);
      return { success: false, error };
    }
  }

  static async getUsersToShare() {
    try {
      const { data } = await $axios().get('/user/share');
      return data;
    } catch (error) {
      QLogger.log('Error at QuizService.getTeachersFromSchool', error);
      return { success: false, error };
    }
  }

  static async getUsersToShareQuizWith(organization) {
    try {
      const { data } = await $axios().get(`/snd/org/${organization}/teachers`);
      return data;
    } catch (error) {
      QLogger.log('Error at QuizService.getUsersToShareQuizWith', error);
      return { success: false, error };
    }
  }

  // slides bulk import
  static async initializeBulkSlidesImport({
    googleOAuthToken, files, rejectedFiles = [], isEditableImport,
  }) {
    try {
      const { data } = await $axios().post('/slide-import/initialize', {
        googleOAuthToken, files, rejectedFiles, isEditable: isEditableImport,
      });
      return data;
    } catch (error) {
      QLogger.log('Error at QuizService.initializeBulkSlidesImport', error);

      return {
        success: false,
        errMsg: get(error, 'response.data.message', i18n('Unable to start bulk import')),
      };
    }
  }

  static async getCurrentSlideImportStatus() {
    try {
      const { data } = await $axios().get('/slide-import/current');
      return {
        success: true,
        data: data.data,
      };
    } catch (error) {
      QLogger.log('Error at QuizService.getCurrentSlideImportStatus', error);
      return {
        success: false,
        errMsg: i18n('Unable to import slides'),
      };
    }
  }

  static async cancelBulkSlideImport() {
    try {
      const { data } = await $axios().post('/slide-import/cancel');
      return {
        success: true,
        data: data.data,
      };
    } catch (error) {
      QLogger.log('Error at QuizService.getCurrentSlideImportStatus', error);
      return {
        success: false,
        errMsg: i18n('Unable to cancel slide import'),
      };
    }
  }

  // Helper Functions
  static cleanQuizQuestion(question, { removeIndex = false } = {}) {
    const cleanedQues = clone(question);

    if (removeIndex) {
      delete cleanedQues.index;
    }

    if (isEmpty(cleanedQues.teleportFrom)) {
      delete cleanedQues.teleportFrom;
    }

    if (cleanedQues.cardId) {
      delete cleanedQues.cardId;
    }

    return cleanedQues;
  }

  static addDefaultMarksToQuestion(question) {
    const questionWithMarks = cloneDeep(question);
    questionWithMarks.structure.marks = {
      correct: getQuestionDefaultMarks(questionWithMarks),
      incorrect: 0,
    };

    return questionWithMarks;
  }
}

// Helper Functions
function cleanElements(questionDrafts) {
  if (!questionDrafts) { return; }
  for (const question of questionDrafts) {
    question.structure.elements = compact(question.structure.elements);
  }
}
