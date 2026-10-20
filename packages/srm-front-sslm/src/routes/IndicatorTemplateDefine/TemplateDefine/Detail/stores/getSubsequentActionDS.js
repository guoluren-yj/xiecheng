/*
 * @Date: 2023-10-19 13:36:19
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import intl from 'utils/intl';
import { SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

// 后续动作表单
export const getSubsequentActionDs = () => ({
  autoCreate: true,
  forceValidate: true,
  fields: [
    {
      name: 'autoUpgradeFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 0,
      label: intl.get('sslm.evaluationTemplate.model.scoreLevel.isAutoLift').d('自动升降级'),
    },
    {
      name: 'ruleConfiguration',
      label: intl.get('sslm.common.model.field.ruleConfiguration').d('条件配置'),
    },
  ],
});

// 策略配置
export const getRuleConfigurationDs = ({ evalTplId } = {}) => ({
  autoQuery: true,
  paging: false,
  fields: [
    {
      name: 'strategyCode',
      label: intl.get('sslm.common.model.policy.name').d('策略名称'),
    },
    {
      name: 'strategyName',
      label: intl.get('sslm.common.model.policy.desc').d('策略描述'),
    },
    {
      name: 'orderSeq',
      label: intl.get('hzero.common.priority').d('优先级'),
    },
  ],
  transport: {
    read: {
      url: `${SRM_SSLM}/v1/${organizationId}/kpi-eval-tpl-strategys/${evalTplId}`,
      method: 'GET',
    },
    destroy: {
      url: `${SRM_SSLM}/v1/${organizationId}/kpi-eval-tpl-strategys/batch-delete`,
      method: 'DELETE',
    },
  },
});

// 策略配置form ds
export const getPolicyFormDs = ({ isEdit, evalGranularity }) => ({
  autoCreate: true,
  forceValidate: true,
  fields: [
    {
      name: 'strategyCode',
      required: isEdit,
      label: intl.get('sslm.common.model.policy.name').d('策略名称'),
    },
    {
      name: 'orderSeq',
      required: isEdit,
      type: 'number',
      numberGrouping: false,
      label: intl.get('hzero.common.priority').d('优先级'),
    },
    {
      name: 'strategyName',
      required: isEdit,
      label: intl.get('sslm.common.model.policy.desc').d('策略描述'),
    },
    {
      name: 'executionRule',
      required: isEdit,
      lookupCode: 'SSLM.LIFE_CYCLE_ENABLE_STAGE_INFO',
      label: intl.get('sslm.common.model.field.targetLifecyclePhase').d('目标生命周期阶段'),
    },
    {
      name: 'matchCondition',
      lookupCode: 'SSLM.EVAL_LEVAEL_CONDITION',
      required: isEdit && ['SU+CA', 'SU+IT'].includes(evalGranularity),
      label: intl.get('sslm.common.model.archive.matchCondition').d('所有考核品类/物料均需满足'),
    },
  ],
  transport: {
    read: ({ data }) => {
      const { strategyId } = data;
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/kpi-eval-tpl-strategys/detail/${strategyId}`,
        method: 'GET',
        params: {},
      };
    },
  },
});
