/*
 * @Date: 2024-05-22 14:30:14
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import { isNil } from 'lodash';
import querystring from 'querystring';

import intl from 'utils/intl';

import BasicInfo from './BasicInfo';
import PurSupIntRules from './PurSupIntRules';
import SupplierEvaluationRules from './SupplierEvaluationRules';
import SupplierEvaluationProgramRules from './SupplierEvaluationProgramRules';

export const getTabPanes = () => [
  {
    key: 'basicInfo',
    tab: intl.get('sslm.evaluationStrategyDetail.tabs.TabPane.basicInfo').d('基础信息'),
    component: BasicInfo,
  },
  {
    key: 'supEvaProRules',
    tab: intl
      .get('sslm.evaluationStrategyDetail.tabs.TabPane.supEvaProRules')
      .d('供应商评估计划规则'),
    component: SupplierEvaluationProgramRules,
  },
  {
    key: 'supEvaRules',
    tab: intl.get('sslm.evaluationStrategyDetail.tabs.TabPane.supEvaRules').d('供应商评估规则'),
    component: SupplierEvaluationRules,
  },
  {
    key: 'purSupIntRules',
    tab: intl.get('sslm.evaluationStrategyDetail.tabs.TabPane.purSupIntRules').d('采供方交互规则'),
    component: PurSupIntRules,
  },
];

// 页面状态
const docStatus = {
  create: intl.get('hzero.common.button.create').d('新建'),
  edit: intl.get('hzero.common.button.edit').d('编辑'),
  view: intl.get('hzero.common.button.view').d('查看'),
  copy: intl.get('hzero.common.button.copy').d('复制'),
};

// 页面标题
export const getTitle = (status, jumpSource, versionNum) => {
  const curStatus = docStatus[status];
  if (['LIST_HISTORY', 'DETAIL_HISTORY'].includes(jumpSource) && !isNil(versionNum)) {
    return intl
      .get('sslm.common.view.title.viewPolicy', {
        version: versionNum,
      })
      .d(`查看策略-版本v${versionNum}`);
  }
  return intl
    .get('sslm.common.view.title.policy', {
      status: curStatus,
    })
    .d(`${curStatus}策略`);
};

// 详情页返回路径
export const getBackPath = ({ jumpSource, sourceStrategyId, draftId, editFlag, isPub }) => {
  if (isPub) {
    return '';
  }
  switch (jumpSource) {
    case 'DETAIL_HISTORY': {
      // 从明细历史记录跳转过来，返回到明细页
      const search = querystring.stringify({
        editFlag,
        draftId,
        sourceStrategyId,
        strategyId: sourceStrategyId,
      });
      return `/sslm/evaluation-strategy/details/view?${search}`;
    }
    default:
      return '/sslm/evaluation-strategy/list';
  }
};
