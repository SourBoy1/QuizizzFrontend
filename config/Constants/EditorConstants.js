export const QuestionTypes = {
  MCQ: 'MCQ',
  MSQ: 'MSQ',
  BLANK: 'BLANK',
  OPEN: 'OPEN',
  POLL: 'POLL',
  DRAW: 'DRAW',
  AUDIO: 'AUDIO',
  VIDEO: 'VIDEO',
  REORDER: 'REORDER',
  MATCH: 'MATCH',
  DRAGNDROP: 'DRAGNDROP',
  DROPDOWN: 'DROPDOWN',
  EQUATION: 'EQUATION',
  DND_IMAGE: 'DND_IMAGE',
  HOTSPOT: 'HOTSPOT',
  GRAPHING: 'GRAPHING',
  WORDCLOUD: 'WORDCLOUD',
  CLASSIFICATION: 'CLASSIFICATION',
};

export const AudioVideoResponseTypes = {
  AUDIO: QuestionTypes.AUDIO,
  VIDEO: QuestionTypes.VIDEO,
};

export const PointsForQuestionTypes = {
  [QuestionTypes.MCQ]: 1,
  [QuestionTypes.MSQ]: 1,
  [QuestionTypes.BLANK]: 1,
  [QuestionTypes.OPEN]: 1,
  [QuestionTypes.POLL]: 0,
  [QuestionTypes.DRAW]: 1,
  [QuestionTypes.AUDIO]: 1,
  [QuestionTypes.VIDEO]: 1,
  [QuestionTypes.REORDER]: 1,
  [QuestionTypes.MATCH]: 1,
  [QuestionTypes.DRAGNDROP]: 1,
  [QuestionTypes.DROPDOWN]: 1,
  [QuestionTypes.EQUATION]: 1,
  [QuestionTypes.DND_IMAGE]: 1,
  [QuestionTypes.HOTSPOT]: 1,
  [QuestionTypes.GRAPHING]: 1,
  [QuestionTypes.WORDCLOUD]: 0,
  [QuestionTypes.CLASSIFICATION]: 1,
};

export const QuestionDefaultTimes = {
  [QuestionTypes.MCQ]: 30 * 1000,
  [QuestionTypes.MSQ]: 45 * 1000,
  [QuestionTypes.POLL]: 30 * 1000,
  [QuestionTypes.BLANK]: 60 * 1000,
  [QuestionTypes.OPEN]: 3 * 60 * 1000,
  [QuestionTypes.DRAW]: 3 * 60 * 1000,
  [QuestionTypes.AUDIO]: 10 * 60 * 1000,
  [QuestionTypes.VIDEO]: 10 * 60 * 1000,
  [QuestionTypes.REORDER]: 90 * 1000,
  [QuestionTypes.MATCH]: 90 * 1000,
  [QuestionTypes.DRAGNDROP]: 90 * 1000,
  [QuestionTypes.DROPDOWN]: 90 * 1000,
  [QuestionTypes.DND_IMAGE]: 90 * 1000,
  [QuestionTypes.HOTSPOT]: 90 * 1000,
  [QuestionTypes.EQUATION]: 120 * 1000,
  [QuestionTypes.GRAPHING]: 3 * 60 * 1000,
  [QuestionTypes.WORDCLOUD]: 3 * 60 * 1000,
};

// indicates which question types can be converted to which other question types, safely
// decisive factor to whether to show conversion warning
export const StableConversionQuestionTypes = {
  [QuestionTypes.DROPDOWN]: [QuestionTypes.DRAGNDROP],
  [QuestionTypes.DRAGNDROP]: [QuestionTypes.DROPDOWN],
  [QuestionTypes.EQUATION]: [QuestionTypes.EQUATION],
  [QuestionTypes.HOTSPOT]: [QuestionTypes.HOTSPOT],
  [QuestionTypes.DND_IMAGE]: [QuestionTypes.DND_IMAGE],
  [QuestionTypes.GRAPHING]: [QuestionTypes.GRAPHING],
};

export const QuestionOptionLimits = {
  [QuestionTypes.MCQ]: {
    min: 2,
    max: 5,
  },
  [QuestionTypes.MSQ]: {
    min: 2,
    max: 5,
  },
  [QuestionTypes.POLL]: {
    min: 2,
    max: 5,
  },
  [QuestionTypes.MATCH]: {
    min: 3,
    max: 5,
  },
  [QuestionTypes.REORDER]: {
    min: 3,
    max: 5,
  },
  [QuestionTypes.DRAGNDROP]: {
    min: 2,
    max: 10,
    minBlanks: 1,
    maxBlanks: 5,
  },
  [QuestionTypes.DROPDOWN]: {
    min: 2,
    max: 10,
    minBlanks: 1,
    maxBlanks: 5,
  },
  [QuestionTypes.DND_IMAGE]: {
    min: 2,
    max: 10,
  },
  [QuestionTypes.HOTSPOT]: {
    min: 2,
    max: 10,
  },
  [QuestionTypes.CLASSIFICATION]: {
    min: 2,
    max: 20,
    minOptionGroups: 2,
    maxOptionGroups: 4,
  },
};

export const DisplayVariantNames = {
  [QuestionTypes.WORDCLOUD]: 'word_cloud',
  [QuestionTypes.BLANK]: {
    SINGLE_BLANK: 'single_blank',
    BOX: 'box',
  },
};

export const EditorQueryParameters = {
  OPEN_QUESTION_EDITOR: 'mbQIdEdit',
  OPEN_NEW_QUESTION_TYPE: 'mbQType',
};
