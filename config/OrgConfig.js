import i18n from '../services/i18n';

export default {
  districtType: [
    { title: i18n('Local school district  NOT component of a supervisory union'), value: '1' },
    { title: i18n('Local school district that is a component of a supervisory union'), value: '2' },
    { title: i18n('Supervisory union administrative center or county superintendent\'s office serving the same purpose'), value: '3' },
    { title: i18n('Regional Education Service Agency RESA'), value: '4' },
    { title: i18n('State agency providing elementary and/or secondary level instruction'), value: '5' },
    { title: i18n('Federal agency providing elementary and/or secondary level instruction'), value: '6' },
    { title: i18n('Independent Charter District'), value: '7' },
    { title: i18n('Other education agencies'), value: '8' },
    { title: i18n('Specialized public school district'), value: '9' },
  ],
};
