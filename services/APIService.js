import $axios from './AxiosService.js';

export default class APIService {
  static async getAdminRecommendedQuizzes() {
    const response = await $axios().get('/v2/adminRecommend');
    const result = response.data;
    if (result.success) {
      return result.data;
    }

    return null;
  }

  static async getUserRecommendationMetadata() {
    return $axios().get('/user/recommendationMeta');
  }

  static async updateUserRecommendationMetadata(params) {
    return $axios().put('/user/recommendationMeta', params);
  }
}
