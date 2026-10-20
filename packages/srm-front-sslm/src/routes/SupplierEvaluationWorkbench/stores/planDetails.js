/**
 * @Description: 销售方评估计划工作台-评估计划-详情页Ds配置
 * @Author: zlh
 * @Date: 2023-09-06
 * @Copyright (c) 2022 by ZhenYun, All Rights Reserved.
 */
import { SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import { EMAIL, PHONE, NOT_CHINA_PHONE } from 'utils/regExp';
import moment from 'moment';
import intl from 'utils/intl';
import { bucketDirectory } from '@/routes/utils/utils';

const organizationId = getCurrentOrganizationId();

/**
 * @description: 获取整单Ds
 * @param {false|'multiple'|'single'} selection
 * @return {*}
 */
const getBasicInfoDs = () => ({
  primaryKey: 'evalPlanHeaderId',
  paging: false,
  fields: [
    {
      name: 'evalPlanNum',
      label: intl.get('sslm.vendorEvaluationPlanDetail.form.label.evalPlanNum').d('评估计划单号'),
      disabled: true,
    },
    {
      name: 'evalPlanDescription',
      label: intl
        .get('sslm.vendorEvaluationPlanDetail.form.label.evalPlanDescription')
        .d('供应商评估计划名称'),
    },
    {
      name: 'evalPlanStrategyLov',
      type: 'object',
      label: intl
        .get('sslm.vendorEvaluationPlanDetail.form.label.evalPlanStrategyId')
        .d('评估策略'),
      lovCode: 'SSLM.EVAL_PLAN_STRATEGY_LIST',
      lovPara: { strategyStatus: 'RELEASED', needFlag: 1 },
    },
    { name: 'evalPlanStrategyId', bind: 'evalPlanStrategyLov.strategyId' },
    { name: 'strategyCode', bind: 'evalPlanStrategyLov.strategyCode' },
    { name: 'strategyName', bind: 'evalPlanStrategyLov.strategyName' },
    {
      name: 'groupFlag',
      label: intl.get('sslm.vendorEvaluationPlanDetail.form.label.groupFlag').d('是否集团级'),
      lookupCode: 'HPFM.FLAG',
    },
    {
      name: 'companyLov',
      type: 'object',
      label: intl.get('sslm.vendorEvaluationPlanDetail.form.label.companyName').d('公司'),
      computedProps: {
        lovCode: ({ record }) => {
          return record.get('evalType') === 'ONLINE'
            ? 'SSLM.EVAL_PLAN_STRATEGY_TPL_COMPANY_NEW'
            : 'SPCM.USER_AUTH.COMPANY';
        },
        lovPara: ({ record }) => ({
          templateId: record.get('evalTplId'),
        }),
      },
    },
    { name: 'companyId', bind: 'companyLov.companyId' },
    { name: 'companyName', bind: 'companyLov.companyName' },
    {
      name: 'evalStatusMeaning',
      label: intl.get('sslm.vendorEvaluationPlanDetail.form.label.status').d('状态'),
      disabled: true,
    },
    {
      name: 'realName',
      label: intl.get('sslm.vendorEvaluationPlanDetail.form.label.realName').d('创建人'),
      disabled: true,
    },
    {
      name: 'creationDate',
      type: 'dateTime',
      label: intl.get('sslm.vendorEvaluationPlanDetail.form.label.creationDate').d('创建时间'),
      disabled: true,
    },
    {
      name: 'creatorUnitName',
      label: intl.get('sslm.vendorEvaluationPlanDetail.form.label.creatorUnit').d('创建人部门'),
      disabled: true,
    },
    {
      name: 'preciseFlag',
      bind: 'evalPlanStrategyLov.preciseFlag',
      label: intl
        .get('sslm.vendorEvaluationPlanDetail.form.label.preciseFlag')
        .d('精确评估计划日期'),
      lookupCode: 'HPFM.FLAG',
      disabled: true,
    },
    {
      name: 'supplierSelfAssessmentFlag',
      bind: 'evalPlanStrategyLov.supplierSelfAssessmentFlag',
      label: intl
        .get('sslm.vendorEvaluationPlanDetail.form.label.supplierSelfAssessmentFlag')
        .d('需要供应商自评'),
      lookupCode: 'HPFM.FLAG',
      disabled: true,
    },
    {
      name: 'assessType',
      bind: 'evalPlanStrategyLov.assessType',
      label: intl.get('sslm.vendorEvaluationPlanDetail.form.label.assessType').d('评估类型'),
      lookupCode: 'SSLM_EVAL_PLAN_TYPE',
      disabled: true,
    },
    {
      name: 'supplierAutoPublishFlag',
      bind: 'evalPlanStrategyLov.supplierAutoPublishFlag',
      label: intl
        .get('sslm.vendorEvaluationPlanDetail.form.label.supplierAutoPublishFlag')
        .d('自动发布评估结果'),
      lookupCode: 'HPFM.FLAG',
      disabled: true,
    },
    {
      name: 'evalType',
      bind: 'evalPlanStrategyLov.evalType',
      label: intl.get('sslm.vendorEvaluationPlanDetail.form.label.evalType').d('评分方式'),
      lookupCode: 'SSLM.SITE_EVAL_TYPE',
    },
    { name: 'evalTplId', bind: 'evalPlanStrategyLov.evalTplId' },
    {
      name: 'evalTplName',
      label: intl.get('sslm.vendorEvaluationPlanDetail.form.label.evalTpl').d('评分模板'),
      bind: 'evalPlanStrategyLov.evalTplName',
      disabled: true,
    },
    {
      name: 'planRemark',
      label: intl
        .get('sslm.vendorEvaluationPlanDetail.form.label.planRemark')
        .d('评估计划补充说明'),
    },
    {
      name: 'attachmentUuid',
      type: 'attachment',
      bucketDirectory: bucketDirectory.evaluation,
      label: intl.get('sslm.vendorEvaluationPlanDetail.form.label.attachment').d('附件'),
    },
  ],
  transport: {
    read: ({ data, params }) => {
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/eval-plan-headers/sale/${data.evalPlanHeaderId}`,
        method: 'GET',
        params: {
          ...params,
        },
        data: {
          ...data,
          customizeUnitCode: 'SSLM.SUPPLIER_ASSESS_DETAIL.EVALUATION_PLAN.BASICINFO',
        },
      };
    },
  },
  events: {
    load: ({ dataSet }) => {
      dataSet.forEach(record => {
        if (record.data.evalType < 0) {
          record.set({ evalType: null });
        }
        if (record.data.evalPlanStrategyId < 0) {
          record.set({ evalPlanStrategyId: null, evalPlanStrategyName: null });
        }
      });
    },
  },
});

/**
 * @description: 获取明细Ds
 * @return {*}
 */
const getPlanLinesDs = () => {
  const batchFields = [
    {
      name: 'ouLov',
      type: 'object',
      noCache: true,
      label: intl.get('sslm.vendorEvaluationPlanDetail.table.column.label.ouName').d('业务实体'),
      textField: 'ouName',
      lovCode: 'SPFM.USER_AUTH.OU',
    },
    { name: 'ouId', bind: 'ouLov.ouId' },
    { name: 'ouName', bind: 'ouLov.ouName' },
    {
      name: 'invOrganizationLov',
      type: 'object',
      noCache: true,
      label: intl
        .get('sslm.vendorEvaluationPlanDetail.table.column.label.invOrganization')
        .d('库存组织'),
      lovCode: 'HPFM.INV_ORG',
    },
    { name: 'invOrganizationId', bind: 'invOrganizationLov.organizationId' },
    { name: 'invOrganizationName', bind: 'invOrganizationLov.organizationName' },
    {
      name: 'inventoryLov',
      type: 'object',
      noCache: true,
      label: intl.get('sslm.vendorEvaluationPlanDetail.table.column.label.inventory').d('库房'),
      lovCode: 'SODR.INVENTORY',
    },
    { name: 'inventoryId', bind: 'inventoryLov.inventoryId' },
    { name: 'inventoryName', bind: 'inventoryLov.inventoryName' },
    {
      name: 'categoryLov',
      type: 'object',
      noCache: true,
      label: intl
        .get('sslm.vendorEvaluationPlanDetail.table.column.label.categoryCode')
        .d('品类编码'),
      lovCode: 'SMDM.CATEGORY.LEVEL_CONTROL_TREE',
      textField: 'categoryCode',
      valueField: 'categoryCode',
      dynamicProps: {
        lovPara: ({ record }) => {
          const supplierCompanyId = record.get('supplierId');
          return {
            enabledFlag: 1,
            supplierCompanyId,
            itemId: record.get('itemId'),
            tenantId: organizationId,
            businessObjectCode: 'SRM_C_SRM_SSLM_SITE_EVAL_HEADER',
          };
        },
      },
      optionsProps: {
        paging: 'server',
        idField: 'categoryId',
        parentIdField: 'parentCategoryId',
        record: {
          dynamicProps: {
            selectable: record => record.get('isCheck') !== false,
          },
        },
      },
    },
    { name: 'categoryId', bind: 'categoryLov.categoryId' },
    { name: 'categoryCode', bind: 'categoryLov.categoryCode' },
    {
      name: 'categoryName',
      label: intl
        .get('sslm.vendorEvaluationPlanDetail.table.column.label.categoryName')
        .d('品类名称'),
      bind: 'categoryLov.categoryName',
    },
    {
      name: 'itemLov',
      label: intl.get('sslm.vendorEvaluationPlanDetail.table.column.label.itemCode').d('物料编码'),
      type: 'object',
      noCache: true,
      ignore: 'always',
      textField: 'itemCode',
      lovCode: 'SSLM.RELATED_CATEGORY_ITEM',
      dynamicProps: {
        lovPara: ({ record }) => {
          const supplierCompanyId = record.get('supplierId');
          return {
            tenantId: organizationId,
            supplierCompanyId,
            categoryId: record.get('categoryId'),
          };
        },
      },
    },
    { name: 'itemId', bind: 'itemLov.itemId' },
    { name: 'itemCode', bind: 'itemLov.itemCode' },
    {
      name: 'itemName',
      bind: 'itemLov.itemName',
      label: intl.get('sslm.vendorEvaluationPlanDetail.table.column.label.itemName').d('物料名称'),
    },
    {
      name: 'evalPrincipalLov',
      type: 'object',
      label: intl
        .get('sslm.vendorEvaluationPlanDetail.table.column.label.evalPrincipal')
        .d('评估负责人'),
      lovCode: 'SSLM.TENANT.SUB.ACCOUNT',
    },
    { name: 'evalPrincipalId', bind: 'evalPrincipalLov.id' },
    { name: 'evalPrincipalName', bind: 'evalPrincipalLov.name' },
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
        .get('sslm.vendorEvaluationPlanDetail.table.column.label.planDateFrom')
        .d('计划评估日期从'),
    },
    {
      name: 'planDateTo',
      type: 'date',
      label: intl
        .get('sslm.vendorEvaluationPlanDetail.table.column.label.planDateTo')
        .d('计划评估日期至'),
    },
  ];
  return {
    primaryKey: 'evalPlanLineId',
    cacheSelection: true,
    pageSize: 20,
    autoQuery: false,
    fields: [
      {
        name: 'lineNumber',
        label: intl.get('sslm.vendorEvaluationPlanDetail.table.column.label.lineNumber').d('行号'),
        disabled: true,
      },
      {
        name: 'evalStatus',
        label: intl
          .get('sslm.vendorEvaluationPlanDetail.table.column.label.lineStatus')
          .d('行状态'),
      },
      {
        name: 'executeStatus',
        label: intl
          .get('sslm.vendorEvaluationPlanDetail.table.column.label.executeStatus')
          .d('计划执行状态'),
      },
      {
        name: 'progressStatusMeaning',
        label: intl
          .get('sslm.vendorEvaluationPlanDetail.table.column.label.assessmentProgress')
          .d('评估进度'),
      },
      {
        name: 'finalScore',
        label: intl
          .get('sslm.vendorEvaluationPlanDetail.table.column.label.evaluationScore')
          .d('评估得分'),
      },
      {
        name: 'resultsFlagMeaning',
        label: intl
          .get('sslm.vendorEvaluationPlanDetail.table.column.label.evaluationResult')
          .d('评估结果'),
      },
      {
        name: 'grade',
        label: intl.get('sslm.vendorEvaluationPlanDetail.table.column.label.grade').d('评估等级'),
      },
      {
        name: 'approveDate',
        type: 'dateTime',
        label: intl
          .get('sslm.vendorEvaluationPlanDetail.table.column.label.assessmentCompletionDate')
          .d('评估完成时间'),
      },
      {
        name: 'supplierCompanyLov',
        type: 'object',
        noCache: true,
        label: intl
          .get('sslm.vendorEvaluationPlanDetail.table.column.label.supplierName')
          .d('供应商'),
        lovCode: 'SSLM.SITE_SUPPLIER',
        valueField: 'supplierCompanyId',
        textField: 'supplierCompanyName',
        computedProps: {
          lovPara: ({ dataSet }) => ({
            tenantId: organizationId,
            companyId: dataSet?.parent?.current.get('companyId'),
            needFeedbackFlag: dataSet?.parent?.current.get('supplierSelfAssessmentFlag') || 0,
          }),
        },
      },
      { name: 'supplierCompanyId', bind: 'supplierCompanyLov.supplierCompanyId' },
      { name: 'supplierTenantId', bind: 'supplierCompanyLov.supplierTenantId' },
      {
        name: 'supplierCompanyNum',
        bind: 'supplierCompanyLov.supplierCompanyNum',
        label: intl
          .get('sslm.vendorEvaluationPlanDetail.table.column.label.supplierCompanyNum')
          .d('平台供应商编码'),
      },
      { name: 'supplierCompanyName', bind: 'supplierCompanyLov.supplierCompanyName' },
      { name: 'supplierId', bind: 'supplierCompanyLov.supplierId' },
      {
        name: 'supplierNum',
        bind: 'supplierCompanyLov.supplierNum',
        label: intl
          .get('sslm.vendorEvaluationPlanDetail.table.column.label.erpSupplierNum')
          .d('erp供应商编码'),
      },
      { name: 'supplierName', bind: 'supplierCompanyLov.supplierName' },
      {
        name: 'supplierCategoryName',
        label: intl
          .get('sslm.vendorEvaluationPlanDetail.table.column.label.supplierClassification')
          .d('供应商分类'),
      },
      {
        name: 'supplierContacts',
        label: intl
          .get('sslm.vendorEvaluationPlanDetail.table.column.label.supplierContacts')
          .d('供应商联系人'),
        bind: 'supplierCompanyLov.name',
      },
      {
        name: 'internationalTelCode',
        lookupCode: 'HPFM.IDD',
        defaultValue: '+86',
        bind: 'supplierCompanyLov.internationalTelCode',
      },
      {
        name: 'telephone',
        type: 'tel',
        regionField: 'internationalTelCode',
        label: intl
          .get('sslm.vendorEvaluationPlanDetail.table.column.label.supplierTelephone')
          .d('供应商联系电话'),
        dynamicProps: {
          pattern: ({ record }) =>
            (record.get('internationalTelCode') || '+86') === '+86' ? PHONE : NOT_CHINA_PHONE,
        },
        bind: 'supplierCompanyLov.mobilephone',
      },
      {
        name: 'email',
        pattern: EMAIL,
        label: intl
          .get('sslm.vendorEvaluationPlanDetail.table.column.label.supplierEmail')
          .d('供应商联系邮箱'),
        bind: 'supplierCompanyLov.mail',
      },
      {
        name: 'supplierAddress',
        label: intl
          .get('sslm.vendorEvaluationPlanDetail.table.column.label.supplierAddress')
          .d('供应商注册地址'),
        bind: 'supplierCompanyLov.addressDetail',
      },
      {
        name: 'evalRemark',
        label: intl
          .get('sslm.vendorEvaluationPlanDetail.table.column.label.evalRemark')
          .d('评估说明'),
      },
      ...batchFields,
    ],
    transport: {
      read: ({ data, params }) => {
        return {
          url: `${SRM_SSLM}/v1/${organizationId}/eval-plan-lines/${data.evalPlanHeaderId}/list`,
          method: 'GET',
          params: {
            ...params,
          },
          data: {
            ...data,
            supplierTenantId: organizationId,
            customizeUnitCode:
              'SSLM.SUPPLIER_ASSESS_DETAIL.EVALUATION_PLAN.PLAN_TABLE,SSLM.SUPPLIER_ASSESS_DETAIL.EVALUATION_PLAN.PLAN_FILTER_NEW',
          },
        };
      },
    },
  };
};

export { getBasicInfoDs, getPlanLinesDs };
