import map from 'lodash/map';
import filter from 'lodash/filter';
import clone from 'lodash/clone';
import find from 'lodash/find';
import isEmpty from 'lodash/isEmpty';

import Constants from '~/config/Constants';
import $store from './StoreService';

import ClassAPIService from './apis/ClassAPIService';

export default class ClassService {
  static async getClass(id, mock = false) {
    const response = await ClassAPIService.getClass(id, mock);
    $store().dispatch('classes/setClass', response);
    return response;
  }

  static async createClass(classDetails) {
    const response = await ClassAPIService.createClass(classDetails);
    $store().dispatch('classes/addClass', response);
    return response;
  }

  static async updateClass(classId, classDetails) {
    const response = await ClassAPIService.updateClass(classId, classDetails);
    $store().dispatch('classes/setClass', response);
  }

  static async updateMembers(classId, memberDetails) {
    const response = await ClassAPIService.updateMembers(classId, { members: [memberDetails] });
    $store().dispatch('classes/updateMembers', response);
  }

  static async addMembers(classId, memberDetails) {
    const response = await ClassAPIService.addMembers(classId, { members: memberDetails });
    return response;
  }

  static async removeMembers(classId, userIds) {
    const memberData = {
      members: map(userIds, (id) => ({ userId: id })),
    };
    const response = await ClassAPIService.removeMembers(classId, memberData);
    $store().dispatch('classes/removeMembers', response);
  }

  static async generateLink(classId) {
    const response = await ClassAPIService.generateLink(classId);
    $store().dispatch('classes/updateLink', response);
  }

  static lmsName(classObj) {
    const lmsType = classObj?.lmsType;
    switch (lmsType) {
      case Constants.LMSTypes.GCL:
        return 'Google Classroom';
      case Constants.LMSTypes.CANVAS:
        return 'Canvas';
      case Constants.LMSTypes.SCHOOLOGY:
        return 'Schoology';
      default:
    }
    return '';
  }

  static lmsImage(classObj) {
    const lmsType = classObj?.lmsType;
    switch (lmsType) {
      case 'gcl':
        return 'https://cf.quizizz.com/img/icons/lms/google_classroom.png';
      case 'canvas':
        return 'https://cf.quizizz.com/img/icons/lms/canvas1.png';
      case 'schoology':
        return 'https://cf.quizizz.com/img/icons/lms/schoology.png';
      default:
    }
    return '';
  }

  static isGoogle(classObj) {
    return !isEmpty(classObj) ? classObj.isGoogle : false;
  }

  static isLMS(classObj) {
    return !!this.lmsName(classObj);
  }

  static totalMembers(classObj) {
    if (isEmpty(classObj)) {
      return 0;
    }
    if (this.isGoogle(classObj)) {
      return classObj.google.students || 0;
    }
    return classObj.totalMembers || 0;
  }

  static getLMSType(classObj) {
    if (classObj.isGoogle) {
      if (!classObj.lmsType || classObj.lmsType === 'gcl') {
        return 'google';
      }
      return classObj.lmsType;
    }
    return null;
  }

  static getMissingMembers(classObj) {
    if (isEmpty(classObj)) {
      return [];
    }
    const { members } = classObj;
    const lmsType = this.getLMSType(classObj);
    const missingMembers = filter(clone(classObj.google?.studentDetails), (item) => !find(members, (member) => Boolean(member[lmsType] && String(member[lmsType].profileId) === String(item.profileId))));

    return missingMembers;
  }

  static getClassStats(classObj) {
    if (isEmpty(classObj) || (isEmpty(classObj.statsV3) && isEmpty(classObj.stats))) {
      return {
        totalGames: '-',
        avgAccuracy: '-',
        totalQuestionsAnswered: '-',
      };
    }
    const stats = classObj.statsV3 || classObj.stats || {};
    const classStats = {};
    classStats.totalGames = stats.totalGames || '0';
    classStats.avgAccuracy = Math.floor(stats.totalCorrect / stats.totalQuestionsAnswered * 100) || '0';
    classStats.totalQuestionsAnswered = stats.totalQuestionsAnswered || '0';
    return classStats;
  }
}
