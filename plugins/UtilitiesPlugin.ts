import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import duration from 'dayjs/plugin/duration';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import localizedFormat from 'dayjs/plugin/localizedFormat';

import StringUtils from '../utils/StringUtils';
import DateUtils from '../utils/DateUtils';
import UrlUtils from '../utils/UrlUtils';
import { getLayoutForScreenSize } from '../utils/Utilities';
import ClipboardService from '../services/ClipboardService';
import FileUploadService from '../services/FileUploadService';
import ToastService from '../services/ToastService';
import SnackbarService from '../services/SnackbarService';
import WebEvents from '../config/WebEvents';
import QLogger from '../services/QLogger';
import EventLoggerService from '../services/EventLoggerService';
import MSTeams from '../services/MSTeams';
import timerWorker from '../webworkers/timerWorker';
import sessionWorker from '../webworkers/sessionWorker';
import i18n from '../services/i18n';
import Constants from '../config/Constants';
import $featureFlags from '../services/FeatureFlagsService';

// adding extensions to dayjs
dayjs.extend(utc);
dayjs.extend(duration);
dayjs.extend(advancedFormat);
dayjs.extend(localizedFormat);

const UtilitiesPlugin = {
  install: (app: any) => {
    app.config.globalProperties.$stringUtils = StringUtils;
    app.config.globalProperties.$dateUtils = DateUtils;
    app.config.globalProperties.$urlUtils = UrlUtils;
    app.config.globalProperties.$getLayout = getLayoutForScreenSize;
    app.config.globalProperties.$clipboard = ClipboardService;
    app.config.globalProperties.$fileUpload = FileUploadService;
    app.config.globalProperties.$toasts = ToastService;
    app.config.globalProperties.$snackbars = SnackbarService;
    app.config.globalProperties.$webEvents = WebEvents;
    app.config.globalProperties.$qLogger = QLogger;
    app.config.globalProperties.$analytics = EventLoggerService;
    app.config.globalProperties.$dayjs = dayjs;
    app.config.globalProperties.$msTeams = MSTeams;
    app.config.globalProperties.$timerWorker = timerWorker;
    app.config.globalProperties.$sessionWorker = sessionWorker;
    app.config.globalProperties.$i18n = i18n;
    app.config.globalProperties.$constants = Constants;
    app.config.globalProperties.$featureFlags = $featureFlags();
  },
};

export default UtilitiesPlugin;
