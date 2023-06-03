/**
 * Page title to be used for google analytics
 * Add page names from the route object with the page title to be send for Google Analytics
 */
const PageTitles = {
  admin: 'Find a Quiz - Quizizz',
  'admin-quizType-id-slug': 'Quiz Page - Quizizz',
  'admin-quizType-start_new-id': 'Start Live Game — Quizizz',
  'admin-quizType-id-settings': 'Start Live Game — Quizizz',
  'admin-quizType-tp-id': 'Start Live Game — Quizizz',
  'admin-quizType-homework-id': 'Start Homework Game — Quizizz',
  'admin-quizType-id-homework-settings': 'Start Homework Game — Quizizz',
  'admin-search-term': 'Search Results — Quizizz',
  'admin-sectionName-id': 'Find a Quiz',
  'forgot-password': 'Forgot Password - Quizizz',
  'delete-account': 'Delete Account - Quizizz',
  reactivate: 'Reactivate Account - Quizizz',
  reactivated: 'Account Reactivated - Quizizz',
  'forWork-plans': 'Quizizz for work: plans',
  signup: 'Create an Account - Quizizz',
  'signup-occupation': 'Your Occupation - Quizizz',
  'signup-teacher-1': 'Sign up as a Teacher - Quizizz',
  'signup-student-1': 'Sign up as a Student - Quizizz',
  'signup-admin-1': 'Sign up as an Administrator - Quizizz',
  'signup-parent-1': 'Sign up as a Parent - Quizizz',
  'signup-corporate-1': 'Create a Corporate Account - Quizizz',
  'signup-other-1': 'Create a Personal Account - Quizizz',
  login: 'Login to your Account - Quizizz',
};

export const getSourcePageTitle = (source) => {
  switch (source) {
    case 'pld_more_quizzes':
      return 'LiveDashboardPage';
    case 'quiz_share':
      return 'QuizPageShare';
    case 'lesson_share':
      return 'LessonPageShare';
    case 'collection_share':
      return 'CollectionPageShare';
    case 'profile_share':
      return 'ProfilePageShare';
    case 'school_pricing_cta_copy_link_1':
    case 'school_pricing_cta_copy_link_2':
      return 'SchoolPricingCTACopy';
    case 'school_pricing_cta_email_1':
    case 'school_pricing_cta_email_2':
      return 'SchoolPricingCTAEmail';
    case 'admin':
      return 'AdminPage';
    case 'search':
      return 'SearchPage';
    case 'content_creation':
      return 'ContentCreationModal';
    case 'curriculum':
      return 'CurriculumPage';
    default:
      return undefined;
  }
};

export const getPageTitleForInhouseEvents = (pathname, query) => {
  if (pathname.includes('/admin/private')) {
    return 'MyQuizizzPage';
  } if (pathname.includes('/admin/search/')) {
    if (query && query.source === 'pld_more_quizzes') {
      return 'MoreQuizResultPage';
    }
    return 'SearchPage';
  } if (pathname.includes('/admin/quiz/start_new/')) {
    return 'StartLiveGamePage';
  } if (pathname.includes('/admin/quiz/homework/')) {
    return 'StartHomeworkGamePage';
  } if (pathname.includes('/admin/quiz/paper_mode/' || pathname.includes('/admin/presentation/paper_mode/'))) {
    return 'PaperModeSettingPage';
  } if (pathname.match(/\/quiz\/[a-zA-Z0-9]+\/startV4/)) {
    return 'LiveDashboardPage';
  } if (pathname.match(/\/quiz\/[a-zA-Z0-9]+\/team/)) {
    return 'TeamDashboardPage';
  } if (pathname.includes('/contest')) {
    return 'ContestPage';
  } if (pathname.includes('/admin/quiz/')) {
    if (pathname.includes('/admin/quiz/tp')) {
      return 'StartLiveInstructorPage';
    }
    return 'QuizPage';
  } if (pathname.includes('/curriculum/')) {
    if (pathname.match(/\/curriculum\/.*?\/.*?\/.*?\/.+?/)) {
      return 'CurriculumTopicPage';
    }

    return 'CurriculumPage';
  } if (pathname.includes('/admin/presentation/')) {
    return 'PresentationPage';
  } if (pathname.includes('/admin/collections')) {
    return 'CollectionsPage';
  } if (pathname.includes('/admin/memes')) {
    return 'MemesPage';
  } if (pathname.includes('/admin/reports')) {
    return 'ReportsPage';
  } if (pathname.match(/\/admin\/classes\/[a-zA-Z0-9]+\/?/)) {
    return 'ClassPage';
  } if (pathname.includes('/admin/classes')) {
    return 'ClassesPage';
  } if (pathname.includes('/admin/subscription/manage')) {
    return 'ManageSubscription';
  } if (pathname.startsWith('/super-trainer')) {
    return 'SuperTrainer';
  } if (pathname.includes('/admin')) {
    if (query?.activeTab === 'SharedLibrary') {
      return 'SharedLibraryPage';
    }
    if (pathname.match(/\/admin\/[a-zA-Z0-9]+\/[a-zA-Z0-9]+\/?/)) {
      return 'FeaturedSubjectPage';
    }

    return 'FeaturedPage';
  } if (pathname.includes('/profile')) {
    return 'ProfilePage';
  } if (pathname.includes('/signup')) {
    return 'SignupPage';
  } if (pathname.includes('/login')) {
    return 'LoginPage';
  } if (pathname.includes('/forgot-password')) {
    return 'ForgotPasswordPage';
  } if (pathname.includes('/email-verified')) {
    return 'EmailVerifiedPage';
  } if (pathname.includes('/reset-password')) {
    return 'ResetPasswordPage';
  } if (pathname.includes('/reactivate')) {
    return 'ReactivatePage';
  } if (pathname.includes('/reactivated')) {
    return 'ReactivatedPage';
  } if (pathname.includes('/delete-account')) {
    return 'DeletePage';
  } if (pathname.includes('/settings')) {
    return 'SettingsPage';
  } if (pathname.includes('/collection/')) {
    return 'CollectionsPublicPage';
  } if (pathname.includes('/resources')) {
    return 'ResourcesPage';
  } if (pathname.includes('/forWork/plans')) {
    return 'QfwPricingPage';
  } if (pathname.match(/\/quiz\/[a-zA-Z0-9]+\/edit/)) {
    return 'Editor';
  } if (pathname.match(/\/presentation\/[a-zA-Z0-9]+\/edit/)) {
    return 'Presentation';
  } if (pathname.match(/\/(?![^?])/)) {
    return 'HomePage';
  }
};

export default PageTitles;
