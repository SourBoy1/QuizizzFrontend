import i18n from '~/services/i18n';

const getDifficultyList = () => [
  {
    val: 'easy',
    text: i18n('Easy'),
    key: 'difficulty',
  },
  {
    val: 'medium',
    text: i18n('Medium'),
    key: 'difficulty',
  },
  {
    val: 'hard',
    text: i18n('Hard'),
    key: 'difficulty',
  },
];

export default getDifficultyList;
