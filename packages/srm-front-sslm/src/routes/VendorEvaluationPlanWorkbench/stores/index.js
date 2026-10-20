/**
 * @Description: 供应商评估计划工作台-列表页Ds配置
 * @Author: 杨一昊 yihao.yang@going-link.com
 * @Date: 2022-12-04 21:33:48
 * @FilePath: /srm-front-sslm/src/routes/VendorEvaluationPlanWorkbench/stores/index.js
 * @Copyright (c) 2022 by ZhenYun, All Rights Reserved.
 */
import moment from 'moment';
import { SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';

const organizationId = getCurrentOrganizationId();

/**
 * @description: 获取整单Ds
 * @param {false|'multiple'|'single'} selection
 * @return {*}
 */
const getWholeListDs = (selection = false, filterCode, tableCode = '') => ({
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
      label: intl.get('sslm.vendorEvaluationPlan.table.column.label.evalPlanNum').d('评估计划单号'),
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
      name: 'assessTypeMeaning',
      label: intl.get('sslm.vendorEvaluationPlan.table.column.label.assessType').d('评估类型'),
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
      label: intl.get('sslm.vendorEvaluationPlan.table.column.label.creationDate').d('创建时间'),
    },
    {
      name: 'publishDate',
      type: 'dateTime',
      label: intl.get('hzero.common.date.releaseTime').d('发布时间'),
    },
    {
      name: 'creationTypeMeaning',
      label: intl.get('sslm.vendorEvaluationPlan.table.column.label.creationType').d('创建方式'),
    },
    {
      name: 'operationRecord',
      label: intl.get('sslm.vendorEvaluationPlan.table.column.label.operationRecord').d('操作记录'),
    },
    {
      name: 'operation',
      label: intl.get('sslm.vendorEvaluationPlan.table.column.label.operation').d('操作'),
    },
  ],
  transport: {
    read: ({ data, params }) => {
      const { evalStatusCustoms, ...others } = data;
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/eval-plan-headers`,
        method: 'GET',
        params: {
          ...params,
        },
        data: {
          ...others,
          evalStatusCustoms: evalStatusCustoms?.join(',') || null,
          customizeUnitCode: [filterCode, tableCode].join(','),
        },
      };
    },
  },
});

/**
 * @description: 获取明细Ds
 * @param {false|'multiple'|'single'} selection
 * @return {*}
 */
const getDetailListDs = (selection = false, filterCode = '', tableCode) => ({
  primaryKey: 'evalPlanLineId',
  selection,
  cacheSelection: Boolean(selection),
  pageSize: 20,
  fields: [
    {
      name: 'evalStatus',
      label: intl.get('sslm.vendorEvaluationPlan.table.column.label.lineStatus').d('计划行状态'),
    },
    {
      name: 'executeStatus',
      label: intl
        .get('sslm.vendorEvaluationPlan.table.column.label.executeStatus')
        .d('计划执行状态'),
    },
    {
      name: 'evalHeaderStatus',
      label: intl.get('sslm.vendorEvaluationPlan.table.column.label.headerStatus').d('计划头状态'),
    },
    {
      name: 'evalPlanNum',
      label: intl.get('sslm.vendorEvaluationPlan.table.column.label.evalPlanNum').d('评估计划单号'),
    },
    {
      name: 'lineNumber',
      label: intl.get('sslm.vendorEvaluationPlan.table.column.label.lineNumber').d('行号'),
    },
    {
      name: 'evalPlanNumAndLineNumber',
      label: intl
        .get('sslm.vendorEvaluationPlan.table.column.label.evalPlanNumAndLineNumber')
        .d('评估计划单号-行号'),
    },
    {
      name: 'associatedEvaluationReport',
      label: intl
        .get('sslm.vendorEvaluationPlan.table.column.label.associatedEvaluationReport')
        .d('关联评估报告'),
    },
    {
      name: 'rectifyStatus',
      label: intl.get('sslm.vendorEvaluationPlan.table.column.label.rectifyStatus').d('整改状态'),
    },
    {
      name: 'problemNum',
      label: intl
        .get('sslm.vendorEvaluationPlan.table.column.label.relatedQuality')
        .d('关联质量整改单据'),
    },
    {
      name: 'progressStatusMeaning',
      label: intl
        .get('sslm.vendorEvaluationPlan.table.column.label.assessmentProgress')
        .d('评估进度'),
    },
    {
      name: 'approveDate',
      type: 'dateTime',
      label: intl
        .get('sslm.vendorEvaluationPlan.table.column.label.assessmentCompletionDate')
        .d('评估完成时间'),
    },
    {
      name: 'grade',
      label: intl.get('sslm.vendorEvaluationPlan.table.column.label.grade').d('评估等级'),
    },
    {
      name: 'finalScore',
      label: intl.get('sslm.vendorEvaluationPlan.table.column.label.evaluationScore').d('评估得分'),
    },
    {
      name: 'resultsFlagMeaning',
      label: intl
        .get('sslm.vendorEvaluationPlan.table.column.label.evaluationResult')
        .d('评估结果'),
    },
    {
      name: 'supplierCompanyName',
      label: intl.get('sslm.vendorEvaluationPlan.table.column.label.supplierName').d('供应商'),
    },
    {
      name: 'supplierCompanyNum',
      label: intl
        .get('sslm.vendorEvaluationPlan.table.column.label.supplierCompanyNum')
        .d('平台供应商编码'),
    },
    {
      name: 'supplierNum',
      label: intl
        .get('sslm.vendorEvaluationPlan.table.column.label.erpSupplierNum')
        .d('erp供应商编码'),
    },
    {
      name: 'categoryCode',
      label: intl.get('sslm.vendorEvaluationPlan.table.column.label.categoryCode').d('品类编码'),
    },
    {
      name: 'categoryName',
      label: intl.get('sslm.vendorEvaluationPlan.table.column.label.categoryName').d('品类名称'),
    },
    {
      name: 'itemCode',
      label: intl.get('sslm.vendorEvaluationPlan.table.column.label.itemCode').d('物料编码'),
    },
    {
      name: 'itemName',
      label: intl.get('sslm.vendorEvaluationPlan.table.column.label.itemName').d('物料名称'),
    },
    {
      name: 'strategyName',
      label: intl
        .get('sslm.vendorEvaluationPlan.table.column.label.evalPlanStrategy')
        .d('评估策略'),
    },
    {
      name: 'assessTypeMeaning',
      label: intl.get('sslm.vendorEvaluationPlan.table.column.label.assessType').d('评估类型'),
    },
    {
      name: 'planMonth',
      label: intl
        .get('sslm.vendorEvaluationPlanDetail.table.column.label.planMonth')
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
        .get('sslm.vendorEvaluationPlan.table.column.label.planDateFrom')
        .d('计划评估日期从'),
    },
    {
      name: 'planDateTo',
      type: 'date',
      label: intl
        .get('sslm.vendorEvaluationPlan.table.column.label.planDateTo')
        .d('计划评估日期至'),
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
      name: 'ouName',
      label: intl.get('sslm.vendorEvaluationPlan.table.column.label.ouName').d('业务实体'),
    },
    {
      name: 'invOrganizationName',
      label: intl.get('sslm.vendorEvaluationPlan.table.column.label.invOrganization').d('库存组织'),
    },
    {
      name: 'inventoryName',
      label: intl.get('sslm.vendorEvaluationPlan.table.column.label.inventory').d('库房'),
    },
    {
      name: 'evalPrincipalName',
      label: intl.get('sslm.vendorEvaluationPlan.table.column.label.evalPrincipal').d('评估负责人'),
    },
    {
      name: 'supplierContacts',
      label: intl
        .get('sslm.vendorEvaluationPlan.table.column.label.supplierContacts')
        .d('供应商联系人'),
    },
    {
      name: 'telephone',
      label: intl
        .get('sslm.vendorEvaluationPlan.table.column.label.supplierTelephone')
        .d('供应商联系电话'),
    },
    {
      name: 'email',
      label: intl
        .get('sslm.vendorEvaluationPlan.table.column.label.supplierEmail')
        .d('供应商联系邮箱'),
    },
    {
      name: 'supplierAddress',
      label: intl
        .get('sslm.vendorEvaluationPlan.table.column.label.supplierAddress')
        .d('供应商注册地址'),
    },
    {
      name: 'evalRemark',
      label: intl.get('sslm.vendorEvaluationPlan.table.column.label.evalRemark').d('评估说明'),
    },
    {
      name: 'createdByName',
      label: intl.get('sslm.vendorEvaluationPlan.table.column.label.realName').d('创建人'),
    },
    {
      name: 'creationDate',
      type: 'dateTime',
      label: intl.get('sslm.vendorEvaluationPlan.table.column.label.creationDate').d('创建时间'),
    },
    {
      name: 'publishDate',
      type: 'dateTime',
      label: intl.get('hzero.common.date.releaseTime').d('发布时间'),
    },
    {
      name: 'evalNum',
      label: intl.get('sslm.purchaserEvaluation.table.column.label.evalNum').d('评估报告编号'),
    },
    {
      name: 'problemNum',
      label: intl
        .get('sslm.vendorEvaluationPlan.table.column.label.relatedQuality')
        .d('关联质量整改单据'),
    },
    {
      name: 'operation',
      label: intl.get('sslm.vendorEvaluationPlan.table.column.label.operation').d('操作'),
    },
  ],
  transport: {
    read: ({ data, params }) => {
      const { evalStatusCustoms, ...others } = data;
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/eval-plan-lines`,
        method: 'GET',
        params: {
          ...params,
        },
        data: {
          ...others,
          evalStatusCustoms: evalStatusCustoms?.join(',') || null,
          customizeUnitCode: [filterCode, tableCode].join(','),
        },
      };
    },
  },
});

export { getWholeListDs, getDetailListDs };
