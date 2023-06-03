import Constants from '~/config/Constants';
import NodeEnvs from '~/config/NodeEnvs';
import { isServer } from '~/utils/EnvUtils';

const URLS = {
  API_SERVER: {
    [NodeEnvs.LOCAL]: 'http://localhost:3000',
    // TODO #migration move envs
    [NodeEnvs.DEV]: `${isServer() && import.meta.env.VITE_DEV_INTERNAL_SERVER_BASE_URL ? import.meta.env.VITE_DEV_INTERNAL_SERVER_BASE_URL : 'https://dev.quizizz.com'}/_api/${import.meta.env.VITE_ENV_API_EXP || 'main'}`,
    [NodeEnvs.PROD]: `${isServer() && import.meta.env.VITE_PROD_INTERNAL_SERVER_BASE_URL ? import.meta.env.VITE_PROD_INTERNAL_SERVER_BASE_URL : 'https://quizizz.com'}/_api/${import.meta.env.VITE_ENV_API_EXP || 'main'}`,
  },
  MEDIA_SERVICE: {
    [Constants.MediaEnvs.LOCAL]: 'https://dev-services.quizizz.com/_mdserver/mdserver',
    [Constants.MediaEnvs.DEV]: 'https://dev-services.quizizz.com/_mdserver/mdserver',
    [Constants.MediaEnvs.PROD]: 'https://media.quizizz.com/_mdserver/main',
  },
  SPECIAL_HOSTNAME: {
    [Constants.MediaEnvs.LOCAL]: ['dev-services.quizizz.com', 'amazonaws.com', 'googleapis.com'],
    [Constants.MediaEnvs.DEV]: ['dev-services.quizizz.com', 'amazonaws.com', 'googleapis.com'],
    [Constants.MediaEnvs.PROD]: ['media.quizizz.com', 'amazonaws.com', 'googleapis.com'],
  },
};

export default URLS;
