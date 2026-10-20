import intl from 'utils/intl';

export const getTabPaneList = () => [
  {
    key: 'waitFeedback',
    // customizeCode: 'SSLM_SITEINVESTIGATE_FEEDBACK_LIST.WAIT_LIST',
    searchCode: 'SSLM_SITEINVESTIGATE_FEEDBACK_LIST.WAIT_SEARCH_BAR',
    tab: intl.get('sslm.siteInvestigateReport.view.title.waitFeedback').d('待反馈'),
  },
  {
    key: 'alreadyFeedback',
    // customizeCode: 'SSLM_SITEINVESTIGATE_FEEDBACK_LIST.ALREADY_LIST',
    searchCode: 'SSLM_SITEINVESTIGATE_FEEDBACK_LIST.RATED_SEARCH_BAR',
    tab: intl.get('sslm.siteInvestigateReport.view.title.alreadyFeedback').d('已反馈'),
  },
];
