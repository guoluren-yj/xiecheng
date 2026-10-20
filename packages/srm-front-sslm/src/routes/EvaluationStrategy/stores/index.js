/**
 * @Description: 供应商评估策略-列表页Ds配置
 * @Author: 杨一昊 yihao.yang@going-link.com
 * @Date: 2022-12-26 15:30:14
 * @FilePath: /srm-front-sslm/src/routes/EvaluationStrategy/stores/index.js
 * @Copyright (c) 2022 by ZhenYun, All Rights Reserved.
 */
// import moment from 'moment';
import { SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';

const organizationId = getCurrentOrganizationId();

/**
 * @description: 获取整单Ds
 * @param {false|'multiple'|'single'} selection
 * @return {*}
 */
const getTableDs = filterCode => ({
  primaryKey: 'strategyId',
  selection: false,
  pageSize: 20,
  paging: 'server',
  childrenField: 'evalPlanStrategy',
  fields: [
    {
      name: 'strategyStatus',
      label: intl.get('sslm.evaluationStrategy.table.column.label.status').d('状态'),
    },
    {
      name: 'strategyCode',
      label: intl.get('sslm.evaluationStrategy.table.column.label.policyNum').d('策略编码'),
    },
    {
      name: 'strategyName',
      label: intl.get('sslm.evaluationStrategy.table.column.label.policyName').d('策略名称'),
    },
    {
      name: 'versionNumber',
      type: 'number',
      label: intl.get('sslm.evaluationStrategy.table.column.label.versionNumber').d('版本'),
    },
    {
      name: 'assessType',
      label: intl.get('sslm.evaluationStrategy.table.column.label.assessType').d('评估类型'),
      lookupCode: 'SSLM_EVAL_PLAN_TYPE',
    },
    {
      name: 'creationDate',
      type: 'dateTime',
      label: intl.get('sslm.evaluationStrategy.table.column.label.creationDate').d('创建时间'),
    },
    {
      name: 'realName',
      label: intl.get('sslm.evaluationStrategy.table.column.label.realName').d('创建人'),
    },
    // {
    //   name: 'operationRecord',
    //   label: intl.get('sslm.evaluationStrategy.table.column.label.operationRecord').d('操作记录'),
    // },
    {
      name: 'enabledFlag',
      label: intl.get('sslm.evaluationStrategy.table.column.label.enabledFlag').d('启用'),
    },
    {
      name: 'operation',
      label: intl.get('sslm.evaluationStrategy.table.column.label.operation').d('操作'),
    },
  ],
  transport: {
    read: ({ data, params }) => {
      const { evalStatusCustoms, ...others } = data;
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/eval-plan-strategys/list`,
        method: 'GET',
        params: {
          ...params,
        },
        data: {
          ...others,
          // evalStatusCustoms: evalStatusCustoms?.join(',') || null,
          customizeUnitCode: filterCode,
        },
      };
    },
  },
});

export { getTableDs };
