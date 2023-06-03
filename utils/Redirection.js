import Analytics from '~/services/EventLoggerService';
import WebEvents from '~/config/WebEvents';
import CookieService from '~/services/CookieService';
import $store from '~/services/StoreService';
import UserService from '~/services/UserService';
import { isClient } from './EnvUtils';

export const GetPlansLink = (feat, variant) => {
  let linkToOpen = '/home/plans?source_cat=product';
  if (feat) {
    const cleanFeat = feat.replace('_', '-');
    linkToOpen += `&feat=${cleanFeat}`;
  }
  if (variant) {
    const cleanVariant = variant.replace('_', '-');
    linkToOpen += `&variant=${cleanVariant}`;
  }
  if ($store()) {
    const user = new UserService($store().getters['root/user'] ?? {});
    if (user && user.id) {
      linkToOpen += `&user_id=${user.id}`;
    }
  }
  return linkToOpen;
};

export const OpenSnDPlansPage = (feat, variant) => {
  if (isClient() && window) {
    const linkToOpen = GetPlansLink(feat, variant);
    window.open(linkToOpen, '_blank');
  }
};

export const GetSnDLink = (feat, variant) => {
  let linkToOpen = '/home/schools-and-districts?source_cat=product';
  if (feat) {
    const cleanFeat = feat.replace('_', '-');
    linkToOpen += `&feat=${cleanFeat}`;
  }
  if (variant) {
    const cleanVariant = variant.replace('_', '-');
    linkToOpen += `&variant=${cleanVariant}`;
  }
  if ($store()) {
    const user = new UserService($store().getters['root/user'] ?? {});
    if (user && user.id) {
      linkToOpen += `&user_id=${user.id}`;
    }
  }
  return linkToOpen;
};

export const OpenSnDPage = (feat, variant) => {
  if (isClient() && window) {
    const linkToOpen = GetSnDLink(feat, variant);
    window.open(linkToOpen, '_blank');
  }
};

export const GetTypeFormSource = ({
  source, feat, variant, prefix = '', suffix = '',
}) => {
  let val = '';
  const cleanedValues = [];

  /**
   * sequence of these values insertion matters
   * clean source, feat, variance in order
  */
  if (source) {
    const cleanSource = source.replace('_', '-');
    cleanedValues.push(cleanSource);
  }
  if (feat) {
    const cleanFeat = feat.replace('_', '-');
    cleanedValues.push(cleanFeat);
  }
  if (variant) {
    const cleanVariant = variant.replace('_', '-');
    cleanedValues.push(cleanVariant);
  }

  val = cleanedValues.join('_');

  // if prefix is present
  if (prefix && val) {
    const cleanPrefix = prefix.replace('_', '-');
    val = `${cleanPrefix}:${val}`;
  }

  // if suffix is present
  if (suffix && val) {
    const cleanSuffix = suffix.replace('_', '-');
    val = `${val}:${cleanSuffix}`;
  }

  return val;
};

export const OpenTypeForm = ({
  source, feat, variant, prefix, suffix,
}) => {
  if (isClient() && window) {
    const typeFormSource = GetTypeFormSource({
      source, feat, variant, prefix, suffix,
    });

    Analytics.logEvent(WebEvents.QUOTE_FROM_LOAD, { source: typeFormSource });

    const typeFormEndpoint = 'https://quizizz.typeform.com/to/vZxFA4SC';

    const typeFormURL = new URL(typeFormEndpoint);
    typeFormURL.searchParams.set('session_id', CookieService.get('quizizz_uid'));
    typeFormURL.searchParams.set('locale', CookieService.get('locale'));
    typeFormURL.searchParams.set('source', typeFormSource);
    typeFormURL.searchParams.set('source_cat', 'product');
    if ($store()) {
      const user = new UserService($store().getters['root/user'] ?? {});
      if (user && user.id) {
        typeFormURL.searchParams.set('user_id', user.id);
      }
    }

    window.open(typeFormURL, '_blank');
  }
};
