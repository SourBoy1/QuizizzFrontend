/* eslint-disable */

import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';

import Constants from '~/config/Constants';
import CookieService from '~/services/CookieService';
import { translator as Translator } from '~/services/i18n';


const defaultOptions = {
  position: {
    horizontal: 'right',
    vertical: 'bottom',
  },
  chat: {
    connectOnPageLoad: false
  }
}
const zdUtils = {
  initConfigs (user, options = defaultOptions) {
    try {
      if (!isEmpty(user) && user.id) {
        const isZopimLoaded = typeof $zopim === 'function';
        const userSubscription = get(user, 'subscriptions[0]', {});
        const planName = get(userSubscription, 'productName', '');
        const userOccupation = get(user, 'occupation', '');
        const isCorporateUser = userOccupation.includes('corporate');
        const isSuperUser = planName === 'Super';
        const isPremiumUser = planName === 'Premium';

        // Live Chat config
        if (isZopimLoaded) {
          $zopim(function () {
            $zopim.livechat.addTags(userOccupation);

            if (isCorporateUser || isSuperUser || isPremiumUser) {
              const userFullName = (user.firstName ? (user.firstName + ' ') : '') + (user.lastName || '');

              if (userFullName) {
                $zopim.livechat.setName(userFullName);
              }

              if (planName) {
                $zopim.livechat.addTags('Plan: ' + planName);
              }

              const slot = Number(CookieService.get('QUIZIZZ_EXP_SLOT') || -1);
              const experiment = CookieService.get('QUIZIZZ_EXP_NAME')

              if (slot !== -1) {
                $zopim.livechat.addTags(`slot: ${slot}`);
              }

              if (experiment) {
                $zopim.livechat.addTags(`experiment: ${experiment}`);
              }

              $zopim.livechat.setEmail(user.email);
            }
          });
        }


        // Tickets config
        const payload = {};

        if (userOccupation) {
          payload.occupation = userOccupation;
        }

        if (planName) {
          payload.plan = planName.toLowerCase();
        }

        const expInfo = {};
        const slot = Number(CookieService.get('QUIZIZZ_EXP_SLOT') || -1);
        const experiment = CookieService.get('QUIZIZZ_EXP_NAME')

        if (slot !== -1) {
          expInfo.slot = slot;
        }

        if (experiment) {
          expInfo.experiment = experiment;
        }

        if (!isEmpty(payload) || !isEmpty(expInfo)) {
          const encodedPayload = payload ? btoa(JSON.stringify(payload)) : null;
          zdUtils.fillTicketMetaData(encodedPayload, !isEmpty(expInfo) ? expInfo : { slot: -1, experiment: 'null_exp' });
          zdUtils.positionWebWidget(options.position)
        }

        zdUtils.setZendeskLocale();
      }
    } catch (e) {
      console.error('Error [zdUtils.initConfigs]: Error while initialising zendesk configs.\n' + e);
    }
  },
  zendeskScriptSrc (user) {
    if (user && user.isCorporate) {
      return 'https://static.zdassets.com/ekr/snippet.js?key=0f529906-35c6-4ab8-a2fd-1fd632f82a1a';
    } else if (user.occupation !== Constants.UserOccupation.STUDENT && !!user.id) {
      return 'https://static.zdassets.com/ekr/snippet.js?key=f2b85f5f-feb8-46ce-8eff-f5871bf855f3';
    }
    return '';
  },
  hideWebWidget () {
    let hideWidgetTimeout;
    let tries = 10;

    if (window.zE) {
      zE('webWidget', 'hide');
    } else {
      const zEAfterLoad = function () {
        tries -=1;

        if (window.zE) {
          zE('webWidget', 'hide');
        } else if(tries > 0) {
          hideWidgetTimeout = setTimeout(zEAfterLoad, 700);
        }
      };

      zEAfterLoad();
    }
    return hideWidgetTimeout;
  },
  moveWidgetOutOfViewport () {
    let tries = 10;
    let triesMobile = 10;

    if (window.zE) {
      zE('webWidget', 'updateSettings', { offset: { horizontal: '2000px' } });
    } else {
      const zEAfterLoad = function () {
        tries -=1;

        if (window.zE) {
          zE('webWidget', 'updateSettings', { offset: { horizontal: '2000px' } });
        } else if(tries > 0) {
          setTimeout(zEAfterLoad, 700);
        }
      };

      zEAfterLoad();
    }

    if(window.$zopim) {
      window.$zopim.livechat.button.setOffsetHorizontalMobile(2000)
    } else {
      const zopimAfterLoad = function () {
        triesMobile -=1;

        if (window.$zopim) {
          window.$zopim.livechat.button.setOffsetHorizontalMobile(2000)
        } else if(triesMobile > 0) {
          setTimeout(zopimAfterLoad, 700);
        }
      };

      zopimAfterLoad();
    }
  },
  openWebWidget () {
    let openWidgetTimeout;
    let tries = 10;


    if (window.zE) {
      zE('webWidget', 'open');
      zE('webWidget', 'show');
      setTimeout(() => {
        zE('webWidget', 'updateSettings', { offset: { horizontal: '0px' } })
      }, 300);
    } else {
      const zEAfterLoad = function () {
        tries -=1;

        if (window.zE) {
          zE('webWidget', 'open');
          zE('webWidget', 'show');
          setTimeout(() => {
            zE('webWidget', 'updateSettings', { offset: { horizontal: '0px' } })
          }, 300);
        } else if(tries > 0) {
          openWidgetTimeout = setTimeout(zEAfterLoad, 700);
        }
      };

      zEAfterLoad();
    }
    return openWidgetTimeout;
  },
  showWebWidget () {
    let showWidgetTimeout;
    let tries = 10;

    if (window.zE) {
      zE('webWidget', 'show');
    } else {
      const zEAfterLoad = function () {
        tries -=1;
        if (window.zE) {
          zE('webWidget', 'show');
        } else if(tries > 0) {
          showWidgetTimeout = setTimeout(zEAfterLoad, 100);
        }
      };

      zEAfterLoad();
    }
    return showWidgetTimeout;
  },
  positionWebWidget (position) {
    zdUtils.updateWidgetSettings('position', position);
  },
  updateWidgetSettings (key, payload) {
    let updateWidgetTimeout;
    if (window.zE) {
      updateSettings(key, payload);
    } else {
      const zEAfterLoad = function () {
        if (window.zE) {
          updateSettings(key, payload);
        } else {
          updateWidgetTimeout = setTimeout(zEAfterLoad, 100);
        }
      };

      zEAfterLoad();
    }
    return updateWidgetTimeout;
  },
  fillTicketMetaData (planName, expInfo) {
    // This id defined in zendesk settings for the custom plan field
    const PLAN_FIELD_ID = 360036628491;
    // var TICKET_FORM_ID1 = 360001176131;
    // var TICKET_FORM_ID2 = 360000913071;

    const SLOT_FIELD_ID = 11471205164697;
    const EXP_FIELD_ID = 11471209184281;

    const payload = { fields: [] };

    if (planName) {
      payload.fields.push({ id: PLAN_FIELD_ID, prefill: { '*': planName } });
    }

    if (expInfo?.slot) {
      payload.fields.push({ id: SLOT_FIELD_ID, prefill: { '*': expInfo.slot } });
    }

    if (expInfo?.experiment) {
      payload.fields.push({ id: EXP_FIELD_ID, prefill: { '*': expInfo.experiment } });
    }

    zdUtils.updateWidgetSettings('contactForm', payload);
  },
  setZendeskLocale() {
    let updateZendeskLocaleTimeout;
    const zEAfterLoad = function () {
      const currentLanguage = Translator.getCurrentLanguage();
      if (window.zE && currentLanguage) {
        zE('webWidget', 'setLocale', currentLanguage);
        clearTimeout(updateZendeskLocaleTimeout);
      } else {
        updateZendeskLocaleTimeout = setTimeout(zEAfterLoad, 1000);
      }
    };
    zEAfterLoad();
  }

  // registerCallbackOnWidgetEvent: function() {

  // }
};


// Helper functions
function updateSettings (key, payload) {
  const updateObj = {
    webWidget: {},
  };

  updateObj.webWidget[key] = payload;

  zE('webWidget', 'updateSettings', updateObj);
}

export default zdUtils;
