/*
 * @Date: 2024-03-15 11:12:44
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import querystring from 'querystring';
import { isNil } from 'lodash';

import intl from 'utils/intl';

import ApplyScope from './ApplyScope';
import ApplyStage from './ApplyStage';
import SetProcess from './SetProcess';
import BasicInfo from './BasicInfo';

export const getTabPaneList = () => [
  {
    key: 'basicInfo',
    title: intl.get('sslm.common.view.title.baseInfo').d('基础信息'),
    component: BasicInfo,
  },
  {
    key: 'applyScope',
    title: intl.get('sslm.supplierLifePolicyConfig.modal.tabTitle.applyScope').d('适用范围'),
    component: ApplyScope,
  },
  {
    key: 'applyStage',
    title: intl.get('sslm.supplierLifePolicyConfig.modal.tabTitle.applyStage').d('适用阶段'),
    component: ApplyStage,
  },
  {
    key: 'setProcess',
    title: intl.get('sslm.supplierLifePolicyConfig.modal.tabTitle.setProcess').d('流程设置'),
    component: SetProcess,
  },
];

// 页面状态
const docStatus = {
  create: intl.get('hzero.common.button.create').d('新建'),
  edit: intl.get('hzero.common.button.edit').d('编辑'),
  view: intl.get('hzero.common.button.view').d('查看'),
};

// 详情页title
export const getHeaderTitle = (status, jumpSource, versionNum) => {
  const curStatus = docStatus[status];
  if (['LIST_HISTORY', 'DETAIL_HISTORY'].includes(jumpSource) && !isNil(versionNum)) {
    return intl
      .get('sslm.supplierLifePolicyConfig.view.title.viewPolicy', {
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
export const getBackPath = ({ jumpSource, sourceStrategyId, editFlag }) => {
  switch (jumpSource) {
    case 'DETAIL_HISTORY': {
      // 从明细历史记录跳转过来，返回到明细页
      const search = querystring.stringify({
        sourceStrategyId,
        editFlag,
      });
      return `/sslm/supplier-life-policy-config/detail/${sourceStrategyId}/view?${search}`;
    }
    default:
      return '/sslm/supplier-life-policy-config/list';
  }
};
