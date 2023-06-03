import sortBy from 'lodash/sortBy';
import find from 'lodash/find';
import get from 'lodash/get';
import forEach from 'lodash/forEach';
import uniq from 'lodash/uniq';

import i18n from '~/services/i18n';
import { GradeRangeIds } from './GradeRanges';
import { GradeRanges } from './GradeRangesLabels';

const Grades = [
  {
    val: 0,
    text: i18n('KG'),
    range: GradeRangeIds.PRIMARY_SCHOOL,
    key: 'grade',
  },
  {
    val: 1,
    text: i18n('1st'),
    range: GradeRangeIds.PRIMARY_SCHOOL,
    key: 'grade',
  },
  {
    val: 2,
    text: i18n('2nd'),
    range: GradeRangeIds.PRIMARY_SCHOOL,
    key: 'grade',
  },
  {
    val: 3,
    text: i18n('3rd'),
    range: GradeRangeIds.PRIMARY_SCHOOL,
    key: 'grade',
  },
  {
    val: 4,
    text: i18n('4th'),
    range: GradeRangeIds.PRIMARY_SCHOOL,
    key: 'grade',
  },
  {
    val: 5,
    text: i18n('5th'),
    range: GradeRangeIds.PRIMARY_SCHOOL,
    key: 'grade',
  },
  {
    val: 6,
    text: i18n('6th'),
    range: GradeRangeIds.MIDDLE_SCHOOL,
    key: 'grade',
  },
  {
    val: 7,
    text: i18n('7th'),
    range: GradeRangeIds.MIDDLE_SCHOOL,
    key: 'grade',
  },
  {
    val: 8,
    text: i18n('8th'),
    range: GradeRangeIds.MIDDLE_SCHOOL,
    key: 'grade',
  },
  {
    val: 9,
    text: i18n('9th'),
    range: GradeRangeIds.HIGH_SCHOOL,
    key: 'grade',
  },
  {
    val: 10,
    text: i18n('10th'),
    range: GradeRangeIds.HIGH_SCHOOL,
    key: 'grade',
  },
  {
    val: 11,
    text: i18n('11th'),
    range: GradeRangeIds.HIGH_SCHOOL,
    key: 'grade',
  },
  {
    val: 12,
    text: i18n('12th'),
    range: GradeRangeIds.HIGH_SCHOOL,
    key: 'grade',
  },
  {
    val: 13,
    text: i18n('University'),
    range: GradeRangeIds.UNIVERSITY,
    key: 'grade',
  },
  {
    val: 14,
    text: i18n('Professional Development'),
    range: GradeRangeIds.UNIVERSITY,
    key: 'grade',
  },
];

export const getGradeRangeFromGrades = (grades) => {
  if (!grades || grades.length === 0) {
    return null;
  }

  const sortedGrades = sortBy(grades);
  const lowestGrade = sortedGrades[0];
  const highestGrade = sortedGrades[sortedGrades.length - 1];

  const [lowestGradeRange, highestGradeRange] = Grades.reduce((gradeRanges, currentGrade) => {
    if (lowestGrade === currentGrade.val) {
      gradeRanges[0] = currentGrade;
    }

    if (highestGrade === currentGrade.val) {
      gradeRanges[1] = currentGrade;
    }

    return gradeRanges;
  }, [Grades[0], Grades[14]]);

  if (lowestGradeRange !== highestGradeRange) {
    return highestGradeRange.range;
  }

  return lowestGradeRange.range;
};

const getRangeName = (grade) => {
  const gradeData = find(Grades, { val: grade });
  const gradeRange = get(gradeData, 'range', '');
  const gradeRangeData = find(GradeRanges, { val: gradeRange });
  return get(gradeRangeData, 'text', '');
};

export const getGradeRangesName = (grades) => {
  const gradesName = [];

  forEach(grades, (grade, ind) => {
    const gradeRangeName = getRangeName(grade);

    const token = gradeRangeName.split(' ');
    gradesName.push(token[0]);
  });

  const uniqueGradeRanges = uniq(gradesName);
  let gradesText = '';

  // create string
  forEach(uniqueGradeRanges, (gradeName, ind) => {
    gradesText += gradeName;
    if (ind < grades.length - 1 && uniqueGradeRanges.length > 1) {
      gradesText += ',';
    }
    gradesText += ' ';
  });

  if (uniqueGradeRanges.length === 1 && uniqueGradeRanges[0] > 'University') {
    return gradesText;
  }

  gradesText += i18n('School');
  return gradesText;
};

export default Grades;
