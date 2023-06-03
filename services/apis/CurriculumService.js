import { StatesInUS } from '~/config/StatesInUS.js';
import $axios from '../AxiosService.js';
import QLogger from '../QLogger.js';

export default class CurriculumService {
  static async getCurriculumList() {
    try {
      const response = await $axios().get('/curriculum/list');
      const result = response.data;

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      QLogger.log('Error at CurriculumService.getCurriculumList', error);

      return {
        success: false,
        error,
      };
    }
  }

  static async getCurriculumRecommendation(currentQuiz, subjectForCurriculumRecommendation, gradesForRecommendation, state) {
    try {
      const stateSubjectsMap = {
        CommonCore: ['Mathematics', 'English Language Arts'],
        TX: ['Mathematics', 'English Language Arts and Reading', 'Science'],
        VA: ['Mathematics (2016)', 'English (2017)', 'Science'],
        NY: ['Next Generation Mathematics Learning Standards (K-8) (2017)', 'Science (2016)'],
        CA: ['Mathematics', 'Science'],
        GA: ['Mathematics - Georgia Standards of Excellence', 'English Language Arts - Georgia Standards of Excellence', 'Science - Georgia Standards of Excellence'],
      };

      let stateName = ' ';
      StatesInUS.forEach((stateObject) => {
        if (stateSubjectsMap[state] && stateObject.abbreviation === state) {
          stateName = stateObject.name;
        }
      });
      const response = await $axios().get(
        '/curriculum/recommendation',
        {
          params: {
            grades: gradesForRecommendation,
            subjects: subjectForCurriculumRecommendation,
            state: stateName,
            disabledSerialization: true,
          },
        },
      );
      const result = response.data;

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      QLogger.log('Error at CurriculumService.getCurriculumRecommendation', error);

      return {
        success: false,
        error,
      };
    }
  }

  static async getCurriculumById(id) {
    try {
      const response = await $axios().get(`/curriculum/${id}`);
      const result = response.data;

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      QLogger.log('Error at CurriculumService.getCurriculumById', error);

      return {
        success: false,
        error,
      };
    }
  }

  static async filterStandards({ curriculum, grade, subject = null }) {
    try {
      const response = await $axios().post('/topics/filter', {
        curriculum,
        grade,
        subject,
      });
      const result = response.data;

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      QLogger.log('Error at CurriculumService.filterStandards', error);

      return {
        success: false,
        error,
      };
    }
  }

  static async getGradesForSubject(subject) {
    try {
      const response = await $axios().get(`/topics/${encodeURIComponent(subject)}`);
      const result = response.data;

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      QLogger.log('Error at CurriculumService.getGradesForSubject', error);

      return {
        success: false,
        error,
      };
    }
  }

  static async getGradesForCurriculumAndSubject({ curriculum, subject }) {
    try {
      const response = await $axios().get(`/topics/${curriculum}/${encodeURIComponent(subject)}`);
      const result = response.data;

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      QLogger.log('Error at CurriculumService.getGradesForCurriculumAndSubject', error);

      return {
        success: false,
        error,
      };
    }
  }
}
