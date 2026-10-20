/*
 * @Date: 2022-09-20 13:41:56
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import intl from 'utils/intl';
import { SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();
const customizeUnitCode = ['SSLM.SUPPLIER_LIFE_POLICY_CONFIG.SEARCH_BAR'].join(',');

export const getListDS = () => ({
  selection: false,
  pageSize: 20,
  paging: 'server',
  primaryKey: 'strategyId',
  childrenField: 'lifeCycleStrategy',
  fields: [
    {
      name: 'strategyCode',
      required: true,
      format: 'uppercase',
      label: intl.get('sslm.supplierLifePolicyConfig.modal.list.policyNum').d('策略编码'),
      dynamicProps: {
        disabled: ({ record }) => record.get('strategyId'),
      },
    },
    {
      name: 'strategyName',
      type: 'intl',
      required: true,
      label: intl.get('sslm.supplierLifePolicyConfig.modal.list.policyDesc').d('策略描述'),
    },
    {
      name: 'strategyStatus',
      lookupCode: 'SSLM.LIFE_CYCLE_STRATEGY_STATUS',
      label: intl.get('hzero.common.status').d('状态'),
    },
    {
      name: 'versionNumber',
      type: 'number',
      label: intl.get('sslm.supplierLifePolicyConfig.modal.list.vision').d('版本'),
    },
    {
      name: 'orderSeq',
      type: 'number',
      required: true,
      min: 0,
      step: 1,
      numberGrouping: false,
      label: intl.get('sslm.supplierLifePolicyConfig.modal.list.priority').d('优先级'),
    },
    {
      name: 'enabledFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 1,
      label: intl.get('hzero.common.status.enable').d('启用'),
    },
    {
      name: 'action',
      label: intl.get('hzero.common.button.action').d('操作'),
    },
  ],
  transport: {
    read: ({ data }) => ({
      url: `${SRM_SSLM}/v1/${organizationId}/life-cycle-strategys`,
      method: 'GET',
      data: {
        ...data,
        customizeUnitCode,
      },
    }),
    update: ({ data }) => {
      const { draftId } = data[0];
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/life-cycle-strategys/${draftId}`,
        method: 'PUT',
        data: { ...data[0], strategyId: draftId },
      };
    },
  },
});
