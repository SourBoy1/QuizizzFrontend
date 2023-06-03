import ObjectId from 'bson-objectid';
import isEmpty from 'lodash/isEmpty';
import slice from 'lodash/slice';
import find from 'lodash/find';
import isEqual from 'lodash/isEqual';
import cloneDeep from 'lodash/cloneDeep';
import compact from 'lodash/compact';
import forEach from 'lodash/forEach';
import keys from 'lodash/keys';
import isNil from 'lodash/isNil';
import set from 'lodash/set';
import uniq from 'lodash/uniq';

import { isSlideForQuestion } from '~/utils/SlideUtils';

import Question from '~/models/Question';
import MutationTypes from '~/config/MutationTypes';
import Constants from '~/config/Constants';

import { rgbStringToHex, isColorDark } from '~/services/ColorService';
import {
  WAITING_FOR_SOLUTION_SELECTION,
  SOLUTION_SELECTED,
} from '~/mixins/questionEditorGraphMixin';

import themes from '~/config/ThemesForSlidesWithShapes';
import QuestionQuery from '~/models/QuestionQuery';
import { stateResetter } from '../utils/StoreUtils';
import { isSlideForContent, doesQuestionHaveAnswerExplanations } from '../utils/QuizUtils';

function getInitialState() {
  const defaultTheme = themes.basicThemes[0];
  const initialTheme = {
    id: defaultTheme.id,
    titleFontFamily: defaultTheme.titleFontFamily,
    fontFamily: defaultTheme.fontFamily,
    fontColor: {
      text: defaultTheme.textColor,
    },
    background: {
      color: defaultTheme.bgColor,
      image: '',
      video: '',
    },
    shape: {
      largeShapeColor: defaultTheme.largeShapeColor,
      smallShapeColor: defaultTheme.smallShapeColor,
    },
  };
  return {
    /**
     * The `question` will always be a reference of the question object inside
     * `rootState.contentEditor.quiz.draft.questionDrafts`
     *   or
     * `rootState.contentEditor.quiz.draft.questions`
     * Always make sure while updating this reference is maintained.
     */
    question: Question({}, false),

    /**
     * We keep this copy to make sure when we go to save the question(for quiz questions)
     * we can check if the user actually made any changes
     */
    initialQuestionCopy: {},

    selectedElementId: '',
    selectedElementIds: [],
    boxSelectingInProgress: false,
    multiSelect: false,
    currentTheme: initialTheme,
    shouldShowElementFocus: false,
    customColors: [],
    tiptapFocusHistory: [],
    sourcePage: 'quizEditor',
    graph: {
      hoverGraphType: Constants.PlotType.None,
      answerPlotType: 0,
      graphEditorState: 0,
      graphComponentReady: false,
      editGraphModalOpen: false,
      nonInteractivePlots: [],
      answerPlot: {},
    },
    analytics: {
      parameterVersion: 1,
      optionGeneratorTokens: [],
      optionGeneratorTokensLogProbs: [],
    },

    preview: {
      questionToConvertTo: Question({}, false),
      showPreview: false,
      graph: {
        answerPlotTypeBeforePreview: 0,
        answerPlotBeforePreview: {},
        graphEditorStateBeforePreview: 0,
        answerPlotType: 0,
        graphEditorState: 0,
        nonInteractivePlots: [],
        answerPlot: {},
      },
    },
    usedQuestionTemplate: {
      isUsed: false,
      segmentName: null,
      description: null,
      questionType: null,
    },
  };
}

export const state = getInitialState;

export const getters = {
  currentSlideId(state) {
    if (state.preview.showPreview) {
      return state.preview.questionToConvertTo._id || '';
    }
    return state.question._id || '';
  },

  currentSlide(state) {
    if (state.preview.showPreview) {
      return state.preview.questionToConvertTo;
    }
    return state.question;
  },

  isASlideBeingEdited(state, getters) {
    return !isEmpty(getters.currentSlideId);
  },

  elements(state) {
    return state.question.structure.elements;
  },

  selectedElementId(state) {
    return state.selectedElementId;
  },

  selectedElementIds(state) {
    return state.selectedElementIds;
  },

  isMultiSelect(state) {
    return state.multiSelect;
  },

  selectedElement(state) {
    if (!Array.isArray(state.question.structure.elements)) {
      return null;
    }
    return state.question.structure.elements.find((item) => item && item._id === state.selectedElementId);
  },

  selectedElements(state) {
    if (state.question.structure.elements) {
      return state.question.structure.elements.filter((item) => state.selectedElementIds.includes(item && item._id));
    }
    return [];
  },

  getElementById: (state) => (id) => state.question.structure.elements.find((item) => item && item._id === id),

  mostRecentlyCreatedElement(state) {
    const { elements } = state.question.structure;
    return elements[elements.length - 1];
  },

  theme(state) {
    return state.question.structure.theme;
  },

  currentTheme(state) {
    return state.currentTheme;
  },

  getCustomColors(state) {
    return state.customColors;
  },

  questionTopics(state) {
    return state.question.topics;
  },

  questionCorrectMarks(state) {
    return state.question.structure.marks?.correct || 5;
  },

  questionIncorrectMarks(state) {
    return state.question.structure.marks?.incorrect || 0;
  },

  isWebpageSlide(state) {
    return state.question && state.question.structure.elements.length > 0 && state.question.structure.elements[0] && state.question.structure.elements[0].type === 'WEBPAGE';
  },

  isTipTapEditorInFocus(state) {
    return !!state.tiptapFocusHistory[0] && !!state.tiptapFocusHistory[0].id;
  },

  currentlyFocusedTiptapEditor(state) {
    return state.tiptapFocusHistory[0] || {};
  },

  lastFocusedTiptapEditor(state) {
    const historyToCheck = slice(state.tiptapFocusHistory, 1);

    const lastElementInFocus = find(historyToCheck, (ele) => !isEmpty(ele));

    return lastElementInFocus || {};
  },

  isFocusedTiptapEditorForContent: () => (focusedTiptap = {}) => {
    if (isEmpty(focusedTiptap.slideType)) {
      return false;
    }

    return isSlideForContent({ type: focusedTiptap.slideType });
  },

  isFocusedTiptapEditorForQuestion: () => (focusedTiptap = {}) => {
    if (isEmpty(focusedTiptap.slideType)) {
      return false;
    }

    return isSlideForQuestion({ type: focusedTiptap.slideType });
  },

  isCurrentSlideForQuestion(state, getters) {
    return isSlideForQuestion(getters.currentSlide);
  },

  isCurrentSlideForContent(state, getters) {
    return isSlideForContent(getters.currentSlide);
  },

  doesSlideHaveAnswerExplanations(state, getters) {
    if (isEmpty(getters.currentSlide)) {
      return false;
    }

    return doesQuestionHaveAnswerExplanations(getters.currentSlide);
  },

  isBoxSelectingInProgress(state) {
    return state.boxSelectingInProgress;
  },

  isLightSlide(state) {
    return !isColorDark(rgbStringToHex(state.currentTheme.background.color));
  },

  checkIfUserEditedSlide: (state, getters) => () =>
    /**
     * This getter has been made deliberately into an method getter because we do not want this
     * computation to happen on each edit of the question and only happen on demand
     */
    !isEqual(state.initialQuestionCopy, getters.currentSlide),

  initialQuestionCopy(state, getters) {
    return state.initialQuestionCopy;
  },

  shouldShowElementFocus(state) {
    return state.shouldShowElementFocus;
  },

  questionQuery(state) {
    return state.question.structure.query;
  },

  questionQueryMedia(state) {
    return state.question.structure.query.media;
  },

  sourcePage(state) {
    return state.sourcePage;
  },

  getHoverGraphType(state) {
    return state.graph.hoverGraphType;
  },

  getAnswerPlotType(state) {
    if (state.preview.showPreview) {
      return state.preview.graph.answerPlotType;
    }
    return state.graph.answerPlotType;
  },

  getGraphEditorState(state) {
    if (state.preview.showPreview) {
      return state.preview.graph.graphEditorState;
    }
    return state.graph.graphEditorState;
  },

  getGraphComponentReady(state) {
    return state.graph.graphComponentReady;
  },

  getEditGraphModalOpen(state) {
    return state.graph.editGraphModalOpen;
  },

  getNonInteractivePlots(state) {
    if (state.preview.showPreview) {
      return state.preview.graph.nonInteractivePlots;
    }
    return state.graph.nonInteractivePlots;
  },

  getAnswerPlot(state) {
    if (state.preview.showPreview) {
      return state.preview.graph.answerPlot;
    }
    return state.graph.answerPlot;
  },

  getGraphScale(state) {
    return state.question.structure?.settings?.graphData?.sizer || 1;
  },

  getAnalyticsParameterVersion(state) {
    return state.analytics.parameterVersion;
  },

  getAnalyticsOptionGeneratorTokens(state) {
    return state.analytics.optionGeneratorTokens;
  },

  getAnalyticsOptionGeneratorTokensLogProbs(state) {
    return state.analytics.optionGeneratorTokensLogProbs;
  },

  getIsPreviewActive(state) {
    return state.preview.showPreview;
  },

  usedQuestionTemplate(state) {
    return state.usedQuestionTemplate;
  },
};

export const mutations = {
  [MutationTypes.slideEditor.ADD_ELEMENT](state, props) {
    props._id = ObjectId().toHexString();
    props.zIndex = state.question.structure.elements.length;
    state.question.structure.elements.push(props);
  },

  [MutationTypes.slideEditor.ADD_ELEMENT_COPY](state, props) {
    state.question.structure.elements.push(props);
  },

  [MutationTypes.slideEditor.DELETE_ELEMENT](state, id) {
    const index = state.question.structure.elements.findIndex((item) => item && item._id === id);
    state.question.structure.elements.splice(index, 1);
    if (state.selectedElementId === id) {
      state.selectedElementId = '';
    }
    for (let i = 0; i < state.question.structure.elements.length; i++) {
      state.question.structure.elements[i].zIndex = i;
    }
  },

  [MutationTypes.slideEditor.SET_SLIDE](state, payload) {
    const { slide } = payload;

    state.currentTheme = { ...slide.structure.theme };
    state.question = slide;
    state.initialQuestionCopy = cloneDeep(slide);
  },

  [MutationTypes.slideEditor.SET_SELECTED_ELEMENT](state, id) {
    state.selectedElementId = id;
    state.selectedElementIds = [];
    state.multiSelect = false;
  },

  [MutationTypes.slideEditor.ADD_SELECTED_ELEMENT](state, id) {
    if (state.selectedElementId) {
      if (state.selectedElementIds.length === 0) {
        state.selectedElementIds.push(state.selectedElementId);
      }
      state.selectedElementIds.push(id);
      state.multiSelect = true;
    } else {
      state.selectedElementId = id;
      state.multiSelect = false;
    }
  },

  [MutationTypes.slideEditor.REMOVE_SELECTED_ELEMENT](state, id) {
    if (state.selectedElementIds.length > 0) {
      const idx = state.selectedElementIds.indexOf(id);
      state.selectedElementIds.splice(idx, 1);

      if (state.selectedElementIds.length === 1) {
        state.multiSelect = false;
        state.selectedElementId = state.selectedElementIds[0];
        state.selectedElementIds = [];
      }
    } else {
      state.selectedElementId = '';
    }
  },

  [MutationTypes.slideEditor.CLEAR_SELECTED_ELEMENTS](state) {
    state.selectedElementIds = [];
    state.selectedElementId = '';
    state.multiSelect = false;
  },

  [MutationTypes.slideEditor.MULTISELECT_MOVE](state, delta) {
    for (const element of state.question.structure.elements) {
      if (element && state.selectedElementIds.includes(element._id)) {
        element.transform.position.x += delta.x;
        element.transform.position.y += delta.y;
      }
    }
  },

  [MutationTypes.slideEditor.CREATE_MULTISELECT](state, ids) {
    state.selectedElementIds = ids;
    state.multiSelect = true;
    state.selectedElementId = '';
  },

  [MutationTypes.slideEditor.SET_BOX_SELECT_IN_PROGRESS](state, value) {
    state.boxSelectingInProgress = value;
  },

  [MutationTypes.slideEditor.UPDATE_ELEMENT](state, elementData) {
    const element = state.question.structure.elements.find(
      (item) => item && item._id === elementData._id,
    );
    if (element) {
      Object.assign(element, elementData);
    }
  },

  [MutationTypes.slideEditor.SET_ELEMENTS](state, elements) {
    state.question.structure.elements = [...elements];
  },

  [MutationTypes.slideEditor.CORRECT_INDICES](state) {
    let elements = [];
    for (let i = 0; i < state.question.structure.elements.length; i++) {
      const el = state.question.structure.elements[i];
      if (el) {
        elements[el.zIndex] = el;
      }
    }
    elements = compact(elements);
    state.question.structure.elements = elements;
  },

  [MutationTypes.slideEditor.BRING_FORWARD](state, _id) {
    if (state.multiSelect) {
      for (const element of state.question.structure.elements) {
        if (element && state.selectedElementIds.includes(element._id)) {
          if (element.zIndex < state.question.structure.elements.length - 1) {
            const nextElement = state.question.structure.elements.find(
              (item) => item && item.zIndex === element.zIndex + 1,
            );

            element.zIndex += 1;
            nextElement.zIndex -= 1;
          }
        }
      }
    } else {
      const element = state.question.structure.elements.find(
        (item) => item && item._id === _id,
      );

      if (element && element.zIndex < state.question.structure.elements.length - 1) {
        const nextElement = state.question.structure.elements.find(
          (item) => item && item.zIndex === element.zIndex + 1,
        );

        element.zIndex += 1;
        nextElement.zIndex -= 1;
      }
    }
  },

  [MutationTypes.slideEditor.SEND_BACKWARD](state, _id) {
    if (state.multiSelect) {
      for (const element of state.question.structure.elements) {
        if (element && state.selectedElementIds.includes(element._id)) {
          if (element.zIndex > 0) {
            const prevElement = state.question.structure.elements.find(
              (item) => item && item.zIndex === element.zIndex - 1,
            );

            element.zIndex -= 1;
            prevElement.zIndex += 1;
          }
        }
      }
    } else {
      const element = state.question.structure.elements.find(
        (item) => item && item._id === _id,
      );

      if (element && element.zIndex > 0) {
        const prevElement = state.question.structure.elements.find(
          (item) => item && item.zIndex === element.zIndex - 1,
        );

        element.zIndex -= 1;
        prevElement.zIndex += 1;
      }
    }
  },

  [MutationTypes.slideEditor.BRING_TO_FRONT](state, _id) {
    if (state.multiSelect) {
      for (const element of state.question.structure.elements) {
        if (element && state.selectedElementIds.includes(element._id)) {
          if (element.zIndex !== state.question.structure.elements.length - 1) {
            const elements = [];
            for (
              let i = element.zIndex + 1;
              i < state.question.structure.elements.length;
              i++
            ) {
              elements.push(
                state.question.structure.elements.find((item) => item && item.zIndex === i),
              );
            }
            elements.forEach((item) => {
              if (item) {
                item.zIndex -= 1;
              }
            });
            element.zIndex = state.question.structure.elements.length - 1;
          }
        }
      }
    } else {
      const element = state.question.structure.elements.find(
        (item) => item && item._id === _id,
      );
      if (element && element.zIndex !== state.question.structure.elements.length - 1) {
        const elements = [];
        for (
          let i = element.zIndex + 1;
          i < state.question.structure.elements.length;
          i++
        ) {
          elements.push(
            state.question.structure.elements.find((item) => item && item.zIndex === i),
          );
        }
        elements.forEach((item) => {
          if (item) {
            item.zIndex -= 1;
          }
        });
        element.zIndex = state.question.structure.elements.length - 1;
      }
    }
  },

  [MutationTypes.slideEditor.SEND_TO_BACK](state, _id) {
    if (state.multiSelect) {
      for (const element of state.question.structure.elements) {
        if (element && state.selectedElementIds.includes(element._id)) {
          if (element.zIndex !== 0) {
            const elements = [];
            for (let i = 0; i < element.zIndex; i++) {
              elements.push(
                state.question.structure.elements.find((item) => item && item.zIndex === i),
              );
            }
            elements.forEach((item) => {
              if (item) {
                item.zIndex += 1;
              }
            });
            element.zIndex = 0;
          }
        }
      }
    } else {
      const element = state.question.structure.elements.find(
        (item) => item && item._id === _id,
      );
      if (element && element.zIndex !== 0) {
        const elements = [];
        for (let i = 0; i < element.zIndex; i++) {
          elements.push(
            state.question.structure.elements.find((item) => item && item.zIndex === i),
          );
        }
        elements.forEach((item) => {
          if (item) {
            item.zIndex += 1;
          }
        });
        element.zIndex = 0;
      }
    }
  },

  [MutationTypes.slideEditor.SET_THEME](state, theme) {
    state.question.structure.theme = theme;
  },

  [MutationTypes.slideEditor.SET_CURRENT_THEME](state, theme) {
    state.currentTheme = theme;
  },
  [MutationTypes.slideEditor.SET_CUSTOM_COLORS](state, customColors) {
    state.customColors = customColors;
  },
  [MutationTypes.slideEditor.ROTATE](state, { _id, degrees }) {
    const element = state.question.structure.elements.find(
      (item) => item && item._id === _id,
    );

    if (!element) {
      return;
    }

    element.transform.rotation += degrees;
    element.transform.rotation = element.transform.rotation % 360;
  },

  [MutationTypes.slideEditor.CENTER](state, { _id, direction }) {
    if (state.multiSelect) {
      for (const element of state.question.structure.elements) {
        if (element && state.selectedElementIds.includes(element._id)) {
          if (direction === 'h') {
            element.transform.position.x = 1280 / 2 - element.transform.size.width / 2;
          } else if (direction === 'v') {
            element.transform.position.y = 720 / 2 - element.transform.size.height / 2;
          } else if (direction === 'hv') {
            element.transform.position.x = 1280 / 2 - element.transform.size.width / 2;
            element.transform.position.y = 720 / 2 - element.transform.size.height / 2;
          }
        }
      }
    } else {
      const element = state.question.structure.elements.find(
        (item) => item && item._id === _id,
      );
      if (!element) {
        return;
      }

      if (direction === 'h') {
        element.transform.position.x = 1280 / 2 - element.transform.size.width / 2;
      } else if (direction === 'v') {
        element.transform.position.y = 720 / 2 - element.transform.size.height / 2;
      } else if (direction === 'hv') {
        element.transform.position.x = 1280 / 2 - element.transform.size.width / 2;
        element.transform.position.y = 720 / 2 - element.transform.size.height / 2;
      }
    }
  },

  [MutationTypes.slideEditor.SET_TIPTAP_EDITOR_IN_FOCUS](state, payload) {
    const tiptapFocusHistory = [payload.editor, ...state.tiptapFocusHistory.slice(0, 3)];
    state.tiptapFocusHistory = tiptapFocusHistory;
  },

  [MutationTypes.slideEditor.UPDATE_QUESTION](state, payload) {
    const allKeys = keys(payload.question);

    forEach(allKeys, (keyName) => {
      state.question[keyName] = payload.question[keyName];
    });
  },

  [MutationTypes.slideEditor.UPDATE_QUESTION_ID](state, payload) {
    state.question._id = payload.id;
  },

  [MutationTypes.slideEditor.UPDATE_QUESTION_QUERY](state, { rawData }) {
    state.question.structure.query = QuestionQuery({
      ...state.question.structure.query,
      ...rawData,
    });
  },

  [MutationTypes.slideEditor.UPDATE_QUESTION_QUERY_TYPE](state, { queryType }) {
    state.question.structure.query.type = queryType;
  },

  [MutationTypes.slideEditor.ADD_QUESTION_QUERY_MEDIA](state, payload) {
    const { type } = payload.media;
    const prevMediaIdx = state.question.structure.query.media.findIndex((item) => item && item.type === type);
    if (prevMediaIdx !== -1) {
      state.question.structure.query.media[prevMediaIdx] = payload.media;
    } else {
      state.question.structure.query.media.push(payload.media);
    }
    state.question.structure.query.media = [...state.question.structure.query.media];
  },

  [MutationTypes.slideEditor.REMOVE_QUESTION_QUERY_IMAGE_MEDIA](state) {
    const index = state.question.structure.query.media.findIndex((item) => item && item.type === 'image');

    state.question.structure.query.media.splice(index, 1);
    state.question.structure.query.media = [...state.question.structure.query.media];
  },

  [MutationTypes.slideEditor.REMOVE_QUESTION_QUERY_AUDIO_MEDIA](state) {
    const index = state.question.structure.query.media.findIndex((item) => item && item.type === 'audio');

    state.question.structure.query.media.splice(index, 1);
    state.question.structure.query.media = [...state.question.structure.query.media];
  },

  [MutationTypes.slideEditor.UPDATE_QUESTION_MATCH_OPTION](
    state,
    { match, index },
  ) {
    state.question.structure.matches[index] = match;
  },

  [MutationTypes.slideEditor.UPDATE_QUESTION_TARGET_BY_ID](
    state,
    { target, id },
  ) {
    const index = state.question.structure.targets.findIndex(
      (item) => item.id === id,
    );
    state.question.structure.targets[index] = target;
  },

  [MutationTypes.slideEditor.UPDATE_QUESTION_OPTION](state, { option, index }) {
    if (state.preview.showPreview) {
      return;
    }
    state.question.structure.options[index] = option;
  },

  [MutationTypes.slideEditor.UPDATE_QUESTION_OPTIONS](state, { options }) {
    if (state.preview.showPreview) {
      return;
    }
    state.question.structure.options = options;
  },

  [MutationTypes.slideEditor.UPDATE_OPTIONS_AND_ANSWER](state, { options, answer }) {
    if (state.preview.showPreview) {
      return;
    }
    state.question.structure.options = options;
    state.question.structure.answer = answer;
  },

  [MutationTypes.slideEditor.UPDATE_QUESTION_ANSWER](state, { answer }) {
    if (state.preview.showPreview) {
      return;
    }
    state.question.structure.answer = answer;
  },

  [MutationTypes.slideEditor.UPDATE_QUESTION_MATCHES](state, { matches }) {
    state.question.structure.matches = matches;
  },

  [MutationTypes.slideEditor.UPDATE_QUESTION_TARGETS](state, { targets }) {
    state.question.structure.targets = targets;
  },

  [MutationTypes.slideEditor.UPDATE_QUESTION_TIME](state, payload) {
    state.question.time = payload.time;
  },

  [MutationTypes.slideEditor.UPDATE_ORDER_OF_OPTIONS](state, payload) {
    state.question.structure.order = payload.order;
  },

  [MutationTypes.slideEditor.UPDATE_QUESTION_TOPICS](state, payload) {
    state.question.topics = payload.topics;
  },

  [MutationTypes.slideEditor.UPDATE_QUESTION_SETTINGS](state, payload) {
    state.question.structure.settings = payload.settings;
  },

  [MutationTypes.slideEditor.UPDATE_QUESTION_CORRECT_MARKS](state, payload) {
    state.question.structure.marks.correct = payload.points;
    state.question.structure.marks.incorrect = 0;
  },

  [MutationTypes.slideEditor.UPDATE_QUESTION_ANSWER_EXPLANATION](state, payload) {
    state.question.structure.explain = payload.explain;
  },

  [MutationTypes.slideEditor.SET_CAN_SUBMIT_CUSTOM_RESPONSE](state, payload) {
    state.question.structure.settings.canSubmitCustomResponse = payload.canSubmitCustomResponse;
  },

  [MutationTypes.slideEditor.SET_FIB_VARIANT](state, payload) {
    state.question.structure.settings.questionDisplayVariant = payload.fibVariant;
    state.initialQuestionCopy.structure.settings.questionDisplayVariant = payload.fibVariant;
  },

  [MutationTypes.slideEditor.SET_ENABLE_ACCENT_MARKS](state, payload) {
    state.question.structure.settings.enableAccentMarks = payload.enableAccentMarks;
  },

  [MutationTypes.slideEditor.SET_IGNORE_ACCENT_MARKS_FOR_EVALUATION](state, payload) {
    state.question.structure.settings.ignoreAccentMarksForEvaluation = payload.ignoreAccentMarksForEvaluation;
  },

  [MutationTypes.slideEditor.SET_QUESTION_HINTS](state, payload) {
    state.question.structure.hints = payload.hints;
  },

  [MutationTypes.slideEditor.SET_ANSWER_LENGTH](state, payload) {
    state.question.structure.settings.questionMetadata.answerLength = payload.answerLength;
  },

  [MutationTypes.slideEditor.SET_SPECIAL_CHAR_INDICES](state, payload) {
    if (isEmpty(state.question.structure.settings.questionMetadata)) {
      state.question.structure.settings.questionMetadata = {};
    }
    state.question.structure.settings.questionMetadata.specialIndices = payload.specialIndices;
  },

  [MutationTypes.slideEditor.SET_HAS_MULTIPLE_CORRECT_SETTING](state, isEnabled = false) {
    state.question.structure.settings.doesOptionHaveMultipleTargets = isEnabled;
  },

  [MutationTypes.slideEditor.RESET_SLIDE_EDITOR](state, payload) {
    const keyNamesToPreserve = payload.keyNamesToPreserve || [];

    stateResetter(state, getInitialState(), keyNamesToPreserve);
  },

  [MutationTypes.slideEditor.SET_SHOULD_SHOW_ELEMENT_FOCUS](state, shouldShowElementFocus) {
    state.shouldShowElementFocus = shouldShowElementFocus;
  },

  [MutationTypes.slideEditor.CLEANUP](state) {
    Object.assign(state, {
      question: Question({}, false),
      initialQuestionCopy: {},
      selectedElementId: '',
      selectedElementIds: [],
      boxSelectingInProgress: false,
      multiSelect: false,
      shouldShowElementFocus: false,
      customColors: [],
      tiptapFocusHistory: [],
    });
  },

  [MutationTypes.slideEditor.SET_SOURCE_PAGE](state, sourcePage) {
    state.sourcePage = sourcePage;
  },

  [MutationTypes.slideEditor.UPDATE_GRAPH_DATA_INTO_QUESTION](state) {
    if (isEmpty(state.graph.answerPlot)) {
      // do nothing
      return;
    }
    const answerPlotType = state.graph.answerPlot.type;
    set(state, 'question.structure.settings.graphData.type', answerPlotType);
    if (Constants.PlotType[answerPlotType] === Constants.PlotType.Points) {
      const maxPoints = state.graph.answerPlot.data.points.length;
      set(state, 'question.structure.settings.graphData.maxPoints', maxPoints);
    }
    const graphs = [...state.graph.nonInteractivePlots];
    graphs.push(state.graph.answerPlot);
    // to drop latex data from the plots
    const cleanGraphs = graphs.map(({ latex, ...keepAttrs }) => keepAttrs);
    state.question.structure.graphs = cleanGraphs;
    const answerPlotId = state.graph.answerPlot.plotId;
    state.question.structure.answer = [answerPlotId];
  },

  [MutationTypes.slideEditor.UPDATE_GRAPH_DATA_FROM_QUESTION](state) {
    const answerPlotId = state.question.structure.answer[0] || '';
    const allGraphs = state.question.structure.graphs || [];
    let answerPlot = null;
    const nonInteractivePlots = [];
    for (let i = 0; i < allGraphs.length; i++) {
      if (allGraphs[i].plotId === answerPlotId) {
        answerPlot = allGraphs[i];
      } else {
        nonInteractivePlots.push(allGraphs[i]);
      }
    }
    state.graph.answerPlot = answerPlot;
    state.graph.nonInteractivePlots = nonInteractivePlots;

    if (isEmpty(answerPlot)) {
      state.graph.answerPlotType = 0;
      state.graph.graphEditorState = WAITING_FOR_SOLUTION_SELECTION;
    } else {
      state.graph.answerPlotType = Constants.PlotType[answerPlot.type] ?? Constants.PlotType.None;
      state.graph.graphEditorState = SOLUTION_SELECTED;
    }
  },

  [MutationTypes.slideEditor.GRAPH.SET_HOVER_GRAPH_TYPE](state, val) {
    state.graph.hoverGraphType = val;
  },

  [MutationTypes.slideEditor.GRAPH.SET_ANSWER_PLOT_TYPE](state, val) {
    state.graph.answerPlotType = val;
  },

  [MutationTypes.slideEditor.GRAPH.SET_GRAPH_EDITOR_STATE](state, val) {
    state.graph.graphEditorState = val;
  },

  [MutationTypes.slideEditor.GRAPH.SET_GRAPH_COMPONENT_READY](state, val) {
    state.graph.graphComponentReady = val;
  },

  [MutationTypes.slideEditor.GRAPH.SET_EDIT_GRAPH_MODAL_OPEN](state, val) {
    state.graph.editGraphModalOpen = val;
  },

  [MutationTypes.slideEditor.GRAPH.SET_NON_INTERACTIVE_PLOTS](state, val) {
    state.graph.nonInteractivePlots = val;
  },

  [MutationTypes.slideEditor.GRAPH.SET_ANSWER_PLOT](state, val) {
    state.graph.answerPlot = val;
  },

  [MutationTypes.slideEditor.GRAPH.SET_GRAPH_SCALE](state, val) {
    set(state, 'question.structure.settings.graphData.sizer', val);
  },

  [MutationTypes.slideEditor.ANALYTICS.SET_PARAMETER_VERSION](state, val) {
    state.analytics.parameterVersion = val;
  },

  [MutationTypes.slideEditor.ANALYTICS.SET_OPTION_GENERATOR_TOKENS](state, val) {
    state.analytics.optionGeneratorTokens = val;
  },

  [MutationTypes.slideEditor.ANALYTICS.SET_OPTION_GENERATOR_LOG_PROBS](state, val) {
    state.analytics.optionGeneratorTokensLogProbs = val;
  },

  [MutationTypes.slideEditor.PREVIEW.SET_PREVIEW](state, question) {
    state.preview.questionToConvertTo = question;
    state.preview.showPreview = true;
  },

  [MutationTypes.slideEditor.PREVIEW.SET_GRAPH](state, graph) {
    state.preview.graph = {
      ...graph,
      answerPlotTypeBeforePreview: state.graph.answerPlotType,
      answerPlotBeforePreview: state.graph.answerPlot,
    };
  },

  [MutationTypes.slideEditor.PREVIEW.DISABLE_PREVIEW](state) {
    if (state.preview.showPreview && state.question.type === Constants.QuestionTypes.GRAPHING) {
      state.graph.answerPlot = state.preview.graph.answerPlotBeforePreview;
      state.graph.answerPlotType = state.preview.graph.answerPlotTypeBeforePreview;
    }
    state.preview.showPreview = false;
  },

  [MutationTypes.slideEditor.PREVIEW.CONVERT_PREVIEW](state, question) {
    const currentQuestion = state.question;
    currentQuestion.type = question.type;
    currentQuestion.structure = question.structure;
    currentQuestion.time = question.time;
    state.question = currentQuestion;
    state.preview.showPreview = false;
  },

  [MutationTypes.slideEditor.QUESTION_TEMPLATE_SELECTED](state, { templateData, segmentName }) {
    state.preview.showPreview = false;

    state.usedQuestionTemplate.isUsed = true;
    state.usedQuestionTemplate.segmentName = segmentName;
    state.usedQuestionTemplate.description = templateData.description;
    state.usedQuestionTemplate.questionType = templateData.questionType;

    state.question = state.preview.questionToConvertTo;
    if (state.question.type === Constants.QuestionTypes.GRAPHING) {
      state.graph.answerPlot = state.preview.graph.answerPlot;
      state.graph.answerPlotType = state.preview.graph.answerPlotType;
      state.graph.nonInteractivePlots = state.preview.graph.nonInteractivePlots;
      state.graph.graphEditorState = SOLUTION_SELECTED;
    }
  },

  [MutationTypes.slideEditor.RESET_SLIDE_QUESTION](state) {
    state.question = Question({}, false);
  },
};

export const actions = {
  addElement({ commit, dispatch, getters }, props) {
    commit(MutationTypes.slideEditor.ADD_ELEMENT, props);

    dispatch('contentEditor/pushHistory', {
      op: Constants.HistoryOps.ADD_ELEMENT,
      props: cloneDeep(props),
    }, { root: true });

    dispatch('onCurrentSlideUpdate');
  },

  deleteElement({ commit, dispatch, getters }, { id, elementData }) {
    const elementProps = getters.getElementById(id);

    commit(MutationTypes.slideEditor.DELETE_ELEMENT, id);

    dispatch('contentEditor/pushHistory', {
      op: Constants.HistoryOps.DELETE_ELEMENT,
      props: elementData ? cloneDeep(elementData) : cloneDeep(elementProps),
    }, { root: true });

    dispatch('onCurrentSlideUpdate');
  },

  deleteAllSelectedElements({ getters, dispatch }) {
    if (getters.isMultiSelect) {
      for (const id of getters.selectedElementIds) {
        dispatch('deleteElement', { id });
        dispatch('deselectAll');
      }
    }
  },

  setSlide({ state, commit, getters }, { slide }) {
    commit(MutationTypes.slideEditor.SET_SLIDE, { slide });
    commit(MutationTypes.slideEditor.SET_SELECTED_ELEMENT, '');
  },

  setSelectedElement({ commit }, id) {
    commit(MutationTypes.slideEditor.SET_SELECTED_ELEMENT, id);
  },

  addSelectedElement({ commit }, id) {
    commit(MutationTypes.slideEditor.ADD_SELECTED_ELEMENT, id);
  },

  removeSelectedElement({ commit }, id) {
    commit(MutationTypes.slideEditor.REMOVE_SELECTED_ELEMENT, id);
  },

  deselectAll({ commit }) {
    commit(MutationTypes.slideEditor.SET_SELECTED_ELEMENT, '');
    commit(MutationTypes.slideEditor.CLEAR_SELECTED_ELEMENTS);
  },

  multiSelectMove({ commit }, delta) {
    commit(MutationTypes.slideEditor.MULTISELECT_MOVE, delta);
  },

  createMultiselect({ commit }, ids) {
    commit(MutationTypes.slideEditor.CREATE_MULTISELECT, ids);
  },

  updateElement({
    commit, dispatch, getters, rootGetters,
  }, { elementData, noStack, initialElementData }) {
    if (!elementData) {
      return;
    }

    const lastHistoryEntry = rootGetters['contentEditor/lastHistoryEntry'];
    const from = lastHistoryEntry?.op === Constants.HistoryOps.UPDATE_ELEMENT
      && lastHistoryEntry?.to?._id === elementData._id
      ? lastHistoryEntry?.to
      : initialElementData;
    commit(MutationTypes.slideEditor.UPDATE_ELEMENT, elementData);

    const to = cloneDeep(getters.getElementById(elementData._id));

    if (!isEqual(from, to) && !noStack) {
      dispatch('contentEditor/pushHistory', {
        op: Constants.HistoryOps.UPDATE_ELEMENT,
        from,
        to,
      }, { root: true });
    }

    dispatch('onCurrentSlideUpdate');
  },

  setElements({ commit, dispatch }, elements) {
    commit(MutationTypes.slideEditor.SET_ELEMENTS, elements);
    dispatch('onCurrentSlideUpdate');
  },

  bringSelectedElementForward({ commit, state, dispatch }) {
    commit(MutationTypes.slideEditor.BRING_FORWARD, state.selectedElementId);
    commit(MutationTypes.slideEditor.CORRECT_INDICES);
    dispatch('onCurrentSlideUpdate');
  },

  sendSelectedElementBackward({ commit, state, dispatch }) {
    commit(MutationTypes.slideEditor.SEND_BACKWARD, state.selectedElementId);
    commit(MutationTypes.slideEditor.CORRECT_INDICES);
    dispatch('onCurrentSlideUpdate');
  },

  bringSelectedElementToFront({ commit, state, dispatch }) {
    commit(MutationTypes.slideEditor.BRING_TO_FRONT, state.selectedElementId);
    commit(MutationTypes.slideEditor.CORRECT_INDICES);
    dispatch('onCurrentSlideUpdate');
  },
  sendSelectedElementToBack({ commit, state, dispatch }) {
    commit(MutationTypes.slideEditor.SEND_TO_BACK, state.selectedElementId);
    commit(MutationTypes.slideEditor.CORRECT_INDICES);
    dispatch('onCurrentSlideUpdate');
  },

  setTheme({ commit, dispatch }, theme) {
    commit(MutationTypes.slideEditor.SET_THEME, theme);
    dispatch('onCurrentSlideUpdate');
  },

  setCurrentTheme({ commit, dispatch }, theme) {
    commit(MutationTypes.slideEditor.SET_CURRENT_THEME, theme);
    dispatch('onCurrentSlideUpdate');
  },

  setCustomColors({ commit, dispatch }, customColors) {
    commit(MutationTypes.slideEditor.SET_CUSTOM_COLORS, customColors);
    dispatch('onCurrentSlideUpdate');
  },

  rotate({ commit, state, dispatch }, degrees) {
    commit(MutationTypes.slideEditor.ROTATE, { _id: state.selectedElementId, degrees });
    const element = state.question.structure.elements.find(
      (item) => item && item._id === state.selectedElementId,
    );
    dispatch('updateElement', { elementData: element });
  },

  center({ commit, state, dispatch }, direction) {
    commit(MutationTypes.slideEditor.CENTER, { _id: state.selectedElementId, direction });
    const element = state.question.structure.elements.find(
      (item) => item && item._id === state.selectedElementId,
    );
    dispatch('updateElement', { elementData: element });
  },

  setTiptapEditorInFocus({ commit, getters, state }, { id = '', slideType = '' } = {}) {
    const isCurrentlyNoElementSelected = isEmpty(getters.currentlyFocusedTiptapEditor);

    if (isCurrentlyNoElementSelected && isEmpty(id)) {
      return;
    }

    if (getters.currentlyFocusedTiptapEditor.id === id) {
      return;
    }

    commit(MutationTypes.slideEditor.SET_TIPTAP_EDITOR_IN_FOCUS, {
      editor: { id, slideType },
    });
  },

  updateQuestionId({ commit, dispatch, getters }, { id }) {
    const from = cloneDeep(getters.currentSlide);
    commit(MutationTypes.slideEditor.UPDATE_QUESTION_ID, { id });
    dispatch('onCurrentSlideUpdate');
    dispatch('updateQuestionHistory', {
      from,
      to: cloneDeep(getters.currentSlide),
    });
  },

  updateQuestionQuery({ commit, dispatch, getters }, {
    query = null, rawData = {}, isTextEmpty = false, parsedQuestionQueryUpdate = false,
  }) {
    // const from = cloneDeep(getters.currentSlide);

    if (rawData.media) {
      // eslint-disable-next-line no-param-reassign
      rawData.media = rawData.media.filter((media) => media.url || media.video);
    }

    commit(MutationTypes.slideEditor.UPDATE_QUESTION_QUERY, { rawData });

    let queryType = getters.questionQuery.type;
    const allMediaTypesPresent = getters.questionQuery.media.map((media) => media.type);

    // const isTextEmpty = this.getTipTapEditorData.isEmpty;

    if (!isTextEmpty) {
      queryType = 'text';
    } else {
      // updated type on the basis of existing query
      queryType = getters.questionQuery.text ? 'text' : '';
    }

    uniq(allMediaTypesPresent).forEach((type) => {
      queryType += `${isEmpty(queryType) ? '' : '_'}${type}`;
    });

    commit(MutationTypes.slideEditor.UPDATE_QUESTION_QUERY_TYPE, { queryType });

    if (parsedQuestionQueryUpdate) {
      dispatch('contentEditor/setParsedQuestionQuery', {
        ...rawData,
        type: queryType,
      }, { root: true });
    }

    dispatch('onCurrentSlideUpdate');
    // dispatch('updateQuestionHistory', {
    //   from,
    //   to: cloneDeep(getters.currentSlide),
    // });
  },

  addQuestionQueryMedia({ commit, dispatch, getters }, { media }) {
    // const from = cloneDeep(getters.currentSlide);
    commit(MutationTypes.slideEditor.ADD_QUESTION_QUERY_MEDIA, { media });
    dispatch('onCurrentSlideUpdate');
    // dispatch('updateQuestionHistory', {
    //   from,
    //   to: cloneDeep(getters.currentSlide),
    // });
  },

  removeQuestionQueryImageMedia({ commit, dispatch, getters }) {
    const from = cloneDeep(getters.currentSlide);
    commit(MutationTypes.slideEditor.REMOVE_QUESTION_QUERY_IMAGE_MEDIA);
    dispatch('onCurrentSlideUpdate');
    dispatch('updateQuestionHistory', {
      from,
      to: cloneDeep(getters.currentSlide),
    });
  },

  removeQuestionQueryAudioMedia({ commit, dispatch, getters }) {
    const from = cloneDeep(getters.currentSlide);
    commit(MutationTypes.slideEditor.REMOVE_QUESTION_QUERY_AUDIO_MEDIA);
    dispatch('onCurrentSlideUpdate');
    dispatch('updateQuestionHistory', {
      from,
      to: cloneDeep(getters.currentSlide),
    });
  },

  updateSingleQuestionOption({ commit, dispatch, getters }, { option, index }) {
    const from = cloneDeep(getters.currentSlide);
    commit(MutationTypes.slideEditor.UPDATE_QUESTION_OPTION, { option, index });
    dispatch('onCurrentSlideUpdate');
    dispatch('updateQuestionHistory', {
      from,
      to: cloneDeep(getters.currentSlide),
    });
  },

  updateSingleMatchOption({ commit, dispatch, getters }, { match, index }) {
    const from = cloneDeep(getters.currentSlide);
    commit(MutationTypes.slideEditor.UPDATE_QUESTION_MATCH_OPTION, { match, index });
    dispatch('onCurrentSlideUpdate');
    dispatch('updateQuestionHistory', {
      from,
      to: cloneDeep(getters.currentSlide),
    });
  },

  updateSingleTargetById({ commit, dispatch, getters }, { target, id }) {
    const from = cloneDeep(getters.currentSlide);
    commit(MutationTypes.slideEditor.UPDATE_QUESTION_TARGET_BY_ID, { target, id });
    dispatch('onCurrentSlideUpdate');
    dispatch('updateQuestionHistory', {
      from,
      to: cloneDeep(getters.currentSlide),
    });
  },

  updateQuestionOptions({ commit, dispatch, getters }, { options, answer }) {
    const from = cloneDeep(getters.currentSlide);
    commit(MutationTypes.slideEditor.UPDATE_QUESTION_OPTIONS, { options });

    if (!isNil(answer)) {
      commit(MutationTypes.slideEditor.UPDATE_QUESTION_ANSWER, { answer });
    }

    dispatch('onCurrentSlideUpdate');
    dispatch('updateQuestionHistory', {
      from,
      to: cloneDeep(getters.currentSlide),
    });
  },

  updateQuestionOptionsAndAnswer({ commit, dispatch, getters }, { options, answer }) {
    const from = cloneDeep(getters.currentSlide);
    commit(MutationTypes.slideEditor.UPDATE_OPTIONS_AND_ANSWER, { options, answer });

    dispatch('onCurrentSlideUpdate');
    dispatch('updateQuestionHistory', {
      from,
      to: cloneDeep(getters.currentSlide),
    });
  },

  updateQuestionAnswer({ commit, dispatch, getters }, { answer }) {
    const from = cloneDeep(getters.currentSlide);
    commit(MutationTypes.slideEditor.UPDATE_QUESTION_ANSWER, { answer });
    dispatch('onCurrentSlideUpdate');
    dispatch('updateQuestionHistory', {
      from,
      to: cloneDeep(getters.currentSlide),
    });
  },

  updateQuestionMatches({ commit, dispatch, getters }, { matches }) {
    const from = cloneDeep(getters.currentSlide);
    commit(MutationTypes.slideEditor.UPDATE_QUESTION_MATCHES, { matches });
    dispatch('onCurrentSlideUpdate');
    dispatch('updateQuestionHistory', {
      from,
      to: cloneDeep(getters.currentSlide),
    });
  },

  updateMultipleQuestionProperties({ commit, dispatch, getters }, {
    options, answer, matches, targets,
  }) {
    const from = cloneDeep(getters.currentSlide);
    if (options) {
      commit(MutationTypes.slideEditor.UPDATE_QUESTION_OPTIONS, { options });
    }
    if (getters.currentSlide.type === Constants.QuestionTypes.MATCH) {
      commit(MutationTypes.slideEditor.UPDATE_QUESTION_MATCHES, { matches });
    }
    if (targets && (getters.currentSlide.type === Constants.QuestionTypes.DND_IMAGE
      || getters.currentSlide.type === Constants.QuestionTypes.CLASSIFICATION)) {
      commit(MutationTypes.slideEditor.UPDATE_QUESTION_TARGETS, { targets });
    }
    if (answer) {
      commit(MutationTypes.slideEditor.UPDATE_QUESTION_ANSWER, { answer });
    }
    dispatch('onCurrentSlideUpdate');
    dispatch('updateQuestionHistory', {
      from,
      to: cloneDeep(getters.currentSlide),
    });
  },

  updateQuestionTime({ commit, dispatch, getters }, { time }) {
    const from = cloneDeep(getters.currentSlide);
    commit(MutationTypes.slideEditor.UPDATE_QUESTION_TIME, { time });
    dispatch('onCurrentSlideUpdate');
    dispatch('updateQuestionHistory', {
      from,
      to: cloneDeep(getters.currentSlide),
    });
  },

  flipOrderOfOptions({ commit, dispatch, getters }, { order }) {
    const from = cloneDeep(getters.currentSlide);
    commit(MutationTypes.slideEditor.UPDATE_ORDER_OF_OPTIONS, { order });
    dispatch('onCurrentSlideUpdate');
    dispatch('updateQuestionHistory', {
      from,
      to: cloneDeep(getters.currentSlide),
    });
  },

  updateQuestionTopics({ commit, dispatch, getters }, { topics }) {
    const from = cloneDeep(getters.currentSlide);
    commit(MutationTypes.slideEditor.UPDATE_QUESTION_TOPICS, { topics });
    dispatch('onCurrentSlideUpdate');
    dispatch('updateQuestionHistory', {
      from,
      to: cloneDeep(getters.currentSlide),
    });
  },

  updateQuestionSettings({ commit, dispatch, getters }, { settings }) {
    const from = cloneDeep(getters.currentSlide);
    commit(MutationTypes.slideEditor.UPDATE_QUESTION_SETTINGS, { settings });
    dispatch('onCurrentSlideUpdate');
    dispatch('updateQuestionHistory', {
      from,
      to: cloneDeep(getters.currentSlide),
    });
  },

  updateQuestionCorrectPoints({ commit, dispatch, getters }, { points }) {
    const from = cloneDeep(getters.currentSlide);
    commit(MutationTypes.slideEditor.UPDATE_QUESTION_CORRECT_MARKS, { points });
    dispatch('onCurrentSlideUpdate');
    dispatch('updateQuestionHistory', {
      from,
      to: cloneDeep(getters.currentSlide),
    });
  },

  updateAnswerExplanation({ commit, dispatch, getters }, { explain }) {
    commit(MutationTypes.slideEditor.UPDATE_QUESTION_ANSWER_EXPLANATION, { explain });
    dispatch('onCurrentSlideUpdate');
  },

  updateQuestion({ commit, dispatch, getters }, { question }) {
    const from = cloneDeep(getters.currentSlide);
    commit(MutationTypes.slideEditor.UPDATE_QUESTION, { question });
    dispatch('onCurrentSlideUpdate');
    dispatch('updateQuestionHistory', {
      from,
      to: cloneDeep(getters.currentSlide),
    });
  },

  setCanSubmitCustomResponse({ commit, dispatch, getters }, { canSubmitCustomResponse }) {
    commit(MutationTypes.slideEditor.SET_CAN_SUBMIT_CUSTOM_RESPONSE, { canSubmitCustomResponse });
    dispatch('contentEditor/setDirtySlide', getters.currentSlideId, {
      root: true,
    });
  },

  setFIBVariant({ commit, dispatch, getters }, { fibVariant }) {
    commit(MutationTypes.slideEditor.SET_FIB_VARIANT, { fibVariant });
    dispatch('contentEditor/setDirtySlide', getters.currentSlideId, {
      root: true,
    });
  },

  setIgnoreAccentMarks({ commit, dispatch, getters }, { ignoreAccentMarksForEvaluation }) {
    commit(MutationTypes.slideEditor.SET_IGNORE_ACCENT_MARKS_FOR_EVALUATION, { ignoreAccentMarksForEvaluation });
    dispatch('contentEditor/setDirtySlide', getters.currentSlideId, {
      root: true,
    });
  },

  setQuestionHints({ commit, dispatch, getters }, { hints }) {
    commit(MutationTypes.slideEditor.SET_QUESTION_HINTS, { hints });
    dispatch('contentEditor/setDirtySlide', getters.currentSlideId, {
      root: true,
    });
  },

  setAnswerLength({ commit, dispatch, getters }, { answerLength }) {
    commit(MutationTypes.slideEditor.SET_ANSWER_LENGTH, { answerLength });
    dispatch('contentEditor/setDirtySlide', getters.currentSlideId, {
      root: true,
    });
  },

  setEnableAccentMarks({ commit, dispatch, getters }, { enableAccentMarks }) {
    commit(MutationTypes.slideEditor.SET_ENABLE_ACCENT_MARKS, { enableAccentMarks });
    dispatch('contentEditor/setDirtySlide', getters.currentSlideId, {
      root: true,
    });
  },

  setSpecialCharIndices({ commit, dispatch, getters }, { specialIndices }) {
    commit(MutationTypes.slideEditor.SET_SPECIAL_CHAR_INDICES, { specialIndices });
    dispatch('contentEditor/setDirtySlide', getters.currentSlideId, {
      root: true,
    });
  },

  setdoesOptionHaveMultipleTargetsSetting({ commit, dispatch, getters }, isEnabled) {
    commit(MutationTypes.slideEditor.SET_HAS_MULTIPLE_CORRECT_SETTING, isEnabled);
    dispatch('contentEditor/setDirtySlide', getters.currentSlideId, {
      root: true,
    });
  },

  updateQuestionHistory({ dispatch, rootGetters }, { from, to }) {
    /**
     * Since undo-redo works on presentationEditor only we only update
     * history when the content is for presentation
     */
    if (!rootGetters['contentEditor/isEditorForPresentationContent']) {
      return;
    }

    dispatch('contentEditor/pushHistory', {
      op: Constants.HistoryOps.UPDATE_QUESTION,
      from,
      to,
    }, { root: true });
  },

  onCurrentSlideUpdate({ dispatch, getters, rootGetters }) {
    /**
     * We only mark the slide dirty when the content being edited is for presentation as auto-save
     * only works there. Because otherwise for editing a quiz the user has to manually save.
     */
    if (!rootGetters['contentEditor/isEditorForPresentationContent']) {
      return;
    }

    dispatch('contentEditor/setDirtySlide', getters.currentSlideId, {
      root: true,
    });
  },

  resetSlideEditor({ commit }, { keyNamesToPreserve } = {}) {
    commit(MutationTypes.slideEditor.RESET_SLIDE_EDITOR, { keyNamesToPreserve });
  },

  setBoxSelectInProgress({ commit }, value) {
    commit(MutationTypes.slideEditor.SET_BOX_SELECT_IN_PROGRESS, value);
  },

  collideRectAndSelect({ commit, getters }, rect) {
    for (const element of getters.elements) {
      if (!element) {
        return;
      }

      if (element.isLocked) {
        continue;
      }
      const elRect = {
        ...element.transform.position,
        ...element.transform.size,
      };

      if (rect.x < (elRect.x + elRect.width)
        && (rect.x + rect.width) > elRect.x
        && rect.y < (elRect.y + elRect.height)
        && (rect.y + rect.height) > elRect.y) {
        commit(MutationTypes.slideEditor.ADD_SELECTED_ELEMENT, element._id);
      }
    }
  },

  setShouldShowElementFocus({ commit }, shouldShowElementFocus) {
    commit(MutationTypes.slideEditor.SET_SHOULD_SHOW_ELEMENT_FOCUS, shouldShowElementFocus);
  },

  cleanup({ commit }) {
    commit(MutationTypes.slideEditor.CLEANUP);
  },

  setSourcePage({ commit }, sourcePage) {
    commit(MutationTypes.slideEditor.SET_SOURCE_PAGE, sourcePage);
  },

  updateGraphDataIntoQuestion({ dispatch, commit, getters }, isSlideEditor = false) {
    commit(MutationTypes.slideEditor.UPDATE_GRAPH_DATA_INTO_QUESTION);
    if (isSlideEditor) {
      dispatch('contentEditor/setDirtySlide', getters.currentSlideId, {
        root: true,
      });
    }
  },

  setHoverGraphType({ commit }, val) {
    commit(MutationTypes.slideEditor.GRAPH.SET_HOVER_GRAPH_TYPE, val);
  },

  setAnswerPlotType({ commit }, val) {
    commit(MutationTypes.slideEditor.GRAPH.SET_ANSWER_PLOT_TYPE, val);
  },

  setGraphEditorState({ commit }, val) {
    commit(MutationTypes.slideEditor.GRAPH.SET_GRAPH_EDITOR_STATE, val);
  },

  setGraphComponentReady({ commit }, val) {
    commit(MutationTypes.slideEditor.GRAPH.SET_GRAPH_COMPONENT_READY, val);
  },

  setEditGraphModalOpen({ commit }, val) {
    commit(MutationTypes.slideEditor.GRAPH.SET_EDIT_GRAPH_MODAL_OPEN, val);
  },

  setNonInteractivePlots({ commit }, val) {
    commit(MutationTypes.slideEditor.GRAPH.SET_NON_INTERACTIVE_PLOTS, val);
  },

  setAnswerPlot({ commit }, val) {
    commit(MutationTypes.slideEditor.GRAPH.SET_ANSWER_PLOT, val);
  },

  setGraphScale({ commit }, val) {
    commit(MutationTypes.slideEditor.GRAPH.SET_GRAPH_SCALE, val);
  },

  updateGraphDataFromQuestion({ commit }) {
    commit(MutationTypes.slideEditor.UPDATE_GRAPH_DATA_FROM_QUESTION);
  },

  historyPopUpdateQuestion({ commit, dispatch }, payload) {
    commit(MutationTypes.slideEditor.UPDATE_QUESTION, payload);
    if (payload.question.type === Constants.QuestionTypes.GRAPHING) {
      dispatch('slideEditor/updateGraphDataFromQuestion');
    }
  },

  setAnalyticsParameterVersion({ commit }, val) {
    commit(MutationTypes.slideEditor.ANALYTICS.SET_PARAMETER_VERSION, val);
  },

  setAnalyticsOptionGeneratorTokens({ commit }, val) {
    commit(MutationTypes.slideEditor.ANALYTICS.SET_OPTION_GENERATOR_TOKENS, val);
  },

  setAnalyticsOptionGeneratorTokensLogProbs({ commit }, val) {
    commit(MutationTypes.slideEditor.ANALYTICS.SET_OPTION_GENERATOR_LOG_PROBS, val);
  },

  resetAnalytics({ commit }) {
    commit(MutationTypes.slideEditor.ANALYTICS.SET_PARAMETER_VERSION, 1);
    commit(MutationTypes.slideEditor.ANALYTICS.SET_OPTION_GENERATOR_TOKENS, []);
    commit(MutationTypes.slideEditor.ANALYTICS.SET_OPTION_GENERATOR_LOG_PROBS, []);
  },

  setPreviewQuestion({ commit }, question) {
    commit(MutationTypes.slideEditor.PREVIEW.SET_PREVIEW, question);
  },

  setPreviewGraph({ commit }, graph) {
    commit(MutationTypes.slideEditor.PREVIEW.SET_GRAPH, graph);
  },

  disablePreviewQuestion({ commit }) {
    commit(MutationTypes.slideEditor.PREVIEW.DISABLE_PREVIEW);
  },

  convertPreviewQuestion({ commit }, question) {
    commit(MutationTypes.slideEditor.PREVIEW.CONVERT_PREVIEW, question);
  },

  setQuestionFromTemplate({ commit }, payload) {
    commit(MutationTypes.slideEditor.QUESTION_TEMPLATE_SELECTED, payload);
  },

  resetSlideQuestion({ commit }) {
    commit(MutationTypes.slideEditor.RESET_SLIDE_QUESTION);
  },
};

const slideEditor = {
  state,
  getters,
  mutations,
  actions,
};

export default slideEditor;
