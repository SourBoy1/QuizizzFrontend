import ObjectId from 'bson-objectid';
import find from 'lodash/find';
import isEmpty from 'lodash/isEmpty';

import Constants from '~/config/Constants.js';
import SlideTemplates from '~/config/SlideTemplates.js';
import Question from '~/models/Question.js';
import Structure from '~/models/Structure';
import SlideElement from '~/models/SlideElement.js';
import { getLines, getTextFromHTML, SlideElementConstants } from '~/utils/SlideV1Utils';
import QuestionOption from '~/models/QuestionOption';
import QLogger from './QLogger';
import $store from './StoreService';

export default class NewSlideService {
  static createSlide(type, values = {}) {
    const _id = ObjectId().toHexString();
    const h1ElementHeight = 72;
    const adjustedHeight = 24;
    const modifiedCenteredTitle = SlideTemplates.CenteredTitle;
    let titleLines = 1;

    switch (type) {
      case Constants.SlideTemplates.BLANK:
        return Question({
          _id,
          type: Constants.SlideTypes.CONTENT_SLIDE_V2,
          structure: {
            kind: Constants.SlideTypes.CONTENT_SLIDE_V2,
            elements: values.slideElements ?? [],
            marks: {
              correct: 0,
              incorrect: 0,
            },
          },
        });

      case Constants.SlideTemplates.DEFAULT_FIRST_SLIDE:
        titleLines = getLines(getTextFromHTML(values.title.html), modifiedCenteredTitle.placeholderSize, SlideElementConstants.MAX_TEXT_WIDTH);
        modifiedCenteredTitle.transform.size.height = titleLines * h1ElementHeight + adjustedHeight;
        modifiedCenteredTitle.transform.position.y = modifiedCenteredTitle.transform.position.y - (modifiedCenteredTitle.transform.size.height - 96);
        return Question({
          _id,
          type: Constants.SlideTypes.CONTENT_SLIDE_V2,
          structure: {
            kind: Constants.SlideTypes.CONTENT_SLIDE_V2,
            elements: [
              SlideElement({
                _id: ObjectId().toHexString(),
                type: 'TEXT',
                placeholder: SlideTemplates.CenteredTitle.placeholder,
                placeholderSize: SlideTemplates.CenteredTitle.placeholderSize,
                transform: modifiedCenteredTitle.transform,
                zIndex: 0,
                data: values?.title || SlideTemplates.CenteredTitle.data,
              }),
              SlideElement({
                _id: ObjectId().toHexString(),
                type: 'TEXT',
                placeholder: SlideTemplates.CenteredSubtitle.placeholder,
                placeholderSize: SlideTemplates.CenteredSubtitle.placeholderSize,
                transform: SlideTemplates.CenteredSubtitle.transform,
                zIndex: 1,
                data: values?.subtitle || SlideTemplates.CenteredSubtitle.data,
              }),
            ],
            marks: {
              correct: 0,
              incorrect: 0,
            },
          },
        });

      case Constants.SlideTemplates.TITLE_SUBTITLE:
        return Question({
          _id,
          type: Constants.SlideTypes.CONTENT_SLIDE_V2,
          structure: {
            kind: Constants.SlideTypes.CONTENT_SLIDE_V2,
            elements: [
              SlideElement({
                _id: ObjectId().toHexString(),
                type: 'TEXT',
                placeholder: SlideTemplates.CenteredTitle.placeholder,
                placeholderSize: SlideTemplates.CenteredTitle.placeholderSize,
                transform: SlideTemplates.CenteredTitle.transform,
                zIndex: 0,
                data: values?.title || SlideTemplates.CenteredTitle.data,
              }),
              SlideElement({
                _id: ObjectId().toHexString(),
                type: 'TEXT',
                placeholder: SlideTemplates.CenteredSubtitle.placeholder,
                placeholderSize: SlideTemplates.CenteredSubtitle.placeholderSize,
                transform: SlideTemplates.CenteredSubtitle.transform,
                zIndex: 1,
                data: values?.subtitle || SlideTemplates.CenteredSubtitle.data,
              }),
            ],
            marks: {
              correct: 0,
              incorrect: 0,
            },
          },
        });

      case Constants.SlideTemplates.TITLE_TEXT:
        return Question({
          _id,
          type: Constants.SlideTypes.CONTENT_SLIDE_V2,
          structure: {
            kind: Constants.SlideTypes.CONTENT_SLIDE_V2,
            elements: [
              SlideElement({
                _id: ObjectId().toHexString(),
                type: 'TEXT',
                placeholder: SlideTemplates.Title.placeholder,
                placeholderSize: SlideTemplates.Title.placeholderSize,
                transform: SlideTemplates.Title.transform,
                zIndex: 0,
                data: SlideTemplates.Title.data,
              }),
              SlideElement({
                _id: ObjectId().toHexString(),
                type: 'TEXT',
                placeholder: SlideTemplates.Text.placeholder,
                placeholderSize: SlideTemplates.Text.placeholderSize,
                transform: SlideTemplates.Text.transform,
                zIndex: 1,
                data: SlideTemplates.Text.data,
              }),
            ],
            marks: {
              correct: 0,
              incorrect: 0,
            },
          },
        });

      case Constants.SlideTemplates.TITLE_TEXT_MEDIA:
        return Question({
          _id,
          type: Constants.SlideTypes.CONTENT_SLIDE_V2,
          structure: {
            kind: Constants.SlideTypes.CONTENT_SLIDE_V2,
            elements: [
              SlideElement({
                _id: ObjectId().toHexString(),
                type: 'TEXT',
                placeholder: SlideTemplates.ShortTitle.placeholder,
                placeholderSize: SlideTemplates.ShortTitle.placeholderSize,
                transform: SlideTemplates.ShortTitle.transform,
                zIndex: 0,
                data: values?.title || SlideTemplates.ShortTitle.data,
              }),
              SlideElement({
                _id: ObjectId().toHexString(),
                type: 'TEXT',
                placeholder: SlideTemplates.ShortText.placeholder,
                placeholderSize: SlideTemplates.ShortText.placeholderSize,
                transform: SlideTemplates.ShortText.transform,
                zIndex: 1,
                data: values?.subtitle || SlideTemplates.ShortText.data,
              }),
              SlideElement({
                _id: ObjectId().toHexString(),
                type: 'MEDIA',
                transform: SlideTemplates.HalfMediaRight.transform,
                zIndex: 1,
                data: {
                  media: !isEmpty(values?.media) ? values?.media : SlideTemplates.HalfMediaRight.data.media,
                },
              }),
            ],
            marks: {
              correct: 0,
              incorrect: 0,
            },
          },
        });

      case Constants.SlideTemplates.TITLE_BULLETS_MEDIA:
        return Question({
          _id,
          type: Constants.SlideTypes.CONTENT_SLIDE_V2,
          structure: {
            kind: Constants.SlideTypes.CONTENT_SLIDE_V2,
            elements: [
              SlideElement({
                _id: ObjectId().toHexString(),
                type: 'TEXT',
                placeholder: SlideTemplates.ShortTitle.placeholder,
                placeholderSize: SlideTemplates.ShortTitle.placeholderSize,
                transform: SlideTemplates.ShortTitle.transform,
                zIndex: 0,
                data: SlideTemplates.ShortTitle.data,
              }),
              SlideElement({
                _id: ObjectId().toHexString(),
                type: 'TEXT',
                placeholder: SlideTemplates.ShortBullets.placeholder,
                placeholderSize: SlideTemplates.ShortBullets.placeholderSize,
                transform: SlideTemplates.ShortBullets.transform,
                zIndex: 1,
                data: SlideTemplates.ShortBullets.data,
              }),
              SlideElement({
                _id: ObjectId().toHexString(),
                type: 'MEDIA',
                transform: SlideTemplates.HalfMediaRight.transform,
                zIndex: 1,
                data: SlideTemplates.HalfMediaRight.data,
              }),
            ],
            marks: {
              correct: 0,
              incorrect: 0,
            },
          },
        });

      case Constants.SlideTemplates.FULLSCREEN_MEDIA:
        return Question({
          _id,
          type: Constants.SlideTypes.CONTENT_SLIDE_V2,
          structure: {
            kind: Constants.SlideTypes.CONTENT_SLIDE_V2,
            elements: [
              SlideElement({
                _id: ObjectId().toHexString(),
                type: 'MEDIA',
                transform: SlideTemplates.FullMedia.transform,
                zIndex: 0,
                data: SlideTemplates.FullMedia.data,
              }),
            ],
            marks: {
              correct: 0,
              incorrect: 0,
            },
          },
        });

      case Constants.SlideTemplates.WEBPAGE_LINK:
        return Question({
          _id,
          type: Constants.SlideTypes.CONTENT_SLIDE_V2,
          structure: {
            kind: Constants.SlideTypes.CONTENT_SLIDE_V2,
            elements: [
              SlideElement({
                _id: ObjectId().toHexString(),
                type: 'WEBPAGE',
                transform: SlideTemplates.FullWebpage.transform,
                zIndex: 0,
                data: SlideTemplates.FullWebpage.data,
              }),
            ],
            marks: {
              correct: 0,
              incorrect: 0,
            },
          },
        });

      default:
        QLogger.error(`Error at NewSlideService.addNewSlide: 'type' given(${type}) is not a valid Slide Template type to add for id(${_id})`);
    }
  }

  static addNewSlide(type, values, noStack) {
    const slide = NewSlideService.createSlide(type, values);
    $store().dispatch('contentEditor/addNewSlide', { slide, noStack, atIndex: values?.atIndex || -1 });
    if (!values || !values.atIndex || values.atIndex === -1) {
      $store().dispatch('contentEditor/selectSlideById', slide._id);
    }
    return slide;
  }

  static getSlideTypeElements(type) {
    const slide = { ...NewSlideService.createSlide(type) };
    const { elements } = slide.structure;
    return elements;
  }

  static createQuestion(type) {
    const _id = ObjectId().toHexString();

    switch (type) {
      case Constants.SlideTypes.MCQ:
        return Question({
          _id,
          type: Constants.SlideTypes.MCQ,
          time: Constants.QuestionDefaultTimes[Constants.SlideTypes.MCQ],
          structure: Structure({
            kind: Constants.SlideTypes.MCQ,
            options: [...Array(4)].map(() => QuestionOption()),
            settings: {
              hasCorrectAnswer: true,
            },
            marks: {
              correct: 1,
              incorrect: 0,
            },
          }),
        });

      case Constants.SlideTypes.MSQ:
        return Question({
          _id,
          type: Constants.SlideTypes.MSQ,
          time: Constants.QuestionDefaultTimes[Constants.SlideTypes.MSQ],
          structure: Structure({
            answer: [],
            kind: Constants.SlideTypes.MSQ,
            options: [...Array(4)].map(() => QuestionOption()),
            settings: {
              hasCorrectAnswer: true,
            },
            marks: {
              correct: 1,
              incorrect: 0,
            },
          }),
        });

      case Constants.SlideTypes.BLANK:
        return Question({
          _id,
          type: Constants.SlideTypes.BLANK,
          time: Constants.QuestionDefaultTimes[Constants.SlideTypes.BLANK],
          structure: Structure({
            answer: [],
            hints: [],
            kind: Constants.SlideTypes.BLANK,
            settings: {
              hasCorrectAnswer: true,
              fibDataType: Constants.TypedQuestionResponseTypes.STRING,
              enableAccentMarks: false,
              questionMetadata: {
                answerLength: 0,
                specialIndices: [],
              },
            },
            marks: {
              correct: 1,
              incorrect: 0,
            },
          }),
        });

      case Constants.SlideTypes.OPEN:
        return Question({
          _id,
          type: Constants.SlideTypes.OPEN,
          time: Constants.QuestionDefaultTimes[Constants.SlideTypes.OPEN],
          structure: Structure({
            answer: [],
            kind: Constants.SlideTypes.OPEN,
            settings: {
              hasCorrectAnswer: false,
              fibDataType: Constants.TypedQuestionResponseTypes.STRING,
            },
            marks: {
              correct: 1,
              incorrect: 0,
            },
          }),
        });

      case Constants.SlideTypes.POLL:
        /**
         * `POLL` Question type is a frontend only thing. Internally it is either an MCQ or MSQ question
         * with just the setting `hasCorrectAnswer` equal to false.
         */
        return Question({
          _id,
          type: Constants.SlideTypes.MCQ,
          time: Constants.QuestionDefaultTimes[Constants.SlideTypes.MCQ],
          structure: Structure({
            kind: Constants.SlideTypes.MCQ,
            options: [...Array(4)].map(() => QuestionOption()),
            settings: {
              hasCorrectAnswer: false,
            },
            marks: {
              correct: 0,
              incorrect: 0,
            },
          }),
        });

      case Constants.SlideTypes.DRAW:
        return Question({
          _id,
          type: Constants.SlideTypes.DRAW,
          time: Constants.QuestionDefaultTimes[Constants.SlideTypes.DRAW],
          structure: Structure({
            kind: Constants.SlideTypes.DRAW,
            settings: {
              hasCorrectAnswer: false,
            },
            marks: {
              correct: 1,
              incorrect: 0,
            },
          }),
        });

      case Constants.SlideTypes.AUDIO:
        return Question({
          _id,
          type: Constants.SlideTypes.AUDIO,
          time: Constants.QuestionDefaultTimes[Constants.SlideTypes.AUDIO],
          structure: Structure({
            kind: Constants.SlideTypes.AUDIO,
            settings: {
              hasCorrectAnswer: false,
            },
            marks: {
              correct: 1,
              incorrect: 0,
            },
          }),
        });

      case Constants.SlideTypes.VIDEO:
        return Question({
          _id,
          type: Constants.SlideTypes.VIDEO,
          time: Constants.QuestionDefaultTimes[Constants.SlideTypes.VIDEO],
          structure: Structure({
            kind: Constants.SlideTypes.VIDEO,
            settings: {
              hasCorrectAnswer: false,
            },
            marks: {
              correct: 1,
              incorrect: 0,
            },
          }),
        });
      case Constants.SlideTypes.REORDER:
        return Question({
          _id,
          type: Constants.SlideTypes.REORDER,
          time: Constants.QuestionDefaultTimes[Constants.SlideTypes.REORDER],
          structure: Structure({
            query: {
              text: '<p><i18n>Reorder the following</i18n></p>',
            },
            order: 'asc',
            kind: Constants.SlideTypes.REORDER,
            answer: [],
            settings: {
              hasCorrectAnswer: true,
            },
            marks: {
              correct: 1,
              incorrect: 0,
            },
          }),
        });
      case Constants.SlideTypes.MATCH:
        return Question({
          _id,
          type: Constants.SlideTypes.MATCH,
          time: Constants.QuestionDefaultTimes[Constants.SlideTypes.MATCH],
          structure: Structure({
            query: {
              text: '<p><i18n>Match the following</i18n></p>',
            },
            kind: Constants.SlideTypes.MATCH,
            answer: [],
            matches: [],
            settings: {
              hasCorrectAnswer: true,
            },
            marks: {
              correct: 1,
              incorrect: 0,
            },
          }),
        });
      case Constants.SlideTypes.DROPDOWN:
        return Question({
          _id,
          type: Constants.SlideTypes.DROPDOWN,
          time: Constants.QuestionDefaultTimes[Constants.SlideTypes.DROPDOWN],
          structure: Structure({
            kind: Constants.SlideTypes.DROPDOWN,
            answer: [],
            settings: {
              hasCorrectAnswer: true,
              doesOptionHaveMultipleTargets: false,
            },
            marks: {
              correct: 1,
              incorrect: 0,
            },
          }),
        });
      case Constants.SlideTypes.DRAGNDROP:
        return Question({
          _id,
          type: Constants.SlideTypes.DRAGNDROP,
          time: Constants.QuestionDefaultTimes[Constants.SlideTypes.DRAGNDROP],
          structure: Structure({
            kind: Constants.SlideTypes.DRAGNDROP,
            answer: [],
            settings: {
              hasCorrectAnswer: true,
              doesOptionHaveMultipleTargets: false,
            },
            marks: {
              correct: 1,
              incorrect: 0,
            },
          }),
        });
      case Constants.SlideTypes.EQUATION:
        return Question({
          _id,
          type: Constants.SlideTypes.EQUATION,
          time: Constants.QuestionDefaultTimes[Constants.SlideTypes.EQUATION],
          structure: Structure({
            kind: Constants.SlideTypes.EQUATION,
            settings: {
              hasCorrectAnswer: true,
            },
            marks: {
              correct: 1,
              incorrect: 0,
            },
          }),
        });
      case Constants.SlideTypes.DND_IMAGE:
        return Question({
          _id,
          type: Constants.SlideTypes.DND_IMAGE,
          time: Constants.QuestionDefaultTimes[Constants.SlideTypes.DND_IMAGE],
          structure: Structure({
            kind: Constants.SlideTypes.DND_IMAGE,
            answer: [],
            targets: [],
            options: [...Array(4)].map(() => QuestionOption()),
            settings: {
              hasCorrectAnswer: true,
            },
            marks: {
              correct: 1,
              incorrect: 0,
            },
          }),
        });
      case Constants.SlideTypes.HOTSPOT:
        return Question({
          _id,
          type: Constants.SlideTypes.HOTSPOT,
          time: Constants.QuestionDefaultTimes[Constants.SlideTypes.HOTSPOT],
          structure: Structure({
            kind: Constants.SlideTypes.HOTSPOT,
            answer: [],
            settings: {
              hasCorrectAnswer: true,
            },
            marks: {
              correct: 1,
              incorrect: 0,
            },
          }),
        });
      case Constants.SlideTypes.GRAPHING:
        return Question({
          _id,
          type: Constants.SlideTypes.GRAPHING,
          time: Constants.QuestionDefaultTimes[Constants.SlideTypes.GRAPHING],
          structure: Structure({
            kind: Constants.SlideTypes.GRAPHING,
            answer: [],
            graphs: [],
            settings: {
              hasCorrectAnswer: true,
              doesOptionHaveMultipleTargets: false,
              graphData: {
                sizer: 1,
                type: 'Linear',
                maxPoints: 2,
              },
            },
            marks: {
              correct: 1,
              incorrect: 0,
            },
          }),
        });
      case Constants.SlideTypes.WORDCLOUD:
        /**
         * `WORDCLOUD` Question type is a frontend only thing. Internally it is a OPEN ENDED question
         * with just the setting `hasCorrectAnswer` equal to false.
         */
        return Question({
          _id,
          type: Constants.SlideTypes.OPEN,
          time: Constants.QuestionDefaultTimes[Constants.SlideTypes.WORDCLOUD],
          structure: Structure({
            kind: Constants.SlideTypes.OPEN,
            settings: {
              hasCorrectAnswer: false,
              fibDataType: Constants.TypedQuestionResponseTypes.STRING,
              questionDisplayVariant: Constants.DisplayVariantNames[Constants.QuestionTypes.WORDCLOUD],
            },
            marks: {
              correct: 0,
              incorrect: 0,
            },
          }),
        });

      case Constants.SlideTypes.CLASSIFICATION:
        return Question({
          _id,
          type: Constants.SlideTypes.CLASSIFICATION,
          time: Constants.QuestionDefaultTimes[Constants.SlideTypes.CLASSIFICATION],
          structure: Structure({
            query: {
              text: '<p><i18n>Classify the options into the right groups</i18n></p>',
            },
            kind: Constants.SlideTypes.CLASSIFICATION,
            answer: [],
            settings: {
              hasCorrectAnswer: true,
              doesOptionHaveMultipleTargets: false,
            },
            marks: {
              correct: 1,
              incorrect: 0,
            },
          }),
        });
      default:
        QLogger.error(`Error at NewSlideService.createQuestion: 'type' given(${type}) is not a valid question type to create for id(${_id})`);
    }
  }

  static addNewQuestion(type) {
    const question = NewSlideService.createQuestion(type);

    $store().dispatch('contentEditor/addNewSlide', { slide: question });
    $store().dispatch('contentEditor/selectSlideById', question._id);
  }

  static replaceWithNewQuestionOrSlide(newQuestionOrSlide, questions, selectedSlideId) {
    const foundQuestion = find(questions, (question, index) => (question._id === selectedSlideId));
    newQuestionOrSlide._id = selectedSlideId;
    newQuestionOrSlide.index = foundQuestion.index;
    $store().dispatch('contentEditor/updateSelectedSlide', newQuestionOrSlide);
    $store().dispatch('slideEditor/setSlide', { slide: newQuestionOrSlide });
  }
}
