/*
 * @Date: 2023-11-03 14:13:35
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import intl from 'utils/intl';

export const getTabPaneList = () => [
  {
    key: 'new',
    customizeCode: 'SSLM.APPRAISAL_PURCHASER_LIST.NEW',
    searchCode: 'SSLM.APPRAISAL_PURCHASER_LIST.NEW_SEARCH',
    tab: intl.get('hzero.common.button.create').d('新建'),
  },
  {
    key: 'scoring',
    customizeCode: 'SSLM.APPRAISAL_PURCHASER_LIST.SCORING',
    searchCode: 'SSLM.APPRAISAL_PURCHASER_LIST.SCORING_SEARCH',
    tab: intl.get('sslm.common.view.field.scoring').d('评分中'),
  },
  {
    key: 'scored',
    customizeCode: 'SSLM.APPRAISAL_PURCHASER_LIST.SCORE_COMPLETED',
    searchCode: 'SSLM.APPRAISAL_PURCHASER_LIST.SCORE_COMPLETED_SEARCH',
    tab: intl.get('sslm.common.view.field.scoreCompleted').d('评分完成'),
  },
  {
    key: 'publish',
    customizeCode: 'SSLM.APPRAISAL_PURCHASER_LIST.RESULT_RELEASE',
    searchCode: 'SSLM.APPRAISAL_PURCHASER_LIST.RESULT_RELEASE_SEARCH',
    tab: intl.get('sslm.common.view.field.resultRelease').d('结果发布'),
  },
  {
    key: 'all',
    customizeCode: 'SSLM.APPRAISAL_PURCHASER_LIST.ALL',
    searchCode: 'SSLM.APPRAISAL_PURCHASER_LIST.ALL_SEARCH',
    tab: intl.get('sslm.common.view.message.all').d('全部'),
  },
];
