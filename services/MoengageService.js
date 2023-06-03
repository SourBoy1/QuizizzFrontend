/* eslint-disable */
import Constants from '~/config/Constants';
import _isFunction from 'lodash/isFunction';
export default class MoengageService {
  static init (user) {
    this.loadscript(user);
  }

  static loadscript (user) {
    if (!([
      Constants.UserOccupation.TEACHER,
      Constants.UserOccupation.TEACHER_SCHOOL,
      Constants.UserOccupation.TEACHER_UNIVERSITY,
      Constants.UserOccupation.CORPORATE_TEACHER,
      Constants.UserOccupation.SCHOOL_ADMIN,
      Constants.UserOccupation.OTHER,
      Constants.UserOccupation.DISTRICT_ADMIN,
      Constants.UserOccupation.DEPARTMENT_HEAD,
      Constants.UserOccupation.INSTRUCTIONAL_TECH_COACH
    ].includes(user.occupation || ''))) {
      return;
    }

    (function(i, s, o, g, r, a, m, n) {
      i["moengage_object"] = r;
      var t = {};
      var q = function(f) {
        return function() {
          (i["moengage_q"] = i["moengage_q"] || []).push({ f: f, a: arguments });
        };
      };
      var f = [
        "track_event",
        "add_user_attribute",
        "add_first_name",
        "add_last_name",
        "add_email",
        "add_mobile",
        "add_user_name",
        "add_gender",
        "add_birthday",
        "destroy_session",
        "add_unique_user_id",
        "update_unique_user_id",
        "moe_events",
        "call_web_push",
        "track",
        "location_type_attribute"
      ];
      for (var k in f) {
        t[f[k]] = q(f[k]);
      }
      a = s.createElement(o);
      m = s.getElementsByTagName(o)[0];
      a.async = 1;
      a.src = g;
      m.parentNode.insertBefore(a, m);
      i["moe"] =
        i["moe"] ||
        function() {
          n = arguments[0];
          return t;
        };
      a.onload = function() {
        if (n) {
          i[r] = moe(n);
        }
      };
    })(
      window,
      document,
      "script",
      "https://cdn.moengage.com/webpush/moe_webSdk.min.latest.js",
      "Moengage"
    );
  }

  static triggerEvent (user, eventType, objectName, eventData = {}) {
    if (eventType === 'event') {
      Object.assign(eventData, { moengageOnly: true });
      this.addEvent(user, objectName, eventData);
      return;
    }

    this.addUserAttrib(objectName);
  };

  static async addEvent (user, eventName, eventData) {
    return;
  }

  static addUserAttrib (attribName, attribData) {
    return;
  }
}
