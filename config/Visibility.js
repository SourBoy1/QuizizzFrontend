import Constants from '~/config/Constants';

export default [
  { title: 'Public, visible to everyone', isVisible: true },
  {
    title: 'Private, only visible to you',
    isVisible: false,
    isSuper: true,
    forSuperQuiz: {
      type: Constants.SuperUpsellTypes.PRIVATE_CONTENT_QUIZ,
      feat: Constants.FeatureTypes.PRIVATE_CONTENT_QUIZ,
      variant: '',
    },
    forSuperPresentation: {
      type: Constants.SuperUpsellTypes.PRIVATE_CONTENT_PRESENTATION,
      feat: Constants.FeatureTypes.PRIVATE_CONTENT_PRESENTATION,
      variant: '',
    },
  },
  // 'Advanced options',
];
