/* eslint-disable no-console */
import i18n, { translator } from '~/services/i18n';

// Refer ~/scripts/parseSearchTerms for parsing the CSV values
const suggestions = {
  raw: {
    general: ['integers', 'adjectives', 'digestive system', 'history'],
    generalQfw: ['Sales training', 'Product training', 'Employee onboarding', 'Customer service training'],
    math: ['fractions', 'multiplication', 'integers', 'probability'],
    english: ['adjectives', 'nouns', 'present simple', 'grammar'], // no translation
    'social studies': [
      'history',
      'economics',
      'branches of government',
      'geography',
    ],
    languages: ['french', 'spanish', 'german', 'portuguese'], // no translation
    science: [
      'states of matter',
      'digestive system',
      'force and motion',
      'solar system',
    ],
    physics: ["newton's laws", 'speed', 'electromagnetic waves', 'gravity'],
    chemistry: [
      'periodic table',
      'atomic structure',
      'chemical bonds',
      'balancing equations',
    ],
    biology: ['photosynthesis', 'cell organelles', 'evolution', 'enzymes'],
    history: [
      'constitution',
      'renaissance',
      'world war 1',
      'the French revolution',
    ],
    geography: [
      'continents',
      'latitude and longitude',
      'continents and oceans',
      'maps',
    ],
    computers: [
      'parts of a computer',
      'basics of c',
      'java programming',
      'storage devices',
    ], // no translation
    'career ed': ['marketing', 'sales', 'accounting', 'finance'],
    'creative arts': [
      'music theory',
      'musical instruments',
      'arts and crafts',
      'color quiz',
    ],
    'health & pe': ['physical education', 'sports', 'football', 'yoga'],
    gcse: ['Algebra', 'Energy', 'Cell biology', 'Atomic structure'],
  },
};

const noTranslations = ['computers', 'english', 'languages'];

export const getters = {
  searchTerms() {
    const currentLocale = translator.currentLanguage;
    if (suggestions[currentLocale]) {
      return suggestions[currentLocale];
    }

    suggestions[currentLocale] = {};
    for (const type in suggestions.raw) {
      const searchTerms = suggestions.raw[type];
      if (noTranslations.includes(type)) {
        suggestions[currentLocale][type] = searchTerms;
      } else {
        suggestions[currentLocale][type] = searchTerms.map((item) => i18n(item));
      }
    }

    return suggestions[currentLocale];
  },
};

const searchSuggestions = {
  getters,
};

export default searchSuggestions;
