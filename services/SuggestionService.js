import featureFlags from '~/services/FeatureFlagsService.js';
import Constants from '~/config/Constants.js';
import removeHtmlTags from '~/utils/removeHTMLTags.js';
import Analytics from '~/services/EventLoggerService';
import WebEvents from '~/config/WebEvents';
import QLogger from './QLogger.js';
import $axios from './AxiosService.js';

export default class SuggestionService {
  static async getInferSubject(questionText) {
    try {
      const response = await $axios().get('/infer-subject', {
        params: {
          question: removeHtmlTags(questionText),
        },
      });
      const result = response.data;
      return {
        success: true,
        data: result.data,
      };
    } catch (error) {
      Analytics.logEvent(WebEvents.INFER_SUBJECT_API_FAIL, { error });
      return {
        success: false,
        error: error.response,
      };
    }
  }

  static async getDistractorsForMCQs(questionText, numberOfDistractors, correctAnswer, subject) {
    try {
      const suggestionData = {
        question: removeHtmlTags(questionText),
        numberOfOptions: numberOfDistractors,
        correctOption: removeHtmlTags(correctAnswer),
      };

      if (subject) {
        suggestionData.subject = subject;
      }
      const response = await $axios().post('/suggestions', suggestionData);
      const result = response.data;

      return {
        success: true,
        data: result.data,
      };
    } catch (error) {
      Analytics.logEvent(WebEvents.OPTION_GENERATION_API_FAIL, { error });
      return {
        success: false,
        error: error.response,
      };
    }
  }

  static async getAllOptionsForMCQs(questionText, numberOfDistractors) {
    try {
      const suggestionData = {
        question: removeHtmlTags(questionText),
        numberOfOptions: numberOfDistractors,
      };

      const response = await $axios().post('/option-suggestions', suggestionData);
      const result = response.data;

      return {
        success: true,
        data: result.data,
      };
    } catch (error) {
      Analytics.logEvent(WebEvents.ALL_OPTION_GENERATION_API_FAIL, { error });
      return {
        success: false,
        error: error.response,
      };
    }
  }

  static async getAnswerExplaination(questionText, correctOptions, options) {
    const response = await $axios().get('/explanation', {
      params: {
        question: removeHtmlTags(questionText),
        model: featureFlags().getFeatureValue(Constants.FeatureFlagsTypes.OPEN_AI_MODAL),
        correctOptions,
        options,
      },
    });
    const result = response.data;
    if (result.success) {
      return result.data;
    }
    return null;
  }

  static async generateQuestions({
    topic, subject, grade, numberOfQuestions, draftId,
  }) {
    try {
      const response = await $axios().post('/generate-questions', {
        topic, subject, grade: Number(grade), questionCount: numberOfQuestions, versionId: draftId,
      });
      return response.data;
    } catch (error) {
      QLogger.log('Error at SuggestionService.generateQuestions', error);
      return { success: false, error };
    }
  }

  static async getAiGeneratedQuiz(fileUrl, fileType, fileName, numberOfQuestions) {
    const dataForAiQuizGeneration = {
      fileUrl,
      fileType,
      fileName,
      numberOfQuestions,
    };
    try {
      const response = await $axios().post('/quiz-generator/generate', dataForAiQuizGeneration);
      const result = response.data;
      return {
        success: true,
        data: result.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response,
        data: error?.response?.data ?? {},
      };
    }
  }

  static async getAiExtractGeneratedQuiz(fileUrl, fileType, fileName, quizId, versionId) {
    const dataForAiQuizGeneration = {
      fileUrl,
      fileType,
      fileName,
      quizId,
      versionId,
    };
    try {
      const response = await $axios().post('/quiz-generator/extract', dataForAiQuizGeneration);
      const result = response.data;
      return {
        success: true,
        data: result.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response,
        data: error?.response?.data ?? {},
      };
    }
  }

  static async getAiGeneratedQuizFromOpenText(text, numberOfQuestions) {
    const dataForAiQuizGeneration = {
      text,
      numberOfQuestions,
    };
    try {
      const response = await $axios().post('/quiz-generator/generate/open-text', dataForAiQuizGeneration);
      const result = response.data;
      return {
        success: true,
        data: result.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response,
        data: error?.response?.data ?? {},
      };
    }
  }

  static async getAiExtractQuizFromOpenText(text, quizId, versionId) {
    const dataForAiQuizGeneration = {
      text,
      quizId,
      versionId,
    };
    try {
      const response = await $axios().post('/quiz-generator/extract/open-text', dataForAiQuizGeneration);
      const result = response.data;
      return {
        success: true,
        data: result.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response,
        data: error?.response?.data ?? {},
      };
    }
  }

  static async getTextCharacterLimitForAiQuizGen(text) {
    try {
      const response = await $axios().post('/quiz-generator/character-count', { text });
      const result = response.data;
      return {
        success: true,
        data: result.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response,
      };
    }
  }

  static async getAiGeneratedQuizFromTopic(topic) {
    const dataForAiQuizGeneration = {
      topic,
    };
    try {
      const response = await $axios().post('/quiz-generator/generate/from-topic', dataForAiQuizGeneration);
      const result = response.data;
      return {
        success: true,
        data: result.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response,
      };
    }
  }

  static async getAiGeneratedQuizFromUrl(url, type) {
    const dataForAiQuizGeneration = {
      url,
      type,
    };
    try {
      const response = await $axios().post('/quiz-generator/generate/from-url', dataForAiQuizGeneration);
      const result = response.data;
      return {
        success: true,
        data: result.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response,
      };
    }
  }

  static async getAiGeneratedQuizQuota() {
    try {
      const response = await $axios().get('/quiz-generator/quota');

      return response.data;
    } catch (error) {
      return {
        success: false,
        error: error.response,
      };
    }
  }

  static async rankQuestions(payload) {
    try {
      const { data } = await $axios().post('/quiz-generator/rank-questions', payload);
      return data;
    } catch (error) {
      return {
        success: false,
        data: [],
      };
    }
  }
}
