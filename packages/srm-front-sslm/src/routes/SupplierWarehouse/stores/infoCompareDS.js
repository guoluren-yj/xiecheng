import intl from 'utils/intl';
import { SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

// 头信息DS
const getHeaderInfoDS = queryParams => ({
  fields: [
    {
      name: 'reqNumber',
      label: intl.get('sslm.supplierWarehouse.model.warehouse.applyNum').d('申请单号'),
    },
    {
      name: 'reqStatus',
      lookupCode: 'SSLM.EXTERNAL_SUP_REQ_STATUS',
      label: intl.get('sslm.supplierWarehouse.model.warehouse.applyStatus').d('申请状态'),
    },
    {
      name: 'creationDate',
      type: 'dateTime',
      label: intl.get('sslm.supplierWarehouse.model.warehouse.creationTime').d('创建时间'),
    },
    {
      name: 'creator',
      label: intl.get('sslm.supplierWarehouse.model.warehouse.applicant').d('申请人'),
    },
    {
      name: 'reqTypeCode',
      lookupCode: 'SSLM.EXTERNAL_SUP_REQ_TYPE',
      defaultValue: 'SUP_NEW_REQ',
      label: intl.get('sslm.supplierWarehouse.model.warehouse.applyType').d('单据类型'),
    },
    {
      name: 'supplierNum',
      label: intl.get('sslm.supplierWarehouse.model.warehouse.supplierCode').d('供应商编码'),
    },
    {
      name: 'supplierName',
      label: intl.get('sslm.supplierWarehouse.model.warehouse.supplierName').d('供应商名称'),
    },
    {
      name: 'supplierTypeCode',
      lookupCode: 'SSLM.SUPPLIER_TYPE_CODE',
      label: intl.get('sslm.supplierWarehouse.model.warehouse.supplierType').d('供应商类型'),
    },
    {
      name: 'idNum',
      label: intl.get('sslm.supplierWarehouse.model.warehouse.idNumber').d('身份证号'),
    },
    {
      name: 'unifiedSocialCode',
      label: intl.get('sslm.supplierWarehouse.model.warehouse.socialCode').d('统一社会信用代码'),
    },
    {
      name: 'organizingInstitutionCode',
      label: intl.get('sslm.supplierWarehouse.model.warehouse.organizationCode').d('组织机构代码'),
    },
    {
      name: 'dunsCode',
      label: intl.get('sslm.supplierWarehouse.model.warehouse.dunCode').d('邓白氏编码'),
    },
    {
      name: 'businessRegistrationNumber',
      label: intl
        .get('sslm.supplierWarehouse.model.warehouse.businessRegisteNum')
        .d('商业注册登记号/税号'),
    },
    {
      name: 'remark',
      label: intl.get('sslm.supplierWarehouse.model.warehouse.explain').d('说明'),
    },
    {
      name: 'passport',
      label: intl.get('sslm.supplierWarehouse.model.warehouse.passport').d('护照'),
    },
    {
      name: 'externalSystemCodeLov',
      type: 'object',
      lovCode: 'SITF.ES_RELATIONS',
      ignore: 'always',
      textField: 'externalSystemName',
      label: intl.get('sslm.supplierWarehouse.model.warehouse.externalSystem').d('来源系统'),
    },
    {
      name: 'externalSystemCode',
      bind: 'externalSystemCodeLov.externalSystemCode',
    },
    {
      name: 'externalSystemName',
      bind: 'externalSystemCodeLov.externalSystemName',
    },
    {
      name: 'unitNameLov',
      type: 'object',
      lovCode: 'SPRM.USER_UNIT',
      ignore: 'always',
      textField: 'unitName',
      label: intl.get('sslm.supplierWarehouse.model.warehouse.unitName').d('创建人部门'),
    },
    {
      name: 'unitId',
      bind: 'unitNameLov.unitId',
    },
    {
      name: 'unitName',
      bind: 'unitNameLov.unitName',
    },
    {
      name: 'enabledFlag',
      lookupCode: 'HPFM.FLAG',
      label: intl.get('sslm.supplierWarehouse.model.warehouse.enabledFlag').d('启用'),
    },
    {
      name: 'termId',
      type: 'object',
      lovCode: 'SMDM.PAYMENT.TERM',
      textField: 'termName',
      valueField: 'termId',
      lovPara: {
        tenantId: organizationId,
      },
      label: intl.get('spfm.importErp.model.importErp.termName').d('付款条款'),
      transformRequest: value => value && value.termId,
      transformResponse: (value, data) => {
        const { termId, termName } = data || {};
        if (!termId) {
          return null;
        } else {
          return {
            termId,
            termName,
          };
        }
      },
    },
    {
      name: 'paymentTypeCode',
      type: 'object',
      lovCode: 'SMDM.PAYMENT_TYPE_CODE',
      textField: 'typeName',
      valueField: 'typeCode',
      label: intl.get(`sslm.supplierWarehouse.model.warehouse.paymentType`).d('付款方式'),
      lovPara: {
        tenantId: organizationId,
      },
      transformRequest: value => value && value.typeCode,
      transformResponse: (value, data) => {
        const { paymentTypeCode, typeName } = data || {};
        if (!paymentTypeCode) {
          return null;
        } else {
          return {
            typeCode: paymentTypeCode,
            typeName,
          };
        }
      },
    },
  ],
  transport: {
    read: {
      url: `${SRM_SSLM}/v1/${organizationId}/external-supplier-reqs/compare`,
      method: 'GET',
      data: {},
      params: { ...queryParams, customizeUnitCode: queryParams.customizeUnitCode },
    },
  },
});

// 联系人DS
const getContactDS = queryParams => ({
  cacheSelection: true,
  autoLocateFirst: false,
  primaryKey: 'extContactReqId',
  selection: false,
  fields: [
    {
      name: 'objectFlag',
      label: intl.get('sslm.supplierWarehouse.model.warehouse.objectFlag').d('变更类型'),
    },
    {
      name: 'name',
      label: intl.get('sslm.supplierWarehouse.model.warehouse.name').d('姓名'),
    },
    // {
    //   name: 'gender',
    //   lookupCode: 'HPFM.GENDER',
    //   label: intl.get('sslm.supplierWarehouse.model.warehouse.gender').d('性别'),
    // },
    {
      name: 'idType',
      lookupCode: 'SPFM.ID_TYPE',
      label: intl.get('sslm.supplierWarehouse.model.warehouse.documentType').d('证件类型'),
    },
    {
      name: 'idNumber',
      label: intl.get('sslm.supplierWarehouse.model.warehouse.documentNumber').d('证件号码'),
    },
    {
      name: 'department',
      label: intl.get('sslm.supplierWarehouse.model.warehouse.department').d('所属部门'),
    },
    {
      name: 'position',
      label: intl.get('sslm.supplierWarehouse.model.warehouse.position').d('职务'),
    },
    {
      name: 'contactType',
      lookupCode: 'SSLM.CONTACT_TYPE',
      label: intl.get('sslm.supplierWarehouse.model.warehouse.contactType').d('联系人类型'),
    },
    {
      name: 'mobilephone',
      label: intl.get('sslm.supplierWarehouse.model.warehouse.mobilePhone').d('移动电话'),
    },
    {
      name: 'mail',
      type: 'email',
      label: intl.get('sslm.supplierWarehouse.model.warehouse.email').d('邮箱'),
    },
    {
      name: 'officePhone',
      label: intl.get('sslm.supplierWarehouse.model.warehouse.officePhone').d('办公电话'),
    },
    {
      name: 'defaultFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      label: intl.get('sslm.supplierWarehouse.model.warehouse.defaultContact').d('默认联系人'),
    },
    {
      name: 'remark',
      label: intl.get('sslm.supplierWarehouse.model.warehouse.remark').d('备注'),
    },
    {
      name: 'enabledFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 1,
      label: intl.get('sslm.supplierWarehouse.model.warehouse.enable').d('启用'),
    },
  ],
  transport: {
    read: ({ params, dataSet }) => {
      const { queryParameter } = dataSet;
      const { customizeUnitCode, compare, ...others } = queryParams;
      const onlyShowChange = dataSet.getState('onlyShowChange');
      const url = onlyShowChange
        ? `${SRM_SSLM}/v1/${organizationId}/ext-supplier-contact-reqs/compare-only-change`
        : `${SRM_SSLM}/v1/${organizationId}/ext-supplier-contact-reqs/compare`;
      return {
        url,
        method: 'GET',
        data: {},
        params: onlyShowChange
          ? {
              ...params,
              ...others,
              ...queryParameter,
              customizeUnitCode,
            }
          : {
              ...params,
              ...queryParams,
              ...queryParameter,
              customizeUnitCode,
            },
      };
    },
  },
});

// 地址DS
const getAddressDS = queryParams => ({
  cacheSelection: true,
  autoLocateFirst: false,
  primaryKey: 'extAddressReqId',
  selection: false,
  fields: [
    {
      name: 'objectFlag',
      label: intl.get('sslm.supplierWarehouse.model.warehouse.objectFlag').d('变更类型'),
    },
    {
      name: 'countryLov',
      required: true,
      type: 'object',
      lovCode: 'HPFM.COUNTRY',
      ignore: 'always',
      noCache: true,
      textField: 'countryName',
      label: intl.get('sslm.supplierWarehouse.model.warehouse.country').d('国家'),
    },
    {
      name: 'countryIdMeaning',
      bind: 'countryLov.countryName',
    },
    {
      name: 'countryId',
      bind: 'countryLov.countryId',
    },
    {
      name: 'regionPathName',
      label: intl.get('sslm.supplierWarehouse.model.warehouse.province').d('省/市/区'),
    },
    {
      name: 'regionId',
    },
    {
      name: 'addressDetail',
      label: intl.get('sslm.supplierWarehouse.model.warehouse.detailedAddress').d('详细地址'),
    },
    {
      name: 'postCode',
      label: intl.get('sslm.supplierWarehouse.model.warehouse.postalCode').d('邮政编码'),
    },
    {
      name: 'remark',
      label: intl.get('sslm.supplierWarehouse.model.warehouse.remark').d('备注'),
    },
    {
      name: 'enabledFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 1,
      label: intl.get('sslm.supplierWarehouse.model.warehouse.enable').d('启用'),
    },
  ],
  transport: {
    read: ({ params, dataSet }) => {
      const { queryParameter } = dataSet;
      const { customizeUnitCode, compare, ...others } = queryParams;
      const onlyShowChange = dataSet.getState('onlyShowChange');
      const url = onlyShowChange
        ? `${SRM_SSLM}/v1/${organizationId}/ext-supplier-address-reqs/compare-only-change`
        : `${SRM_SSLM}/v1/${organizationId}/ext-supplier-address-reqs/compare`;
      return {
        url,
        method: 'GET',
        data: {},
        params: onlyShowChange
          ? {
              ...params,
              ...others,
              ...queryParameter,
              customizeUnitCode: queryParams.customizeUnitCode,
            }
          : {
              ...params,
              ...queryParams,
              ...queryParameter,
              customizeUnitCode: queryParams.customizeUnitCode,
            },
      };
    },
  },
});

// 银行账户DS
const getBankAccountDS = queryParams => ({
  cacheSelection: true,
  autoLocateFirst: false,
  primaryKey: 'extBkAccountReqId',
  selection: false,
  fields: [
    {
      name: 'objectFlag',
      label: intl.get('sslm.supplierWarehouse.model.warehouse.objectFlag').d('变更类型'),
    },
    {
      name: 'countryId',
      type: 'object',
      label: intl.get('spfm.bank.model.bank.bankCountry').d('国家/地区'),
    },
    {
      name: 'bankCode',
      // type: 'object',
      // lovCode: 'SPFM.COMPANY.BANK',
      // textField: 'bankCode',
      // required: true,
      // noCache: true,
      // ignore: 'always',
      label: intl.get('sslm.supplierWarehouse.model.warehouse.bankCode').d('银行代码'),
    },
    {
      name: 'bankId',
      // bind: 'bankLov.bankId',
    },
    // {
    //   name: 'bankCode',
    //   bind: 'bankLov.bankCode',
    // },
    {
      name: 'bankName',
      // bind: 'bankLov.bankName',
      label: intl.get('sslm.supplierWarehouse.model.warehouse.bankName').d('银行名称'),
    },
    {
      name: 'correspondentLov',
      type: 'object',
      lovCode: 'SMDM.BANK_BRANCK_FIRM_TENANT',
      noCache: true,
      ignore: 'always',
      textField: 'bankFirm',
      dynamicProps: {
        lovPara: ({ record }) => {
          return {
            bankId: record.get('bankId'),
            tenantId: organizationId,
          };
        },
      },
      label: intl.get('sslm.supplierWarehouse.model.warehouse.correspondent').d('联行行号'),
    },
    {
      name: 'bankBranchId',
      bind: 'correspondentLov.bankBranchId',
    },
    {
      name: 'bankFirm',
      bind: 'correspondentLov.bankFirm',
    },
    {
      name: 'bankBranchName',
      bind: 'correspondentLov.bankBranchName',
      label: intl.get('sslm.supplierWarehouse.model.warehouse.openeBankName').d('开户行名称'),
    },
    {
      name: 'bankAccountName',
      label: intl.get('sslm.supplierWarehouse.model.warehouse.accountName').d('账户名称'),
    },
    {
      name: 'bankAccountNum',
      label: intl.get('sslm.supplierWarehouse.model.warehouse.bankAccount').d('银行账号'),
    },
    {
      name: 'bankIdentifyCodeType',
      lookupCode: 'SPFM.BANK_IDENTIFY_CODE_TYPE',
      label: intl.get('sslm.common.model.bank.bankIdentifyCodeType').d('银行识别码类型'),
    },
    {
      name: 'bankIdentifyCode',
      label: intl.get('sslm.common.model.bank.bankIdentifyCode').d('银行识别码'),
    },
    {
      name: 'masterFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      label: intl.get('sslm.supplierWarehouse.model.warehouse.mainAccount').d('主账号'),
    },
    {
      name: 'enabledFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 1,
      label: intl.get('sslm.supplierWarehouse.model.warehouse.enable').d('启用'),
    },
    {
      name: 'remark',
      label: intl.get('sslm.supplierWarehouse.model.warehouse.remark').d('备注'),
    },
    {
      name: 'intlBankAccountNum',
      label: intl.get('spfm.bank.model.bank.intlBankAccount').d('IBAN码'),
    },
  ],
  transport: {
    read: ({ params, dataSet }) => {
      const { queryParameter } = dataSet;
      const { customizeUnitCode, compare, ...others } = queryParams;
      const onlyShowChange = dataSet.getState('onlyShowChange');
      const url = onlyShowChange
        ? `${SRM_SSLM}/v1/${organizationId}/ext-sup-bk-account-reqs/compare-only-change`
        : `${SRM_SSLM}/v1/${organizationId}/ext-sup-bk-account-reqs/compare`;
      return {
        url,
        method: 'GET',
        data: {},
        params: onlyShowChange
          ? {
              ...params,
              ...others,
              ...queryParameter,
              customizeUnitCode,
            }
          : {
              ...params,
              ...queryParams,
              ...queryParameter,
              customizeUnitCode,
            },
      };
    },
  },
});

// 附件户DS
const getAttachmentDS = queryParams => ({
  cacheSelection: true,
  autoLocateFirst: false,
  primaryKey: 'extAttachmentReqId',
  selection: false,
  fields: [
    {
      name: 'objectFlag',
      label: intl.get('sslm.supplierWarehouse.model.warehouse.objectFlag').d('变更类型'),
    },
    {
      name: 'description',
      label: intl.get('sslm.supplierWarehouse.model.warehouse.attachmentName').d('附件名称'),
    },
    {
      name: 'fileSize',
      label: intl.get('sslm.supplierWarehouse.model.warehouse.attachmentSize').d('附件大小（MB）'),
    },
    {
      name: 'uploader',
      label: intl.get('sslm.supplierWarehouse.model.warehouse.uploadUser').d('上传人'),
    },
    {
      name: 'uploadDate',
      type: 'dateTime',
      label: intl.get('sslm.supplierWarehouse.model.warehouse.uploadTime').d('上传时间'),
    },
    {
      name: 'remark',
      label: intl.get('sslm.supplierWarehouse.model.warehouse.remark').d('备注'),
    },
    {
      name: 'operation',
      label: intl.get('hzero.common.button.action').d('操作'),
    },
  ],
  transport: {
    read: ({ params, dataSet }) => {
      const { queryParameter } = dataSet;
      const { customizeUnitCode, compare, ...others } = queryParams;
      const onlyShowChange = dataSet.getState('onlyShowChange');
      const url = onlyShowChange
        ? `${SRM_SSLM}/v1/${organizationId}/ext-supplier-attachment-reqs/compare-only-change`
        : `${SRM_SSLM}/v1/${organizationId}/ext-supplier-attachment-reqs/compare`;
      return {
        url,
        method: 'GET',
        data: {},
        params: onlyShowChange
          ? {
              ...params,
              ...others,
              ...queryParameter,
              customizeUnitCode,
            }
          : {
              ...params,
              ...queryParams,
              ...queryParameter,
              customizeUnitCode,
            },
      };
    },
  },
});

// 采购财务-头
const getPurchaseHeaderDS = queryParams => ({
  fields: [
    {
      name: 'programmeGroups',
      label: intl.get('spfm.importErp.model.importErp.planGroups').d('计划组'),
    },
    {
      name: 'schemeGroup',
      type: 'string',
      label: intl.get('sslm.supplierInform.model.supplierInform.schemeGroup').d('方案组'),
    },
    {
      name: 'accountGroup',
      label: intl.get('sslm.supplierInform.model.supplierInform.accountGroup').d('账户组'),
    },
    {
      name: 'reconciliationAccount',
      label: intl.get('sslm.supplierInform.model.supplierInform.controlAccount').d('统驭科目'),
    },
    {
      name: 'ouId',
      label: intl.get('sslm.supplierInform.model.supplierInform.erpCompanyCode').d('erp公司代码'),
    },
    {
      name: 'termId',
      label: intl.get('spfm.importErp.model.importErp.termName').d('付款条款'),
    },
    {
      name: 'frozenFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      label: intl.get('sslm.supplierInform.model.supplierInform.accountFlag').d('记账冻结'),
    },
    {
      name: 'paymentFrozen',
      label: intl.get('spfm.importErp.model.importErp.paymentFreezeCode').d('付款冻结代码'),
    },
  ],
  transport: {
    read: ({ params, dataSet: { queryParameter } }) => {
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/ext-supplier-pf-req/compare`,
        method: 'GET',
        data: {},
        params: {
          ...params,
          ...queryParams,
          ...queryParameter,
          customizeUnitCode: queryParams.customizeUnitCode,
        },
      };
    },
  },
});

// 采购财务-行
const getPurchaseLineDS = queryParams => ({
  selection: false,
  primaryKey: 'extPfLineReqId',
  fields: [
    {
      name: 'objectFlag',
      label: intl.get('sslm.supplierWarehouse.model.warehouse.objectFlag').d('变更类型'),
    },
    {
      name: 'organizationCode',
      label: intl.get('sslm.supplierInform.model.supplierInform.organizationCode').d('采购组织'),
    },
    {
      name: 'organizationName',
      type: 'string',
      label: intl
        .get('sslm.supplierInform.model.supplierInform.organizationName')
        .d('采购组织名称'),
    },
    {
      name: 'purchaseAgentId',
      label: intl.get('sslm.supplierInform.model.supplierInform.purchaseAgent').d('采购员'),
    },
    {
      name: 'termId',
      label: intl.get('sslm.supplierInform.model.supplierInform.termName').d('付款条款'),
    },
    {
      name: 'typeCode',
      label: intl.get('sslm.supplierInform.model.supplierInform.payMethod').d('付款方式'),
    },
    {
      name: 'tradeTerms',
      label: intl.get('spfm.importErp.model.importErp.internationalCondition').d('国贸条件'),
    },
    {
      name: 'tradeTermsSite',
      label: intl.get('spfm.importErp.model.importErp.internationalSite').d('国贸地点'),
    },
    {
      name: 'currencyCode',
      label: intl.get('sslm.supplierInform.model.supplierInform.currencyCode').d('订单货币'),
    },
    {
      name: 'reconciliationAccount',
      label: intl.get('sslm.supplierInform.model.supplierInform.controlAccount').d('统驭科目'),
    },
    {
      name: 'sortNumber',
      numberGrouping: false,
      type: 'number',
      label: intl.get(`sslm.supplierInform.model.supplierInform.sortNumber`).d('排序码'),
    },
    {
      name: 'frozenFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      label: intl.get(`sslm.supplierInform.model.purchase.frozenFlag`).d('采购冻结'),
    },
  ],
  transport: {
    read: ({ params, dataSet }) => {
      const { queryParameter } = dataSet;
      const { customizeUnitCode, compare, ...others } = queryParams;
      const onlyShowChange = dataSet.getState('onlyShowChange');
      const url = !onlyShowChange
        ? `${SRM_SSLM}/v1/${organizationId}/ext-supplier-pf-line-req/compare`
        : `${SRM_SSLM}/v1/${organizationId}/ext-supplier-pf-line-req/compare-only-change`;
      return {
        url,
        method: 'GET',
        data: {},
        params: !onlyShowChange
          ? {
              ...params,
              ...queryParams,
              ...queryParameter,
              customizeUnitCode,
            }
          : {
              ...params,
              ...others,
              ...queryParameter,
              customizeUnitCode,
            },
      };
    },
  },
});

export {
  getHeaderInfoDS,
  getContactDS,
  getAddressDS,
  getBankAccountDS,
  getAttachmentDS,
  getPurchaseHeaderDS,
  getPurchaseLineDS,
};
