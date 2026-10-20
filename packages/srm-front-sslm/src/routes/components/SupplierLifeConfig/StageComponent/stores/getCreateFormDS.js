/*
 * @Date: 2022-10-18 20:34:53
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import intl from 'utils/intl';
import { SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

export const getCreateFormDS = ({ strategyId }) => ({
  fields: [
    {
      name: 'startStrategyStageId',
      disabled: true,
      noCache: true,
      required: true,
      lookupCode: 'SSLM.LIFE_CYCLE_STRATEGY_STAGES',
      lovPara: {
        strategyId,
        tenantId: organizationId,
      },
      label: intl.get('sslm.supplierLifePolicyConfig.view.leftContent.startStage').d('开始阶段'),
    },
    {
      name: 'endStrategyStageId',
      required: true,
      noCache: true,
      lookupCode: 'SSLM.LIFE_CYCLE_STRATEGY_STAGES',
      lovPara: {
        strategyId,
        tenantId: organizationId,
      },
      label: intl.get('sslm.supplierLifePolicyConfig.view.leftContent.targetStage').d('目标阶段'),
    },
  ],
  transport: {
    submit: ({ data }) => {
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/life-cycle-stage-procs`,
        method: 'POST',
        data: data && data[0],
      };
    },
  },
});
