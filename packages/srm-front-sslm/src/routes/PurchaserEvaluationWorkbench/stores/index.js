/**
 * @Description: 采购方评估工作台-列表页Ds配置
 * @Author: 杨一昊 yihao.yang@going-link.com
 * @Date: 2023-01-29 15:44:37
 * @FilePath: /srm-front-sslm/src/routes/PurchaserEvaluationWorkbench/stores/index.js
 * @Copyright (c) 2023 by ZhenYun, All Rights Reserved.
 */
import moment from 'moment';
import { SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';

const organizationId = getCurrentOrganizationId();

/**
 * @description: 采购方评估列表页Ds
 * @param {false|'multiple'|'single'} selection
 * @return {*}
 */
const getTableDs = ({ selection = false, currentTab, filterCode, tableCode = '' }) => {
  const urlObj = {
    tabPaneAssessmentReserve: `${SRM_SSLM}/v1/${organizationId}/site-eval-headers/eval-report-header`,
    tabPaneUnderEvaluation: `${SRM_SSLM}/v1/${organizationId}/site-eval-headers/eval-report-header`,
    tabPaneEvaluationCompleted: `${SRM_SSLM}/v1/${organizationId}/site-eval-headers/eval-report-header`,
    tabPaneManageAll: `${SRM_SSLM}/v1/${organizationId}/site-eval-headers/eval-report-header`,

    tabPaneWaitScore: `${SRM_SSLM}/v1/${organizationId}/site-eval-headers/eval-report/evaluating`,
    tabPaneScoreAll: `${SRM_SSLM}/v1/${organizationId}/site-eval-headers/all/evaluating`,
  };
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
        name: 'scoreStatus',
        label: intl.get('hzero.common.status').d('状态'),
      },
      {
        name: 'evalNum',
        label: intl.get('sslm.purchaserEvaluation.table.column.label.evalNum').d('评估报告编号'),
      },
      {
        name: 'progressStatus',
        label: intl
          .get('sslm.purchaserEvaluation.table.column.label.evaluateProgress')
          .d('评估进度'),
      },
      {
        name: 'rectifyStatus',
        label: intl.get('sslm.purchaserEvaluation.table.column.label.rectifyStatus').d('整改状态'),
      },
      {
        name: 'problemNum',
        label: intl
          .get('sslm.purchaserEvaluation.table.column.label.relatedQuality')
          .d('关联质量整改单据'),
      },
      {
        name: 'evalDescription',
        label: intl
          .get('sslm.purchaserEvaluation.table.column.label.evalDescription')
          .d('评估报告描述'),
      },
      {
        name: 'groupFlag',
        label: intl.get('sslm.purchaserEvaluation.table.column.label.groupFlag').d('是否集团级'),
      },
      {
        name: 'companyName',
        label: intl.get('sslm.purchaserEvaluation.table.column.label.companyName').d('公司'),
      },
      {
        name: 'supplierCompanyName',
        label: intl
          .get('sslm.purchaserEvaluation.table.column.label.supplierCompanyName')
          .d('供应商'),
      },
      {
        name: 'resultsFlagMeaning',
        label: intl
          .get('sslm.purchaserEvaluation.table.column.label.evaluationResult')
          .d('评估结果'),
      },
      {
        name: 'finalScore',
        label: intl.get('sslm.purchaserEvaluation.table.column.label.evaluateScore').d('评估得分'),
      },
      {
        name: 'grade',
        label: intl.get('sslm.purchaserEvaluation.table.column.label.evaluateLevel').d('评估等级'),
      },
      {
        name: 'strategyName',
        label: intl.get('sslm.purchaserEvaluation.table.column.label.strategyName').d('评估策略'),
      },
      {
        name: 'evalTplName',
        label: intl
          .get('sslm.purchaserEvaluation.table.column.label.evalTplName')
          .d('评估模板名称'),
      },
      {
        name: 'evalTypeMeaning',
        label: intl.get('sslm.purchaserEvaluation.table.column.label.evalType').d('评分方式'),
      },
      {
        name: 'assessTypeMeaning',
        label: intl.get('sslm.purchaserEvaluation.table.column.label.assessType').d('评估类型'),
      },
      {
        name: 'realName',
        label: intl.get('sslm.purchaserEvaluation.table.column.label.realName').d('创建人'),
      },
      {
        name: 'creationDate',
        type: 'dateTime',
        label: intl.get('sslm.purchaserEvaluation.table.column.label.creationDate').d('创建时间'),
      },
      {
        name: 'operation',
        label: intl.get('sslm.purchaserEvaluation.table.column.label.operation').d('操作'),
      },
      {
        name: 'reformContent',
        label: intl.get('sslm.purchaserEvaluation.table.column.label.reformContent').d('质量整改'),
      },
      {
        name: 'operationRecord',
        label: intl
          .get('sslm.purchaserEvaluation.table.column.label.operationRecord')
          .d('操作记录'),
      },
      {
        name: 'feedbackDate',
        type: 'dateTime',
        label: intl
          .get('sslm.purchaserEvaluationDetail.modal.basic.feedbackDate')
          .d('执行自评时间'),
      },
      {
        name: 'publishDate',
        type: 'dateTime',
        label: intl
          .get('sslm.purchaserEvaluationDetail.modal.basic.publishDate')
          .d('评估结果发布时间'),
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
          url: `${urlObj[currentTab]}`,
          method: 'GET',
          params: {
            ...params,
            customizeUnitCode: [filterCode, tableCode].join(','),
          },
          data: {
            ...data,
          },
        };
      },
    },
  };
};

const getEvalPlanDs = () => ({
  primaryKey: 'evalPlanLineId',
  selection: 'multiple',
  cacheSelection: true,
  pageSize: 20,
  fields: [
    {
      name: 'evalStatus',
      label: intl.get('sslm.purchaserEvaluation.table.column.label.lineStatus').d('计划行状态'),
    },
    {
      name: 'executeStatus',
      label: intl
        .get('sslm.purchaserEvaluation.table.column.label.executeStatus')
        .d('计划执行状态'),
    },
    {
      name: 'evalHeaderStatus',
      label: intl.get('sslm.purchaserEvaluation.table.column.label.headerStatus').d('计划头状态'),
    },
    {
      name: 'evalPlanNum',
      label: intl.get('sslm.purchaserEvaluation.table.column.label.evalPlanNum').d('评估计划单号'),
    },
    {
      name: 'lineNumber',
      label: intl.get('sslm.purchaserEvaluation.table.column.label.lineNumber').d('行号'),
    },
    {
      name: 'evalPlanNumAndLineNumber',
      label: intl
        .get('sslm.purchaserEvaluation.table.column.label.evalPlanNumAndLineNumber')
        .d('评估计划单号-行号'),
    },
    {
      name: 'associatedEvaluationReport',
      label: intl
        .get('sslm.purchaserEvaluation.table.column.label.associatedEvaluationReport')
        .d('关联评估报告'),
    },
    {
      name: 'assessmentProgress',
      label: intl
        .get('sslm.purchaserEvaluation.table.column.label.assessmentProgress')
        .d('评估进度'),
    },
    {
      name: 'assessmentCompletionDate',
      type: 'dateTime',
      label: intl
        .get('sslm.purchaserEvaluation.table.column.label.assessmentCompletionDate')
        .d('评估完成时间'),
    },
    {
      name: 'evaluationScore',
      label: intl.get('sslm.purchaserEvaluation.table.column.label.evaluationScore').d('评估得分'),
    },
    {
      name: 'evaluationResult',
      label: intl.get('sslm.purchaserEvaluation.table.column.label.evaluationResult').d('评估结果'),
    },
    {
      name: 'supplierCompanyName',
      label: intl.get('sslm.purchaserEvaluation.table.column.label.supplierName').d('供应商'),
    },
    {
      name: 'supplierCompanyNum',
      label: intl
        .get('sslm.purchaserEvaluation.table.column.label.supplierCompanyNum')
        .d('平台供应商编码'),
    },
    {
      name: 'supplierNum',
      label: intl
        .get('sslm.purchaserEvaluation.table.column.label.erpSupplierNum')
        .d('erp供应商编码'),
    },
    {
      name: 'categoryCode',
      label: intl.get('sslm.purchaserEvaluation.table.column.label.categoryCode').d('品类编码'),
    },
    {
      name: 'categoryName',
      label: intl.get('sslm.purchaserEvaluation.table.column.label.categoryName').d('品类名称'),
    },
    {
      name: 'itemCode',
      label: intl.get('sslm.purchaserEvaluation.table.column.label.itemCode').d('物料编码'),
    },
    {
      name: 'itemName',
      label: intl.get('sslm.purchaserEvaluation.table.column.label.itemName').d('物料名称'),
    },
    {
      name: 'strategyName',
      label: intl.get('sslm.purchaserEvaluation.table.column.label.evalPlanStrategy').d('评估策略'),
    },
    {
      name: 'investigationTypeMeaning',
      label: intl
        .get('sslm.purchaserEvaluation.table.column.label.investigationType')
        .d('考察方式'),
    },
    {
      name: 'assessTypeMeaning',
      label: intl.get('sslm.purchaserEvaluation.table.column.label.assessType').d('评估类型'),
    },
    {
      name: 'planMonth',
      label: intl
        .get('sslm.purchaserEvaluationDetail.table.column.label.planMonth')
        .d('计划评估月份'),
      type: 'month',
      transformResponse: (_value, data) => {
        return (data.planDateFrom && moment(data.planDateFrom)) || null;
      },
    },
    {
      name: 'planDateFrom',
      type: 'date',
      label: intl
        .get('sslm.purchaserEvaluation.table.column.label.planDateFrom')
        .d('计划评估日期从'),
    },
    {
      name: 'planDateTo',
      type: 'date',
      label: intl.get('sslm.purchaserEvaluation.table.column.label.planDateTo').d('计划评估日期至'),
    },
    {
      name: 'groupFlag',
      label: intl.get('sslm.purchaserEvaluation.table.column.label.groupFlag').d('是否集团级'),
    },
    {
      name: 'companyName',
      label: intl.get('sslm.purchaserEvaluation.table.column.label.companyName').d('公司'),
    },
    {
      name: 'ouName',
      label: intl.get('sslm.purchaserEvaluation.table.column.label.ouName').d('业务实体'),
    },
    {
      name: 'invOrganizationName',
      label: intl.get('sslm.purchaserEvaluation.table.column.label.invOrganization').d('库存组织'),
    },
    {
      name: 'inventoryName',
      label: intl.get('sslm.purchaserEvaluation.table.column.label.inventory').d('库房'),
    },
    {
      name: 'evalPrincipalName',
      label: intl.get('sslm.purchaserEvaluation.table.column.label.evalPrincipal').d('评估负责人'),
    },
    {
      name: 'supplierContacts',
      label: intl
        .get('sslm.purchaserEvaluation.table.column.label.supplierContacts')
        .d('供应商联系人'),
    },
    {
      name: 'telephone',
      label: intl
        .get('sslm.purchaserEvaluation.table.column.label.supplierTelephone')
        .d('供应商联系电话'),
    },
    {
      name: 'email',
      label: intl
        .get('sslm.purchaserEvaluation.table.column.label.supplierEmail')
        .d('供应商联系邮箱'),
    },
    {
      name: 'supplierAddress',
      label: intl
        .get('sslm.purchaserEvaluation.table.column.label.supplierAddress')
        .d('供应商注册地址'),
    },
    {
      name: 'evalRemark',
      label: intl.get('sslm.purchaserEvaluation.table.column.label.evalRemark').d('评估说明'),
    },
    {
      name: 'createdByName',
      label: intl.get('sslm.purchaserEvaluation.table.column.label.realName').d('创建人'),
    },
    {
      name: 'creationDate',
      type: 'dateTime',
      label: intl.get('sslm.purchaserEvaluation.table.column.label.creationDate').d('创建时间'),
    },
  ],
  transport: {
    read: ({ data, params }) => {
      const { evalStatusCustoms, queryParams, ...others } = data;
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/eval-plan-lines`,
        method: 'GET',
        params: {
          ...params,
        },
        data: {
          ...queryParams,
          ...others,
          evalStatusCustoms: ['PUBLISHED']?.join(','),
          customizeUnitCode: [
            'SSLM.PURCHASER_ASSESS_LIST.MANAGE.REF_EVA_PLAN_CRE_NEW',
            'SSLM.PURCHASER_ASSESS_LIST.MANAGE.REF_EVA_PLAN_TABLE',
          ].join(','),
        },
      };
    },
  },
});

export { getTableDs, getEvalPlanDs };
