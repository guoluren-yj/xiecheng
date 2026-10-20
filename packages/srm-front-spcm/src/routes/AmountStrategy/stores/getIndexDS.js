/*
 * @Date: 2024-06-07 14:58:41
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import intl from 'utils/intl';
import { SRM_SPCM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const tenantId = getCurrentOrganizationId();

export const getIndexDS = () => ({
  pageSize: 20,
  selection: false,
  paging: 'server',
  childrenField: 'children',
  fields: [
    {
      name: 'strategyStatus',
      label: intl.get('hzero.common.status').d('状态'),
    },
    {
      name: 'operator',
      label: intl.get('hzero.common.button.operator').d('操作'),
    },
    {
      name: 'strategyNum',
      label: intl.get('spcm.amountStrategy.model.strategy.num').d('策略编码'),
    },
    {
      name: 'strategyName',
      label: intl.get('spcm.amountStrategy.model.strategy.name').d('策略名称'),
    },
    {
      name: 'versionNumber',
      type: 'number',
      label: intl.get('spcm.common.model.field.version').d('版本'),
    },
    {
      name: 'createdByName',
      label: intl.get('hzero.common.date.creator').d('创建人'),
    },
    {
      name: 'creationDate',
      label: intl.get('hzero.common.date.createDate').d('创建时间'),
    },
  ],
  events: {
    beforeLoad: ({ data }) => {
      data.map((item) => {
        const { children, enableFlag } = item;
        if (children) {
          children.forEach((child) => {
            child.parentEnabledFlag = enableFlag;
          });
        }
        return item;
      });
    },
  },
  transport: {
    read: ({ data }) => ({
      url: `${SRM_SPCM}/v1/${tenantId}/pc-amount-occupy-strategy/selectStrategyList`,
      method: 'GET',
      data: {
        ...data,
        customizeUnitCode: 'SPCM.AMOUNT_STRATEGY.LIST_SEARCH_BAR',
      },
    }),
  },
});
