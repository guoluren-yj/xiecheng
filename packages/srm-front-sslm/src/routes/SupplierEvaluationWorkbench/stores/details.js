/**
 * @Author: 杨一昊 yihao.yang@going-link.com
 * @Date: 2023-02-13 09:40:27
 * @FilePath: /srm-front-sslm/src/routes/SupplierEvaluationWorkbench/stores/details.js
 * @Copyright (c) 2023 by ZhenYun, All Rights Reserved.
 */
import { PRIVATE_BUCKET, SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import { EMAIL, PHONE, NOT_CHINA_PHONE } from 'utils/regExp';
import intl from 'utils/intl';
import { isNil } from 'lodash';

import { bucketDirectory } from '@/routes/utils/utils';

const organizationId = getCurrentOrganizationId();

/**
 * @description: 基本信息 - 公司信息 - 供应商信息 - 评估结果 - 审查结果附件 - 内外附件合集 DS 合集
 * @param {false|'multiple'|'single'} selection
 * @return {*}
 */
const getBasicInfoDs = showOldModal => {
  // 基础信息
  const basicInfo = [
    {
      name: 'evalNum',
      label: intl.get('sslm.supplierEvaluationDetail.form.label.evalNum').d('评估报告编号'),
      disabled: true,
    },
    {
      name: 'evalDescription',
      label: intl.get('sslm.supplierEvaluationDetail.form.label.evalDescription').d('评估报告描述'),
    },
    {
      name: 'reportStatusMeaning',
      label: intl.get('hzero.common.status').d('状态'),
      disabled: true,
    },
    {
      name: 'sourceTypeMeaning',
      label: intl.get('sslm.supplierEvaluationDetail.form.label.creationType').d('创建方式'),
      disabled: true,
    },
    {
      name: 'evalPlanNum',
      label: intl.get('sslm.supplierEvaluationDetail.form.label.documentOrigin').d('来源单据'),
      disabled: true,
    },
    {
      name: 'creationDate',
      type: 'dateTime',
      label: intl.get('sslm.supplierEvaluationDetail.form.label.creationDate').d('创建时间'),
      disabled: true,
    },
    {
      name: 'realName',
      label: intl.get('sslm.supplierEvaluationDetail.form.label.realName').d('创建人'),
      disabled: true,
    },
    {
      name: 'unitName',
      label: intl.get('sslm.supplierEvaluationDetail.form.label.unitName').d('创建人部门'),
      disabled: true,
    },
    {
      name: 'strategyLov',
      type: 'object',
      label: intl.get('sslm.supplierEvaluationDetail.form.label.strategyName').d('评估策略'),
      lovCode: 'SSLM.EVAL_PLAN_STRATEGY_LIST',
      lovPara: { strategyStatus: 'RELEASED' },
      computedProps: {
        disabled: ({ record }) => {
          return record.get('evalHeaderId');
        },
      },
    },
    { name: 'strategyId', bind: 'strategyLov.strategyId' },
    { name: 'strategyName', bind: 'strategyLov.strategyName' },
    { name: 'strategyCode', bind: 'strategyLov.strategyCode' },

    { name: 'evalTplId', bind: 'strategyLov.evalTplId' },
    { name: 'evalTplCode', bind: 'strategyLov.evalTplCode' },
    {
      name: 'evalTplName',
      label: intl.get('sslm.supplierEvaluationDetail.form.label.evalTpl').d('评分模板'),
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
      bind: 'strategyLov.evalType',
      lookupCode: 'SSLM.SITE_EVAL_TYPE',
    },
    {
      name: 'evalDateFrom',
      label: intl.get('sslm.supplierEvaluationDetail.form.label.evalDateFrom').d('评估日期从'),
      type: 'date',
    },
    {
      name: 'evalDateTo',
      label: intl.get('sslm.supplierEvaluationDetail.form.label.evalDateTo').d('评估日期至'),
      type: 'date',
    },

    {
      name: 'assessType',
      bind: 'strategyLov.assessType',
      label: intl.get('sslm.supplierEvaluationDetail.form.label.assessType').d('评估类型'),
      lookupCode: 'SSLM_EVAL_PLAN_TYPE',
      disabled: true,
    },
    {
      name: 'investigationType',
      label: intl.get('sslm.supplierEvaluationDetail.form.label.investigationType').d('考察方式'),
      lookupCode: 'SSLM.INVESTIGATION_TYPE',
    },
    {
      name: 'evalRemark',
      label: intl.get('sslm.supplierEvaluationDetail.form.label.evalRemark').d('评估说明'),
    },
  ];
  // 公司信息
  const companyInfo = [
    {
      name: 'groupFlag',
      label: intl.get('sslm.supplierEvaluationDetail.form.label.groupFlag').d('是否集团级'),
      lookupCode: 'HPFM.FLAG',
    },
    {
      name: 'companyLov',
      type: 'object',
      label: intl.get('sslm.supplierEvaluationDetail.form.label.companyName').d('公司'),
      lovCode: 'SSLM.EVAL_PLAN_STRATEGY_TPL_COMPANY_NEW',
    },
    { name: 'companyId', bind: 'companyLov.companyId' },
    { name: 'companyName', bind: 'companyLov.companyName' },
    {
      name: 'ouLov',
      type: 'object',
      noCache: true,
      label: intl.get('sslm.supplierEvaluationDetail.table.column.label.ouName').d('业务实体'),
      textField: 'ouName',
      lovCode: 'SPFM.USER_AUTH.OU',
      computedProps: {
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
        .get('sslm.supplierEvaluationDetail.table.column.label.invOrganization')
        .d('库存组织'),
      lovCode: 'HPFM.INV_ORG',
      computedProps: {
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
      label: intl.get('sslm.supplierEvaluationDetail.table.column.label.inventory').d('库房'),
      lovCode: 'SODR.INVENTORY',
      computedProps: {
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
      label: intl.get('sslm.supplierEvaluationDetail.table.column.label.supplierName').d('供应商'),
      lovCode: 'SSLM.SITE_SUPPLIER',
      disabled: true,
      valueField: 'supplierCompanyId',
      textField: 'supplierName',
      computedProps: {
        lovPara: ({ record }) => ({
          tenantId: organizationId,
          companyId: record?.get('companyId'),
        }),
        disabled: ({ record }) => {
          return record.get('evalHeaderId');
        },
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
      computedProps: {
        lovPara: ({ record }) => ({
          companyId: record?.get('companyId'),
          sameFlag: record?.get('needFeedbackFlag') || null,
        }),
        disabled: ({ record }) => {
          return record.get('evalHeaderId');
        },
      },
    },
    { name: 'supplierCompanyId', bind: 'supplierCompanyLov.supplierCompanyId' },
    {
      name: 'supplierCompanyNum',
      bind: 'supplierCompanyLov.supplierCompanyNum',
      label: intl
        .get('sslm.supplierEvaluationDetail.table.column.label.supplierCompanyNum')
        .d('平台供应商编码'),
    },
    { name: 'supplierCompanyName', bind: 'supplierCompanyLov.supplierCompanyName' },
    { name: 'supplierId', bind: 'supplierCompanyLov.supplierId' },
    { name: 'supplierTenantId', bind: 'supplierCompanyLov.supplierTenantId' },
    {
      name: 'supplierNum',
      bind: 'supplierCompanyLov.supplierNum',
      label: intl
        .get('sslm.supplierEvaluationDetail.table.column.label.erpSupplierNum')
        .d('erp供应商编码'),
    },
    { name: 'supplierName', bind: 'supplierCompanyLov.supplierName' },
    {
      name: 'supplierType',
      label: intl.get('sslm.supplierEvaluationDetail.form.label.supplierType').d('供应商类型'),
      lookupCode: 'SSLM.SUPPLIER_TYPE',
      disabled: true,
    },
    {
      name: 'supplierContactor',
      label: intl
        .get('sslm.supplierEvaluationDetail.table.column.label.supplierContacts')
        .d('供应商联系人'),
      bind: 'supplierCompanyLov.name',
      computedProps: {
        disabled: ({ record }) => {
          return !(record.get('supplierId') || record.get('supplierCompanyId'));
        },
      },
    },
    {
      name: 'internationalTelCode',
      // required: true,
      lookupCode: 'HPFM.IDD',
      defaultValue: '+86',
      bind: 'supplierCompanyLov.internationalTelCode',
      computedProps: {
        disabled: ({ record }) => {
          return !(record.get('supplierId') || record.get('supplierCompanyId'));
        },
      },
    },
    {
      name: 'supplierContactPhone',
      type: 'tel',
      regionField: 'internationalTelCode',
      label: intl
        .get('sslm.supplierEvaluationDetail.table.column.label.supplierTelephone')
        .d('供应商联系电话'),
      // dynamicProps: ({ record }) => {
      //   return {
      //     pattern:
      //       (record.get('internationalTelCode') || '+86') === '+86' ? PHONE : NOT_CHINA_PHONE,
      //   };
      dynamicProps: {
        pattern: ({ record }) =>
          (record.get('internationalTelCode') || '+86') === '+86' ? PHONE : NOT_CHINA_PHONE,
      },
      computedProps: {
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
        .get('sslm.supplierEvaluationDetail.table.column.label.supplierEmail')
        .d('供应商联系邮箱'),
      bind: 'supplierCompanyLov.mail',
      computedProps: {
        disabled: ({ record }) => {
          return !(record.get('supplierId') || record.get('supplierCompanyId'));
        },
      },
    },
    {
      name: 'supplierRegisteredAddress',
      label: intl
        .get('sslm.supplierEvaluationDetail.table.column.label.supplierAddress')
        .d('供应商注册地址'),
      bind: 'supplierCompanyLov.addressDetail',
      disabled: true,
    },
    {
      name: 'supplierOverview',
      label: intl.get('sslm.supplierEvaluationDetail.form.label.supplierOverview').d('供应商概况'),
      disabled: true,
    },
    {
      name: 'evalAddress',
      label: intl.get('sslm.supplierEvaluationDetail.form.label.evalAddress').d('实际考察地址'),
    },
    {
      name: 'evalAddress',
      label: intl.get('sslm.supplierEvaluationDetail.form.label.evalAddress').d('实际考察地址'),
    },
    {
      name: 'backRemark',
      label: intl
        .get('sslm.supplierEvaluationDetail.form.label.backRemark')
        .d('供应商自我评价说明'),
    },
    {
      name: 'backReason',
      label: intl.get('sslm.supplierEvaluationDetail.form.label.backReason').d('退回原因'),
      disabled: true,
    },
  ].filter(Boolean);
  // 评估结果
  const assessmentResult = [
    {
      name: 'finalScore',
      label: intl.get('sslm.supplierEvaluationDetail.form.label.finalScore').d('最后得分'),
    },
    {
      name: 'grade',
      label: intl.get('sslm.supplierEvaluationDetail.form.label.level').d('等级'),
    },
    {
      name: 'resultsFlag',
      label: intl.get('sslm.supplierEvaluationDetail.form.label.resultsFlag').d('评估结果'),
      lookupCode: 'SSLM.INVESTIGATION.RESULTS',
    },
    {
      name: 'opinion',
      label: intl.get('sslm.supplierEvaluationDetail.form.label.opinion').d('综合意见'),
    },
    {
      name: 'userNames',
      type: 'object',
      label: intl.get('sslm.supplierEvaluationDetail.form.label.copyTo').d('抄送'),
      lovCode: 'SPUC.ACCEPT_USER',
      multiple: true,
      computedProps: {
        lovPara: ({ record }) => {
          return {
            tenantId: organizationId,
            loginName: record?.get('loginName'),
            userName: record?.get('userName'),
          };
        },
      },
    },
    { name: 'informUserIds', bind: 'informUserLov.userId', multiple: ',' },
    // { name: 'userNames', bind: 'informUserLov.userName', multiple: ',' },
  ];
  // 审查结果附件
  const assessmentResultAttachment = [
    {
      // 审查结果附件
      name: 'resultLinkUuid',
      type: 'attachment',
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: bucketDirectory.evaluation,
      label: intl.get('sslm.supplierEvaluationDetail.form.label.resultLinkUuid').d('附件'),
    },
  ];
  // 内部外部附件
  const attachment = [
    {
      // 内部附件
      name: 'internalAttachmentUuid',
      label: intl.get('sslm.supplierEvaluationDetail.form.label.internalAttachment').d('附件'),
    },
    {
      // 外部附件
      name: 'externalAttachmentUuid',
      label: intl
        .get('sslm.supplierEvaluationDetail.form.label.externalAttachment1')
        .d('采购方附件'),
    },
    {
      name: 'selfEvalAttachmentUuid',
      label: intl
        .get('sslm.supplierEvaluationDetail.form.label.supplierAccessoriesAttachment')
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
    fields: fieldsArray,
    events: {
      update: ({ record, name, value }) => {
        if (name === 'supplierCompanyLov') {
          record.set({
            supplierName: value ? value.supplierCompanyName || value.supplierName : null,
          });
        }
        if (name === 'groupFlag') {
          if (value && +value === 1) {
            record.set({ companyLov: {}, ouLov: {}, invOrganizationLov: {}, inventoryLov: {} });
          }
        }
      },
    },
  };
};

/**
 * @description: 评估物料/品类 DataSet 配置
 * @return {*}
 */
const getItemCategoryInfoDs = (id, tabPaneKey) => ({
  primaryKey: 'evalItemCateId',
  fields: [
    {
      name: 'itemLov',
      label: intl.get('sslm.supplierEvaluationDetail.table.column.label.itemCode').d('物料编码'),
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
      label: intl.get('sslm.supplierEvaluationDetail.table.column.label.itemName').d('物料名称'),
      computedProps: {
        disabled: ({ record }) => {
          return record.get('itemCode');
        },
      },
    },
    {
      name: 'categoryLov',
      type: 'object',
      noCache: true,
      label: intl
        .get('sslm.supplierEvaluationDetail.table.column.label.categoryCode')
        .d('品类编码'),
      lovCode: 'SMDM.CATEGORY.LEVEL_CONTROL_TREE',
      textField: 'categoryCode',
      valueField: 'categoryCode',
      dynamicProps: {
        lovPara: ({ record }) => {
          const supplierCompanyId = record.get('supplierId');
          return {
            supplierCompanyId,
            itemId: record.get('itemId'),
            tenantId: organizationId,
          };
        },
      },
      optionsProps: {
        paging: 'server',
        idField: 'categoryId',
        parentIdField: 'parentCategoryId',
      },
    },
    { name: 'itemCategoryId', bind: 'categoryLov.categoryId' },
    { name: 'itemCategoryCode', bind: 'categoryLov.categoryCode' },
    {
      name: 'itemCategoryName',
      label: intl
        .get('sslm.supplierEvaluationDetail.table.column.label.categoryName')
        .d('品类名称'),
      bind: 'categoryLov.categoryName',
      computedProps: {
        disabled: ({ record }) => {
          return record.get('categoryCode');
        },
      },
    },
    {
      name: 'brand',
      label: intl.get('sslm.supplierEvaluationDetail.table.column.label.brand').d('品牌'),
    },
    {
      name: 'remark',
      label: intl.get('sslm.supplierEvaluationDetail.table.column.label.remark').d('备注'),
    },
  ],
  transport: {
    read: ({ data, params, dataSet }) => {
      const evalHeaderId = dataSet?.parent?.current?.get('evalHeaderId');
      // 区分已反馈
      const defaultUrl = ['selfRatedEvaluated'].includes(tabPaneKey)
        ? `${SRM_SSLM}/v1/${organizationId}/site-eval-item-cate-copy/${evalHeaderId}/supplier`
        : `${SRM_SSLM}/v1/${organizationId}/site-eval-item-cates/${evalHeaderId}/supplier`;
      return {
        url: defaultUrl,
        method: 'POST',
        params: {
          ...params,
        },
        data: {
          ...data,
          customizeUnitCode: 'SSLM.SUPPLIER_ASSESS_DETAIL.EVALUATE_MATERIAL',
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
    },
  },
});

/**
 * @description: 评估小组 DataSet 配置
 * @return {*}
 */
const getAssessmentPanelDs = (id, tabPaneKey) => ({
  primaryKey: 'evalGroupId',
  fields: [
    {
      name: 'userLov',
      label: intl.get('sslm.supplierEvaluationDetail.table.column.label.Account').d('账户'),
      type: 'object',
      lovCode: 'SSLM.TENANT.SUB.ACCOUNT',
      textField: 'loginName',
      valueField: 'id',
      lovPara: {
        tenantId: organizationId,
      },
    },
    {
      name: 'userId',
      bind: 'userLov.id',
    },
    {
      name: 'loginName',
      bind: 'userLov.loginName',
    },
    {
      name: 'member',
      bind: 'userLov.name',
      label: intl.get('sslm.supplierEvaluationDetail.table.column.label.member').d('名称'),
    },
    {
      name: 'department',
      bind: 'userLov.unitName',
      label: intl.get('sslm.supplierEvaluationDetail.table.column.label.department').d('部门'),
    },
    {
      name: 'post',
      bind: 'userLov.positionName',
      label: intl.get('sslm.supplierEvaluationDetail.table.column.label.station').d('岗位'),
    },
    {
      name: 'internationalTelCode',
      // required: true,
      lookupCode: 'HPFM.IDD',
      defaultValue: '+86',
      bind: 'userLov.internationalTelCode',
    },
    {
      name: 'phone',
      type: 'tel',
      regionField: 'internationalTelCode',
      label: intl
        .get('sslm.supplierEvaluationDetail.table.column.label.supplierTelephone')
        .d('供应商联系电话'),
      // dynamicProps: {
      //   pattern: ({ record }) =>
      //     (record.get('internationalTelCode') || '+86') === '+86' ? PHONE : NOT_CHINA_PHONE,
      // },
      dynamicProps: {
        pattern: ({ record }) =>
          (record.get('internationalTelCode') || '+86') === '+86' ? PHONE : NOT_CHINA_PHONE,
      },
      bind: 'userLov.mobile',
    },
    {
      name: 'email',
      bind: 'userLov.email',
      pattern: EMAIL,
      label: intl.get('sslm.supplierEvaluationDetail.table.column.label.email').d('邮箱'),
    },
    {
      name: 'leaderFlag',
      type: 'boolean',
      label: intl.get('sslm.supplierEvaluationDetail.table.column.label.isLeader').d('是否组长'),
      trueValue: 1,
      falseValue: 0,
    },

    {
      name: 'evaluationIndex',
      label: intl
        .get('sslm.supplierEvaluationDetail.table.column.label.evaluationIndex')
        .d('评估指标'),
    },
  ],
  transport: {
    read: ({ data, params, dataSet }) => {
      const evalHeaderId = dataSet?.parent?.current?.get('evalHeaderId');
      // 区分已反馈
      const defaultUrl = ['selfRatedEvaluated'].includes(tabPaneKey)
        ? `${SRM_SSLM}/v1/${organizationId}/site-eval-group-copy/eval-report/${evalHeaderId}`
        : `${SRM_SSLM}/v1/${organizationId}/site-eval-groups/eval-report/${evalHeaderId}`;
      return {
        url: defaultUrl,
        method: 'GET',
        params: {
          ...params,
        },
        data: {
          ...data,
          customizeUnitCode: 'SSLM.SUPPLIER_ASSESS_DETAIL.ASSESSMENT_TEAM',
        },
      };
    },
    destroy: ({ data }) => {
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/site-eval-groups`,
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
});

// 判断评分信息中是否含有否决项，且是否有否决项被勾选，若任一否决项被勾选，则其他类型的指标不允许打分
const getScoreDisabled = dataSet => {
  const vetoList = dataSet.filter(record => record.get('indicatorType') === 'VETO');
  const scoreDisabled = vetoList.some(record => Boolean(record.get('selfIsVeto')));
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
  searchCode = '',
  tableCode = '',
  showSelfEvaluation,
  tabPaneKey,
}) => {
  return {
    primaryKey: 'evalLineId',
    selection,
    forceValidate: true,
    cacheSelection: true,
    ...(source === 'score'
      ? { paging: true, pageSize: 10 }
      : {
          paging: false,
          idField: 'indicatorId',
          parentField: 'parentId',
        }),
    fields: [
      {
        name: 'indicatorCode',
        label: intl
          .get('sslm.supplierEvaluationDetail.table.column.label.indicatorCode')
          .d('评估项目代码'),
      },
      {
        name: 'indicatorName',
        label: intl
          .get('sslm.supplierEvaluationDetail.table.column.label.indicatorName')
          .d('评估项目名称'),
      },
      {
        name: 'scoreTypeMeaning',
        label: intl.get('sslm.supplierEvaluationDetail.table.column.label.scoreType').d('评分方式'),
      },
      {
        name: 'evalStandard',
        label: intl
          .get('sslm.supplierEvaluationDetail.table.column.label.evalStandard')
          .d('评分标准'),
      },
      {
        name: 'backReason',
        label: intl
          .get('sslm.supplierEvaluationDetail.table.column.label.backReason')
          .d('退回原因'),
      },
      {
        name: 'indicatorTypeMeaning',
        label: intl
          .get('sslm.supplierEvaluationDetail.table.column.label.indicatorType')
          .d('评估项目类型'),
      },
      {
        name: 'supplierEvalFlag',
        label: intl
          .get('sslm.supplierEvaluationDetail.table.column.label.supplierEvalFlag')
          .d('供应商自评指标'),
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
      },
      {
        name: 'supplierScore',
        type: 'number',
        label: intl
          .get('sslm.supplierEvaluationDetail.table.column.label.supplierScore')
          .d('供应商自评得分'),
        dynamicProps: {
          disabled: ({ record }) => {
            const { supplierEvalFlag } = record?.get(['supplierEvalFlag']);
            // 供应商自评时，若自评范围为仅底层指标，且允许查看上级指标，则父级指标可查看设置不可编辑
            const indicatorDisabledFlag = source === 'feedback' && +supplierEvalFlag !== 1;
            return indicatorDisabledFlag;
          },
        },
      },
      {
        name: 'supplierRemarks',
        label: intl
          .get('sslm.supplierEvaluationDetail.table.column.label.supplierRemarks')
          .d('供应商自评意见'),
        dynamicProps: {
          disabled: ({ record }) => {
            const { supplierEvalFlag } = record?.get(['supplierEvalFlag']);
            // 供应商自评时，若自评范围为仅底层指标，且允许查看上级指标，则父级指标可查看设置不可编辑
            const indicatorDisabledFlag = source === 'feedback' && +supplierEvalFlag !== 1;
            return indicatorDisabledFlag;
          },
        },
      },
      {
        name: 'attachmentUuid',
        type: 'attachment',
        bucketName: PRIVATE_BUCKET,
        bucketDirectory: bucketDirectory.evaluation,
        label: intl
          .get('sslm.supplierEvaluationDetail.table.column.label.supplierAttachement')
          .d('供应商自评附件'),
        dynamicProps: {
          disabled: ({ record }) => {
            const { supplierEvalFlag } = record?.get(['supplierEvalFlag']);
            // 供应商自评时，若自评范围为仅底层指标，且允许查看上级指标，则父级指标可查看设置不可编辑
            const indicatorDisabledFlag = source === 'feedback' && +supplierEvalFlag !== 1;
            return indicatorDisabledFlag;
          },
        },
      },

      {
        name: 'evalWeight',
        label: intl
          .get('sslm.supplierEvaluationDetail.table.column.label.evalWeight')
          .d('指标权重'),
      },
      {
        name: 'scorer',
        label: intl.get('sslm.supplierEvaluationDetail.table.column.label.scorer').d('评分人'),
      },
      {
        name: 'completeFlag',
        label: intl
          .get('sslm.supplierEvaluationDetail.table.column.label.scoreStatus')
          .d('评估状态'),
      },

      {
        name: 'respWeight',
        label: intl
          .get('sslm.supplierEvaluationDetail.table.column.label.respWeight')
          .d('评分人权重'),
      },
      {
        name: 'score',
        type: 'number',
        label: intl.get('sslm.supplierEvaluationDetail.table.column.label.score').d('得分'),
        computedProps: {
          disabled: ({ record }) => {
            return record?.get('indicatorType') !== 'SCORE';
          },
        },
        transformResponse: (value, data) => {
          if (isNil(value)) {
            return data.defaultScore;
          } else {
            return value;
          }
        },
      },
      {
        name: 'finalScore',
        label: intl.get('sslm.supplierEvaluationDetail.table.column.label.score').d('得分'),
      },
      {
        name: 'scoreFrom',
        label: intl.get('sslm.supplierEvaluationDetail.table.column.label.scoreFrom').d('分值从'),
        type: 'number',
      },
      {
        name: 'scoreTo',
        label: intl.get('sslm.supplierEvaluationDetail.table.column.label.scoreTo').d('分值至'),
        type: 'number',
      },
      {
        name: 'defaultScore',
        label: intl
          .get('sslm.supplierEvaluationDetail.table.column.label.defaultScore')
          .d('缺省分值'),
      },
      {
        name: 'isStandard',
        label: intl
          .get('sslm.supplierEvaluationDetail.table.column.label.isStandard')
          .d('符合评分标准'),
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
        computedProps: {
          disabled: ({ record }) => {
            return record?.get('indicatorType') !== 'TICK';
          },
        },
      },
      {
        name: 'isVeto',
        label: intl.get('sslm.supplierEvaluationDetail.table.column.label.isVeto').d('否决该项'),
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
        computedProps: {
          disabled: ({ record }) => {
            return record?.get('indicatorType') !== 'VETO';
          },
        },
      },
      {
        name: 'indOptLov',
        type: 'object',
        label: intl
          .get('sslm.supplierEvaluationDetail.table.column.label.indOptName')
          .d('评分选项'),
        lovCode: 'SSLM.KPI.INDICATOR.OPT.CFG',
        computedProps: {
          lovPara: ({ record }) => {
            return {
              tenantId: organizationId,
              evalTplIndId: record?.get('indicatorId'),
            };
          },
          disabled: ({ record }) => {
            return record?.get('indicatorType') !== 'OPT';
          },
        },
      },
      { name: 'evalTplIndOptId', bind: 'indOptLov.value' },
      { name: 'indOptName', bind: 'indOptLov.meaning' },
      {
        name: 'transformReason',
        label: intl
          .get('sslm.supplierEvaluationDetail.table.column.label.transformReason')
          .d('转交原因'),
      },
      {
        name: 'gradeAttachment',
        type: 'attachment',
        bucketName: PRIVATE_BUCKET,
        bucketDirectory: bucketDirectory.evaluation,
        label: intl
          .get('sslm.supplierEvaluationDetail.table.column.label.gradeAttachment')
          .d('评分附件'),
      },
      {
        name: 'respRemarks',
        label: intl
          .get('sslm.supplierEvaluationDetail.table.column.label.selfRespRemarks')
          .d('内部评分备注'),
      },
      {
        name: 'selfSupplierScore',
        type: 'number',
        label: intl
          .get('sslm.purchaserEvaluationDetail.table.column.label.selfSupplierScore')
          .d('供应商自评打分'),
        dynamicProps: {
          disabled: ({ record, dataSet }) => {
            const { indicatorType, scoreType, supplierEvalFlag } = record?.get([
              'indicatorType',
              'scoreType',
              'supplierEvalFlag',
            ]);
            // 供应商自评时，若自评范围为仅底层指标，且允许查看上级指标，则父级指标可查看设置不可编辑
            const indicatorDisabledFlag = source === 'feedback' && +supplierEvalFlag !== 1;
            // 行为打分式、系统计算指标时默认可编辑且必填
            const disabledFlag = indicatorType !== 'SCORE' && scoreType !== 'SYSTEM';
            return disabledFlag || indicatorDisabledFlag || dataSet?.getState('scoreDisabled');
          },
          required: ({ record, dataSet }) => {
            const { indicatorType, scoreType } = record?.get(['indicatorType', 'scoreType']);
            const requiredFlag =
              showSelfEvaluation &&
              (indicatorType === 'SCORE' || scoreType === 'SYSTEM') &&
              !dataSet?.getState('scoreDisabled');
            return requiredFlag;
          },
          min: ({ record }) => {
            if (record) {
              const { indicatorType, scoreType, supplierEvalFlag } = record.get([
                'indicatorType',
                'scoreType',
                'supplierEvalFlag',
              ]);
              // 供应商自评时，若自评范围为仅底层指标，且允许查看上级指标，则父级指标可查看设置不可编辑
              const indicatorDisabledFlag = source === 'feedback' && +supplierEvalFlag !== 1;
              // 行为打分式、系统计算指标时默认可编辑且必填
              const disabledFlag = indicatorType !== 'SCORE' && scoreType !== 'SYSTEM';
              const flat = disabledFlag || indicatorDisabledFlag || !showSelfEvaluation;
              return flat ? null : record.get('scoreFrom');
            }
          },
          max: ({ record }) => {
            if (record) {
              const { indicatorType, scoreType, supplierEvalFlag } = record?.get([
                'indicatorType',
                'scoreType',
                'supplierEvalFlag',
              ]);
              // 供应商自评时，若自评范围为仅底层指标，且允许查看上级指标，则父级指标可查看设置不可编辑
              const indicatorDisabledFlag = source === 'feedback' && +supplierEvalFlag !== 1;
              // 行为打分式、系统计算指标时默认可编辑且必填
              const disabledFlag = indicatorType !== 'SCORE' && scoreType !== 'SYSTEM';
              const flat = disabledFlag || indicatorDisabledFlag || !showSelfEvaluation;
              return flat ? null : record.get('scoreTo');
            }
          },
        },
      },
      {
        name: 'selfIsStandard',
        label: intl
          .get('sslm.purchaserEvaluationDetail.table.column.label.selfIsStandard')
          .d('供应商自评符合评分标准'),
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
        defaultValue: 0,
        dynamicProps: {
          disabled: ({ record, dataSet }) => {
            const { indicatorType, supplierEvalFlag } = record?.get([
              'indicatorType',
              'supplierEvalFlag',
            ]);
            // 供应商自评时，若自评范围为仅底层指标，且允许查看上级指标，则父级指标可查看设置不可编辑
            const indicatorDisabledFlag = source === 'feedback' && +supplierEvalFlag !== 1;
            // 行为勾选式指标时默认可编辑且必填
            const disabledFlag = indicatorType !== 'TICK';
            return disabledFlag || indicatorDisabledFlag || dataSet?.getState('scoreDisabled');
          },
          required: ({ record, dataSet }) => {
            const { indicatorType } = record?.get(['indicatorType']);
            const requiredFlag =
              showSelfEvaluation && indicatorType === 'TICK' && !dataSet?.getState('scoreDisabled');
            return requiredFlag;
          },
        },
        transformResponse: value => {
          if (isNil(value)) {
            return 0;
          } else {
            return value;
          }
        },
      },
      {
        name: 'selfIsVeto',
        label: intl
          .get('sslm.purchaserEvaluationDetail.table.column.label.selfIsVeto')
          .d('供应商自评否决该项'),
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
        defaultValue: 0,
        dynamicProps: {
          disabled: ({ record }) => {
            const { indicatorType, supplierEvalFlag } = record?.get([
              'indicatorType',
              'supplierEvalFlag',
            ]);
            // 供应商自评时，若自评范围为仅底层指标，且允许查看上级指标，则父级指标可查看设置不可编辑
            const indicatorDisabledFlag = source === 'feedback' && +supplierEvalFlag !== 1;
            // 行为否决项指标时默认可编辑且必填
            const disabledFlag = indicatorType !== 'VETO';
            return disabledFlag || indicatorDisabledFlag;
          },
          required: ({ record }) => {
            const { indicatorType } = record?.get(['indicatorType']);
            const requiredFlag = showSelfEvaluation && indicatorType === 'VETO';
            return requiredFlag;
          },
        },
        transformResponse: value => {
          if (isNil(value)) {
            return 0;
          } else {
            return value;
          }
        },
      },
      {
        name: 'selfIndOptId',
        label: intl
          .get('sslm.purchaserEvaluationDetail.table.column.label.selfIndOptId')
          .d('供应商自评评分选项'),
        lookupCode: 'SSLM.KPI.INDICATOR.OPT.CFG',
        dynamicProps: {
          lovPara: ({ record }) => {
            return {
              evalTplIndId: record.get('indicatorId'),
              tenantId: organizationId,
              page: 0,
              size: 0,
            };
          },
          disabled: ({ record, dataSet }) => {
            const { indicatorType, supplierEvalFlag } = record?.get([
              'indicatorType',
              'supplierEvalFlag',
            ]);
            // 供应商自评时，若自评范围为仅底层指标，且允许查看上级指标，则父级指标可查看设置不可编辑
            const indicatorDisabledFlag = source === 'feedback' && +supplierEvalFlag !== 1;
            // 行为选择项指标时默认可编辑且必填
            const disabledFlag = indicatorType !== 'OPT';
            return disabledFlag || indicatorDisabledFlag || dataSet?.getState('scoreDisabled');
          },
          required: ({ record, dataSet }) => {
            const { indicatorType } = record?.get(['indicatorType']);
            const requiredFlag =
              showSelfEvaluation && indicatorType === 'OPT' && !dataSet?.getState('scoreDisabled');
            return requiredFlag;
          },
        },
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
    ],
    transport: {
      read: ({ data, params, dataSet }) => {
        const evalHeaderId = dataSet?.parent?.current?.get('evalHeaderId');
        // 区分已反馈
        const defaultUrl = ['selfRatedEvaluated'].includes(tabPaneKey)
          ? `${SRM_SSLM}/v1/${organizationId}/site-eval-line-copy/eval-report-line/${evalHeaderId}`
          : `${SRM_SSLM}/v1/${organizationId}/site-eval-lines/eval-report-line/${evalHeaderId}`;
        switch (source) {
          case 'score':
            return {
              url: `${SRM_SSLM}/v1/${organizationId}/site-eval-lines/${evalHeaderId}/evaluating`,
              method: 'GET',
              params: {
                ...params,
                customizeUnitCode: [searchCode, tableCode].join(','),
              },
              data: {
                ...data,
                code,
              },
            };

          default:
            return {
              url: defaultUrl,
              method: 'GET',
              params: {
                ...params,
                customizeUnitCode: [searchCode, tableCode].join(','),
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
          if (!record.data.leafFlag) {
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
        if (name === 'indOptLov') {
          record.set({ score: value ? value.score : null });
        }
        if (name === 'selfIsVeto') {
          const vetoScoreFlag = dataSet?.parent?.current?.get('evalPlanStrategy')?.vetoScoreFlag;
          if (vetoScoreFlag) {
            const scoreDisabled = getScoreDisabled(dataSet);
            dataSet.setState('scoreDisabled', scoreDisabled);
          }
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
const getScoreSumInfoDs = () => {
  return {
    fields: [
      {
        name: 'respUserName',
        label: intl.get('sslm.supplierEvaluationDetail.form.label.scoreUserName').d('评分人名称'),
        disabled: true,
      },
      {
        name: 'userDepartmentName',
        label: intl
          .get('sslm.supplierEvaluationDetail.form.label.scoreUserDepartmentName')
          .d('评分人部门'),
        disabled: true,
      },
      {
        name: 'sumScore',
        label: intl.get('sslm.supplierEvaluationDetail.form.label.sumScore').d('评分人汇总得分'),
        disabled: true,
      },
    ],
    transport: {
      read: ({ data, params, dataSet }) => {
        const evalHeaderId = dataSet?.parent?.current?.get('evalHeaderId');
        return {
          url: `${SRM_SSLM}/v1/${organizationId}/site-eval-resp-headers/get-resp-header/${evalHeaderId}`,
          method: 'GET',
          params: {
            ...params,
          },
          data: {
            ...data,
          },
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
const getScoreDs = ({ averageFlag }) => {
  return {
    paging: false,
    fields: [
      { name: 'isSelect', type: 'boolean', trueValue: 1, falseValue: 0 },
      {
        name: 'loginName',
        label: intl.get('sslm.supplierEvaluationDetail.scoreTable.label.loginName').d('子账户'),
      },
      {
        name: 'realName',
        label: intl.get('sslm.supplierEvaluationDetail.scoreTable.label.scorerealName').d('名称'),
      },
      {
        name: 'userDepartment',
        label: intl.get('sslm.supplierEvaluationDetail.scoreTable.label.userDepartment').d('部门'),
      },
      {
        name: 'respWeight',
        type: 'number',
        label: intl
          .get('sslm.supplierEvaluationDetail.scoreTable.label.respWeight')
          .d('评分人权重(%)'),
        computedProps: {
          disabled: () => averageFlag,
        },
      },
    ],
    events: {
      load: ({ dataSet }) => {
        dataSet.forEach(record => {
          const { member, realName, userDepartment, department, isSelect, userId, respUserId } =
            record?.data || {};
          record.set({
            realName: member || realName,
            userDepartment: department || userDepartment,
            respUserId: userId || respUserId,
          });

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
    fields: [
      {
        name: 'userLov',
        label: intl.get('sslm.supplierEvaluationDetail.scoreTable.label.loginName').d('子账户'),
        type: 'object',
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
        label: intl.get('sslm.supplierEvaluationDetail.scoreTable.label.userName').d('名称'),
        bind: 'userLov.userName',
      },
      {
        name: 'userDepartment',
        label: intl.get('sslm.supplierEvaluationDetail.scoreTable.label.userDepartment').d('部门'),
        bind: 'userLov.unitName',
      },
      {
        name: 'respWeight',
        type: 'number',
        label: intl
          .get('sslm.supplierEvaluationDetail.scoreTable.label.respWeight')
          .d('评分人权重(%)'),
        computedProps: {
          disabled: () => averageFlag,
        },
      },
      {
        name: 'transformReason',
        label: intl
          .get('sslm.supplierEvaluationDetail.scoreTable.label.transformReason')
          .d('转交原因'),
      },
    ],
  };
};

const getReformContentDs = ({ evalHeaderId, modalFlag }) => {
  return {
    pageSize: 20,
    fields: [
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
    ],
    transport: {
      read: ({ params }) => ({
        url: `${SRM_SSLM}/v1/${organizationId}/site_eval_external_orders/eval-report/${evalHeaderId}/supplier`,
        method: 'POST',
        params: {
          ...params,
        },
        data: {
          orderSource: 'reportEval',
          customizeUnitCode: modalFlag
            ? 'SSLM.PURCHASER_ASSESS_LIST.REFORMCONTENT_MODAL'
            : 'SSLM.SUPPLIER_ASSESS_DETAIL.QUALIT_RECTIFICATION',
        },
      }),
    },
  };
};

export {
  getBasicInfoDs,
  getItemCategoryInfoDs,
  getAssessmentPanelDs,
  getAssessmentInfoDs,
  getScoreSumInfoDs,
  getScoreDs,
  getTransferDs,
  getReformContentDs,
};
