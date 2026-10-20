/**
 * @Description: 采购方评估工作台 - 详情页 - dataSet配置
 * @Author: 杨一昊 yihao.yang@going-link.com
 * @Date: 2023-01-31 17:42:53
 * @FilePath: /srm-front-sslm/src/routes/PurchaserEvaluationWorkbench/stores/details.js
 * @Copyright (c) 2023 by ZhenYun, All Rights Reserved.
 */
import uuid from 'uuid/v4';
import { PRIVATE_BUCKET, SRM_SSLM } from '_utils/config';
import { getCurrentUserId, getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
import { EMAIL, PHONE, NOT_CHINA_PHONE } from 'utils/regExp';
import intl from 'utils/intl';
import { isNil, isEmpty, isObject } from 'lodash';

import { bucketDirectory } from '@/routes/utils/utils';

const currentUserId = getCurrentUserId();
const organizationId = getCurrentOrganizationId();

// 处理基础信息的必输问题
const getBasicInfoRequire = ({ record, isCreate, readOnly }) => {
  const { progressStatus, reportStatus } = record.get(['progressStatus', 'reportStatus']);
  return (
    isCreate ||
    (!readOnly &&
      ['EVAL_PREPARE'].includes(progressStatus) &&
      ['NEW', 'REJECTED'].includes(reportStatus))
  );
};

/**
 * @description: 基本信息 - 公司信息 - 供应商信息 - 评估结果 - 审查结果附件 - 内外附件合集 DS 合集
 * @param {false|'multiple'|'single'} selection
 * @return {*}
 */
const getBasicInfoDs = (showOldModal, readOnly, isCreate, isAmktClient = false) => {
  // 基础信息
  const basicInfo = [
    {
      name: 'evalNum',
      label: intl.get('sslm.purchaserEvaluationDetail.form.label.evalNum').d('评估报告编号'),
      disabled: true,
    },
    {
      name: 'evalDescription',
      label: intl
        .get('sslm.purchaserEvaluationDetail.form.label.evalDescription')
        .d('评估报告描述'),
    },
    {
      name: 'reportStatus',
      label: intl.get('hzero.common.status').d('状态'),
      disabled: true,
    },
    {
      name: 'sourceTypeMeaning',
      label: intl.get('sslm.purchaserEvaluationDetail.form.label.creationType').d('创建方式'),
      disabled: true,
    },
    {
      name: 'evalPlanNum',
      label: intl.get('sslm.purchaserEvaluationDetail.form.label.documentOrigin').d('来源单据'),
      disabled: true,
    },
    {
      name: 'creationDate',
      type: 'dateTime',
      label: intl.get('sslm.purchaserEvaluationDetail.form.label.creationDate').d('创建时间'),
      disabled: true,
    },
    {
      name: 'realName',
      label: intl.get('sslm.purchaserEvaluationDetail.form.label.realName').d('创建人'),
      disabled: true,
    },
    {
      name: 'unitName',
      label: intl.get('sslm.purchaserEvaluationDetail.form.label.unitName').d('创建人部门'),
      disabled: true,
    },
    {
      name: 'strategyLov',
      type: 'object',
      label: intl.get('sslm.purchaserEvaluationDetail.form.label.strategyName').d('评估策略'),
      ignore: 'always',
      lovCode: 'SSLM.EVAL_PLAN_STRATEGY_LIST',
      lovPara: { strategyStatus: 'RELEASED' },
      dynamicProps: {
        disabled: ({ record }) => {
          return record.get('evalHeaderId');
        },
        required: ({ record }) => getBasicInfoRequire({ record, isCreate, readOnly }),
      },
    },
    { name: 'strategyId', bind: 'strategyLov.strategyId' },
    { name: 'strategyName', bind: 'strategyLov.strategyName' },
    { name: 'strategyCode', bind: 'strategyLov.strategyCode' },
    { name: 'createPage', bind: 'strategyLov.createPage' },
    {
      name: 'evalTplId',
      textField: 'evalTplName',
      valueField: 'evalTplId',
      lovCode: 'SSLM.SITE_EVAL_TPL',
      lovPara: { tenantId: organizationId },
      bind: 'strategyLov.evalTplId',
      // 处理个性化默认值
      transformRequest: value => {
        return value ? (isObject(value) ? value.evalTplId : value) : null;
      },
    },
    { name: 'evalTplCode', bind: 'strategyLov.evalTplCode' },
    {
      name: 'evalTplName',
      label: intl.get('sslm.purchaserEvaluationDetail.form.label.evalTpl').d('评分模板'),
      bind: 'strategyLov.evalTplName',
    },
    {
      // 策略-是否需要供应商自评 -----  现场考察：是否需要反馈 / 评估报告：是否需要供应商自评
      name: 'needFeedbackFlag',
      bind: 'strategyLov.supplierSelfAssessmentFlag',
      lookupCode: 'HPFM.FLAG',
    },
    {
      // 是否自动发布考评结果
      name: 'autoPushVendorFlag',
      bind: 'strategyLov.supplierAutoPublishFlag',
      lookupCode: 'HPFM.FLAG',
    },
    {
      // 评分方式
      name: 'evalType',
      label: intl.get('sslm.purchaserEvaluationDetail.table.column.label.scoreType').d('评分方式'),
      bind: 'strategyLov.evalType',
      lookupCode: 'SSLM.SITE_EVAL_TYPE',
    },
    {
      name: 'evalDateFrom',
      label: intl.get('sslm.purchaserEvaluationDetail.form.label.evalDateFrom').d('评估日期从'),
      type: 'date',
      max: 'evalDateTo',
      dynamicProps: {
        required: ({ record }) => getBasicInfoRequire({ record, isCreate, readOnly }),
      },
    },
    {
      name: 'evalDateTo',
      label: intl.get('sslm.purchaserEvaluationDetail.form.label.evalDateTo').d('评估日期至'),
      type: 'date',
      min: 'evalDateFrom',
      dynamicProps: {
        required: ({ record }) => getBasicInfoRequire({ record, isCreate, readOnly }),
      },
    },

    {
      name: 'assessType',
      bind: 'strategyLov.assessType',
      label: intl.get('sslm.purchaserEvaluationDetail.form.label.assessType').d('评估类型'),
      lookupCode: 'SSLM_EVAL_PLAN_TYPE',
      disabled: true,
    },
    {
      name: 'investigationType',
      label: intl.get('sslm.purchaserEvaluationDetail.form.label.investigationType').d('考察方式'),
      lookupCode: 'SSLM.INVESTIGATION_TYPE',
    },
    {
      name: 'evalRemark',
      label: intl.get('sslm.purchaserEvaluationDetail.form.label.evalRemark').d('评估说明'),
    },
    {
      name: 'showParentFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 0,
      label: intl
        .get('sslm.purchaserEvaluationDetail.model.basic.showParentFlag')
        .d('末级指标行赋值上级/一级指标信息'),
    },
    {
      name: 'progressStatus',
      disabled: true,
      lookupCode: 'SSLM_EVAL_PROGRESS',
      label: intl.get('sslm.purchaserEvaluation.table.column.label.evaluateProgress').d('评估进度'),
    },
    {
      name: 'feedbackDate',
      type: 'dateTime',
      disabled: true,
      label: intl.get('sslm.purchaserEvaluationDetail.modal.basic.feedbackDate').d('执行自评时间'),
    },
    {
      name: 'publishDate',
      disabled: true,
      type: 'dateTime',
      label: intl
        .get('sslm.purchaserEvaluationDetail.modal.basic.publishDate')
        .d('评估结果发布时间'),
    },
  ];
  // 公司信息
  const companyInfo = [
    {
      name: 'groupFlag',
      label: intl.get('sslm.purchaserEvaluationDetail.form.label.groupFlag').d('是否集团级'),
      lookupCode: 'HPFM.FLAG',
      defaultValue: '1',
      dynamicProps: {
        required: ({ record }) => getBasicInfoRequire({ record, isCreate, readOnly }),
      },
    },
    {
      name: 'groupMeaning',
      ignore: 'always',
      transformResponse: (_, data) => {
        return data.groupFlag
          ? intl.get('sslm.common.model.field.groupLevel').d('集团级')
          : intl.get('sslm.common.model.field.companyLevel').d('公司级');
      },
    },
    {
      name: 'companyLov',
      type: 'object',
      ignore: 'always',
      label: intl.get('sslm.purchaserEvaluationDetail.form.label.companyName').d('公司'),
      lovCode: 'SSLM.USER_AUTHORITY_COMPANY',
      dynamicProps: {
        required: ({ record }) => {
          return getBasicInfoRequire({ record, isCreate, readOnly }) && record.get('strategyId')
            ? !+record.get('groupFlag')
            : false;
        },
        disabled: ({ record }) => {
          return record.get('strategyId') ? Boolean(+record.get('groupFlag')) : true;
        },
        lovPara: ({ record }) => {
          const evalTplIdLov = record.get('evalTplId');
          return {
            templateId: isObject(evalTplIdLov) ? evalTplIdLov.evalTplId : evalTplIdLov,
          };
        },
        lovCode: ({ record }) => {
          return record.get('createPage') === 'ASSESS'
            ? 'SSLM.USER_AUTHORITY_COMPANY'
            : record.get('evalType') === 'ONLINE'
            ? 'SSLM.EVAL_PLAN_STRATEGY_TPL_COMPANY_NEW'
            : 'SPCM.USER_AUTH.COMPANY';
        },
      },
    },
    { name: 'companyId', bind: 'companyLov.companyId' },
    { name: 'companyName', bind: 'companyLov.companyName' },
    {
      name: 'ouLov',
      type: 'object',
      noCache: true,
      label: intl.get('sslm.purchaserEvaluationDetail.table.column.label.ouName').d('业务实体'),
      textField: 'ouName',
      lovCode: 'SPFM.USER_AUTH.OU',
      dynamicProps: {
        disabled: ({ record }) => {
          return !record.get('companyId');
        },
        lovPara: ({ record }) => ({
          companyId: record.get('companyId'),
          tenantId: organizationId,
        }),
      },
    },
    { name: 'ouId', bind: 'ouLov.ouId' },
    { name: 'ouName', bind: 'ouLov.ouName' },
    {
      name: 'invOrganizationLov',
      type: 'object',
      noCache: true,
      label: intl
        .get('sslm.purchaserEvaluationDetail.table.column.label.invOrganization')
        .d('库存组织'),
      lovCode: 'HPFM.INV_ORG',
      dynamicProps: {
        disabled: ({ record }) => {
          return !record.get('ouId');
        },
        lovPara: ({ record }) => ({
          ouId: record.get('ouId'),
          tenantId: organizationId,
        }),
      },
    },
    { name: 'invOrganizationId', bind: 'invOrganizationLov.organizationId' },
    { name: 'organizationName', bind: 'invOrganizationLov.organizationName' },
    {
      name: 'inventoryLov',
      type: 'object',
      noCache: true,
      label: intl.get('sslm.purchaserEvaluationDetail.table.column.label.inventory').d('库房'),
      lovCode: 'SODR.INVENTORY',
      dynamicProps: {
        disabled: ({ record }) => {
          return !record.get('invOrganizationId');
        },
        lovPara: ({ record }) => ({
          organizationId: record.get('invOrganizationId'),
          tenantId: organizationId,
        }),
      },
    },
    { name: 'inventoryId', bind: 'inventoryLov.inventoryId' },
    { name: 'inventoryName', bind: 'inventoryLov.inventoryName' },
  ];
  // 供应商信息
  const supplierInfo = [
    showOldModal && {
      name: 'supplierCompanyLov',
      type: 'object',
      noCache: true,
      label: intl.get('sslm.purchaserEvaluationDetail.table.column.label.supplierName').d('供应商'),
      lovCode: 'SSLM.SITE_SUPPLIER',
      valueField: 'supplierCompanyId',
      textField: 'supplierName',
      dynamicProps: {
        lovPara: ({ record }) => ({
          tenantId: organizationId,
          companyId: record?.get('companyId'),
          needFeedbackFlag: record?.get('needFeedbackFlag') || 0,
        }),
        disabled: ({ record }) => {
          return record.get('evalHeaderId') || isAmktClient;
        },
        required: ({ record }) => getBasicInfoRequire({ record, isCreate, readOnly }),
      },
    },
    !showOldModal && {
      name: 'supplierCompanyLov',
      type: 'object',
      lovCode: 'SSLM.SUPPLIER', // 固定值, 不可更改
      ignore: 'always',
      label: intl.get('sslm.purchaserEvaluationDetail.table.column.label.supplierName').d('供应商'),
      valueField: 'supplierCompanyId',
      textField: 'supplierName',
      dynamicProps: {
        lovPara: ({ record }) => ({
          companyId: record?.get('companyId'),
          sameFlag: record?.get('needFeedbackFlag') || null,
        }),
        disabled: ({ record }) => {
          return record.get('evalHeaderId') || isAmktClient;
        },
        required: ({ record }) => getBasicInfoRequire({ record, isCreate, readOnly }),
      },
    },
    { name: 'supplierCompanyId', bind: 'supplierCompanyLov.supplierCompanyId' },
    {
      name: 'supplierCompanyNum',
      bind: 'supplierCompanyLov.supplierCompanyNum',
      label: intl
        .get('sslm.purchaserEvaluationDetail.table.column.label.supplierCompanyNum')
        .d('平台供应商编码'),
    },
    { name: 'supplierCompanyName', bind: 'supplierCompanyLov.supplierCompanyName' },
    { name: 'supplierId', bind: 'supplierCompanyLov.supplierId' },
    { name: 'supplierTenantId', bind: 'supplierCompanyLov.supplierTenantId' },
    {
      name: 'supplierNum',
      bind: 'supplierCompanyLov.supplierNum',
      label: intl
        .get('sslm.purchaserEvaluationDetail.table.column.label.erpSupplierNum')
        .d('erp供应商编码'),
    },
    { name: 'supplierName', bind: 'supplierCompanyLov.supplierName' },
    {
      name: 'supplierType',
      label: intl.get('sslm.purchaserEvaluationDetail.form.label.supplierType').d('供应商类型'),
      lookupCode: 'SSLM.SUPPLIER_TYPE',
    },
    {
      name: 'supplierContactor',
      label: intl
        .get('sslm.purchaserEvaluationDetail.table.column.label.supplierContacts')
        .d('供应商联系人'),
      bind: 'supplierCompanyLov.name',
      dynamicProps: {
        disabled: ({ record }) => {
          return !(record.get('supplierId') || record.get('supplierCompanyId'));
        },
      },
    },
    {
      name: 'internationalTelCode',
      lookupCode: 'HPFM.IDD',
      defaultValue: '+86',
      // bind: 'supplierCompanyLov.internationalTelCode',
      dynamicProps: {
        disabled: ({ record }) => {
          return !(record.get('supplierId') || record.get('supplierCompanyId'));
        },
      },
    },
    {
      name: 'phoneNumber',
    },
    {
      name: 'mobilephoneField',
      label: intl
        .get('sslm.purchaserEvaluationDetail.table.column.label.supplierTelephone')
        .d('供应商联系电话'),
      ignore: 'always',
    },
    {
      name: 'supplierContactPhone',
      type: 'tel',
      regionField: 'internationalTelCode',
      label: intl
        .get('sslm.purchaserEvaluationDetail.table.column.label.supplierTelephone')
        .d('供应商联系电话'),
      dynamicProps: {
        pattern: ({ record }) =>
          (record.get('internationalTelCode') || '+86') === '+86' ? PHONE : NOT_CHINA_PHONE,
        disabled: ({ record }) => {
          return !(record.get('supplierId') || record.get('supplierCompanyId'));
        },
      },
      bind: 'supplierCompanyLov.mobilephone',
    },
    {
      name: 'supplierContactMail',
      pattern: EMAIL,
      label: intl
        .get('sslm.purchaserEvaluationDetail.table.column.label.supplierEmail')
        .d('供应商联系邮箱'),
      bind: 'supplierCompanyLov.mail',
      dynamicProps: {
        disabled: ({ record }) => {
          return !(record.get('supplierId') || record.get('supplierCompanyId'));
        },
      },
    },
    {
      name: 'supplierRegisteredAddress',
      label: intl
        .get('sslm.purchaserEvaluationDetail.table.column.label.supplierAddress')
        .d('供应商注册地址'),
      bind: 'supplierCompanyLov.addressDetail',
      disabled: true,
    },
    {
      name: 'supplierOverview',
      label: intl.get('sslm.purchaserEvaluationDetail.form.label.supplierOverview').d('供应商概况'),
    },
    {
      name: 'evalAddress',
      label: intl.get('sslm.purchaserEvaluationDetail.form.label.evalAddress').d('实际考察地址'),
    },
    {
      name: 'backRemark',
      label: intl
        .get('sslm.purchaserEvaluationDetail.form.label.backRemark')
        .d('供应商自我评价说明'),
    },
    {
      name: 'backReason',
      label: intl.get('sslm.purchaserEvaluationDetail.form.label.backReason').d('退回原因'),
    },
  ].filter(Boolean);
  // 评估结果
  const assessmentResult = [
    {
      name: 'finalScore',
      type: 'number',
      label: intl.get('sslm.purchaserEvaluationDetail.form.label.finalScore').d('最后得分'),
      dynamicProps: {
        disabled: ({ record }) => {
          return record.get('evalType') === 'ONLINE';
        },
      },
    },
    {
      name: 'grade',
      label: intl.get('sslm.purchaserEvaluationDetail.form.label.level').d('等级'),
      dynamicProps: {
        disabled: ({ record }) => {
          return record.get('evalType') === 'ONLINE';
        },
      },
    },
    {
      name: 'resultsFlag',
      label: intl.get('sslm.purchaserEvaluationDetail.form.label.resultsFlag').d('评估结果'),
      lookupCode: 'SSLM.INVESTIGATION.RESULTS',
      dynamicProps: {
        required: ({ dataSet, record }) => {
          const currentStepStatus = (dataSet.getState('currentStepConfig') || {}).progressStatus;
          return (
            !readOnly &&
            (record.get('progressStatus') === 'EVAL_RESULT' || currentStepStatus === 'EVAL_RESULT')
          );
        },
      },
    },
    {
      name: 'opinion',
      label: intl.get('sslm.purchaserEvaluationDetail.form.label.opinion').d('综合意见'),
      dynamicProps: {
        required: ({ dataSet, record }) => {
          const currentStepStatus = (dataSet.getState('currentStepConfig') || {}).progressStatus;
          return (
            !readOnly &&
            (record.get('progressStatus') === 'EVAL_RESULT' || currentStepStatus === 'EVAL_RESULT')
          );
        },
      },
    },
    {
      name: 'userNames',
      type: 'object',
      ignore: 'always',
      label: intl.get('sslm.purchaserEvaluationDetail.form.label.copyTo').d('抄送'),
      lovCode: 'SPUC.ACCEPT_USER',
      multiple: true,
      dynamicProps: {
        lovPara: () => {
          return {
            tenantId: organizationId,
          };
        },
      },
    },
    { name: 'informUserIds', bind: 'userNames.userId', multiple: ',' },
    {
      name: 'respUserRemarks',
      disabled: true,
      label: intl.get('sslm.common.model.field.ratersSynthesizeOpinions').d('评分人综合意见'),
    },
    {
      // 供应商自评最后得分
      name: 'selfFinalSupplierScore',
      type: 'number',
      label: intl
        .get('sslm.purchaserEvaluationDetail.form.label.selfFinalSupplierScore')
        .d('供应商自评最后得分'),
      disabled: true,
    },
    {
      // 评估末级指标总分
      name: 'lastTotalScore',
      type: 'number',
      label: intl.get('sslm.purchaserEvaluationDetail.form.label.totalScore').d('评估末级指标总分'),
      disabled: true,
    },
  ];
  // 审查结果附件
  const assessmentResultAttachment = [
    {
      // 审查结果附件
      name: 'resultLinkUuid',
      type: 'attachment',
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: bucketDirectory.evaluation,
      label: intl.get('sslm.purchaserEvaluationDetail.form.label.resultLinkAtt').d('审查结果附件'),
    },
  ];
  // 内部外部附件
  const attachment = [
    {
      // 内部附件
      name: 'internalAttachmentUuid',
      type: 'attachment',
      bucketDirectory: bucketDirectory.evaluation,
      defaultValue: uuid(), // 前端生成默认值，解决后端评分时不能更新头问题
      label: intl
        .get('sslm.purchaserEvaluationDetail.form.label.internalAttachment')
        .d('采购方附件'),
    },
    {
      // 外部附件
      name: 'externalAttachmentUuid',
      type: 'attachment',
      bucketDirectory: bucketDirectory.evaluation,
      defaultValue: uuid(), // 前端生成默认值，解决后端评分时不能更新头问题
      label: intl
        .get('sslm.purchaserEvaluationDetail.form.label.PurchaseAccessoriesAttachment')
        .d('采购方附件'),
    },
    {
      name: 'selfEvalAttachmentUuid',
      type: 'attachment',
      bucketDirectory: bucketDirectory.evaluation,
      defaultValue: uuid(), // 前端生成默认值，解决后端评分时不能更新头问题
      label: intl
        .get('sslm.purchaserEvaluationDetail.form.label.supplierAccessoriesAttachment')
        .d('供应商附件'),
    },
  ];

  const fieldsArray = [
    ...basicInfo,
    ...companyInfo,
    ...supplierInfo,
    ...assessmentResult,
    ...assessmentResultAttachment,
    ...attachment,
  ];

  return {
    primaryKey: 'evalHeaderId',
    forceValidate: true,
    fields: fieldsArray,
    transport: {
      read: ({ data }) => {
        const { queryParams, ...otherData } = data;
        const { evalHeaderId, wfParams = {}, ...others } = queryParams || {};
        return {
          url: `${SRM_SSLM}/v1/${organizationId}/site-eval-headers/eval-report/${evalHeaderId}`,
          method: 'GET',
          params: {},
          data: {
            ...otherData,
            ...others,
            ...wfParams,
          },
        };
      },
    },
    events: {
      load: ({ dataSet }) => {
        dataSet.forEach(i => {
          Object.assign(i, { status: 'update' });
        });
      },
      update: ({ record, name, value }) => {
        if (name === 'supplierCompanyLov') {
          if (value) {
            record.set({
              supplierName: value.supplierCompanyName || value.supplierName,
              internationalTelCode: value.internationalTelCode,
            });
          } else {
            record.set({
              supplierName: null,
              internationalTelCode: null,
            });
          }
        }
        if (name === 'groupFlag') {
          if (value && +value === 1) {
            record.set({ companyLov: {}, ouLov: {}, invOrganizationLov: {}, inventoryLov: {} });
          }
        }
        // if (name === 'strategyLov' && !isAmktClient) {
        //   record.set({
        //     supplierCompanyLov: null,
        //   });
        // }
      },
    },
  };
};

/**
 * @description: 评估物料/品类 DataSet 配置
 * @return {*}
 */
const getItemCategoryInfoDs = (evalHeaderId, sourceKey) => ({
  primaryKey: 'evalItemCateId',
  forceValidate: true,
  pageSize: 20,
  fields: [
    {
      name: 'itemLov',
      label: intl.get('sslm.purchaserEvaluationDetail.table.column.label.itemCode').d('物料编码'),
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
            categoryId: record.get('itemCategoryId'),
          };
        },
      },
    },
    { name: 'itemId', bind: 'itemLov.itemId' },
    { name: 'itemCode', bind: 'itemLov.itemCode' },
    {
      name: 'itemName',
      bind: 'itemLov.itemName',
      label: intl.get('sslm.purchaserEvaluationDetail.table.column.label.itemName').d('物料名称'),
      dynamicProps: {
        disabled: ({ record }) => {
          return record.get('itemCode');
        },
      },
    },
    {
      name: 'categoryLov',
      type: 'object',
      noCache: true,
      ignore: 'always',
      label: intl
        .get('sslm.purchaserEvaluationDetail.table.column.label.categoryCode')
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
    { name: 'itemCategoryId', bind: 'categoryLov.categoryId' },
    { name: 'itemCategoryCode', bind: 'categoryLov.categoryCode' },
    {
      name: 'itemCategoryName',
      label: intl
        .get('sslm.purchaserEvaluationDetail.table.column.label.categoryName')
        .d('品类名称'),
      dynamicProps: {
        disabled: ({ record }) => {
          return record.get('categoryCode');
        },
      },
    },
    {
      name: 'brand',
      label: intl.get('sslm.purchaserEvaluationDetail.table.column.label.brand').d('品牌'),
    },
    {
      name: 'remark',
      label: intl.get('sslm.purchaserEvaluationDetail.table.column.label.remark').d('备注'),
    },
  ],
  transport: {
    read: ({ params, dataSet }) => {
      const newEvalHeaderId = dataSet?.parent?.current?.get('evalHeaderId') || evalHeaderId;
      const { wfParams = {} } = dataSet.parent?.getQueryParameter('queryParams') || {};
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/site-eval-item-cates/${newEvalHeaderId}`,
        method: 'GET',
        params: {
          customizeUnitCode: 'SSLM.PURCHASER_ASSESS_DETAIL.EVALUATE_MATERIALS_TABLE', // 不可动位置，存在后面覆盖前面的情况
          ...params,
          ...wfParams,
          pageSource: sourceKey === 'SCORE_DETAILS' ? 'SCORE' : null,
        },
      };
    },
    destroy: ({ data }) => {
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/site-eval-item-cates`,
        method: 'DELETE',
        data: data.map(i => i.evalItemCateId),
      };
    },
    submit: () => {
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/site-eval-item-cates`,
        method: 'POST',
      };
    },
  },
  events: {
    update: ({ name, value, record }) => {
      if (name === 'itemLov') {
        record.set({
          itemCategoryId: value ? value.categoryId : null,
          itemCategoryCode: value ? value.categoryCode : null,
          itemCategoryName: value ? value.categoryName : null,
        });
      }
      if (name === 'categoryLov') {
        record.set({
          itemCategoryName: value ? value.categoryName : null,
          categoryCode: value ? value.categoryCode : null,
        });
      }
    },
  },
});

/**
 * @description: 评估小组 DataSet 配置
 * @return {*}
 */
const getAssessmentPanelDs = evalHeaderId => ({
  primaryKey: 'evalGroupId',
  pageSize: 20,
  fields: [
    {
      name: 'evalHeaderId',
      defaultValue: evalHeaderId,
    },
    {
      name: 'userType',
      label: intl.get('sslm.purchaserEvaluationDetail.table.column.label.userType').d('代表方'),
      lookupCode: 'SSLM.SITE_GROUP_TYPE',
      defaultValue: 'PURCHASER', // SUPPLIER:供应商 PURCHASER:采购方
      required: true,
      dynamicProps: {
        disabled: ({ record }) => {
          const { supplierUserId, userId, templateAddFlag, evalGroupId } = record.get([
            'supplierUserId',
            'userId',
            'templateAddFlag',
            'evalGroupId',
          ]);
          let supplierUserIdFlag = false;
          let userIdFlag = false;
          if (typeof supplierUserId === 'number') {
            supplierUserIdFlag = Number(supplierUserId);
          } else {
            supplierUserIdFlag = !isEmpty(supplierUserId);
          }
          if (typeof userId === 'number') {
            userIdFlag = Number(userId);
          } else {
            userIdFlag = !isEmpty(userId);
          }
          return supplierUserIdFlag || userIdFlag || templateAddFlag || evalGroupId;
        },
      },
    },
    {
      name: 'supplierCompanyLov',
      type: 'object',
      noCache: true,
      label: intl
        .get('sslm.purchaserEvaluationDetail.table.column.label.supplierContacts')
        .d('供应商联系人'),
      lovCode: 'SSLM.SUPPLIER_MAIN_DATA_CONTACT',
      valueField: 'name',
      textField: 'name',
      transformResponse: (value, date) => {
        if (date.supplierUserId) {
          return {
            id: date.supplierUserId,
            name: date.supplierLoginName,
          };
        } else {
          return null;
        }
      },
      computedProps: {
        lovPara: ({ dataSet }) => {
          const { supplierTenantId, companyId, supplierCompanyId } =
            dataSet.parent?.current?.get(['supplierCompanyId', 'companyId']) || {};
          return {
            companyId,
            partnerTenantId: supplierTenantId,
            partnerCompanyId: supplierCompanyId,
          };
        },
      },
      dynamicProps: {
        disabled: ({ record }) => {
          const { userType, templateAddFlag, evalGroupId } = record.get([
            'userType',
            'templateAddFlag',
            'evalGroupId',
          ]);
          const purchaserFlag =
            userType === 'PURCHASER' || templateAddFlag || evalGroupId || isEmpty(userType);
          return purchaserFlag;
        },
      },
    },
    {
      name: 'supplierUserId',
    },
    {
      name: 'supplierLoginName',
    },
    {
      name: 'userLov',
      label: intl.get('sslm.purchaserEvaluationDetail.table.column.label.Account').d('账户'),
      type: 'object',
      lovCode: 'SSLM.TENANT.SUB.ACCOUNT',
      textField: 'loginName',
      valueField: 'id',
      ignore: 'always',
      lovPara: {
        tenantId: organizationId,
      },
      transformResponse: (value, date) => {
        if (date.userId) {
          return {
            id: date.userId,
            loginName: date.loginName,
          };
        } else {
          return null;
        }
      },
      dynamicProps: {
        disabled: ({ record }) => {
          const { userType, evalGroupId } = record.get(['userType', 'evalGroupId']);
          const supplierFlag = userType === 'SUPPLIER' || isEmpty(userType);
          return supplierFlag || record.get('scoreStatus') || evalGroupId;
        },
      },
    },
    {
      name: 'userId',
    },
    {
      name: 'loginName',
    },
    {
      name: 'member',
      label: intl.get('sslm.purchaserEvaluationDetail.table.column.label.member').d('名称'),
      required: true,
    },
    {
      name: 'department',
      label: intl.get('sslm.purchaserEvaluationDetail.table.column.label.department').d('部门'),
    },
    {
      name: 'post',
      label: intl.get('sslm.purchaserEvaluationDetail.table.column.label.station').d('岗位'),
    },
    {
      name: 'internationalTelCode',
      lookupCode: 'HPFM.IDD',
      defaultValue: '+86',
    },
    {
      name: 'phone',
      label: intl.get('sslm.common.fields.contacts.telephone').d('联系电话'),
      type: 'tel',
      regionField: 'internationalTelCode',
      dynamicProps: {
        pattern: ({ record }) => {
          return (record.get('internationalTelCode') || '+86') === '+86' ? PHONE : NOT_CHINA_PHONE;
        },
      },
    },
    {
      name: 'email',
      pattern: EMAIL,
      label: intl.get('sslm.purchaserEvaluationDetail.table.column.label.email').d('邮箱'),
    },
    {
      name: 'leaderFlag',
      type: 'boolean',
      label: intl.get('sslm.purchaserEvaluationDetail.table.column.label.isLeader').d('是否组长'),
      trueValue: 1,
      falseValue: 0,
    },
    {
      name: 'scoreStatus',
      label: intl
        .get('sslm.purchaserEvaluationDetail.table.column.label.evaluationIndex')
        .d('评估指标'),
    },
    {
      name: 'siteLocation',
      label: intl
        .get('sslm.purchaserEvaluationDetail.table.column.label.siteLocation')
        .d('现场定位'),
    },
  ],
  transport: {
    read: ({ data, dataSet }) => {
      const newEvalHeaderId = dataSet?.parent?.current?.get('evalHeaderId') || evalHeaderId;
      const { wfParams = {} } = dataSet.parent?.getQueryParameter('queryParams') || {};
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/site-eval-groups/eval-report/${newEvalHeaderId}`,
        method: 'GET',
        data: {
          customizeUnitCode: 'SSLM.PURCHASER_ASSESS_DETAIL.ASSESSMENT_TEAM', // 不可动位置，存在后面覆盖前面的情况
          ...data,
          ...wfParams,
        },
      };
    },
    destroy: ({ data, dataSet }) => {
      const newEvalHeaderId = dataSet?.parent?.current?.get('evalHeaderId') || evalHeaderId;
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/site-eval-groups/${newEvalHeaderId}/site-resp`,
        method: 'DELETE',
        data: data.map(i => i.evalGroupId),
      };
    },
    submit: () => {
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/site-eval-groups`,
        method: 'POST',
      };
    },
  },
  events: {
    load: ({ dataSet }) => {
      const progressStatus = dataSet?.parent?.current?.get('progressStatus');
      dataSet.forEach(record => {
        // 线上评分-评估结果确认节点,已经分配评估指标的小组成员不允许进行修改和删除
        if (record.get('scoreStatus') && progressStatus === 'EVAL_RESULT') {
          Object.assign(record, { selectable: false });
        }
      });
    },
    update: ({ name, record, value }) => {
      switch (name) {
        case 'userLov':
          record.set({
            userId: value?.id,
            email: value?.email,
            phone: value?.mobile,
            member: value?.name,
            post: value?.positionName,
            department: value?.unitName,
            loginName: value?.loginName,
            internationalTelCode: value?.internationalTelCode,
          });
          break;
        case 'supplierCompanyLov':
          record.set({
            member: value?.name,
            email: value?.email,
            post: value?.position,
            supplierUserId: value?.id,
            phone: value?.mobilephone,
            department: value?.department,
            supplierLoginName: value?.name,
            internationalTelCode: value?.internationalTelCode,
          });
          break;
        default:
          break;
      }
    },
  },
});

// 评分人改变时的回调
const handleEvalResps = ({ value, record }) => {
  // 评分小组
  const siteEvalLineResps = record.get('siteEvalLineResps');
  // 评分信息行id
  const evalLineId = record.get('evalLineId');
  let newList = []; // 评分人下拉列表
  let evalResps = []; // 评分人展示列表
  if (value) {
    const respUserIds = value.map(n => n.respUserId);
    newList = siteEvalLineResps.map(data => {
      const { evalLineRespId, ...others } = data;
      return { ...others, evalLineId, isSelect: respUserIds.includes(data.respUserId) ? 1 : 0 };
    });
    evalResps = value.map(n => {
      const { evalLineRespId, ...others } = n;
      return others;
    });
  } else {
    // 大清除
    newList = siteEvalLineResps.map(n => ({ ...n, isSelect: 0 }));
  }
  record.set({
    evalResps,
    siteEvalLineResps: newList,
  });
};

// 判断评分信息中是否含有否决项，且是否有否决项被勾选，若任一否决项被勾选，则其他类型的指标不允许打分
const getScoreDisabled = dataSet => {
  const vetoList = dataSet.filter(record => record.get('indicatorType') === 'VETO');
  const scoreDisabled = vetoList.some(record => Boolean(record.get('isVeto')));
  return scoreDisabled;
};

/**
 * @description: 评估信息 DataSet 配置
 * @return {*}
 */
const getAssessmentInfoDs = ({
  selection = false,
  source,
  code,
  isCreate,
  evalHeaderId,
  allFlag,
  readOnly,
  searchCode = '',
  submitUserId,
}) => {
  return {
    primaryKey: 'evalLineId',
    selection,
    cacheSelection: true,
    forceValidate: true,
    ...(source === 'score'
      ? { paging: true, pageSize: 20 }
      : {
          paging: false,
          idField: 'indicatorId',
          parentField: 'parentId',
        }),
    fields: [
      {
        name: 'indicatorCode',
        label: intl
          .get('sslm.purchaserEvaluationDetail.table.column.label.indicatorCode')
          .d('评估项目代码'),
      },
      {
        name: 'indicatorName',
        label: intl
          .get('sslm.purchaserEvaluationDetail.table.column.label.indicatorName')
          .d('评估项目名称'),
      },
      {
        name: 'scoreTypeMeaning',
        label: intl
          .get('sslm.purchaserEvaluationDetail.table.column.label.scoreType')
          .d('评分方式'),
      },
      {
        name: 'evalStandard',
        label: intl
          .get('sslm.purchaserEvaluationDetail.table.column.label.evalStandard')
          .d('评分标准'),
      },
      {
        name: 'backReason',
        label: intl
          .get('sslm.purchaserEvaluationDetail.table.column.label.backReason')
          .d('退回原因'),
      },
      {
        name: 'indicatorTypeMeaning',
        label: intl
          .get('sslm.purchaserEvaluationDetail.table.column.label.indicatorType')
          .d('评估项目类型'),
      },
      {
        name: 'finalLevelDesc',
        label: intl.get(`sslm.supplierDocManage.model.docManage.indicatorLevelCode`).d('指标等级'),
      },
      {
        name: 'supplierEvalFlag',
        label: intl
          .get('sslm.purchaserEvaluationDetail.table.column.label.supplierEvalFlag')
          .d('供应商自评指标'),
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
      },
      {
        name: 'supplierScore',
        label: intl
          .get('sslm.purchaserEvaluationDetail.table.column.label.supplierScore')
          .d('供应商自评得分'),
      },
      {
        name: 'supplierRemarks',
        label: intl
          .get('sslm.purchaserEvaluationDetail.table.column.label.supplierRemarks')
          .d('供应商自评意见'),
      },
      {
        name: 'attachmentUuid',
        type: 'attachment',
        bucketName: PRIVATE_BUCKET,
        bucketDirectory: bucketDirectory.evaluation,
        label: intl
          .get('sslm.purchaserEvaluationDetail.table.column.label.supplierAttachment')
          .d('供应商自评附件'),
      },
      {
        name: 'evalWeight',
        label: intl
          .get('sslm.purchaserEvaluationDetail.table.column.label.evalWeight')
          .d('指标权重'),
      },
      {
        name: 'evalResps',
        type: 'object',
        textField: 'realName',
        label: intl.get('sslm.purchaserEvaluationDetail.table.column.label.scorer').d('评分人'),
        dynamicProps: {
          required: ({ record, dataSet }) => {
            const progressStatus = dataSet?.parent?.current?.get('progressStatus');
            const { leafFlag, scoreType } = record?.get(['leafFlag', 'scoreType']) || {};
            const requiredFlag =
              !readOnly &&
              scoreType !== 'SYSTEM' &&
              leafFlag &&
              progressStatus === 'INTERNAL_EVAL' &&
              source === 'manage';
            return requiredFlag;
          },
        },
      },
      {
        name: 'completeFlag',
        type: 'number',
        label: intl
          .get('sslm.purchaserEvaluationDetail.table.column.label.indicatorStatus')
          .d('指标评估状态'),
        defaultValue: isCreate ? 0 : undefined,
      },
      {
        name: 'respWeight',
        label: intl
          .get('sslm.purchaserEvaluationDetail.table.column.label.respWeight')
          .d('评分人权重'),
      },
      {
        name: 'finalScore',
        label: intl.get('sslm.purchaserEvaluationDetail.table.column.label.finalScore').d('得分'),
      },
      {
        name: 'score',
        // type: 'number',
        label: intl.get('sslm.purchaserEvaluationDetail.table.column.label.score').d('得分'),
        dynamicProps: {
          disabled: ({ record, dataSet }) => {
            return record?.get('indicatorType') !== 'SCORE' || dataSet?.getState('scoreDisabled');
          },
        },
        transformResponse: (value, data) => {
          if (isNil(value)) {
            return data.completeFlag === 4 ? value : data.defaultScore;
          } else {
            return value;
          }
        },
      },
      {
        name: 'scoreFrom',
        label: intl.get('sslm.purchaserEvaluationDetail.table.column.label.scoreFrom').d('分值从'),
      },
      {
        name: 'scoreTo',
        label: intl.get('sslm.purchaserEvaluationDetail.table.column.label.scoreTo').d('分值至'),
      },
      {
        name: 'defaultScore',
        label: intl
          .get('sslm.purchaserEvaluationDetail.table.column.label.defaultScore')
          .d('缺省分值'),
      },
      {
        name: 'isStandard',
        label: intl
          .get('sslm.purchaserEvaluationDetail.table.column.label.isStandard')
          .d('符合评分标准'),
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
        defaultValue: 0,
        dynamicProps: {
          disabled: ({ record, dataSet }) => {
            return record?.get('indicatorType') !== 'TICK' || dataSet?.getState('scoreDisabled');
          },
        },
        transformRequest: value => (isNil(value) ? 0 : value),
        transformResponse: value => {
          if (isNil(value)) {
            return 0;
          } else {
            return value;
          }
        },
      },
      {
        name: 'isVeto',
        label: intl.get('sslm.purchaserEvaluationDetail.table.column.label.isVeto').d('否决该项'),
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
        defaultValue: 0,
        dynamicProps: {
          disabled: ({ record }) => {
            return record?.get('indicatorType') !== 'VETO';
          },
        },
        transformRequest: value => (isNil(value) ? 0 : value),
        transformResponse: value => {
          if (isNil(value)) {
            return 0;
          } else {
            return value;
          }
        },
      },
      {
        name: 'indOptLov',
        type: 'object',
        ignore: 'always',
        label: intl
          .get('sslm.purchaserEvaluationDetail.table.column.label.indOptName')
          .d('评分选项'),
        textField: 'meaning',
        valueField: 'value',
        dynamicProps: {
          disabled: ({ record, dataSet }) => {
            return record?.get('indicatorType') !== 'OPT' || dataSet?.getState('scoreDisabled');
          },
        },
        transformResponse: (_, data) => {
          const { score, evalTplIndOptId, indOptName } = data;
          return {
            score,
            value: evalTplIndOptId,
            meaning: indOptName,
          };
        },
      },
      {
        name: 'transformReason',
        label: intl
          .get('sslm.purchaserEvaluationDetail.table.column.label.transformReason')
          .d('转交原因'),
      },
      {
        name: 'scoreAttachmentUuid',
        type: 'attachment',
        bucketName: PRIVATE_BUCKET,
        bucketDirectory: bucketDirectory.evaluation,
        label: intl
          .get('sslm.purchaserEvaluationDetail.table.column.label.gradeAttachment')
          .d('评分附件'),
      },
      {
        name: 'scoreAttachmentUuids',
        type: 'attachment',
        bucketName: PRIVATE_BUCKET,
        bucketDirectory: bucketDirectory.evaluation,
        label: intl
          .get('sslm.purchaserEvaluationDetail.table.column.label.gradeAttachment')
          .d('评分附件'),
      },
      {
        name: 'respRemarks',
        label: intl
          .get('sslm.purchaserEvaluationDetail.table.column.label.selfRespRemarks')
          .d('内部评分备注'),
      },
      {
        name: 'selfSupplierScore',
        type: 'number',
        label: intl
          .get('sslm.purchaserEvaluationDetail.table.column.label.selfSupplierScore')
          .d('供应商自评打分'),
      },
      {
        name: 'selfIsStandard',
        label: intl
          .get('sslm.purchaserEvaluationDetail.table.column.label.selfIsStandard')
          .d('供应商自评符合评分标准'),
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
      },
      {
        name: 'selfIsVeto',
        label: intl
          .get('sslm.purchaserEvaluationDetail.table.column.label.selfIsVeto')
          .d('供应商自评否决该项'),
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
      },
      {
        name: 'selfIndOptId',
        label: intl
          .get('sslm.purchaserEvaluationDetail.table.column.label.selfIndOptId')
          .d('供应商自评评分选项'),
        lookupCode: 'SSLM.KPI.INDICATOR.OPT.CFG',
      },
      {
        name: 'orderSeq',
        label: intl.get('sslm.common.model.field.orderSeq').d('排序'),
        order: 'asc',
      },
      {
        name: 'summaryRatersAttachment',
        label: intl
          .get('sslm.purchaserEvaluationDetail.table.column.label.summaryRatersAttachment')
          .d('汇总评分人附件'),
      },
      {
        name: 'parentIndicatorCode',
        label: intl
          .get('sslm.purchaserEvaluationDetail.model.assessmentInfo.parentIndicatorCode')
          .d('直属上级指标编码'),
      },
      {
        name: 'parentIndicatorName',
        label: intl
          .get('sslm.purchaserEvaluationDetail.model.assessmentInfo.parentIndicatorName')
          .d('直属上级指标名称'),
      },
      {
        name: 'superIndicatorCode',
        label: intl
          .get('sslm.purchaserEvaluationDetail.model.assessmentInfo.superIndicatorCode')
          .d('一级指标编码'),
      },
      {
        name: 'superIndicatorName',
        label: intl
          .get('sslm.purchaserEvaluationDetail.model.assessmentInfo.superIndicatorName')
          .d('一级指标名称'),
      },
    ],
    transport: {
      read: ({ data, params, dataSet }) => {
        const newEvalHeaderId = dataSet?.parent?.current?.get('evalHeaderId') || evalHeaderId;
        const { wfParams = {} } = dataSet.parent?.getQueryParameter('queryParams') || {};
        switch (source) {
          case 'score':
            return {
              url: `${SRM_SSLM}/v1/${organizationId}/site-eval-lines/eval-report/${newEvalHeaderId}/evaluating`,
              method: 'GET',
              params: filterNullValueObject({
                ...params,
                submitUserId,
                customizeUnitCode: [
                  searchCode,
                  'SSLM.PURCHASER_ASSESS_DETAIL.EVALUATION_INFORMATION',
                  'SSLM.PURCHASER_ASSESS_DETAIL.SCORE_INFORMATION',
                ].join(','),
              }),
              data: {
                ...data,
                code,
                allFlag,
              },
            };
          default:
            return {
              url: `${SRM_SSLM}/v1/${organizationId}/site-eval-lines/eval-report-line/${newEvalHeaderId}`,
              method: 'GET',
              params: {
                customizeUnitCode: [
                  searchCode,
                  'SSLM.PURCHASER_ASSESS_DETAIL.EVALUATION_INFORMATION',
                  'SSLM.PURCHASER_ASSESS_DETAIL.EVALUATION_STATUS_INFORMATION',
                ].join(','), // 不可动位置，存在后面覆盖前面的情况
                ...params,
                ...wfParams,
              },
              data: {
                ...data,
              },
            };
        }
      },
    },
    events: {
      load: ({ dataSet }) => {
        dataSet.forEach(record => {
          if (record.data.scoreType === 'SYSTEM' || record.data.completeFlag === 4) {
            Object.assign(record, { selectable: false });
          }
        });
        const vetoScoreFlag = dataSet?.parent?.current?.get('evalPlanStrategy')?.vetoScoreFlag;
        if (vetoScoreFlag) {
          const scoreDisabled = getScoreDisabled(dataSet);
          dataSet.setState('scoreDisabled', scoreDisabled);
        }
      },
      update: ({ value, name, record, dataSet }) => {
        if (name === 'evalResps') {
          handleEvalResps({ value, record });
        }
        if (name === 'isVeto') {
          const vetoScoreFlag = dataSet?.parent?.current?.get('evalPlanStrategy')?.vetoScoreFlag;
          if (vetoScoreFlag) {
            const scoreDisabled = getScoreDisabled(dataSet);
            dataSet.setState('scoreDisabled', scoreDisabled);
          }
        }
      },
      select: ({ dataSet, record }) => {
        if (record.children) {
          record.children.forEach(i => dataSet.select(i));
        }
      },
      unSelect: ({ dataSet, record }) => {
        if (record.children) {
          record.children.forEach(i => dataSet.unSelect(i));
        }
      },
    },
  };
};

/**
 * @description: 评分人汇总信息
 * @param {*} evalHeaderId
 * @return {*}
 */
const getScoreSumInfoDs = ({ submitUserId, customizeUnitCode = '' }) => {
  return {
    fields: [
      {
        name: 'respUserName',
        label: intl.get('sslm.purchaserEvaluationDetail.form.label.scoreUserName').d('评分人名称'),
        disabled: true,
      },
      {
        name: 'userDepartmentName',
        label: intl
          .get('sslm.purchaserEvaluationDetail.form.label.scoreUserDepartmentName')
          .d('评分人部门'),
        disabled: true,
      },
      {
        name: 'sumScore',
        label: intl.get('sslm.purchaserEvaluationDetail.form.label.sumScore').d('评分人汇总得分'),
        disabled: true,
      },
      {
        name: 'respUserRemark',
        label: intl.get('sslm.common.model.field.raterOpinion').d('评分人意见'),
      },
      {
        name: 'siteLocation',
        label: intl
          .get('sslm.purchaserEvaluationDetail.table.column.label.siteLocation')
          .d('现场定位'),
      },
    ],
    transport: {
      read: ({ data, dataSet }) => {
        const evalHeaderId = dataSet?.parent?.current?.get('evalHeaderId');
        return {
          url: `${SRM_SSLM}/v1/${organizationId}/site-eval-resp-headers/get-resp-header/${evalHeaderId}`,
          method: 'GET',
          params: {
            customizeUnitCode,
          },
          data: filterNullValueObject({
            ...data,
            submitUserId,
          }),
        };
      },
    },
  };
};

/**
 * @description: 评分人
 * @param {*} evalHeaderId
 * @return {*}
 */
const getScoreDs = ({ averageFlag, batchFlag = false, evalHeaderId }) => {
  return {
    dataToJSON: 'selected',
    paging: !!batchFlag,
    forceValidate: true,
    primaryKey: 'respUserId',
    pageSize: 20,
    fields: [
      {
        name: 'isSelect',
        label: intl.get('sslm.purchaserEvaluationDetail.scoreTable.label.isSelect').d('分配评分人'),
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
      },
      {
        name: 'loginName',
        label: intl.get('sslm.purchaserEvaluationDetail.scoreTable.label.loginName').d('子账户'),
      },
      {
        name: 'realName',
        label: intl.get('sslm.purchaserEvaluationDetail.scoreTable.label.scorerealName').d('名称'),
        transformResponse: (_, object) => object.member || object.realName,
      },
      {
        name: 'userDepartment',
        label: intl.get('sslm.purchaserEvaluationDetail.scoreTable.label.userDepartment').d('部门'),
        transformResponse: (_, object) => object.department || object.userDepartment,
      },
      {
        name: 'respWeight',
        type: 'number',
        label: intl
          .get('sslm.purchaserEvaluationDetail.scoreTable.label.respWeight')
          .d('评分人权重(%)'),
        max: 100,
        dynamicProps: {
          disabled: ({ record }) => averageFlag || !record.isSelected,
          required: ({ record }) => !averageFlag && record.isSelected,
        },
      },
    ],
    transport: {
      read: {
        url: `${SRM_SSLM}/v1/${organizationId}/site-eval-groups/eval-report/${evalHeaderId}/assign`,
        method: 'GET',
      },
    },
    events: {
      load: ({ dataSet }) => {
        dataSet.forEach(record => {
          const { isSelect } = record.get(['isSelect']);
          Object.assign(record, { isSelected: isSelect });
        });
      },
    },
  };
};

/**
 * @description: 转交弹窗Ds
 * @param {*} evalHeaderId
 * @return {*}
 */
const getTransferDs = ({ averageFlag }) => {
  return {
    paging: false,
    forceValidate: true,
    fields: [
      {
        name: 'userLov',
        label: intl.get('sslm.purchaserEvaluationDetail.scoreTable.label.loginName').d('子账户'),
        type: 'object',
        required: true,
        ignore: 'always',
        lovCode: 'SSLM.KPI_CHOOSE_USER',
        textField: 'loginName',
        valueField: 'userId',
        lovPara: {
          tenantId: organizationId,
        },
      },
      {
        name: 'respUserId',
        bind: 'userLov.userId',
      },
      {
        name: 'loginName',
        bind: 'userLov.loginName',
      },
      {
        name: 'userName',
        disabled: true,
        label: intl.get('sslm.purchaserEvaluationDetail.scoreTable.label.userName').d('名称'),
        bind: 'userLov.userName',
      },
      {
        name: 'userDepartment',
        label: intl.get('sslm.purchaserEvaluationDetail.scoreTable.label.userDepartment').d('部门'),
        bind: 'userLov.unitName',
      },
      {
        name: 'respWeight',
        type: 'number',
        label: intl
          .get('sslm.purchaserEvaluationDetail.scoreTable.label.respWeight')
          .d('评分人权重(%)'),
        max: 100,
        dynamicProps: {
          disabled: () => averageFlag,
        },
        validator: value => {
          if (averageFlag === 1) {
            return true;
          } else if (value > 0) {
            return true;
          } else {
            return intl
              .get('sslm.purchaserEvaluationDetail.scoreTable.label.respWeightValidate')
              .d('权重值必须大于0');
          }
        },
      },
      {
        name: 'transformReason',
        label: intl
          .get('sslm.purchaserEvaluationDetail.scoreTable.label.transformReason')
          .d('转交原因'),
      },
    ],
  };
};

const getReformContentDs = ({ evalHeaderId, sourceKey }) => {
  return {
    primaryKey: 'evalExternalOrderId',
    pageSize: 20,
    record: {
      dynamicProps: {
        selectable: record =>
          sourceKey === 'SCORE_DETAILS' ? record?.get('createdBy') === currentUserId : true,
      },
    },
    fields: [
      {
        name: 'createdBy',
        defaultValue: currentUserId,
      },
      {
        name: 'reformContent',
        label: intl
          .get('sslm.purchaserEvaluationDetail.scoreTable.label.reformContent')
          .d('整改内容'),
        required: true,
      },
      {
        name: 'problemTitle',
        label: intl
          .get('sslm.purchaserEvaluationDetail.scoreTable.label.problemTitle')
          .d('整改报告标题'),
      },
      {
        name: 'problemStatusMeaning',
        label: intl
          .get('sslm.purchaserEvaluationDetail.scoreTable.label.problemStatusMeaning')
          .d('单据状态'),
      },
      {
        name: 'problemNum',
        label: intl
          .get('sslm.purchaserEvaluationDetail.scoreTable.label.problemNum')
          .d('整改报告编号'),
      },
      {
        name: 'opteration',
        label: intl.get('sslm.purchaserEvaluationDetail.scoreTable.label.opteration').d('操作'),
      },
      {
        name: 'externalOrderId',
      },
      {
        name: 'evalExternalOrderId',
      },
      {
        name: 'createdUserName',
        label: intl.get(`sslm.common.model.evaluation.createdUserName`).d('创建人'),
      },
      {
        name: 'creationDate',
        type: 'dateTime',
        label: intl.get('hzero.common.date.creation').d('创建时间'),
      },
      {
        name: 'lastUpdatedUserName',
        label: intl.get('sslm.common.user.updateUser').d('更新人'),
      },
      {
        name: 'lastUpdateDate',
        type: 'dateTime',
        label: intl.get('sslm.common.model.time.updateTime').d('更新时间'),
      },
      {
        name: 'createdMoment',
        defaultValue: sourceKey === 'SCORE_DETAILS' ? 'score' : 'administration',
      },
      {
        name: 'createdMomentMeaning',
        lookupCode: 'SSLM_EXTER_ORDER_CREATE_MOMENT',
        label: intl.get('sslm.common.time.creationTiming').d('创建时机'),
      },
    ],
    transport: {
      read: ({ params, dataSet, data }) => {
        const { customizeUnitCode } = data;
        const { wfParams = {} } = dataSet.parent?.getQueryParameter('queryParams') || {};
        const queryPath =
          sourceKey === 'SCORE_DETAILS'
            ? `site_eval_external_orders/eval-report/eval/${evalHeaderId}`
            : `site_eval_external_orders/eval-report/${evalHeaderId}`;
        return {
          url: `${SRM_SSLM}/v1/${organizationId}/${queryPath}`,
          method: 'POST',
          params: {
            customizeUnitCode:
              customizeUnitCode || 'SSLM.PURCHASER_ASSESS_DETAIL.QUALITY_RECTIFICATION', // 不可动位置，存在后面覆盖前面的情况
            ...params,
            ...wfParams,
          },
          data: {
            orderSource: 'reportEval',
          },
        };
      },
      destroy: ({ data }) => ({
        url: `${SRM_SSLM}/v1/${organizationId}/site_eval_external_orders/${evalHeaderId}/batch-delete`,
        method: 'DELETE',
        data,
      }),
      submit: () => ({
        url: `${SRM_SSLM}/v1/${organizationId}/site_eval_external_orders/${evalHeaderId}/create-or-update`,
        method: 'POST',
      }),
    },
    events: {
      create: ({ record }) => {
        record.set({ orderSource: 'reportEval' });
      },
    },
  };
};

const getAttachmentModalDS = (evalLineId, attCustomizeCode) => ({
  primaryKey: 'attachmentItemId',
  autoQuery: true,
  cacheSelection: true,
  pageSize: 20,
  fields: [
    {
      label: intl.get(`sslm.common.model.attachment.realName`).d('上传人'),
      name: 'realName',
    },
    {
      name: 'scoreAttachmentUuid',
      type: 'attachment',
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: bucketDirectory.evaluation,
      label: intl.get('hzero.common.upload.modal.title').d('附件'),
    },
  ],
  transport: {
    read: {
      url: `${SRM_SSLM}/v1/${organizationId}/site-eval-lines/eval-report/listRespScoreAttachment`,
      method: 'GET',
      params: {
        evalLineId,
        customizeUnitCode: attCustomizeCode,
      },
    },
  },
});

export {
  getBasicInfoDs,
  getItemCategoryInfoDs,
  getAssessmentPanelDs,
  getAssessmentInfoDs,
  getScoreSumInfoDs,
  getScoreDs,
  getTransferDs,
  getReformContentDs,
  getAttachmentModalDS,
};
