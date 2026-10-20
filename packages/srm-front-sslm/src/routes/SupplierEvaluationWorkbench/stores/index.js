/**
 * @description: 采购方评估列表页Ds
 * @param {false|'multiple'|'single'} selection
 * @return {*}
 */
import { SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';

const organizationId = getCurrentOrganizationId();

const getTableDs = ({ selection = false, currentTab, filterCode, tableCode = '' }) => {
  const urlObj = {
    selfRatedEvaluated: `${SRM_SSLM}/v1/${organizationId}/site-eval-header-copy/eval-report/waiting-rejected`,
    // selfRatedEvaluated: `${SRM_SSLM}/v1/${organizationId}/site-eval-headers/eval-report/waiting-rejected`,
    toBeSelfEvaluated: `${SRM_SSLM}/v1/${organizationId}/site-eval-headers/eval-report/waiting-rejected`,
    published: `${SRM_SSLM}/v1/${organizationId}/site-eval-headers/eval-report/publishedList`,
    evaluationPlanAll: `${SRM_SSLM}/v1/${organizationId}/eval-plan-headers/sale/list`,
  };
  // 评估计划标识
  const isPlanFlag = ['evaluationPlanAll'].includes(currentTab);

  if (isPlanFlag) {
    // 评估计划ds
    return {
      primaryKey: 'evalPlanHeaderId',
      selection,
      cacheSelection: Boolean(selection),
      pageSize: 20,
      fields: [
        {
          name: 'evalStatus',
          label: intl.get('sslm.vendorEvaluationPlan.table.column.label.status').d('状态'),
        },
        {
          name: 'evalPlanNum',
          label: intl
            .get('sslm.vendorEvaluationPlan.table.column.label.evalPlanNum')
            .d('评估计划单号'),
        },
        {
          name: 'evalPlanDescription',
          label: intl
            .get('sslm.vendorEvaluationPlan.table.column.label.evalPlanDescription')
            .d('供应商评估计划名称'),
        },
        {
          name: 'strategyName',
          label: intl
            .get('sslm.vendorEvaluationPlan.table.column.label.evalPlanStrategy')
            .d('评估策略'),
        },
        {
          name: 'groupFlag',
          label: intl.get('sslm.vendorEvaluationPlan.table.column.label.groupFlag').d('是否集团级'),
        },
        {
          name: 'companyName',
          label: intl.get('sslm.vendorEvaluationPlan.table.column.label.companyName').d('公司'),
        },
        {
          name: 'realName',
          label: intl.get('sslm.vendorEvaluationPlan.table.column.label.realName').d('创建人'),
        },
        {
          name: 'creationDate',
          type: 'dateTime',
          label: intl
            .get('sslm.vendorEvaluationPlan.table.column.label.creationDate')
            .d('创建时间'),
        },
        {
          name: 'creationTypeMeaning',
          label: intl
            .get('sslm.vendorEvaluationPlan.table.column.label.creationType')
            .d('创建方式'),
        },
      ],
      transport: {
        read: ({ data, params }) => {
          return {
            url: `${urlObj[currentTab]}`,
            method: 'GET',
            params: {
              ...params,
            },
            data: {
              ...data,
              supplierTenantId: organizationId,
              customizeUnitCode: [filterCode, tableCode].join(','),
            },
          };
        },
      },
    };
  } else {
    // 评估报告ds
    return {
      primaryKey: 'evalHeaderId',
      selection,
      cacheSelection: Boolean(selection),
      pageSize: 20,
      fields: [
        {
          name: 'reportStatus',
          label: intl.get('hzero.common.status').d('状态'),
        },
        {
          name: 'evalNum',
          label: intl.get('sslm.supplierEvaluation.table.column.label.evalNum').d('评估报告编号'),
        },
        {
          name: 'evaluateProgress',
          label: intl
            .get('sslm.supplierEvaluation.table.column.label.evaluateProgress')
            .d('评估进度'),
        },
        {
          name: 'evalDescription',
          label: intl
            .get('sslm.supplierEvaluation.table.column.label.evalDescription')
            .d('评估报告描述'),
        },
        {
          name: 'groupFlag',
          label: intl.get('sslm.supplierEvaluation.table.column.label.groupFlag').d('是否集团级'),
        },
        {
          name: 'companyName',
          label: intl.get('sslm.supplierEvaluation.table.column.label.companyName').d('公司'),
        },
        {
          name: 'supplierCompanyName',
          label: intl
            .get('sslm.supplierEvaluation.table.column.label.supplierCompanyName')
            .d('供应商'),
        },
        {
          name: 'evaluationResult',
          label: intl
            .get('sslm.supplierEvaluation.table.column.label.evaluationResult')
            .d('评估结果'),
        },
        {
          name: 'finalScore',
          label: intl.get('sslm.supplierEvaluation.table.column.label.evaluateScore').d('评估得分'),
        },
        {
          name: 'grade',
          label: intl.get('sslm.supplierEvaluation.table.column.label.evaluateLevel').d('评估等级'),
        },
        {
          name: 'strategyName',
          label: intl.get('sslm.supplierEvaluation.table.column.label.strategyName').d('评估策略'),
        },
        {
          name: 'evalTplName',
          label: intl
            .get('sslm.supplierEvaluation.table.column.label.evalTplName')
            .d('评估模板名称'),
        },
        {
          name: 'needFeedbackFlag',
          label: intl
            .get('sslm.supplierEvaluation.table.column.label.needFeedbackFlag')
            .d('需要供应商自评'),
        },
        {
          name: 'evalTypeMeaning',
          label: intl.get('sslm.supplierEvaluation.table.column.label.evalType').d('评分方式'),
        },
        {
          name: 'evalPlanNum',
          label: intl
            .get('sslm.supplierEvaluation.table.column.label.evalPlanNum')
            .d('关联评估计划单号'),
        },
        {
          name: 'problemNum',
          lable: intl
            .get('sslm.supplierEvaluation.table.column.label.relatedQuality')
            .d('关联质量整改'),
        },
        {
          name: 'assessTypeMeaning',
          label: intl.get('sslm.supplierEvaluation.table.column.label.assessType').d('评估类型'),
        },
        {
          name: 'realName',
          label: intl.get('sslm.supplierEvaluation.table.column.label.realName').d('创建人'),
        },
        {
          name: 'creationDate',
          type: 'dateTime',
          label: intl.get('sslm.supplierEvaluation.table.column.label.creationDate').d('创建时间'),
        },
        {
          name: 'operation',
          label: intl.get('sslm.supplierEvaluation.table.column.label.operation').d('操作'),
        },
        {
          name: 'sourceTypeMeaning',
          label: intl.get('sslm.supplierEvaluation.table.column.label.creationType').d('创建方式'),
          disabled: true,
        },
        {
          name: 'operationRecord',
          label: intl
            .get('sslm.supplierEvaluation.table.column.label.operationRecord')
            .d('操作记录'),
        },
      ],
      events: {
        load: ({ dataSet }) => {
          dataSet.forEach(record => {
            // 不可废弃删除 的单据状态合集
            if ([''].includes(record.data.evalStatus)) {
              Object.assign(record, { selectable: false });
            }
          });
        },
      },
      transport: {
        read: ({ data, params }) => {
          return {
            // /v1/{organizationId}/site-eval-headers/eval-plan
            url: `${urlObj[currentTab]}`,
            method: 'POST',
            params: {
              ...params,
              customizeUnitCode: filterCode,
            },
            data: {
              ...data,
              createMethod: 'eval_report',
              customizeUnitCode: [filterCode, tableCode].join(','),
            },
          };
        },
      },
    };
  }
};

export { getTableDs };
