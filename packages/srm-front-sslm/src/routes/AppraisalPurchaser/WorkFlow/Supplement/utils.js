/*
 * @Date: 2024-02-06 20:49:34
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import intl from 'utils/intl';
import Basic from './components/Basic';
import ScoreResult from './components/ScoreResult';

// 信息补录
export const getSupplementList = () => [
  {
    key: 'basicInfo',
    title: intl.get('sslm.common.view.title.baseInfo').d('基础信息'),
    component: Basic,
    componentProps: {
      customizeUnitCode: 'SSLM.APPRAISAL_PURCHASER.CUSTOM_SUPPLEMENT.BASIC',
    },
  },
  {
    key: 'scoreResult',
    title: intl.get('sslm.common.view.title.scoreResult').d('评分结果'),
    component: ScoreResult,
    componentProps: {
      customizeUnitCode: 'SSLM.APPRAISAL_PURCHASER.CUSTOM_SUPPLEMENT.SCORE_RESULT_LIST',
    },
  },
];
