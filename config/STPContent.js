import NodeEnvs from '~/config/NodeEnvs';

/**
 * Lesson links

PL Trainer - https://quizizz.com/admin/presentation/6458c519f0a6f9001dc7a7f1/stptrainer-lessonpl
IT Trainer - https://quizizz.com/admin/presentation/6458c4c913f294001d26aa83/stptrainer-lessonit
ID Trainer - https://quizizz.com/admin/presentation/6458c4838c8d31001e0ed66b/stptrainer-lessonid
ES Trainer - https://quizizz.com/admin/presentation/6458c3aa66616a001d26fc5c/stptrainer-lessones
VN Trainer - https://quizizz.com/admin/presentation/6458c1c36e3e35001d55229b/stptrainer-lessonvn
TH Trainer - https://quizizz.com/admin/presentation/6458c33d13f294001d2642b2/stptrainer-lessonth

PL Trainee - https://quizizz.com/admin/presentation/6458d0ef89b489001dc1bbb1/stptraining-lessonpl
IT Trainee - https://quizizz.com/admin/presentation/6458cf38f1231c001db9000c/stptraining-lessonit
ID Training - https://quizizz.com/admin/presentation/6458ccf1851ed6001e6cc648/stptraining-lessonid
ES Trainee - https://quizizz.com/admin/presentation/6458cab4cbe881001d54f5e5/stptraining-lessones
VN Training - https://quizizz.com/admin/presentation/6458c7fa662db4001e258749/stptraining-lessonvn
TH Trainee - https://quizizz.com/admin/presentation/6458c5638b337f001d37dfc8/stptraining-lessonth

 */

const countryVsTraineeLessonId = {
  PL: '6458d0ef89b489001dc1bbb1',
  IT: '6458cf38f1231c001db9000c',
  ID: '6458ccf1851ed6001e6cc648',
  ES: '6458cab4cbe881001d54f5e5',
  VN: '6458c7fa662db4001e258749',
  TH: '6458c5638b337f001d37dfc8',
};

function prodTraineeLesson(country) {
  return countryVsTraineeLessonId[country] || '63ee147743b47e001da0ef7c';
}

const countryVsTrainerLessonId = {
  PL: '6458c519f0a6f9001dc7a7f1',
  IT: '6458c4c913f294001d26aa83',
  ID: '6458c4838c8d31001e0ed66b',
  ES: '6458c3aa66616a001d26fc5c',
  VN: '6458c1c36e3e35001d55229b',
  TH: '6458c33d13f294001d2642b2',
};

function prodTrainerLesson(country) {
  return countryVsTrainerLessonId[country] || '63ee145ad81383001d07de5b';
}

function devLesson() {
  return '6062d4f5900d5f1305ab7ae6';
}

export default {
  trainee: {
    [NodeEnvs.PROD]: prodTraineeLesson,
    [NodeEnvs.DEV]: devLesson,
    [NodeEnvs.LOCAL]: devLesson,
  },
  trainer: {
    [NodeEnvs.PROD]: prodTrainerLesson,
    [NodeEnvs.DEV]: devLesson,
    [NodeEnvs.LOCAL]: devLesson,
  },
};
