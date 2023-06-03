import NodeEnvs from '~/config/NodeEnvs';

export const isProd = () => import.meta.env.VITE_NODE_ENV === NodeEnvs.PROD;

export const isNonProd = () => import.meta.env.VITE_NODE_ENV !== NodeEnvs.PROD;

export const getEnvironmentEnv = () => {
  if (import.meta.env.VITE_NODE_ENV === 'local') {
    return NodeEnvs.LOCAL;
  }

  if (import.meta.env.VITE_NODE_ENV === 'dev') {
    return NodeEnvs.DEV;
  }

  return NodeEnvs.PROD;
};

export const isClient = () => import.meta.env.VITE_CLIENT === 'true';

export const isServer = () => import.meta.env.VITE_SERVER === 'true';

export const isSentryEnabled = () => import.meta.env.VITE_ENABLE_SENTRY === 'true';

export const isCustomLoggingEnabled = () => import.meta.env.VITE_ENABLE_CUSTOM_LOGGING === 'true';

export const isPseudolocalizationEnabled = () => import.meta.env.VITE_ENFORCE_PSEUDOLOCALIZE === 'true';
