import intersection from 'lodash/intersection';
import isEmpty from 'lodash/isEmpty';

import i18n from '~/services/i18n';
import Constants from '~/config/Constants';
import featureFlags from '~/services/FeatureFlagsService';

export default class SuperUpsell {
  static getOptions(type, {
    feat,
    variant = '',
    openInNewTab = false,
    isEligibleForTrial,
    featureInfo = null,
    isQuizPremium = false,
  }) {
    const options = {
      feat,
      variant,
      openInNewTab,
    };

    const superUpgradeText = isEligibleForTrial ? 'Get a free trial of' : 'UPGRADE to';
    const superUpgradeText2 = isEligibleForTrial ? 'Get free Super trial' : 'GO SUPER';

    const showIndividualPlan = featureFlags().isEnabled(Constants.FeatureFlagsTypes.SHOW_INDIVIDUAL_PLAN);
    switch (type) {
      case Constants.SuperUpsellTypes.THEMES:
        options.topSectionTitle = i18n(superUpgradeText);
        options.topSectionLabel = i18n('SUPER');
        options.topSectionSubtitle = i18n('Graduate from your Basic plan.');
        options.topSectionIcon = 'https://cf.quizizz.com/img/icons/bolt.png';
        options.middleSectionTitle = i18n('Boost engagement with fun dashboard themes');
        options.middleSectionSubtitle = i18n('Reopen assignments, share reports, hard timer, and more.');
        options.featureInfo = [
          {
            icon: 'far fa-hand-paper',
            text: i18n('Remove ads for you and your students'),
          },
          {
            icon: 'far fa-infinity',
            text: i18n('Keep assignments open for as long as you like'),
          },
          {
            icon: 'far fa-tags',
            text: i18n('Level-up with custom tags and standards'),
          },
        ];
        break;

      case Constants.SuperUpsellTypes.BULK_ADD_TELEPORT:
        options.topSectionTitle = i18n(superUpgradeText);
        options.topSectionLabel = i18n('SUPER');
        options.topSectionSubtitle = i18n('Graduate from your Basic plan.');
        options.topSectionIcon = 'https://cf.quizizz.com/img/icons/bolt.png';
        options.middleSectionTitle = i18n('Bulk add super questions in your quizzes and lessons');
        options.middleSectionSubtitle = i18n('Reopen assignments, fun dashboard themes, share reports, and more.');
        options.featureInfo = [
          {
            icon: 'far fa-hand-paper',
            text: i18n('Remove ads for you and your students'),
          },
          {
            icon: 'far fa-infinity',
            text: i18n('Keep assignments open for as long as you like'),
          },
          {
            icon: 'far fa-tags',
            text: i18n('Level-up with custom tags and standards'),
          },
        ];
        break;

      case Constants.SuperUpsellTypes.LESSON_THEME:
        options.topSectionTitle = i18n(superUpgradeText);
        options.topSectionLabel = i18n('SUPER');
        options.topSectionSubtitle = i18n('Graduate from your Basic plan.');
        options.topSectionIcon = 'https://cf.quizizz.com/img/icons/bolt.png';
        options.middleSectionTitle = i18n('Customize your lessons with custom fonts and themes');
        options.middleSectionSubtitle = i18n('Reopen assignments, fun dashboard themes, share reports, and more.');
        options.featureInfo = [
          {
            icon: 'far fa-hand-paper',
            text: i18n('Remove ads for you and your students'),
          },
          {
            icon: 'far fa-infinity',
            text: i18n('Keep assignments open for as long as you like'),
          },
          {
            icon: 'far fa-tags',
            text: i18n('Level-up with custom tags and standards'),
          },
        ];
        break;

      case Constants.SuperUpsellTypes.CAN_SHOW_WORK:
        options.topSectionTitle = i18n(superUpgradeText);
        options.topSectionLabel = i18n('SUPER');
        options.topSectionSubtitle = i18n('Graduate from your Basic plan.');
        options.topSectionIcon = 'https://cf.quizizz.com/img/icons/bolt.png';
        options.middleSectionTitle = i18n('Allow students to show work and upload them directly.');
        options.middleSectionSubtitle = i18n('Custom themes, topics, standards, and more.');
        options.featureInfo = [
          {
            icon: 'far fa-hand-paper',
            text: i18n('Remove ads for you and your students'),
          },
          {
            icon: 'far fa-infinity',
            text: i18n('Embed interactive video in Lessons and Quizzes'),
          },
          {
            icon: 'far fa-tags',
            text: i18n('Promote mastery with answer explanations'),
          },
        ];
        break;

      case Constants.SuperUpsellTypes.EDIT_PRESENTATION:
        options.topSectionTitle = i18n(superUpgradeText);
        options.topSectionLabel = i18n('SUPER');
        options.topSectionSubtitle = i18n('Graduate from your Basic plan.');
        options.topSectionIcon = 'https://cf.quizizz.com/img/icons/bolt.png';
        options.middleSectionTitle = i18n('Edit & customize public lessons for students');
        options.middleSectionSubtitle = i18n('Reopen assignments, fun dashboard themes, share reports, and more.');
        options.featureInfo = [
          {
            icon: 'far fa-hand-paper',
            text: i18n('Remove ads for you and your students'),
          },
          {
            icon: 'far fa-infinity',
            text: i18n('Keep assignments open for as long as you like'),
          },
          {
            icon: 'far fa-tags',
            text: i18n('Level-up with custom tags and standards'),
          },
        ];
        break;

      case Constants.SuperUpsellTypes.EDIT_QUIZ:
        options.topSectionTitle = i18n(superUpgradeText);
        options.topSectionLabel = i18n('SUPER');
        options.topSectionSubtitle = i18n('Graduate from your Basic plan.');
        options.topSectionIcon = 'https://cf.quizizz.com/img/icons/bolt.png';
        options.middleSectionTitle = i18n('Edit & customize public quizzes with Super features');
        options.middleSectionSubtitle = i18n('Reopen assignments, fun dashboard themes, share reports, and more.');
        options.featureInfo = [
          {
            icon: 'far fa-hand-paper',
            text: i18n('Remove ads for you and your students'),
          },
          {
            icon: 'far fa-infinity',
            text: i18n('Keep assignments open for as long as you like'),
          },
          {
            icon: 'far fa-tags',
            text: i18n('Level-up with custom tags and standards'),
          },
        ];
        break;

      case Constants.SuperUpsellTypes.EDIT_PREMIUM_WEEK_QUIZ:
        options.topSectionTitle = i18n(superUpgradeText);
        options.topSectionLabel = i18n('SUPER');
        options.topSectionSubtitle = i18n('Graduate from your Basic plan.');
        options.topSectionIcon = 'https://cf.quizizz.com/img/icons/bolt.png';
        options.middleSectionTitle = i18n('Edit your quizzes and lessons from Premium Question Week');
        options.middleSectionSubtitle = i18n('Reopen assignments, fun dashboard themes, share reports, and more.');
        options.featureInfo = [
          {
            icon: 'far fa-hand-paper',
            text: i18n('Remove ads for you and your students'),
          },
          {
            icon: 'far fa-infinity',
            text: i18n('Keep assignments open for as long as you like'),
          },
          {
            icon: 'far fa-tags',
            text: i18n('Level-up with custom tags and standards'),
          },
        ];
        break;

      case Constants.SuperUpsellTypes.PREMIUM_CONTENT:
        options.topSectionTitle = i18n(superUpgradeText);
        options.topSectionLabel = i18n('SUPER');
        options.topSectionSubtitle = i18n('Graduate from your Basic plan.');
        options.topSectionIcon = 'https://cf.quizizz.com/img/icons/bolt.png';
        options.middleSectionTitle = showIndividualPlan
          ? i18n('Get unlimited access to over 1.8M premium resources')
          : i18n('Get unlimited access to over 100,000 Super resources');
        options.middleSectionSubtitle = i18n('Reopen assignments, fun dashboard themes, share reports, and more.');
        options.featureInfo = [
          {
            icon: 'far fa-hand-paper',
            text: i18n('Remove ads for you and your students'),
          },
          {
            icon: 'far fa-infinity',
            text: i18n('Keep assignments open for as long as you like'),
          },
          {
            icon: 'far fa-tags',
            text: i18n('Level-up with custom tags and standards'),
          },
        ];
        break;

      case Constants.SuperUpsellTypes.AUTO_CONVERTED_CONTENT:
        options.topSectionTitle = i18n(superUpgradeText);
        options.topSectionLabel = i18n('SUPER');
        options.topSectionSubtitle = i18n('Graduate from your Basic plan.');
        options.topSectionIcon = 'https://cf.quizizz.com/img/icons/bolt.png';
        options.middleSectionTitle = i18n('Automatically convert MCQs into highly interactive questions!');
        options.middleSectionSubtitle = i18n('Custom themes, topics, standards, and more.');
        options.featureInfo = [
          {
            icon: 'far fa-hand-paper',
            text: i18n('Drag and drop. Encourage critical thinking.'),
          },
          {
            icon: 'far fa-square-caret-down',
            text: i18n('Drop down. Encourage careful selection.'),
          },
          {
            icon: 'far fa-rectangle-wide',
            text: i18n('Fill-in-the-Blanks. Check for perfect recall.'),
          },
        ];
        break;

      case Constants.SuperUpsellTypes.PRIVATE_CONTENT_QUIZ:
        options.topSectionTitle = i18n(superUpgradeText);
        options.topSectionLabel = i18n('SUPER');
        options.topSectionSubtitle = i18n('Graduate from your Basic plan.');
        options.topSectionIcon = 'https://cf.quizizz.com/img/icons/bolt.png';
        options.middleSectionTitle = i18n('Make your quiz private with Super');
        options.middleSectionSubtitle = i18n('Custom themes, topics, and more.');
        options.featureInfo = [
          {
            icon: 'far fa-hand-paper',
            text: i18n('Remove ads for you and your students'),
          },
          {
            icon: 'far fa-video',
            text: i18n('Embed interactive video in Lessons and Quizzes'),
          },
          {
            icon: 'far fa-infinity',
            text: i18n('Keep assignments open for as long as you like'),
          },
        ];
        break;

      case Constants.SuperUpsellTypes.PRIVATE_CONTENT_PRESENTATION:
        options.topSectionTitle = i18n(superUpgradeText);
        options.topSectionLabel = i18n('SUPER');
        options.topSectionSubtitle = i18n('Graduate from your Basic plan.');
        options.topSectionIcon = 'https://cf.quizizz.com/img/icons/bolt.png';
        options.middleSectionTitle = i18n('Make your lesson private with Super');
        options.middleSectionSubtitle = i18n('Custom themes, topics, and more.');
        options.featureInfo = [
          {
            icon: 'far fa-hand-paper',
            text: i18n('Remove ads for you and your students'),
          },
          {
            icon: 'far fa-video',
            text: i18n('Embed interactive video in Lessons and Quizzes'),
          },
          {
            icon: 'far fa-infinity',
            text: i18n('Keep assignments open for as long as you like'),
          },
        ];
        break;

      case Constants.SuperUpsellTypes.IMAGE_SEARCH:
        options.topSectionTitle = i18n(superUpgradeText);
        options.topSectionLabel = i18n('SUPER');
        options.topSectionSubtitle = i18n('Graduate from your Basic plan.');
        options.topSectionIcon = 'https://cf.quizizz.com/img/icons/bolt.png';
        options.middleSectionTitle = i18n('Add unlimited images and videos through search.');
        options.middleSectionSubtitle = i18n('Reopen assignments, fun dashboard themes, share reports, and more.');
        options.featureInfo = [
          {
            icon: 'far fa-hand-paper',
            text: i18n('Remove ads for you and your students'),
          },
          {
            icon: 'far fa-infinity',
            text: i18n('Keep assignments open for as long as you like'),
          },
          {
            icon: 'far fa-tags',
            text: i18n('Level-up with custom tags and standards'),
          },
        ];
        break;

      case Constants.SuperUpsellTypes.ASYNC_GAMES_UNLIMITED:
        options.topSectionTitle = i18n(superUpgradeText);
        options.topSectionLabel = i18n('SUPER');
        options.topSectionSubtitle = i18n('Graduate from your Basic plan.');
        options.topSectionIcon = 'https://cf.quizizz.com/img/icons/bolt.png';
        options.middleSectionTitle = i18n('Keep assignments open for as long as you like');
        options.middleSectionSubtitle = i18n('Reopen assignments, share reports, hard timer, and more.');
        options.featureInfo = [
          {
            icon: 'far fa-hand-paper',
            text: i18n('Remove ads for you and your students'),
          },
          {
            icon: 'far fa-stars',
            text: i18n('Boost engagement with fun dashboard themes'),
          },
          {
            icon: 'far fa-tags',
            text: i18n('Level-up with custom tags and standards'),
          },
        ];
        break;

      case Constants.SuperUpsellTypes.CUSTOM_TAGS:
        options.topSectionTitle = i18n(superUpgradeText);
        options.topSectionLabel = i18n('SUPER');
        options.topSectionSubtitle = i18n('Graduate from your Basic plan.');
        options.topSectionIcon = 'https://cf.quizizz.com/img/icons/bolt.png';
        options.middleSectionTitle = i18n('Level-up with custom tags and standards');
        options.middleSectionSubtitle = i18n('Reopen assignments, share reports, hard timer, and more.');
        options.featureInfo = [
          {
            icon: 'far fa-hand-paper',
            text: i18n('Remove ads for you and your students'),
          },
          {
            icon: 'far fa-infinity',
            text: i18n('Keep assignments open for as long as you like'),
          },
          {
            icon: 'far fa-stars',
            text: i18n('Boost engagement with fun dashboard themes'),
          },
        ];
        break;

      case Constants.SuperUpsellTypes.HARD_TIMER:
        options.topSectionTitle = i18n(superUpgradeText);
        options.topSectionLabel = i18n('SUPER');
        options.topSectionSubtitle = i18n('Graduate from your Basic plan.');
        options.topSectionIcon = 'https://cf.quizizz.com/img/icons/bolt.png';
        options.middleSectionTitle = i18n('Prepare your students to answer within time');
        options.middleSectionSubtitle = i18n('Reopen assignments, fun dashboard themes, share reports, and more.');
        options.featureInfo = [
          {
            icon: 'far fa-hand-paper',
            text: i18n('Remove ads for you and your students'),
          },
          {
            icon: 'far fa-infinity',
            text: i18n('Keep assignments open for as long as you like'),
          },
          {
            icon: 'far fa-tags',
            text: i18n('Level-up with custom tags and standards'),
          },
        ];
        break;

      case Constants.SuperUpsellTypes.QBANK:
        options.topSectionTitle = i18n(superUpgradeText);
        options.topSectionLabel = i18n('SUPER');
        options.topSectionSubtitle = i18n('Graduate from your Basic plan.');
        options.topSectionIcon = 'https://cf.quizizz.com/img/icons/bolt.png';
        options.middleSectionTitle = showIndividualPlan
          ? i18n('Make practice meaningful with adaptive quizzes')
          : i18n('Promote mastery with adaptive quizzes');
        options.middleSectionSubtitle = i18n('Reopen assignments, fun dashboard themes, share reports, and more.');
        options.featureInfo = [
          {
            icon: 'far fa-hand-paper',
            text: i18n('Remove ads for you and your students'),
          },
          {
            icon: 'far fa-infinity',
            text: i18n('Keep assignments open for as long as you like'),
          },
          {
            icon: 'far fa-tags',
            text: i18n('Level-up with custom tags and standards'),
          },
        ];
        break;

      case Constants.SuperUpsellTypes.REOPEN_GAMES:
        options.topSectionTitle = i18n(superUpgradeText);
        options.topSectionLabel = i18n('SUPER');
        options.topSectionSubtitle = i18n('Graduate from your Basic plan.');
        options.topSectionIcon = 'https://cf.quizizz.com/img/icons/bolt.png';
        options.middleSectionTitle = i18n('Re-open expired assignments at any time');
        options.middleSectionSubtitle = i18n('Fun dashboard themes, share reports, hard timer, and more.');
        options.featureInfo = [
          {
            icon: 'far fa-hand-paper',
            text: i18n('Remove ads for you and your students'),
          },
          {
            icon: 'far fa-infinity',
            text: i18n('Keep assignments open for as long as you like'),
          },
          {
            icon: 'far fa-tags',
            text: i18n('Level-up with custom tags and standards'),
          },
        ];
        break;

      case Constants.SuperUpsellTypes.ADS_FREE:
        options.topSectionTitle = i18n(superUpgradeText);
        options.topSectionLabel = i18n('SUPER');
        options.topSectionSubtitle = i18n('Graduate from your Basic plan.');
        options.topSectionIcon = 'https://cf.quizizz.com/img/icons/bolt.png';
        options.middleSectionTitle = i18n('Remove ads for you and your students');
        options.middleSectionSubtitle = i18n('Reopen assignments, share reports, hard timer, and more.');
        options.featureInfo = [
          {
            icon: 'far fa-stars',
            text: i18n('Boost engagement with fun dashboard themes'),
          },
          {
            icon: 'far fa-infinity',
            text: i18n('Keep assignments open for as long as you like'),
          },
          {
            icon: 'far fa-tags',
            text: i18n('Level-up with custom tags and standards'),
          },
        ];
        break;

      case Constants.SuperUpsellTypes.SHARE_REPORT:
        options.topSectionTitle = i18n(superUpgradeText);
        options.topSectionLabel = i18n('SUPER');
        options.topSectionSubtitle = i18n('Graduate from your Basic plan.');
        options.topSectionIcon = 'https://cf.quizizz.com/img/icons/bolt.png';
        options.middleSectionTitle = i18n('Share your reports with other teachers');
        options.middleSectionSubtitle = i18n('Reopen assignments, fun dashboard themes, hard timer, and more.');
        options.featureInfo = [
          {
            icon: 'far fa-hand-paper',
            text: i18n('Remove ads for you and your students'),
          },
          {
            icon: 'far fa-infinity',
            text: i18n('Keep assignments open for as long as you like'),
          },
          {
            icon: 'far fa-tags',
            text: i18n('Level-up with custom tags and standards'),
          },
        ];

        break;

      case Constants.SuperUpsellTypes.VIDEO:
        options.topSectionTitle = i18n(superUpgradeText);
        options.topSectionLabel = i18n('SUPER');
        options.topSectionSubtitle = i18n('Graduate from your Basic plan.');
        options.topSectionIcon = 'https://cf.quizizz.com/img/icons/bolt.png';
        options.middleSectionTitle = i18n('Embed YouTube videos in Lessons and Quizzes');
        options.middleSectionSubtitle = i18n('Reopen assignments, fun dashboard themes, share reports, and more.');
        options.featureInfo = [
          {
            icon: 'far fa-hand-paper',
            text: i18n('Remove ads for you and your students'),
          },
          {
            icon: 'far fa-infinity',
            text: i18n('Keep assignments open for as long as you like'),
          },
          {
            icon: 'far fa-tags',
            text: i18n('Level-up with custom tags and standards'),
          },
        ];

        break;

      case Constants.SuperUpsellTypes.AUDIO:
        options.topSectionTitle = i18n(superUpgradeText);
        options.topSectionLabel = i18n('SUPER');
        options.topSectionSubtitle = i18n('Graduate from your Basic plan.');
        options.topSectionIcon = 'https://cf.quizizz.com/img/icons/bolt.png';
        options.middleSectionTitle = i18n('Add voice clips and audio recordings in Lessons and Quizzes');
        options.middleSectionSubtitle = i18n('Reopen assignments, fun dashboard themes, share reports, and more.');
        options.featureInfo = [
          {
            icon: 'far fa-hand-paper',
            text: i18n('Remove ads for you and your students'),
          },
          {
            icon: 'far fa-infinity',
            text: i18n('Keep assignments open for as long as you like'),
          },
          {
            icon: 'far fa-tags',
            text: i18n('Level-up with custom tags and standards'),
          },
        ];

        break;

      case Constants.SuperUpsellTypes.MATCH_QUESTION:
      case Constants.SuperUpsellTypes.REORDER_QUESTION:
        options.topSectionTitle = i18n(superUpgradeText);
        options.topSectionLabel = i18n('SUPER');
        options.topSectionSubtitle = i18n('Graduate from your Basic plan.');
        options.topSectionIcon = 'https://cf.quizizz.com/img/icons/bolt.png';
        options.middleSectionTitle = showIndividualPlan
          ? i18n('Engage students in critical thinking with Match and Reorder')
          : i18n('Push students to engage in critical thinking with Match and Reorder');

        options.middleSectionSubtitle = i18n('Custom themes, topics, standards, and more');
        options.featureInfo = [
          {
            icon: 'far fa-hand-paper',
            text: i18n('Remove ads for you and your students'),
          },
          {
            icon: 'far fa-infinity',
            text: i18n('Embed interactive video in Lessons and Quizzes'),
          },
          {
            icon: 'far fa-tags',
            text: i18n('Promote mastery with answer explanations'),
          },
        ];
        break;

      case Constants.SuperUpsellTypes.DRAGNDROP_QUESTION:
      case Constants.SuperUpsellTypes.DROPDOWN_QUESTION:
      case Constants.SuperUpsellTypes.HOTSPOT_QUESTION:
      case Constants.SuperUpsellTypes.DND_IMAGE_QUESTION: {
        let questionTypeName = i18n('Drag and drop');
        let videoAssetIdentifier = 'dnd';
        if (type === Constants.SuperUpsellTypes.DROPDOWN_QUESTION) {
          questionTypeName = i18n('Drop down');
          videoAssetIdentifier = 'dd';
        }
        if (type === Constants.SuperUpsellTypes.HOTSPOT_QUESTION) {
          questionTypeName = i18n('Hotspot');
          videoAssetIdentifier = 'hotspot';
        }
        if (type === Constants.SuperUpsellTypes.DND_IMAGE_QUESTION) {
          questionTypeName = i18n('Labeling');
          videoAssetIdentifier = 'dnd_image';
        }
        if (type === Constants.SuperUpsellTypes.GRAPHING_QUESTION) {
          questionTypeName = i18n('Graphing');
          videoAssetIdentifier = 'graphing';
        }
        options.topSectionTitle = i18n(superUpgradeText);
        options.topSectionLabel = i18n('SUPER');
        options.topSectionSubtitle = i18n('Graduate from your Basic plan.');
        options.topSectionIcon = 'https://cf.quizizz.com/img/icons/bolt.png';
        options.middleSectionTitle = i18n('Encourage critical thinking with easy to use {$1} questions!', [questionTypeName]);
        options.video = `https://cf.quizizz.com/videos/qtype/${videoAssetIdentifier}.min.mp4`;
        options.featureInfo = [];
        break;
      }

      case Constants.SuperUpsellTypes.GRAPHING_QUESTION: {
        const videoAssetIdentifier = 'graphing';
        options.topSectionTitle = i18n(superUpgradeText);
        options.topSectionLabel = i18n('SUPER');
        options.topSectionSubtitle = i18n('Graduate from your Basic plan.');
        options.topSectionIcon = 'https://cf.quizizz.com/img/icons/bolt.png';
        options.middleSectionTitle = i18n('It’s a LINE? It’s a PLANE? It’s the GRAPHING question type!');
        options.video = `https://cf.quizizz.com/videos/qtype/${videoAssetIdentifier}.min.mp4`;
        options.featureInfo = [];
        break;
      }

      case Constants.SuperUpsellTypes.LMS_CUSTOM_GRADING:
        options.topSectionTitle = i18n(superUpgradeText);
        options.topSectionLabel = i18n('SUPER');
        options.topSectionSubtitle = i18n('Graduate from your Basic plan.');
        options.topSectionIcon = 'https://cf.quizizz.com/img/icons/bolt.png';
        options.middleSectionTitle = i18n('Choose how you grade assignments');
        options.middleSectionSubtitle = i18n('Custom themes, tags, standards, and more.');
        options.featureInfo = [
          {
            icon: 'far fa-hand-paper',
            text: i18n('Remove ads for you and your students'),
          },
          {
            icon: 'far fa-video',
            text: i18n('Embed interactive video in Lessons and Quizzes'),
          },
          {
            icon: 'far fa-abacus',
            text: i18n('Promote mastery with answer explanations'),
          },
        ];
        break;

      case Constants.SuperUpsellTypes.PLAY_QUIZ:
        options.topSectionTitle = i18n(superUpgradeText);
        options.topSectionLabel = i18n('SUPER');
        options.topSectionSubtitle = i18n('Graduate from your Basic plan.');
        options.topSectionIcon = 'https://cf.quizizz.com/img/icons/bolt.png';
        options.middleSectionTitle = showIndividualPlan
          ? i18n('Get unlimited access to over 1.8M premium resources')
          : i18n('Get unlimited access to over 100,000 Super resources');
        options.middleSectionSubtitle = i18n('Reopen assignments, tag standards, use themes and more.');
        options.featureInfo = [
          {
            icon: 'far fa-hand-paper',
            text: i18n('Remove ads for you and your students'),
          },
          {
            icon: 'far fa-video',
            text: i18n('Embed interactive videos in Lessons and Quizzes'),
          },
          {
            icon: 'far fa-abacus',
            text: i18n('Promote mastery with adaptive quizzes'),
          },
        ];
        break;

      case Constants.SuperUpsellTypes.AUDIO_QUESTION:
      case Constants.SuperUpsellTypes.VIDEO_QUESTION:
        options.topSectionTitle = i18n(superUpgradeText);
        options.topSectionLabel = i18n('SUPER');
        options.topSectionSubtitle = i18n('Graduate from your Basic plan.');
        options.topSectionIcon = 'https://cf.quizizz.com/img/icons/bolt.png';
        options.middleSectionTitle = i18n('Encourage higher order thinking with audio and video responses');
        options.middleSectionSubtitle = '';
        options.featureInfo = [];
        options.video = 'https://cf.quizizz.com/join/img/misc/aud_vid_super.mp4';
        break;

      case Constants.SuperUpsellTypes.EDIT_RUNNING_QUESTION:
        options.topSectionTitle = i18n(superUpgradeText);
        options.topSectionLabel = i18n('SUPER');
        options.topSectionSubtitle = i18n('Graduate from your Basic plan.');
        options.topSectionIcon = 'https://cf.quizizz.com/img/icons/bolt.png';
        options.middleSectionTitle = i18n('Make realtime changes to questions in a running assignment');
        options.middleSectionSubtitle = i18n('+ Custom themes, add explanations, audio recordings and more.');
        options.featureInfo = [
          {
            icon: 'fas fa-infinity',
            text: i18n('Keep assignments open for as long as you like'),
          },
          {
            icon: 'fas fa-calendar-day',
            text: i18n('Re-open expired assignments at any time'),
          },
          {
            icon: 'fas fa-tags',
            text: i18n('Level-up reports with custom tags and standards'),
          },
        ];
        break;

      case Constants.SuperUpsellTypes.REFERRAL_UPSELL:
        options.topSectionTitle = i18n(superUpgradeText);
        options.topSectionLabel = i18n('SUPER');
        options.topSectionIcon = 'https://cf.quizizz.com/img/icons/bolt.png';
        options.topSectionSubtitle = i18n('Graduate from your Basic plan.');
        options.topSectionMainTitle = i18n('REFER & EARN SUPER');
        options.topSectionHeadingPrimary = i18n('Free');
        options.topSectionHeadingSecondary = i18n('One month, for every successful referral');
        options.topSectionPoints = [
          {
            icon: 'far fa-hand-paper',
            text: i18n('Share your unique referral link with other teachers'),
          },
          {
            icon: 'fal fa-video',
            text: i18n('They register as a teacher using that link and host a game on Quizizz'),
          },
          {
            icon: 'fal fa-abacus',
            text: i18n('After completion, you both get a FREE month of Super!'),
          },
        ];
        options.referrBtn = i18n('Get Super for free');
        options.bottomSectionHeading = i18n('Or upgrade with our subscription plan');
        options.bottomSectionCurrencyType = i18n('US Dollars');
        options.bottomSectionCurrencySubheading = i18n('Per month, billed annually ($24 per year)');
        options.BotttomSectionBtnText = i18n('Buy Super');
        break;

      case Constants.SuperUpsellTypes.CLASSES_UPSELLL:
        options.topSectionTitle = i18n(superUpgradeText);
        options.topSectionLabel = i18n('SUPER');
        options.topSectionSubtitle = i18n('Graduate from your Basic plan.');
        options.topSectionIcon = 'https://cf.quizizz.com/img/icons/bolt.png';
        options.middleSectionTitle = i18n('Unlock reports for every student');
        options.middleSectionSubtitle = i18n('Reopen assignments, fun dashboard themes, share reports, and more.');
        options.featureInfo = [
          {
            icon: 'far fa-chart-line-up',
            text: i18n('Visualize Recent Performance'),
          },
          {
            icon: 'fal fa-file-alt',
            text: i18n('View Student Activity across Games'),
          },
        ];
        break;

      case Constants.SuperUpsellTypes.SIGNUP_UPSELL:
        options.topSectionTitle = i18n('Want something twice as nice? ');
        options.topSectionLabelTitle = i18n(superUpgradeText2);
        options.leftSectionImage = 'https://cf.quizizz.com/img/illustrations/super_pricing_prompt_background.png';
        options.leftSectionText = i18n('“Shout out to @quizizz for being so easy to use during remote learning... It allows my students to work whenever they are free, at their own pace, and as many times as they want...”');
        options.leftSectionUserIcon = 'https://cf.quizizz.com/img/super/pricing/sara_golden.png';
        options.leftSectionUserText = i18n('Sara Golden, High School Math');
        options.rightSectionPoints = [
          {
            imgName: 'clock',
            text: i18n('Enjoy additional tools for asynchronous learning'),
          },
          {
            imgName: 'content-box',
            text: i18n('Gain unlimited access to every quiz and Lesson in the library'),
          },
          {
            imgName: 'magnify',
            text: i18n('Utilize Answer explanations and flexible assignment settings'),
          },
          {
            imgName: 'themeMedal',
            text: i18n('Personalize learning with adaptive question banks'),
          },
          {
            imgName: 'media',
            text: i18n('Use interactive Videos and Audios in your questions'),
          },
          {
            imgName: 'noAds',
            text: i18n('Ad-free for you and your students'),
          },
          {
            imgName: 'tag',
            text: i18n('Make your games stand out with new themes'),
          },
        ];
        options.goSuperBtn = i18n(superUpgradeText2);
        break;

      case Constants.SuperUpsellTypes.SKIP_QUESTION:
        options.topSectionTitle = i18n(superUpgradeText);
        options.topSectionLabel = i18n('SUPER');
        options.topSectionSubtitle = i18n('Graduate from your Basic plan.');
        options.topSectionIcon = 'https://cf.quizizz.com/img/icons/bolt.png';
        options.middleSectionTitle = i18n('Allow students to skip questions and attempt later.');
        options.middleSectionSubtitle = i18n('Reopen assignments, fun dashboard themes, share reports, and more.');
        options.featureInfo = [
          {
            icon: 'far fa-hand-paper',
            text: i18n('Remove ads for you and your students'),
          },
          {
            icon: 'far fa-infinity',
            text: i18n('Keep assignments open for as long as you like'),
          },
          {
            icon: 'far fa-tags',
            text: i18n('Level-up with custom tags and standards'),
          },
        ];
        break;

      case Constants.SuperUpsellTypes.SCHEDULE_LATER:
        options.topSectionTitle = i18n(superUpgradeText);
        options.topSectionLabel = i18n('SUPER');
        options.topSectionSubtitle = i18n('Graduate from your Basic plan');
        options.topSectionIcon = 'https://cf.quizizz.com/img/icons/bolt.png';
        options.middleSectionTitle = i18n('Schedule your game to save time and plan ahead!');
        options.middleSectionSubtitle = i18n('Custom themes, topics, standards, and more');
        options.featureInfo = [
          {
            icon: 'far fa-hand-paper',
            text: i18n('Remove ads for you and your students'),
          },
          {
            icon: 'far fa-video',
            text: i18n('Embed interactive video in Lessons and Quizzes'),
          },
          {
            icon: 'far fa-abacus',
            text: i18n('Custom themes, topics, standards, and more'),
          },
        ];
        break;

      case Constants.SuperUpsellTypes.UPGRADE_TO_PUBLISH_QUIZ_WITH_SUPER_QUESTIONS:
        options.topSectionTitle = i18n(superUpgradeText);
        options.topSectionLabel = i18n('SUPER');
        options.topSectionSubtitle = i18n('Graduate from your Basic plan');
        options.topSectionIcon = 'https://cf.quizizz.com/img/icons/bolt.png';
        options.middleSectionTitle = i18n('Your quiz contains the following Super features:');
        options.hideSndButton = true;
        options.showContinueButton = true;
        options.featureInfo = featureInfo || [];
        options.isQuizPremium = isQuizPremium;
        break;

      case Constants.SuperUpsellTypes.DEADLINE_NONE:
        options.topSectionTitle = i18n(superUpgradeText);
        options.topSectionLabel = i18n('SUPER');
        options.topSectionSubtitle = i18n('Graduate from your Basic plan');
        options.topSectionIcon = 'https://cf.quizizz.com/img/icons/bolt.png';
        options.middleSectionTitle = i18n('Go with no-deadline for your game!');
        options.middleSectionSubtitle = i18n('Custom themes, topics, standards, and more');
        options.featureInfo = [
          {
            icon: 'far fa-hand-paper',
            text: i18n('Remove ads for you and your students'),
          },
          {
            icon: 'far fa-video',
            text: i18n('Embed interactive video in Lessons and Quizzes'),
          },
          {
            icon: 'far fa-abacus',
            text: i18n('Custom themes, topics, standards, and more'),
          },
        ];
        break;

      case Constants.SuperUpsellTypes.OPTIONS_GENERATOR_UPSELL:
        options.topSectionTitle = i18n(superUpgradeText);
        options.topSectionLabel = i18n('SUPER');
        options.topSectionSubtitle = i18n('Graduate from your Basic plan');
        options.topSectionIcon = 'https://cf.quizizz.com/img/icons/bolt.png';
        options.middleSectionTitle = i18n('Save time on creation by using the option generator');
        options.middleSectionSubtitle = i18n('Custom themes, topics, standards, and more');
        options.featureInfo = [
          {
            icon: 'far fa-hand-paper',
            text: i18n('Remove ads for you and your students'),
          },
          {
            icon: 'far fa-video',
            text: i18n('Embed interactive video in Lessons and Quizzes'),
          },
          {
            icon: 'far fa-abacus',
            text: i18n('Custom themes, topics, standards, and more'),
          },
        ];
        break;

      case Constants.SuperUpsellTypes.TOP_CREATOR_UPSELL:
        options.topSectionTitle = i18n('Upgrade for a better experience');
        options.topSectionLabel = i18n('SUPER');
        options.topSectionSubtitle = i18n('Graduate from your Basic plan');
        options.topSectionIcon = 'https://cf.quizizz.com/img/icons/bolt.png';
        options.middleSectionTitle = i18n('Search from all content created by teachers in your District');
        options.middleSectionSubtitle = i18n('Quizizz paid plans also get you:');
        options.featureInfo = [
          {
            icon: 'far fa-hand-paper',
            text: i18n('Remove ads for you and your students'),
          },
          {
            icon: 'far fa-video',
            text: i18n('Embed interactive video in Lessons and Quizzes'),
          },
          {
            icon: 'far fa-abacus',
            text: i18n('Custom themes, topics, standards, and more'),
          },
        ];
        break;

      default:
    }

    this.populateNewUpsellConfig(options);

    return options;
  }

  /**
   * [Super to School]
   * New Upsell for US only (conditional featureFlag -> showIndividualPlan)
   */
  static populateNewUpsellConfig(options) {
    const showIndividualPlan = featureFlags().isEnabled(Constants.FeatureFlagsTypes.SHOW_INDIVIDUAL_PLAN);
    if (showIndividualPlan) {
      const newUpsellConfig = {
        topSectionTitle: i18n('Upgrade for a better experience'),
        topSectionSubtitle: i18n('Graduate from your Basic plan.'),
        middleSectionSubtitle: i18n('Standards aligned content, LMS integrations, enhanced collaboration'),
        middleSectionListTitle: i18n('Quizizz paid plans also get you:'),
        featureInfo: [
          {
            icon: 'fas fa-bolt-lightning',
            text: i18n('Access to 1.8M premium resources'),
          },
          {
            icon: 'fas fa-calendar',
            text: i18n('Flexible deadlines and assignment options'),
          },
          {
            icon: 'fas fa-messages-question',
            text: i18n('Unrestricted access to 10+ question types'),
          },
        ],
      };

      const commonConfig = intersection(Object.keys(newUpsellConfig), Object.keys(options));

      // update only non-empty configs
      commonConfig.forEach((config) => {
        if (!isEmpty(options[config])) {
          options[config] = newUpsellConfig[config];
        }
      });
    }
  }
}
