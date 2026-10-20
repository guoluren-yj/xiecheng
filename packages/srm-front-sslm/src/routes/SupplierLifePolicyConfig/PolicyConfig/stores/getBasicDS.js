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

export const getBasicDs = ({ isEdit = true } = {}) => ({
  autoCreate: true,
  paging: false,
  forceValidate: true,
  fields: [
    {
      name: 'strategyCode',
      required: isEdit,
      format: 'uppercase',
      label: intl.get('sslm.supplierLifePolicyConfig.modal.list.policyNum').d('策略编码'),
      dynamicProps: {
        disabled: ({ record }) => record.get('strategyId'),
      },
      pattern: /^[0-9A-Z-_]*$/,
    },
    {
      name: 'strategyName',
      required: isEdit,
      type: isEdit ? 'intl' : 'string',
      label: intl.get('sslm.supplierLifePolicyConfig.modal.list.policyDesc').d('策略描述'),
    },
    {
      name: 'orderSeq',
      type: 'number',
      required: isEdit,
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
      name: 'mustProcess',
      required: isEdit,
      defaultValue: '1',
      lookupCode: 'SSLM.LIFE_CYCLE_STRATEGY_CONTROL_MODE',
      label: intl
        .get('sslm.supplierLifePolicyConfig.modal.field.strategyControlMode')
        .d('策略控制模式'),
    },
  ],
  transport: {
    read: () => ({
      url: `${SRM_SSLM}/v1/${organizationId}/life-cycle-strategys`,
      method: 'GET',
    }),
    create: ({ data }) => {
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/life-cycle-strategys`,
        method: 'POST',
        data: data[0],
      };
    },
  },
});
