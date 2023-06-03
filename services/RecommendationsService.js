import LocalStorage from '~/services/LocalStorage';
import $store from '~/services/StoreService';
import APIService from './APIService.js';

export default class RecommendationsService {
  static async getAdminRecommendedQuizzes() {
    const result = await APIService.getAdminRecommendedQuizzes();
    return result;
  }

  static _setRecommendationMetaInStore(recommendationMeta) {
    const storeMetadata = { data: recommendationMeta, expiry: Date.now() + (24 * 60 * 60 * 1000) };
    $store().dispatch('currentUser/setRecommendationMeta', storeMetadata);
  }

  static _setRecommendationMetaInLocalStorage(recommendationMeta) {
    const localStorageMetadata = { data: recommendationMeta, expiry: Date.now() + (24 * 60 * 60 * 1000) };
    LocalStorage.setItem('recommendationMetadata', localStorageMetadata);
  }

  static async getUserRecommendationMetadata() {
    const storeMetadata = $store().getters['currentUser/recommendationMetadata'];
    if (storeMetadata && storeMetadata.expiry > Date.now()) {
      return storeMetadata.data;
    }

    const localStorageMetadata = LocalStorage.getItem('recommendationMetadata');
    if (localStorageMetadata && localStorageMetadata.expiry > Date.now()) {
      this._setRecommendationMetaInStore(localStorageMetadata.data);
      return localStorageMetadata.data;
    }

    const response = await APIService.getUserRecommendationMetadata();
    if (response.data.success) {
      const recommendationDataFromAPI = response.data.data;
      this._setRecommendationMetaInStore(recommendationDataFromAPI);
      this._setRecommendationMetaInLocalStorage(recommendationDataFromAPI);

      return recommendationDataFromAPI;
    }

    return null;
  }

  // Check with Parth before deciding to update this in the backend as that is supposed to be believed as the source of truth
  static async updateUserRecommendationMetadata(recommendationMeta, updateAPI = false) {
    let updatedRecommendationMeta = recommendationMeta;
    if (updateAPI) {
      const response = await APIService.updateUserRecommendationMetadata({ ...recommendationMeta, forceMerge: true });
      if (response.data.success) {
        updatedRecommendationMeta = response.data.data;
      }
    }

    this._setRecommendationMetaInStore(updatedRecommendationMeta);
    this._setRecommendationMetaInLocalStorage(updatedRecommendationMeta);
  }
}
