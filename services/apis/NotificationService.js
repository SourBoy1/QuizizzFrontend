import axios from 'axios';

import io from 'socket.io-client';

import Constants from '~/config/Constants.js';
import QLogger from '../QLogger.js';

const SUB_DOMAIN = import.meta.env.VITE_NODE_ENV === Constants.NodeEnvs.PROD ? 'notif' : 'dev-services';

const DOMAIN = `https://${SUB_DOMAIN}.quizizz.com/notif/main`;

const SOCKET_SERVER = `wss://${SUB_DOMAIN}.quizizz.com/`;
const SOCKET_PATH = '/_nsocket/sockUpg/socket/';
const LIMIT = 8;

export default class NotificationService {
  constructor(domain = DOMAIN, notification = SOCKET_SERVER, user) {
    this.domain = domain;
    this.notification = notification;
    this.user = user;
  }

  async get(start = 0) {
    const limit = start === 0 ? 20 : LIMIT;
    try {
      const response = await axios.get(`${this.domain}/user/${this.user}?start=${start}&limit=${limit}`);
      if (response.data) {
        return response.data;
      }
      return {};
    } catch (error) {
      QLogger.log(`Error fetching notification at page ${0}`, error);
      return {};
    }
  }

  async markOneNotificationAsRead(notificationID) {
    try {
      const response = await axios.put(`${this.domain}/user/${this.user}/read/`, { nIds: [notificationID] });
      if (response.data) {
        return response.data;
      }
      return {};
    } catch (error) {
      QLogger.log('Error marking one notification', error);
      return null;
    }
  }

  async markMultipleNotificationsAsRead(nIds) {
    try {
      const response = await axios.put(`${this.domain}/user/${this.user}/read/`, { nIds });
      if (response.data) {
        return response.data;
      }
      return {};
    } catch (error) {
      QLogger.log('Error marking all notifications as read', error);
      return {};
    }
  }

  initSocket() {
    const socket = io(this.notification, {
      path: SOCKET_PATH,
      withCredentials: true,
    });
    return socket;
  }
}
