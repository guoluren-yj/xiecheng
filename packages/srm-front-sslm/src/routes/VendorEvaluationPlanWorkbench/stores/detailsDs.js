/**
 * @Description: 供应商评估计划工作台-详情页Ds配置
 * @Author: 杨一昊 yihao.yang@going-link.com
 * @Date: 2022-12-04 21:33:48
 * @Copyright (c) 2022 by ZhenYun, All Rights Reserved.
 */
import { SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import { EMAIL, PHONE, NOT_CHINA_PHONE } from 'utils/regExp';
import { isNil, isObject } from 'lodash';
import moment from 'moment';
import intl from 'utils/intl';

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
      name: 'evalPlanStrategyId',
      type: 'object',
      label: intl
        .get('sslm.vendorEvaluationPlanDetail.form.label.defaultEvalPlanStrategyId')
        .d('默认评估策略'),
      required: true,
      lovCode: 'SSLM.EVAL_PLAN_STRATEGY_LIST',
      lovPara: { strategyStatus: 'RELEASED', needFlag: 1 },
      transformRequest: value => (value ? value.strategyId : null),
      transformResponse: (value, data) =>
        value
          ? {
              evalType: data.evalType,
              evalTplId: data.evalTplId,
              assessType: data.assessType,
              createPage: data.createPage,
              preciseFlag: data.preciseFlag,
              evalTplName: data.evalTplName,
              strategyName: data.strategyName,
              strategyId: data.evalPlanStrategyId,
              supplierAutoPublishFlag: data.supplierAutoPublishFlag,
              supplierSelfAssessmentFlag: data.supplierSelfAssessmentFlag,
            }
          : null,
    },
    { name: 'strategyId', bind: 'evalPlanStrategyId.strategyId' },
    { name: 'strategyName', bind: 'evalPlanStrategyId.strategyName' },
    { name: 'createPage', bind: 'evalPlanStrategyId.createPage' },
    {
      name: 'groupFlag',
      label: intl.get('sslm.vendorEvaluationPlanDetail.form.label.groupFlag').d('是否集团级'),
      lookupCode: 'HPFM.FLAG',
      required: true,
      computedProps: {
        disabled: ({ record }) => {
          return !record.get('evalPlanStrategyId');
        },
      },
    },
    {
      name: 'companyId',
      type: 'object',
      label: intl.get('sslm.vendorEvaluationPlanDetail.form.label.companyName').d('公司'),
      computedProps: {
        lovCode: ({ record }) => {
          return record.get('createPage') === 'ASSESS'
            ? 'SPCM.USER_AUTH.COMPANY'
            : record.get('evalType') === 'ONLINE'
            ? 'SSLM.EVAL_PLAN_STRATEGY_TPL_COMPANY_NEW'
            : 'SPCM.USER_AUTH.COMPANY';
        },
        required: ({ record }) => {
          return !+record.get('groupFlag');
        },
        disabled: ({ record }) => {
          return Boolean(+record.get('groupFlag')) || !record.get('evalPlanStrategyId');
        },
        lovPara: ({ record }) => ({
          templateId: record.get('evalTplId'),
        }),
      },
      transformRequest: value => (value ? value.companyId : null),
      transformResponse: (value, data) =>
        value
          ? {
              companyId: data.companyId,
              companyName: data.companyName,
            }
          : null,
    },
    { name: 'companyName', bind: 'companyId.companyName' },
    {
      name: 'evalStatus',
      lookupCode: 'SSLM_EVAL_PLAN_HEADER_STATUS',
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
      label: intl.get('sslm.vendorEvaluationPlanDetail.form.label.creationDate').d('创建时间'),
      disabled: true,
      type: 'dateTime',
    },
    {
      name: 'creatorUnitName',
      label: intl.get('sslm.vendorEvaluationPlanDetail.form.label.creatorUnit').d('创建人部门'),
      disabled: true,
    },
    {
      name: 'preciseFlag',
      bind: 'evalPlanStrategyId.preciseFlag',
      label: intl
        .get('sslm.vendorEvaluationPlanDetail.form.label.preciseFlag')
        .d('精确评估计划日期'),
      lookupCode: 'HPFM.FLAG',
      disabled: true,
    },
    {
      name: 'supplierSelfAssessmentFlag',
      bind: 'evalPlanStrategyId.supplierSelfAssessmentFlag',
      label: intl
        .get('sslm.vendorEvaluationPlanDetail.form.label.supplierSelfAssessmentFlag')
        .d('需要供应商自评'),
      lookupCode: 'HPFM.FLAG',
      disabled: true,
    },
    {
      name: 'assessType',
      bind: 'evalPlanStrategyId.assessType',
      label: intl.get('sslm.vendorEvaluationPlanDetail.form.label.assessType').d('评估类型'),
      lookupCode: 'SSLM_EVAL_PLAN_TYPE',
      disabled: true,
      computedProps: {
        disabled: ({ record }) => {
          return record.get('evalPlanStrategyId');
        },
      },
    },
    {
      name: 'planTypeCode',
      label: intl
        .get('sslm.vendorEvaluationPlanDetail.form.label.planTypeCode')
        .d('评估计划单修改类型'),
      lookupCode: 'SSLM_EVAL_PLAN_CHANGE_TYPE',
      defaultValue: 'PLAN_NEW',
      disabled: true,
    },
    {
      name: 'supplierAutoPublishFlag',
      bind: 'evalPlanStrategyId.supplierAutoPublishFlag',
      label: intl
        .get('sslm.vendorEvaluationPlanDetail.form.label.supplierAutoPublishFlag')
        .d('自动发布评估结果'),
      lookupCode: 'HPFM.FLAG',
      disabled: true,
    },
    {
      name: 'evalType',
      bind: 'evalPlanStrategyId.evalType',
      label: intl.get('sslm.vendorEvaluationPlanDetail.form.label.evalType').d('评分方式'),
      lookupCode: 'SSLM.SITE_EVAL_TYPE',
      computedProps: {
        disabled: ({ record }) => {
          return record.get('evalPlanStrategyId');
        },
      },
    },
    { name: 'evalTplId', bind: 'evalPlanStrategyId.evalTplId' },
    {
      name: 'evalTplName',
      label: intl.get('sslm.vendorEvaluationPlanDetail.form.label.evalTpl').d('评分模板'),
      bind: 'evalPlanStrategyId.evalTplName',
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
      label: intl.get('sslm.vendorEvaluationPlanDetail.form.label.attachment').d('附件'),
    },
    {
      name: 'publishDate',
      disabled: true,
      type: 'dateTime',
      label: intl.get('hzero.common.date.releaseTime').d('发布时间'),
    },
  ],
  transport: {
    read: ({ data, params }) => {
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/eval-plan-headers/${data.evalPlanHeaderId}/compare`,
        method: 'GET',
        params: {
          ...params,
        },
        data: {
          ...data,
          customizeUnitCode: 'SSLM.SUP_PLAN_WORKBENCH_DETAIL.BASICINFO',
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
        if (record?.data?.evalPlanStrategyId?.strategyId < 0) {
          record.set({ evalPlanStrategyId: null, evalPlanStrategyName: null });
        }
      });
    },
    update: ({ name, value, record }) => {
      if (name === 'evalType') {
        if (value !== 'ONLINE') {
          record.set({ evalTplLov: null, evalTplName: null, evalTplId: null });
        }
      }
      if (name === 'groupFlag') {
        record.set({ companyId: null, companyName: null });
      }
    },
  },
});

/**
 * @description: 获取明细Ds
 * @param {boolean} preciseFlag 是否精确计划评估日期
 * @param {boolean} isBatch 批量分配使用标识
 * @return {*}
 */
const getPlanLinesDs = (preciseFlag = false, isBatch = false, companyId) => {
  const batchFields = [
    {
      name: 'ouId',
      type: 'object',
      noCache: true,
      label: intl.get('sslm.vendorEvaluationPlanDetail.table.column.label.ouName').d('业务实体'),
      textField: 'ouName',
      lovCode: 'SPFM.USER_AUTH.OU',
      computedProps: {
        disabled: ({ dataSet }) => {
          return !(dataSet?.parent?.current.get('companyId')?.companyId || companyId);
        },
        lovPara: ({ dataSet }) => ({
          companyId: dataSet?.parent?.current.get('companyId')?.companyId || companyId,
          tenantId: organizationId,
        }),
      },
      transformRequest: value => (value ? value.ouId : null),
      transformResponse: (value, data) =>
        value
          ? {
              ouId: isObject(data.ouId) ? data.ouId.ouId : data.ouId,
              ouName: data.ouName,
            }
          : null,
    },
    { name: 'ouName', bind: 'ouId.ouName' },
    {
      name: 'invOrganizationId',
      type: 'object',
      noCache: true,
      label: intl
        .get('sslm.vendorEvaluationPlanDetail.table.column.label.invOrganization')
        .d('库存组织'),
      lovCode: 'HPFM.INV_ORG',
      computedProps: {
        disabled: ({ record }) => {
          return !record.get('ouId');
        },
        lovPara: ({ record }) => ({
          ouId: record.get('ouId')?.ouId,
          tenantId: organizationId,
        }),
      },
      transformRequest: value => (value ? value.organizationId : null),
      transformResponse: (value, data) =>
        value
          ? {
              organizationId: isObject(data.invOrganizationId)
                ? data.invOrganizationId.invOrganizationId
                : data.invOrganizationId,
              organizationName: data.invOrganizationName,
            }
          : null,
    },
    { name: 'invOrganizationName', bind: 'invOrganizationId.organizationName' },
    {
      name: 'inventoryId',
      type: 'object',
      noCache: true,
      label: intl.get('sslm.vendorEvaluationPlanDetail.table.column.label.inventory').d('库房'),
      lovCode: 'SODR.INVENTORY',
      computedProps: {
        disabled: ({ record }) => {
          return !record.get('invOrganizationId');
        },
        lovPara: ({ record }) => ({
          organizationId: record?.get('invOrganizationId')?.organizationId,
          tenantId: organizationId,
        }),
      },
      transformRequest: value => (value ? value.inventoryId : null),
      transformResponse: (value, data) =>
        value
          ? {
              inventoryId: isObject(data.inventoryId)
                ? data.inventoryId.inventoryId
                : data.inventoryId,
              inventoryName: data.inventoryName,
            }
          : null,
    },
    { name: 'inventoryName', bind: 'inventoryId.inventoryName' },
    {
      name: 'categoryCode',
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
            itemId: record?.get('itemId')?.itemId,
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
      transformRequest: value => (value ? value.categoryCode : null),
      transformResponse: (value, data) =>
        value
          ? {
              categoryId: data.categoryId,
              categoryCode: isObject(data.categoryCode)
                ? data.categoryCode.categoryCode
                : data.categoryCode,
              categoryName: data.categoryName,
            }
          : null,
    },
    { name: 'categoryId', bind: 'categoryCode.categoryId' },
    {
      name: 'categoryName',
      label: intl
        .get('sslm.vendorEvaluationPlanDetail.table.column.label.categoryName')
        .d('品类名称'),
      bind: 'categoryCode.categoryName',
      computedProps: {
        disabled: ({ record }) => {
          return record.get('categoryCode');
        },
      },
    },
    {
      name: 'itemId',
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
      transformRequest: value => (value ? value.itemId : null),
      transformResponse: (value, data) =>
        value
          ? {
              itemId: isObject(data.itemId) ? data.itemId.itemId : data.itemId,
              itemCode: data.itemCode,
              itemName: data.itemName,
            }
          : null,
    },
    { name: 'itemCode', bind: 'itemId.itemCode' },
    {
      name: 'itemName',
      bind: 'itemId.itemName',
      label: intl.get('sslm.vendorEvaluationPlanDetail.table.column.label.itemName').d('物料名称'),
      computedProps: {
        disabled: ({ record }) => {
          return record.get('itemCode');
        },
      },
    },
    {
      name: 'evalPlanStrategyId',
      type: 'object',
      label: intl
        .get('sslm.vendorEvaluationPlanDetail.form.label.evalPlanStrategyId')
        .d('评估策略'),
      lovCode: 'SSLM.EVAL_PLAN_STRATEGY_LIST',
      lovPara: { strategyStatus: 'RELEASED', needFlag: 1 },
      textField: 'strategyName',
      valueField: 'strategyId',
      dynamicProps: {
        disabled: ({ dataSet }) => {
          const evalStatus = dataSet.getState('evalStatus');
          return !['NEW', 'REJECT'].includes(evalStatus);
        },
      },
      help: intl
        .get('sslm.vendorEvaluationPlanDetail.form.help.evalPlanStrategyIdWarn')
        .d(
          '若评估计划行未维护评估策略，则引用评估计划创建评估报告时会使用评估计划的默认评估策略。'
        ),
      transformRequest: value => value && value.strategyId,
      transformResponse: (value, data) =>
        value
          ? {
              evalPlanStrategyId: data.evalPlanStrategyId,
              strategyCode: data.strategyCode,
              strategyName: data.strategyName,
            }
          : null,
    },
    {
      name: 'investigationType',
      label: intl.get('sslm.vendorEvaluationPlanDetail.form.label.investigationType').d('考察方式'),
      lookupCode: 'SSLM.INVESTIGATION_TYPE',
      dynamicProps: {
        disabled: ({ dataSet }) => {
          const evalStatus = dataSet.getState('evalStatus');
          return !['NEW', 'REJECT'].includes(evalStatus);
        },
      },
    },
    {
      name: 'evalPrincipalId',
      type: 'object',
      label: intl
        .get('sslm.vendorEvaluationPlanDetail.table.column.label.evalPrincipal')
        .d('评估负责人'),
      lovCode: 'SSLM.TENANT.SUB.ACCOUNT',
      transformRequest: value => value && value.id,
      transformResponse: (value, data) =>
        value
          ? {
              id: isObject(value)
                ? value.id
                : isObject(data.evalPrincipalId)
                ? data.evalPrincipalId.evalPrincipalId
                : data.evalPrincipalId,
              name: data.evalPrincipalName,
            }
          : null,
    },
    { name: 'evalPrincipalName', bind: 'evalPrincipalId.name' },
    {
      name: 'planMonth',
      label: intl
        .get('sslm.vendorEvaluationPlanDetail.table.column.label.planMonth')
        .d('计划评估起始月份'),
      type: 'month',
      computedProps: {
        required: ({ record, dataSet: { parent } }) => {
          const { preciseFlag: linePreciseFlag } = record.get(['preciseFlag']) || {};
          const isDate = !isNil(linePreciseFlag)
            ? linePreciseFlag
            : preciseFlag || +parent?.current?.get('preciseFlag');
          // 批量分配 不做必填
          return isBatch ? false : !isDate;
        },
        disabled: ({ dataSet: { parent }, record }) => {
          const { preciseFlag: linePreciseFlag } = record.get(['preciseFlag']) || {};
          const isDate = !isNil(linePreciseFlag)
            ? linePreciseFlag
            : preciseFlag || +parent?.current?.get('preciseFlag');
          return isDate;
        },
      },
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
      computedProps: {
        required: ({ dataSet: { parent }, record }) => {
          const { preciseFlag: linePreciseFlag } = record.get(['preciseFlag']) || {};
          const isDate = !isNil(linePreciseFlag)
            ? linePreciseFlag
            : preciseFlag || +parent?.current?.get('preciseFlag');
          return isBatch ? false : isDate;
        },
        disabled: ({ dataSet: { parent }, record }) => {
          const { preciseFlag: linePreciseFlag } = record.get(['preciseFlag']) || {};
          const isDate = !isNil(linePreciseFlag)
            ? linePreciseFlag
            : preciseFlag || +parent?.current?.get('preciseFlag');
          return !isDate;
        },
        max: ({ record }) => record.get('planDateTo'),
      },
    },
    {
      name: 'planDateTo',
      type: 'date',
      label: intl
        .get('sslm.vendorEvaluationPlanDetail.table.column.label.planDateTo')
        .d('计划评估日期至'),
      computedProps: {
        required: ({ dataSet: { parent }, record }) => {
          const { preciseFlag: linePreciseFlag } = record.get(['preciseFlag']) || {};
          const isDate = !isNil(linePreciseFlag)
            ? linePreciseFlag
            : preciseFlag || +parent?.current?.get('preciseFlag');
          return isBatch ? false : isDate;
        },
        disabled: ({ dataSet: { parent }, record }) => {
          const { preciseFlag: linePreciseFlag } = record.get(['preciseFlag']) || {};
          const isDate = !isNil(linePreciseFlag)
            ? linePreciseFlag
            : preciseFlag || +parent?.current?.get('preciseFlag');
          return !isDate;
        },
        min: ({ record }) => record.get('planDateFrom'),
      },
    },
  ];
  return {
    forceValidate: true,
    primaryKey: 'evalPlanLineId',
    cacheSelection: true,
    paging: !isBatch,
    pageSize: 20,
    autoQuery: false,
    fields: isBatch
      ? [...batchFields]
      : [
          {
            name: 'lineNumber',
            label: intl
              .get('sslm.vendorEvaluationPlanDetail.table.column.label.lineNumber')
              .d('行号'),
            disabled: true,
          },
          {
            name: 'evalStatus',
            lookupCode: 'SSLM_EVAL_PLAN_LINE_STATUS',
            defaultValue: 'NEW',
            disabled: true,
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
            name: 'lineTypeCode',
            lookupCode: 'SSLM_EVAL_PLAN_CHANGE_TYPE',
            defaultValue: 'PLAN_NEW',
            disabled: true,
            label: intl
              .get('sslm.vendorEvaluationPlanDetail.form.label.lineTypeCode')
              .d('评估计划行修改类型'),
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
            type: 'number',
          },
          {
            name: 'grade',
            label: intl
              .get('sslm.vendorEvaluationPlanDetail.table.column.label.grade')
              .d('评估等级'),
          },
          {
            name: 'resultsFlagMeaning',
            label: intl
              .get('sslm.vendorEvaluationPlanDetail.table.column.label.evaluationResult')
              .d('评估结果'),
          },
          {
            name: 'approveDate',
            type: 'dateTime',
            label: intl
              .get('sslm.vendorEvaluationPlanDetail.table.column.label.assessmentCompletionDate')
              .d('评估完成时间'),
          },
          {
            name: 'supplierCompanyId',
            type: 'object',
            noCache: true,
            label: intl
              .get('sslm.vendorEvaluationPlanDetail.table.column.label.supplierName')
              .d('供应商'),
            required: true,
            lovCode: 'SSLM.SITE_SUPPLIER',
            valueField: 'supplierCompanyId',
            textField: 'supplierCompanyName',
            computedProps: {
              lovPara: ({ dataSet }) => ({
                tenantId: organizationId,
                companyId: dataSet?.parent?.current?.get('companyId')?.companyId,
                needFeedbackFlag: dataSet?.parent?.current.get('supplierSelfAssessmentFlag') || 0,
              }),
            },
            transformRequest: value => value && value.supplierCompanyId,
            transformResponse: (value, data) =>
              value
                ? {
                    mail: data.email,
                    name: data.supplierContacts,
                    supplierId: data.supplierId,
                    mobilephone: data.telephone,
                    supplierNum: data.supplierNum,
                    supplierName: data.supplierName,
                    addressDetail: data.supplierAddress,
                    supplierCompanyId: isObject(data.supplierCompanyId)
                      ? data.supplierCompanyId.supplierCompanyId
                      : data.supplierCompanyId,
                    supplierTenantId: data.supplierTenantId,
                    supplierCompanyNum: data.supplierCompanyNum,
                    supplierCompanyName: data.supplierCompanyName,
                    internationalTelCode: data.internationalTelCode,
                  }
                : null,
          },
          { name: 'supplierTenantId', bind: 'supplierCompanyId.supplierTenantId' },
          {
            name: 'supplierCompanyNum',
            bind: 'supplierCompanyId.supplierCompanyNum',
            label: intl
              .get('sslm.vendorEvaluationPlanDetail.table.column.label.supplierCompanyNum')
              .d('平台供应商编码'),
          },
          { name: 'supplierCompanyName', bind: 'supplierCompanyId.supplierCompanyName' },
          { name: 'supplierId', bind: 'supplierCompanyId.supplierId' },
          {
            name: 'supplierNum',
            bind: 'supplierCompanyId.supplierNum',
            label: intl
              .get('sslm.vendorEvaluationPlanDetail.table.column.label.erpSupplierNum')
              .d('erp供应商编码'),
          },
          { name: 'supplierName', bind: 'supplierCompanyId.supplierName' },
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
            bind: 'supplierCompanyId.name',
          },
          {
            name: 'internationalTelCode',
            lookupCode: 'HPFM.IDD',
            defaultValue: '+86',
            bind: 'supplierCompanyId.internationalTelCode',
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
                record.get('internationalTelCode') === '+86' ? PHONE : NOT_CHINA_PHONE,
            },
            bind: 'supplierCompanyId.mobilephone',
          },
          {
            name: 'email',
            pattern: EMAIL,
            label: intl
              .get('sslm.vendorEvaluationPlanDetail.table.column.label.supplierEmail')
              .d('供应商联系邮箱'),
            bind: 'supplierCompanyId.mail',
          },
          {
            name: 'supplierAddress',
            label: intl
              .get('sslm.vendorEvaluationPlanDetail.table.column.label.supplierAddress')
              .d('供应商注册地址'),
            bind: 'supplierCompanyId.addressDetail',
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
          url: `${SRM_SSLM}/v1/${organizationId}/eval-plan-lines/${data.evalPlanHeaderId}/compare`,
          method: 'GET',
          params: {
            ...params,
          },
          data: {
            ...data,
            customizeUnitCode: isBatch
              ? 'SSLM.SUP_PLAN_WORKBENCH_DETAIL.BATCH_ALLOCATION_TABLE'
              : 'SSLM.SUP_PLAN_WORKBENCH_DETAIL.LINE_NEW,SSLM.SUP_PLAN_WORKBENCH_DETAIL.DETAIL_TABLE',
          },
        };
      },
      destroy: ({ data, params }) => {
        return {
          url: `${SRM_SSLM}/v1/${organizationId}/eval-plan-lines`,
          method: 'DELETE',
          data,
          params,
        };
      },
    },
    events: {
      update: ({ dataSet: { parent }, record, name, value }) => {
        if (name === 'planMonth') {
          const { preciseFlag: linePreciseFlag } = record.get(['preciseFlag']) || {};
          const isDate = !isNil(linePreciseFlag)
            ? linePreciseFlag
            : preciseFlag || +parent?.current?.get('preciseFlag');
          if (!isDate) {
            record.set({
              planDateFrom: (value && moment(value).startOf('month')) || null,
              planDateTo: (value && moment(value).endOf('month')) || null,
            });
          }
        }
        if (name === 'planDateFrom') {
          record.set({
            planMonth: (value && moment(value).startOf('month')) || null,
          });
        }
        if (name === 'supplierCompanyId') {
          record.set({
            supplierCompanyName: value ? value.supplierCompanyName || value.supplierName : null,
          });
        }
        if (name === 'itemId') {
          record.set({
            itemCategoryId: value ? value.categoryId : null,
            itemCategoryCode: value ? value.categoryCode : null,
            itemCategoryName: value ? value.categoryName : null,
          });
        }
        if (name === 'evalPlanStrategyId') {
          record.set({
            preciseFlag: value ? value.preciseFlag : null,
          });
        }
      },
    },
  };
};

export { getBasicInfoDs, getPlanLinesDs };
