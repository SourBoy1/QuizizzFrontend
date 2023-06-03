import i18n from '~/services/i18n';

export const QuestionColumnsForExcel = [{
  name: i18n('Question'),
  value: 'questionText',
  width: 64,
}, {
  name: i18n('Question Type'),
  value: 'questionType',
  width: 40,
}, {
  name: i18n('Option 1'),
  value: 'option1',
  width: 32,
}, {
  name: i18n('Option 2'),
  value: 'option2',
  width: 32,
}, {
  name: i18n('Option 3'),
  value: 'option3',
  width: 32,
}, {
  name: i18n('Option 4'),
  value: 'option4',
  width: 32,
}, {
  name: i18n('Option 5'),
  value: 'option5',
  width: 32,
}, {
  name: i18n('Correct'),
  value: 'correct',
  width: 32,
  hasTooltip: true,
  text: i18n('For multiple correct answers separate the correct option numbers using a comma<br><br>e.g. 1,4,5<br><br>For questions without a correct answer, enter hyphen (-)'),
}, {
  name: i18n('Time'),
  value: 'time',
  width: 20,
}, {
  name: i18n('Image link'),
  value: 'url',
  width: 64,
}, {
  name: i18n('Delete'),
  value: 'delete',
  width: 16,
}];

export const ExcelImportErrorMessages = {
  INVALID_SHEET: i18n('Could not import from this spreadsheet. Please follow the sample template.'),
};

export const ExcelImportErrorFields = {
  QUESTION_TEXT: 'questionText',
  OPTION_1: 'option1',
  OPTION_2: 'option2',
  CORRECT: 'correct',
  URL: 'url',
};

export const ExcelImportErrorTypes = {
  MISSING_ANSWER_OPTION: i18n('Missing answer option'),
  MISSING_QUESTION_TEXT: i18n('Missing question text'),
  INVALID_CORRECT_OPTION: i18n('Invalid correct option'),
  INVALID_URL: i18n('Invalid image link'),
};
