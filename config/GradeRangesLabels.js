import i18n from '~/services/i18n';
import { GradeRangeIds } from './GradeRanges';

export const GradeRanges = [
  {
    val: GradeRangeIds.PRIMARY_SCHOOL,
    text: i18n('Elementary'),
  },
  {
    val: GradeRangeIds.MIDDLE_SCHOOL,
    text: i18n('Middle School'),
  },
  {
    val: GradeRangeIds.HIGH_SCHOOL,
    text: i18n('High School'),
  },
  {
    val: GradeRangeIds.UNIVERSITY,
    text: i18n('University'),
  },
];
