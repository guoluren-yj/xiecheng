/*
 * @Date: 2024-06-11 15:02:42
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import querystring from 'querystring';

import intl from 'utils/intl';
import { filterNullValueObject } from 'utils/utils';

// 页面状态
const docStatus = {
  create: intl.get('hzero.common.button.create').d('新建'),
  edit: intl.get('hzero.common.button.edit').d('编辑'),
  view: intl.get('hzero.common.button.view').d('查看'),
};

// 详情页title
export const getHeaderTitle = (status, sourceKey, versionNumber) => {
  const curStatus = docStatus[status];
  if (['LIST_HISTORY', 'DETAIL_HISTORY'].includes(sourceKey)) {
    return intl
      .get('spcm.amountStrategy.view.title.viewAgreementAmountStrategy', {
        version: versionNumber,
      })
      .d(`查看协议金额策略-版本v${versionNumber}`);
  }
  return intl
    .get('spcm.amountStrategy.view.title.agreementAmountStrategy', {
      status: curStatus,
    })
    .d(`${curStatus}协议金额策略`);
};

// 详情页返回路径
export const getBackPath = (routerParam) => {
  const { sourceKey, sourceStrategyId, editFlag, parentEnabledFlag } = routerParam;
  switch (sourceKey) {
    case 'EDIT':
    case 'DETAIL_HISTORY': {
      // 从明细跳转过来，返回到明细页
      const search = querystring.stringify(
        filterNullValueObject({
          editFlag,
          sourceStrategyId,
          parentEnabledFlag,
        })
      );
      return `/spcm/amount-strategy/${sourceStrategyId}/view?${search}`;
    }
    default:
      return '/spcm/amount-strategy/list';
  }
};
