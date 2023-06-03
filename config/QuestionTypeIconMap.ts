import Constants from '~/config/Constants';

const QuestionTypeIconMap = {
  [Constants.QuestionTypes.MCQ]: {
    icon: 'far fa-check-square',
    brandColor: 'b',
  },

  [Constants.QuestionTypes.MSQ]: {
    icon: 'far fa-check-square',
    brandColor: 'b',
  },

  [Constants.QuestionTypes.POLL]: {
    icon: 'far fa-poll',
    brandColor: 'a',
  },

  [Constants.QuestionTypes.BLANK]: {
    icon: 'far fa-rectangle-wide',
    brandColor: 'b',
  },

  [Constants.QuestionTypes.OPEN]: {
    icon: 'far fa-align-left',
    brandColor: 'e',
  },

  [Constants.QuestionTypes.DRAW]: {
    icon: 'far fa-pen-swirl',
    brandColor: 'e',
  },

  [Constants.SlideTypes.CONTENT_SLIDE_V1]: {
    icon: 'far fa-presentation',
    brandColor: 'f',
  },

  [Constants.SlideTypes.CONTENT_SLIDE_V2]: {
    icon: 'far fa-presentation',
    brandColor: 'f',
  },

  [Constants.QuestionTypes.AUDIO]: {
    icon: 'fas fa-microphone-alt',
    brandColor: 'e',
  },

  [Constants.QuestionTypes.VIDEO]: {
    icon: 'fas fa-video',
    brandColor: 'e',
  },

  [Constants.QuestionTypes.REORDER]: {
    icon: 'fas fa-signal-alt',
    brandColor: 'b',
  },

  [Constants.QuestionTypes.MATCH]: {
    icon: 'far fa-layer-plus',
    brandColor: 'b',
  },

  [Constants.QuestionTypes.DROPDOWN]: {
    icon: 'fal fa-caret-square-down',
    brandColor: 'b',
  },

  [Constants.QuestionTypes.DRAGNDROP]: {
    icon: 'fal fa-hand-paper',
    brandColor: 'b',
  },

  [Constants.QuestionTypes.EQUATION]: {
    icon: 'fal fa-function',
    brandColor: 'b',
  },

  [Constants.QuestionTypes.DND_IMAGE]: {
    icon: 'fal fa-message-image',
    brandColor: 'b',
  },

  [Constants.QuestionTypes.HOTSPOT]: {
    icon: 'fal fa-bullseye-pointer',
    brandColor: 'b',
  },

  [Constants.QuestionTypes.GRAPHING]: {
    icon: 'far fa-chart-line',
    brandColor: 'b',
  },

  [Constants.QuestionTypes.WORDCLOUD]: {
    icon: 'far fa-cloud-word',
    brandColor: 'a',
  },

  [Constants.QuestionTypes.CLASSIFICATION]: {
    icon: 'fal fa-columns-3',
    brandColor: 'b',
  },
};

// eslint-disable-next-line import/prefer-default-export
export { QuestionTypeIconMap };
