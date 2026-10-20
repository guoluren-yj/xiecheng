import intl from 'utils/intl';
import { PRIVATE_BUCKET, SRM_SSRC } from '_utils/config';
import {
  getCurrentOrganizationId,
  getDateTimeFormat,
  getDateFormat,
  getCurrentUser,
} from 'utils/utils';
import { EMAIL, NOT_CHINA_PHONE, PHONE } from 'utils/regExp';
import { isNil, isEmpty } from 'lodash';
import { math } from 'choerodon-ui/dataset';

import { getQtyName, getUomName } from '@/utils/utils';

/**
 * 请求API前缀
 * @type {string}
 */
const prefix = `${SRM_SSRC}/v1`;

// 基础信息字段
const getBaseInfoDSFields = () => {
  return [
    {
      label: intl
        .get('ssrc.projectSetup.model.spChange.baseInfo.sourceProjectNum')
        .d('寻源项目编号'),
      name: 'sourceProjectNum',
      required: true,
      format: 'uppercase',
    },
    {
      label: intl
        .get('ssrc.projectSetup.model.spChange.baseInfo.sourceProjectName')
        .d('寻源项目名称'),
      name: 'sourceProjectName',
      required: true,
      type: 'intl',
    },
    {
      label: intl.get('ssrc.projectSetup.model.projectSetup.budgetAmount').d('预算金额'),
      name: 'budgetAmount',
      type: 'number',
      min: 0,
      max: '99999999999999999999',
      required: true,
      step: 0,
    },
    {
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.totalEstimatedAmount`).d('预估金额'),
      name: 'totalEstimatedAmount',
      type: 'number',
      min: 0,
      max: '99999999999999999999',
      disabled: true,
      step: 0,
    },
    {
      label: intl.get('ssrc.projectSetup.model.projectSetup.estimatedDate').d('预计完成日期'),
      name: 'estimatedDate',
      type: 'date',
      min: new Date(),
      format: getDateFormat(),
    },
    {
      label: intl.get('ssrc.projectSetup.model.projectSetup.sourceDate').d('寻源时间'),
      name: 'sourceDate',
      type: 'dateTime',
      format: getDateTimeFormat(),
    },
    {
      label: intl.get(`ssrc.sourceTemplate.model.template.subjectMatterRule`).d('标的规则'),
      name: 'subjectMatterRule',
      lookupCode: 'SSRC.SUBJECT_MATTER_RULE',
      defaultValue: 'NONE',
    },
    {
      label: intl.get(`ssrc.projectSetup.model.projectSetup.prejectRemark`).d('项目说明'),
      name: 'sourceProjectRemark',
      required: true,
      maxLength: 1000,
    },
  ];
};

// 采购组织及人员字段
const getPurAndOrgFields = (payload) => {
  const { sourceFrom } = payload || {};
  // 当前用户信息
  const currentUserInfo = getCurrentUser() || {};
  return [
    {
      label: intl.get(`ssrc.common.company`).d('公司'),
      name: 'companyId',
      lovCode: 'SPFM.USER_AUTHORITY_COMPANY',
      type: 'object',
      required: true,
      textField: 'companyName',
      valueField: 'companyId',
      transformRequest: (value = {}) => value?.companyId || null,
      transformResponse: (value, data) => {
        return value ? { companyId: value, companyName: data?.companyName } : null;
      },
    },
    {
      name: 'companyName',
      bind: 'companyId.companyName',
    },
    {
      label: intl
        .get('ssrc.projectSetup.model.spChange.purOrganizationAndStaff.unitName')
        .d('需求部门'),
      name: 'unitId',
      lovCode: 'SSRC.DEMAND.UNIT',
      type: 'object',
      textField: 'unitName',
      valueField: 'unitId',
      lovPara: {
        sourceFrom,
        tenantId: getCurrentOrganizationId(),
      },
      transformRequest: (value = {}) => value?.unitId || null,
      transformResponse: (value, data) => {
        return value ? { unitId: value, unitName: data?.unitName } : null;
      },
    },
    {
      name: 'unitName',
      bind: 'unitId.unitName',
    },
    {
      label: intl.get(`ssrc.projectSetup.model.projectSetup.creator`).d('创建人'),
      name: 'createdByName',
      disabled: true,
      transformResponse: (value) => {
        return value || currentUserInfo.realName;
      },
    },
    {
      label: intl
        .get('ssrc.projectSetup.model.spChange.purOrganizationAndStaff.purOrganizationName')
        .d('采购组织'),
      name: 'purOrganizationId',
      lovCode: 'SPFM.USER_AUTH.PURORG',
      type: 'object',
      textField: 'organizationName',
      valueField: 'purchaseOrgId',
      transformRequest: (value = {}) => value?.purchaseOrgId || null,
      transformResponse: (value, data) => {
        return value ? { purchaseOrgId: value, organizationName: data?.purOrganizationName } : null;
      },
    },
    {
      name: 'purOrganizationName',
      bind: 'purOrganizationId.organizationName',
    },
    {
      label: intl.get('ssrc.projectSetup.model.projectSetup.purchaseLov').d('采购员'),
      name: 'purchaserId',
      lovCode: 'SPFM.USER_AUTH.PURCHASE_AGENT',
      type: 'object',
      textField: 'purchaseAgentName',
      valueField: 'purchaseAgentId',
      transformRequest: (value = {}) => value?.purchaseAgentId || null,
      transformResponse: (value, data) => {
        return value ? { purchaseAgentId: value, purchaseAgentName: data?.purchaserName } : null;
      },
    },
    {
      name: 'purchaserName',
      bind: 'purchaserId.purchaseAgentName',
    },
    {
      label: intl.get('ssrc.projectSetup.model.projectSetup.purchaseCont').d('采购联系人'),
      name: 'contactUserId',
      lovCode: 'HIAM.PUBLIC.TENANT.USER', // todo: 临时替换不脱敏值集，后续需要整改
      type: 'object',
      required: true,
      textField: 'realName',
      valueField: 'id',
      transformRequest: (value = {}) => value?.id || null,
      transformResponse: (value, data) => {
        return {
          id: value || currentUserInfo.id,
          realName: data?.purAgent || currentUserInfo.realName,
        };
      },
    },
    {
      name: 'purAgent',
      bind: 'contactUserId.realName',
    },
    {
      label: intl.get(`ssrc.projectSetup.model.projectSetup.contactMobilephone`).d('联系人电话'),
      name: 'contactMobilephone',
      required: true,
      type: 'tel',
      regionField: 'internationalTelCode',
      validator: (value, _, record) => {
        const validateType = record.get('internationalTelCode') === '+86' ? PHONE : NOT_CHINA_PHONE;
        if (value && !validateType.test(record.get('contactMobilephone'))) {
          return intl.get('ssrc.common.validation.phoneForma').d('电话格式不正确');
        }
        return true;
      },
      transformResponse: (value, record) => {
        if (!record.contactUserId || record.contactUserId === currentUserInfo.id) {
          return value || currentUserInfo.phone;
        }
        return value;
      },
    },
    {
      name: 'internationalTelCode',
      lookupCode: 'HPFM.IDD',
      required: true,
      transformResponse: (value, record) => {
        if (record.contactUserId === currentUserInfo.id) {
          return value ?? currentUserInfo.internationalTelCode ?? '+86';
        }
        return value ?? '+86';
      },
    },
    {
      label: intl.get('ssrc.projectSetup.model.projectSetup.contactMail').d('联系人邮箱'),
      name: 'contactMail',
      required: true,
      validator: (value, _, record) => {
        if (value && !EMAIL.test(record.get('contactMail'))) {
          return intl.get('hzero.common.validation.email').d('邮箱格式不正确');
        }
        return true;
      },
      transformResponse: (value, record) => {
        if (!record.contactUserId || record.contactUserId === currentUserInfo.id) {
          return value || currentUserInfo.email;
        }
        return value;
      },
    },
    {
      label: intl.get('ssrc.projectSetup.model.projectSetup.projectMember').d('项目成员'),
      name: 'sourceMember',
      lovCode: 'SSRC.PROJECT.TENANT.USER',
      type: 'object',
      textField: 'realName',
      valueField: 'id',
      multiple: true,
      transformRequest: (value = {}) => (value && value.map((item) => item.id).join(',')) || null,
      transformResponse: (value, data) => {
        const sourceMemberIdList = value?.split(',') || [];
        const sourceMemberNameList = data?.sourceMemberMeaning?.split('/') || [];
        return value
          ? sourceMemberIdList.map((id, index) => ({
            id: math.isBigNumber(id) ? id : Number(id),
            realName: sourceMemberNameList[index],
          }))
          : null;
      },
    },
  ];
};

// 寻源要求字段
const getSourceDemandFields = (payload) => {
  const { sourceFrom } = payload || {};
  return [
    {
      label: intl.get('ssrc.inquiryHall.model.inquiryHall.sourcingCategory').d('寻源类别'),
      name: 'secondarySourceCategory',
      lookupCode: 'SSRC.SECONDARY_SOURCE_CATEGORY',
      required: true,
    },
    {
      label: intl.get('ssrc.projectSetup.model.projectSetup.RFXNodeConfig').d('RFX节点配置'),
      name: 'sourceConfig',
      lookupCode: 'SSRC.SOURCE_PROJECT_RFX_CONFIG',
    },
    {
      label: intl.get(`ssrc.projectSetup.model.projectSetup.sourceRequest`).d('寻源方法'),
      name: 'sourceRequest',
      lookupCode: 'SSRC.PROJECT_SOURCE_REQUEST',
      defaultValue: 'ONLINE_SOURCING',
    },
    {
      label: intl.get(`ssrc.common.currencyCode`).d('币种'),
      name: 'currencyCode',
      lovCode: 'SMDM.EXCHANGE_RATE.CURRENCY',
      type: 'object',
      textField: 'currencyCode',
      required: true,
      transformRequest: (value = {}) => value?.currencyCode || null,
      transformResponse: (value, data) => {
        return value ? { currencyCode: data?.currencyCode } : null;
      },
    },
    {
      label: intl.get('ssrc.projectSetup.model.projectSetup.paymentType').d('付款方式'),
      name: 'paymentTypeId',
      lovCode: 'SMDM.PAYMENTTYPE',
      type: 'object',
      textField: 'typeName',
      valueField: 'typeId',
      lovPara: {
        sourceFrom,
        tenantId: getCurrentOrganizationId(),
      },
      transformRequest: (value = {}) => value?.typeId || null,
      transformResponse: (value, data) => {
        return value ? { typeId: value, typeName: data?.paymentTypeName } : null;
      },
    },
    {
      name: 'paymentTypeName',
      bind: 'paymentTypeId.typeName',
    },
    {
      label: intl.get('ssrc.projectSetup.model.projectSetup.paymentTerm').d('付款条款'),
      name: 'paymentTermId',
      lovCode: 'SMDM.PAYMENT.TERM',
      type: 'object',
      textField: 'termName',
      valueField: 'termId',
      lovPara: {
        enabledFlag: 1,
      },
      transformRequest: (value = {}) => value?.termId || null,
      transformResponse: (value, data) => {
        return value ? { termId: value, termName: data?.paymentTermName } : null;
      },
    },
    {
      name: 'paymentTermName',
      bind: 'paymentTermId.termName',
    },
    {
      label: intl.get('ssrc.projectSetup.model.projectSetup.depositAmount').d('保证金'),
      name: 'depositAmount',
      type: 'number',
      min: 0,
      max: '99999999999999999999',
      step: 0,
    },
    {
      label: intl.get('ssrc.projectSetup.model.projectSetup.evaluatMethod').d('评标办法'),
      name: 'methodId',
      type: 'object',
      lovCode: 'SSRC.BID_EVAL_METHOD',
      textField: 'evalMethodName',
      valueField: 'evalMethodId',
      lovPara: {
        sourceFrom,
        tenantId: getCurrentOrganizationId(),
        enabledFlag: 1, // 仅仅查启用的
      },
      transformRequest: (value = {}) => value?.evalMethodId || null,
      transformResponse: (value, data) => {
        return value ? { evalMethodId: value, evalMethodName: data?.evalMethodName } : null;
      },
    },
    {
      name: 'evalMethodName',
      bind: 'methodId.evalMethodName',
    },
    {
      label: intl.get(`ssrc.projectSetup.model.projectSetup.methodRemark`).d('评标办法说明'),
      name: 'methodRemark',
      maxLength: 500,
    },
  ];
};

// 附件字段
const getAttachmentFields = () => [
  {
    label: intl.get('ssrc.common.model.common.attachment').d('附件'),
    name: 'sourceProjectAttachmentUuid',
    type: 'attachment',
    bucketName: PRIVATE_BUCKET,
    bucketDirectory: 'ssrc-bid-projectsetup',
  },
];

// 寻源方式字段
const getSourceMethodFields = () => [
  {
    label: intl.get(`ssrc.inquiryHall.model.inquiryHall.sourcingApproach`).d('寻源方式'),
    name: 'sourceMethod',
    required: true,
    type: 'string',
    lookupCode: 'SSRC.SOURCE_METHOD',
    dynamicProps: {
      help: ({ record }) =>
        ['OPEN', 'ALL_OPEN'].includes(record.get('sourceMethod'))
          ? intl
            .get('ssrc.common.validate.sourceMethod')
            .d(
              '为保护您的个人信息，建议使用您的商务联系方式（如办公电话、商业邮箱，办公室地址等），而非私人联系信息。'
            )
          : null,
    },
  },
];

// 头信息ds
const headerDS = (payload) => {
  const { sourceProjectId, customizeUnitCode, createFlag, remote } = payload || {};
  const fields = [
    ...getBaseInfoDSFields(),
    ...getPurAndOrgFields(payload),
    ...getSourceDemandFields(payload),
    ...getAttachmentFields(),
    ...getSourceMethodFields(),
  ];
  const remoteHeaderFields = remote
    ? remote.process(
      'SSRC_PROJECTSETUP_SP_UPDATE_PROCESS_SET_HEADER_CUX_FIELD',
      fields
    )
    : fields;
  return {
    dataToJSON: 'all',
    autoCreate: createFlag,
    fields: remoteHeaderFields,
    transport: {
      read: () => {
        return {
          url: `${prefix}/${getCurrentOrganizationId()}/source-projects/${sourceProjectId}`,
          method: 'GET',
          data: {
            customizeUnitCode,
          },
        };
      },
    },
  };
};

// 物料信息-标的物ds
const itemLineDS = (payload) => {
  const { sourceProjectId, customizeUnitCode, headerDs } = payload || {};
  return {
    primaryKey: 'projectLineItemId',
    selection: 'multiple',
    cacheModified: true,
    pageSize: 10,
    dataToJSON: 'all',
    fields: [
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.lineNo.`).d('行号'),
        name: 'projectLineItemNum',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.businessUnit`).d('业务实体'),
        name: 'ouId',
        lovCode: 'SPFM.USER_AUTH.OU',
        type: 'object',
        textField: 'ouName',
        valueField: 'ouId',
        transformRequest: (value = {}) => value?.ouId || null,
        transformResponse: (value, data) => {
          return value ? { ouId: value, ouName: data?.ouName } : null;
        },
        dynamicProps: {
          disabled({ record }) {
            return record.get('prNum');
          },
        },
      },
      {
        name: 'ouName',
        bind: 'ouId.ouName',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.invOrganizationName`).d('库存组织'),
        name: 'invOrganizationId',
        lovCode: 'HPFM.INV_ORG',
        type: 'object',
        textField: 'organizationName',
        valueField: 'organizationId',
        dynamicProps: {
          disabled({ record }) {
            return !record.get('ouId') || record.get('prNum');
          },
          lovPara({ record }) {
            return {
              ouId: record.get('ouId')?.ouId,
              enabledFlag: 1,
              organizationId: getCurrentOrganizationId(),
            };
          },
        },
        transformRequest: (value = {}) => value?.organizationId || null,
        transformResponse: (value, data) => {
          return value
            ? { organizationId: value, organizationName: data?.invOrganizationName }
            : null;
        },
      },
      {
        name: 'invOrganizationName',
        bind: 'invOrganizationId.organizationName',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemCode`).d('物料编码'),
        name: 'itemId',
        type: 'object',
        textField: 'itemCode',
        valueField: 'itemId',
        lovCode: 'SSRC.NEW_CUSTOMER_ITEM',
        dynamicProps: {
          disabled({ record }) {
            return record.get('prNum');
          },
          lovPara({ record }) {
            const { invOrganizationId, itemCategoryId, ouId } = record.get([
              'invOrganizationId',
              'itemCategoryId',
              'ouId',
            ]);
            return {
              invOrganizationId: invOrganizationId?.organizationId,
              itemCategoryId: itemCategoryId?.categoryId,
              ouId: ouId?.ouId,
              companyId: headerDs?.current?.get('companyId')?.companyId,
            };
          },
        },
        transformRequest: (value = {}) => value?.itemId || null,
        transformResponse: (value, data) => {
          return value
            ? { itemId: value, itemCode: data?.itemCode, itemName: data?.itemName }
            : null;
        },
      },
      {
        name: 'itemCode',
        bind: 'itemId.itemCode',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemName`).d('物料名称'),
        name: 'itemName',
        required: true,
        dynamicProps: {
          disabled({ record }) {
            return record.get('prNum') || !!record.get('itemId')?.itemId;
          },
        },
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemCategory`).d('物料类别'),
        name: 'itemCategoryId',
        type: 'object',
        lovCode: 'SMDM.CATEGORY.LEVEL_CONTROL_TREE',
        textField: 'categoryName',
        valueField: 'categoryId',
        optionsProps: {
          paging: 'server',
          idField: 'categoryId',
          parentField: 'parentCategoryId',
          record: {
            dynamicProps: {
              selectable: (record) => record.get('isCheck') !== false,
            },
          },
        },
        dynamicProps: {
          disabled({ record }) {
            return record.get('prNum');
          },
          lovPara({ record }) {
            return {
              tenantId: getCurrentOrganizationId(),
              itemId: record.get('itemId')?.itemId,
              businessObjectCode: 'SRM_C_SRM_SSRC_SOURCE_PROJECT',
            };
          },
        },
        transformRequest: (value = {}) => value?.categoryId || null,
        transformResponse: (value, data) => {
          return value ? { categoryId: value, categoryName: data?.itemCategoryName } : null;
        },
      },
      {
        name: 'itemCategoryName',
        bind: 'itemCategoryId.categoryName',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.specifications`).d('规格'),
        name: 'specifications',
      },
      {
        label: intl.get(`ssrc.common.model.common.model`).d('型号'),
        name: 'model',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.quantity`).d('需求数量'),
        name: 'secondaryQuantity',
        type: 'number',
        min: 0,
        max: '99999999999999999999',
        step: 0,
        dynamicProps: {
          required({ dataSet }) {
            return dataSet.getState('doubleUnitFlag');
          },
        },
      },
      {
        name: 'requiredQuantity',
        type: 'number',
        min: 0,
        max: '99999999999999999999',
        step: 0,
        dynamicProps: {
          label: ({ dataSet }) => {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            return getQtyName(doubleUnitFlag);
          },
          required({ dataSet }) {
            return !dataSet.getState('doubleUnitFlag');
          },
          disabled({ dataSet }) {
            return dataSet.getState('doubleUnitFlag');
          },
        },
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.unit`).d('单位'),
        name: 'secondaryUomId',
        type: 'object',
        textField: 'uomName',
        valueField: 'uomId',
        dynamicProps: {
          disabled({ record }) {
            return record.get('prNum');
          },
          lovPara({ record, dataSet }) {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            return doubleUnitFlag && record.get('itemId')?.itemId
              ? {
                itemId: record.get('itemId')?.itemId,
                primaryUomId: record.get('uomId')?.uomId,
              }
              : {};
          },
          lovCode({ record, dataSet }) {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            return doubleUnitFlag && record.get('itemId')?.itemId
              ? 'SMDM_ITEM_ORG_UOM'
              : 'SSRC.UOM';
          },
          required({ dataSet }) {
            return dataSet.getState('doubleUnitFlag');
          },
        },
        transformRequest: (value = {}) => value?.uomId || null,
        transformResponse: (value, data) => {
          return value ? { uomId: value, uomName: data?.secondaryUomName } : null;
        },
      },
      {
        name: 'secondaryUomName',
        bind: 'secondaryUomId.uomName',
      },
      {
        name: 'secondaryUomCode',
        bind: 'secondaryUomId.uomCode',
      },
      {
        name: 'uomId',
        type: 'object',
        lovCode: 'SSRC.UOM',
        textField: 'uomName',
        valueField: 'uomId',
        dynamicProps: {
          label: ({ dataSet }) => {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            return getUomName(doubleUnitFlag);
          },
          disabled({ record, dataSet }) {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            return doubleUnitFlag || record.get('prNum');
          },
          required({ dataSet }) {
            return !dataSet.getState('doubleUnitFlag');
          },
        },
        transformRequest: (value = {}) => value?.uomId || null,
        transformResponse: (value, data) => {
          return value ? { uomId: value, uomName: data?.uomName, uomCode: data?.uomCode } : null;
        },
      },
      {
        name: 'uomCode',
        bind: 'uomId.uomCode',
      },
      {
        name: 'uomName',
        bind: 'uomId.uomName',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.priceQuantity`).d('价格批量'),
        name: 'priceBatch',
        type: 'number',
        max: '99999999999999999999',
        step: 0,
        validator: (value) => {
          if (!isNil(value) && value <= 0) {
            return intl.get('ssrc.common.pleaseEnterGreatThanZeroNumber').d('请输入大于0的数值');
          }
          return true;
        },
        transformResponse: (value) => {
          return value ?? 1;
        },
        dynamicProps: {
          required({ dataSet, record }) {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            const { itemId, secondaryUomId, uomId } = record.get([
              'itemId',
              'secondaryUomId',
              'uomId',
            ]);
            return !(
              doubleUnitFlag &&
              itemId?.itemId &&
              secondaryUomId?.uomId &&
              uomId?.uomId !== secondaryUomId?.uomId
            );
          },
          disabled({ dataSet, record }) {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            const { itemId, secondaryUomId, uomId } = record.get([
              'itemId',
              'secondaryUomId',
              'uomId',
            ]);
            return (
              doubleUnitFlag &&
              itemId?.itemId &&
              secondaryUomId?.uomId &&
              uomId?.uomId !== secondaryUomId?.uomId
            );
          },
        },
      },
      {
        label: intl
          .get(`ssrc.projectSetupApprovalWf.model.approvalWf.itemLineDetail.estimatedUnitPrice`)
          .d('预算单价(元)'),
        name: 'costPrice',
        type: 'number',
        min: 0,
        max: '99999999999999999999',
        step: 0,
      },
      {
        label: intl
          .get(`ssrc.projectSetupApprovalWf.model.approvalWf.itemLineDetail.estimatedUnitAmount`)
          .d('预算行金额(元)'),
        name: 'totalPrice',
        type: 'number',
        // min: '0',
        // max: '99999999999999999999',
      },
      {
        label: intl
          .get(`ssrc.projectSetupApprovalWf.model.approvalWf.estimatedPrice`)
          .d('预估单价'),
        name: 'estimatedPrice',
        // help: intl
        //   .get(`ssrc.common.model.inquiryHall.estimatedSecondaryUnitPrice`)
        //   .d('辅助单位对应的预估单价'),
        type: 'number',
        min: 0,
        max: '99999999999999999999',
      },
      {
        label: intl
          .get(`ssrc.projectSetupApprovalWf.model.approvalWf.estimatedAmount`)
          .d('预估行金额'),
        name: 'estimatedAmount',
        type: 'number',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.quotationTemplate`).d('报价模板'),
        name: 'quotationTemplateId',
        type: 'object',
        lovCode: 'SSRC.QUOTATION_TEMPLATE',
        textField: 'templateName',
        valueField: 'templateId',
        lovPara: {
          tenantId: getCurrentOrganizationId(),
        },
        transformRequest: (value = {}) => value?.templateId || null,
        transformResponse: (value, data) => {
          return value ? { templateId: value, templateName: data?.templateName } : null;
        },
      },
      {
        name: 'templateName',
        bind: 'quotationTemplateId.templateName',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.quotationDetail`).d('报价明细'),
        name: 'quotationDetail',
      },
      {
        label: intl.get(`hzero.common.remark`).d('备注'),
        name: 'itemRemark',
        dynamicProps: {
          disabled({ record }) {
            return record.get('prNum');
          },
        },
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.lineAttachment`).d('行附件'),
        name: 'itemAttachmentUuid',
        type: 'attachment',
        bucketName: PRIVATE_BUCKET,
        bucketDirectory: 'ssrc-rfx-rfxitem',
        dynamicProps: {
          readOnly({ record }) {
            return record.get('prNum');
          },
        },
      },
      {
        label: intl
          .get(`ssrc.projectSetupApprovalWf.model.approvalWf.itemLineDetail.prNum`)
          .d('采购申请号'),
        name: 'prNum',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.prLineNum`).d('采购申请行号'),
        name: 'prDisplayLineNum',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.prRequestedName`).d('申请人'),
        name: 'requestUserId',
        type: 'object',
        lovCode: 'HIAM.TENANT.USER',
        valueField: 'id',
        textField: 'realName',
        lovPara: {
          organizationId: getCurrentOrganizationId(),
        },
        transformRequest: (value = {}) => value?.id || null,
        transformResponse: (value, data) => {
          return value ? { id: value, realName: data?.requestUserName } : null;
        },
        dynamicProps: {
          disabled({ record }) {
            return record.get('prNum');
          },
        },
      },
      {
        name: 'requestUserName',
        bind: 'requestUserId.realName',
      },
      {
        label: intl.get('ssrc.common.model.common.projectTaskNme').d('项目任务名称'),
        name: 'projectTaskId',
        type: 'object',
        lovCode: 'SIEC.PROJECT_TASK_TREE',
        valueField: 'taskId',
        textField: 'taskName',
        lovPara: {
          businessObjectCode: 'SRM_C_SRM_SSRC_SOURCE_PROJECT',
        },
        optionsProps: {
          paging: 'server',
          childrenField: 'children',
          record: {
            dynamicProps: {
              selectable: (record) => record.get('isCheck') !== false,
            },
          },
        },
        transformRequest: (value = {}) => value?.taskId || null,
        transformResponse: (value, data) => {
          return value ? { taskId: value, taskName: data?.projectTaskName } : null;
        },
        dynamicProps: {
          disabled({ record }) {
            return Number(record.get('projectTaskDisableFlag')) === 1;
          },
        },
      },
      {
        name: 'projectTaskName',
        bind: 'projectTaskId.taskName',
      },
      {
        label: intl.get(`ssrc.projectSetup.model.projectSetup.sectionNum`).d('标段/包编号'),
        name: 'sectionCode',
        type: 'object',
        lovCode: 'SSRC.PROJECT_SRCTION',
        valueField: 'sectionCode',
        textField: 'sectionCode',
        dynamicProps: {
          required() {
            if (headerDs?.current?.get('subjectMatterRule') === 'PACK') {
              return true;
            }
          },
        },
        lovPara: {
          businessObjectCode: 'SRM_C_SRM_SSRC_SOURCE_PROJECT',
          sourceProjectId,
          organizationId: getCurrentOrganizationId(),
        },
        transformRequest: (value = {}) => value?.sectionCode || null,
        transformResponse: (value, data) => {
          return value ? { sectionCode: value, sectionName: data?.sectionName } : null;
        },
      },
      {
        name: 'projectLineSectionId',
        bind: 'sectionCode.projectLineSectionId',
      },
      {
        label: intl.get(`ssrc.projectSetup.model.projectSetup.sectionName`).d('标段/包名称'),
        name: 'sectionName',
        bind: 'sectionCode.sectionName',
      },
    ],
    // events: {
    // update: ({ record, name, value = null }) => {
    // if (name === 'adjustFields' && record.status !== 'add') return;
    // const adjustFields = record.get('adjustFields') || [];
    // 那些id类型的要特殊处理
    // if (value !== record.getPristineValue(name)) {
    //   record.set('adjustFields', [...adjustFields, name]);
    // } else {
    //   const index = adjustFields.indexOf(name);
    //   adjustFields.splice(index, 1);
    // }
    //   },
    // },
    transport: {
      read: ({ data }) => {
        const { projectLineSectionId } = data || {};
        return {
          url: `${prefix}/${getCurrentOrganizationId()}/source-projects/${sourceProjectId}/items`,
          method: 'GET',
          data: {
            projectLineSectionId,
            customizeUnitCode,
          },
        };
      },
      destroy: ({ data }) => {
        return {
          url: `${prefix}/${getCurrentOrganizationId()}/project-line-items`,
          method: 'DELETE',
          data,
        };
      },
    },
  };
};

// 标段/包信息ds
const sectionOrPacketInfoDS = (payload) => {
  const { sourceProjectId, customizeUnitCode } = payload || {};
  return {
    primaryKey: 'projectLineSectionId',
    pageSize: 10,
    selection: 'multiple',
    cacheModified: true,
    dataToJSON: 'all',
    fields: [
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.lineNo.`).d('行号'),
        name: 'sectionNum',
      },
      {
        label: intl.get(`ssrc.projectSetup.model.projectSetup.sectionNum`).d('标段/包编号'),
        name: 'sectionCode',
        required: true,
      },
      {
        label: intl.get(`ssrc.projectSetup.model.projectSetup.sectionName`).d('标段/包名称'),
        name: 'sectionName',
        required: true,
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.viewItemDetail`).d('物料'),
        name: 'allotMaterial',
      },
      {
        label: intl.get(`hzero.common.remark`).d('备注'),
        name: 'sectionRemark',
      },
      {
        label: intl.get(`ssrc.projectSetup.model.projectSetup.sectionAttachmentUuid`).d('附件'),
        name: 'sectionAttachmentUuid',
        type: 'attachment',
        bucketName: PRIVATE_BUCKET,
        bucketDirectory: 'ssrc-rfx-rfxitem',
      },
    ],
    transport: {
      read: () => {
        return {
          url: `${prefix}/${getCurrentOrganizationId()}/project-line-sections/${sourceProjectId}`,
          method: 'GET',
          data: {
            customizeUnitCode,
          },
        };
      },
      destroy: ({ data }) => {
        return {
          url: `${prefix}/${getCurrentOrganizationId()}/project-line-sections`,
          method: 'DELETE',
          data,
        };
      },
    },
  };
};

// 标段分配物料弹框ds
const allotItemLineDS = (payload) => {
  const { sourceProjectId, customizeUnitCode, type } = payload || {};
  return {
    primaryKey: 'projectLineItemId',
    selection: 'multiple',
    dataToJSON: 'all',
    queryFields: [
      {
        label: intl
          .get(`ssrc.projectSetup.model.spChange.itemAllocatedFuzzyValue`)
          .d('请输入物料编码、名称查询'),
        name: 'itemAllocatedFuzzyValue',
      },
    ],
    fields: [
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.lineNo.`).d('行号'),
        name: 'projectLineItemNum',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemCode`).d('物料编码'),
        name: 'itemCode',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemName`).d('物料名称'),
        name: 'itemName',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemCategory`).d('物料类别'),
        name: 'itemCategoryName',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.unit`).d('单位'),
        name: 'secondaryUomName',
      },
      {
        name: 'uomName',
        dynamicProps: {
          label: ({ dataSet }) => {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            return getUomName(doubleUnitFlag);
          },
        },
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.quantity`).d('需求数量'),
        name: 'secondaryQuantity',
      },
      {
        name: 'requiredQuantity',
        dynamicProps: {
          label: ({ dataSet }) => {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            return getQtyName(doubleUnitFlag);
          },
        },
      },
    ],
    transport: {
      read: ({ data, dataSet }) => {
        const { projectLineSectionId, itemAllocatedFuzzyValue } = data || {};
        if (type === 'allot') {
          return {
            url: `${prefix}/${getCurrentOrganizationId()}/source-projects/${sourceProjectId}/items`,
            method: 'GET',
            data: {
              projectLineSectionId,
              customizeUnitCode,
            },
          };
        }
        if (!projectLineSectionId) return;
        const {
          queryParameter: { projectLineItemIds = [] },
        } = dataSet || {};
        return {
          // 分配物料点击新增弹出的物料弹框
          url: `${prefix}/${getCurrentOrganizationId()}/project-line-sections/not-allot/fuzzy`,
          method: 'POST',
          params: {
            customizeUnitCode,
          },
          data: {
            projectLineSectionId,
            itemAllocatedFuzzyValue,
            projectLineItemIds, // 需要过滤数据的id
            sourceProjectId,
          },
        };
      },
      destroy: ({ data }) => {
        if (type === 'allot') {
          // 分配物料弹框
          return {
            url: `${prefix}/${getCurrentOrganizationId()}/project-line-sections/allot/delete`,
            method: 'DELETE',
            data,
          };
        }
      },
      submit: ({ data, dataSet }) => {
        const {
          queryParameter: { projectLineSectionId = {} },
        } = dataSet || {};
        if (type === 'allot') {
          // 分配物料弹框
          return {
            url: `${prefix}/${getCurrentOrganizationId()}/project-line-sections/${projectLineSectionId}/allot`,
            method: 'POST',
            params: {
              customizeUnitCode,
            },
            data,
          };
        }
      },
    },
  };
};

// 对供应商要求
const supplierLineTableDS = (payload) => {
  const { sourceProjectId, customizeUnitCode, headerDs } = payload || {};

  return {
    primaryKey: 'projectLineSupplierId',
    selection: 'multiple',
    cacheModified: true,
    pageSize: 10,
    dataToJSON: 'all',
    fields: [
      {
        label: intl.get('ssrc.common.supplierNum').d('供应商编码'),
        name: 'supplierCompanyNum',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierName`).d('供应商名称'),
        name: 'supplierCompanyName',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierCategory`).d('供应商分类'),
        name: 'supplierCategoryDescription',
        disabled: true,
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.lifeCycle`).d('生命周期阶段'),
        name: 'stageDescription',
        disabled: true,
        dynamicProps: {
          help({ record }) {
            return record.get('stageMismatchCnfFlag')
              ? intl
                .get(`ssrc.inquiryHall.model.inquiryHall.supplierNotQuotation`)
                .d('该供应商当前所在的生命周期阶段不可进行报价')
              : '';
          },
        },
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.contacts`).d('联系人'),
        name: 'supplierContactId',
        type: 'object',
        lovCode: 'SSRC.SUPPLIER_CONTANCTS',
        valueField: 'companyContactId',
        textField: 'name',
        transformRequest: (value = {}) => value?.companyContactId || null,
        transformResponse: (value, data) => {
          return value
            ? {
              companyContactId: data?.supplierContactId,
              name: data?.contactName,
            }
            : null;
        },
        dynamicProps: {
          lovPara({ record }) {
            return {
              companyId: headerDs?.current?.get('companyId')?.companyId,
              supplierCompanyId: record.get('supplierCompanyId'),
            };
          },
        },
      },
      {
        name: 'contactName',
        bind: 'supplierContactId.name',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.tel`).d('联系电话'),
        name: 'contactMobilephone',
        type: 'tel',
        regionField: 'internationalTelCode',
        validator: (value, _, record) => {
          const validateType =
            record.get('internationalTelCode') === '+86' ? PHONE : NOT_CHINA_PHONE;
          if (value && !validateType.test(record.get('contactMobilephone'))) {
            return intl.get('ssrc.common.validation.phoneForma').d('电话格式不正确');
          }
          return true;
        },
      },
      {
        name: 'internationalTelCode',
        lookupCode: 'HPFM.IDD',
      },
      {
        label: intl.get('ssrc.projectSetup.model.projectSetup.contactMail').d('联系人邮箱'),
        name: 'contactMail',
        validator: (value, _, record) => {
          if (value && !EMAIL.test(record.get('contactMail'))) {
            return intl.get('hzero.common.validation.email').d('邮箱格式不正确');
          }
          return true;
        },
      },
      {
        label: intl.get(`ssrc.inquiryHall.view.message.button.allotSection`).d('分配标段'),
        name: 'allocatedLot',
        type: 'object',
        lovCode: 'SSRC.SUP_SECT_ASSIGN_RELATION',
        valueField: 'projectLineSectionId',
        textField: 'sectionName',
        multiple: true,
        optionsProps: {
          paging: false,
        },
        lovPara: {
          tenantId: getCurrentOrganizationId(),
          sourceProjectId,
        },
        transformRequest: (value) =>
          !isEmpty(value) ? value.map((i) => i.projectLineSectionId) : null,
        transformResponse: (_, data) => {
          return data?.supSectionAssignLovDTOS?.length ? data.supSectionAssignLovDTOS : null;
        },
        dynamicProps: {
          required() {
            if (headerDs?.current?.get('subjectMatterRule') === 'PACK') {
              return true;
            }
          },
        },
      },
    ],
    transport: {
      read: () => {
        return {
          url: `${prefix}/${getCurrentOrganizationId()}/source-projects/${sourceProjectId}/suppliers`,
          method: 'GET',
          data: {
            customizeUnitCode,
          },
        };
      },
      destroy: ({ data }) => {
        return {
          url: `${prefix}/${getCurrentOrganizationId()}/project-line-suppliers`,
          method: 'DELETE',
          data,
        };
      },
    },
  };
};

// 项目计划ds
const planLineTableDS = (payload) => {
  const { sourceProjectId, customizeUnitCode } = payload || {};
  return {
    primaryKey: 'projectLinePlanId',
    pageSize: 10,
    selection: 'multiple',
    cacheModified: true,
    dataToJSON: 'all',
    fields: [
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.lineNo.`).d('行号'),
        name: 'projectLinePlanNum',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.projectStage`).d('项目阶段'),
        name: 'projectStage',
        type: 'string',
        lookupCode: 'SSRC.PROJECT_PLAN_STAGE',
        required: true,
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.planCompleteDate`).d('计划完成日期'),
        name: 'planCompleteDate',
        required: true,
        type: 'date',
      },
    ],
    transport: {
      read() {
        return {
          url: `${prefix}/${getCurrentOrganizationId()}/source-projects/${sourceProjectId}/plans`,
          method: 'GET',
          data: {
            customizeUnitCode,
          },
        };
      },
      destroy: ({ data }) => {
        return {
          url: `${prefix}/${getCurrentOrganizationId()}/project-line-plans`,
          method: 'DELETE',
          data,
        };
      },
    },
  };
};

// 批量添加供应商
const supplierLovDS = (payload) => {
  const { sourceProjectId } = payload || {};
  return {
    autoCreate: true,
    fields: [
      {
        name: 'supplierLovList',
        type: 'object',
        lovCode: 'SSLM.SUPPLIER', // 固定值, 不可更改
        multiple: true,
      },
    ],
    transport: {
      submit: ({ data }) => {
        if (!data?.length) return;
        const { supplierLovList = [] } = data[0] || {};
        if (isEmpty(supplierLovList)) return;
        const newData = supplierLovList.map((item) => {
          const {
            mail,
            mobilephone,
            contactMail,
            contactPhone,
            name = null,
            supplierName,
            supplierCompanyName,
            supplierNum,
            supplierCompanyId,
            supplierCompanyNum,
            internationalTelCode = null,
          } = item || {};
          return {
            ...item,
            contactName: name,
            sourceProjectId,
            tenantId: getCurrentOrganizationId(),
            contactMail: mail || contactMail,
            contactMobilephone: mobilephone || contactPhone,
            mobilephone: mobilephone || contactPhone,
            supplierCompanyId,
            supplierCompanyName: supplierCompanyName || supplierName,
            supplierCompanyNum: supplierCompanyNum || supplierNum,
            internationalTelCode,
          };
        });

        return {
          url: `${prefix}/${getCurrentOrganizationId()}/project-line-suppliers`,
          method: 'POST',
          params: { sourceProjectId },
          data: newData,
        };
      },
    },
  };
};

export {
  headerDS,
  itemLineDS,
  sectionOrPacketInfoDS,
  allotItemLineDS,
  supplierLineTableDS,
  planLineTableDS,
  supplierLovDS,
};
