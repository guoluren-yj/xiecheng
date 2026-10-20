/*
 * @Date: 2022-11-28 14:11:24
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import { isArray } from 'lodash';
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

export const getIndexDS = ({ strategyId, checkedValue }) => ({
  autoCreate: true,
  fields: [
    {
      name: 'startStages',
      required: true,
      noCache: true,
      multiple: checkedValue === 'targetStage',
      lookupCode: 'SSLM.LIFE_CYCLE_STRATEGY_STAGES',
      lovPara: {
        strategyId,
        tenantId: organizationId,
      },
      transformRequest: value => value && (isArray(value) ? value : [value]),
      label: intl.get('sslm.supplierLifePolicyConfig.view.batchEdit.initialStage').d('初始阶段'),
    },
    {
      name: 'endStages',
      required: true,
      noCache: true,
      multiple: checkedValue === 'initialStage',
      lookupCode: 'SSLM.LIFE_CYCLE_STRATEGY_STAGES',
      lovPara: {
        strategyId,
        tenantId: organizationId,
      },
      transformRequest: value => value && (isArray(value) ? value : [value]),
      label: intl.get('sslm.supplierLifePolicyConfig.view.leftContent.targetStage').d('目标阶段'),
    },
  ],
});
