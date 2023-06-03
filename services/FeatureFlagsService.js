import { nextTick } from 'vue';
import isEmpty from 'lodash/isEmpty';
import { isClient } from '~/utils/EnvUtils';
import $axios from './AxiosService';
import $store from './StoreService';
import QLogger from './QLogger';

export class FeatureFlagsService {
  constructor(env) {
    this.env = env;
    this.featuresEndpoint = '/features';
    this.features = {};
    this.userAttributes = {};
    this.forcedFeatures = {};
  }

  getState() {
    return $store().state;
  }

  updateFeatureElement() {
    let featureElement = document.getElementById('feature-flags');
    if (!featureElement) {
      featureElement = document.createElement('div');
      featureElement.id = 'feature-flags';
      featureElement.classList.add('is-admin-v3');
      featureElement.style.display = 'none';
      document.body.appendChild(featureElement);
    }
    featureElement.innerText = JSON.stringify(this.getFeatureValues());
    featureElement.onclick = () => {
      const featureValues = JSON.parse(featureElement.innerText || '{}');
      Object.keys(featureValues).forEach((feature) => {
        this.setForcedFeature(feature, featureValues[feature]);
      });
    };
  }

  setFeatures(features) {
    this.features = features || {};
    nextTick(() => {
      $store().dispatch('root/setFeature', features);
    });
    if (isClient()) {
      this.updateFeatureElement();
    }
  }

  async updateFeatureFlags() {
    const axios = $axios();

    // If features are already set, lazy-load updated feature flags, set features and return
    if (Object.keys(this.getFeatures() || {}).length > 0) {
      axios
        && axios.get(this.featuresEndpoint).then((response) => {
          this.setFeatures(response?.data?.data?.features || {});
        });
      return;
    }

    if (isClient()) {
      // Get feature flags from serverData if available and set features
      if (Object.keys(window.serverData?.featureFlags?.features || {}).length > 0) {
        this.setFeatures(window.serverData?.featureFlags?.features || {});
        return;
      }
    }

    // For local, get feature flags from API and set features
    if (axios) {
      try {
        const response = await axios.get(this.featuresEndpoint);
        this.setFeatures(response?.data?.data?.features || {});
      } catch (error) {
        QLogger.log('fetching featureflags errored out', error);
      }
    }
  }

  setUserAttributes(userAttributes) {
    this.userAttributes = userAttributes || {};
  }

  getUserAttributes() {
    return this.userAttributes;
  }

  /**
   * @deprecated Will be deleted. Use isEnabled instead.
   */
  isOn(feature) {
    return this.isEnabled(feature);
  }

  /**
   * @deprecated Will be deleted. Use isDisabled instead.
   */
  isOff(feature) {
    return this.isDisabled(feature);
  }

  isEnabled(feature) {
    return (
      this.getFeatureValue(feature) === 'ENABLED'
      || this.getFeatureValue(feature) === true
    );
  }

  isDisabled(feature) {
    return (
      this.getFeatureValue(feature) === 'DISABLED'
      || !this.getFeatureValue(feature)
    );
  }

  isNotEligible(feature) {
    return !this.isEnabled(feature) && !this.isDisabled(feature);
  }

  getFeatureValue(feature, defaultValue) {
    const forcedFeatureValue = this.forcedFeatures[feature];
    if (forcedFeatureValue !== undefined && forcedFeatureValue !== null) {
      return forcedFeatureValue;
    }

    const featureValue = this.getFeatures()[feature]?.defaultValue;
    if (featureValue !== undefined && featureValue !== null) {
      return featureValue;
    }
    return defaultValue;
  }

  getFeatures() {
    /*
    * enabled getting features from state which is being set in updateFeatureFlags function.
    * It is needed because in case off ssr api call is being made to get features on server,
    * but it is not sent to client side because it is not part of state.
    */
    const state = this.getState();
    return !isEmpty(state.root.features) ? state.root.features : this.features;
  }

  getFeatureValues() {
    const featureValues = {};
    Object.keys(this.getFeatures()).forEach((feature) => {
      featureValues[feature] = this.getFeatureValue(feature);
    });
    return featureValues;
  }

  setForcedFeature(key, value) {
    this.forcedFeatures[key] = value;
  }
}

let featureFlags = null;

export default function $featureFlags() {
  if (!featureFlags) {
    featureFlags = new FeatureFlagsService(import.meta.env.VITE_NODE_ENV);
  }
  return featureFlags;
}
