import intl from 'utils/intl';
import { SRM_SSLM } from '_utils/config';
import { isEmpty } from 'lodash';

import { NOT_CHINA_PHONE, PHONE, IDENTITY_CARD } from 'utils/regExp';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

// 头信息DS
const getHeaderInfoDS = ({
  isEdit,
  customizeUnitCode = 'SSLM.EASY_SUPPLIER_WAREHOUSE.BASIC_INFO',
}) => ({
  fields: [
    {
      name: 'extSupplierReqId',
    },
    {
      name: 'reqNumber',
      disabled: true,
      label: intl.get('sslm.supplierWarehouse.model.warehouse.applyNum').d('申请单号'),
    },
    {
      name: 'reqStatus',
      disabled: true,
      lookupCode: 'SSLM.EXTERNAL_SUP_REQ_STATUS',
      defaultValue: 'NEW',
      label: intl.get('sslm.supplierWarehouse.model.warehouse.applyStatus').d('申请状态'),
    },
    {
      name: 'creationDate',
      disabled: true,
      type: 'dateTime',
      label: intl.get('sslm.supplierWarehouse.model.warehouse.creationTime').d('创建时间'),
    },
    {
      name: 'creator',
      disabled: true,
      label: intl.get('sslm.supplierWarehouse.model.warehouse.applicant').d('申请人'),
    },
    {
      name: 'reqTypeCode',
      disabled: true,
      lookupCode: 'SSLM.EXTERNAL_SUP_REQ_TYPE',
      defaultValue: 'SUP_NEW_REQ',
      label: intl.get('sslm.supplierWarehouse.model.warehouse.applyType').d('单据类型'),
    },
    {
      name: 'supplierNum',
      label: intl.get('sslm.supplierWarehouse.model.warehouse.supplierCode').d('供应商编码'),
      dynamicProps: {
        disabled: ({ record }) => !record.get('extSupplierReqId'),
        required: ({ record }) => isEdit && record.get('extSupplierReqId'),
      },
    },
    {
      name: 'supplierName',
      required: isEdit,
      label: intl.get('sslm.supplierWarehouse.model.warehouse.supplierName').d('供应商名称'),
    },
    {
      name: 'supplierTypeCode',
      required: isEdit,
      lookupCode: 'SSLM.SUPPLIER_TYPE_CODE',
      label: intl.get('sslm.supplierWarehouse.model.warehouse.supplierType').d('供应商类型'),
    },
    {
      name: 'idNum',
      pattern: IDENTITY_CARD,
      label: intl.get('sslm.supplierWarehouse.model.warehouse.idNumber').d('身份证号'),
      dynamicProps: {
        required: ({ record }) => {
          if (record.get('supplierTypeCode') === 'INDIVIDUAL_SUPPLIER' && !record.get('passport')) {
            return isEdit;
          } else {
            return false;
          }
        },
      },
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
      dynamicProps: {
        required: ({ record }) => {
          if (record.get('supplierTypeCode') === 'INDIVIDUAL_SUPPLIER' && !record.get('idNum')) {
            return isEdit;
          } else {
            return false;
          }
        },
      },
    },
    {
      name: 'externalSystemCodeLov',
      required: true,
      type: 'object',
      lovCode: 'SITF.ES_RELATIONS',
      ignore: 'always',
      noCache: true,
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
      noCache: true,
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
    read: ({ dataSet: { queryParameter } }) => {
      const { extSupplierReqId, workFlowCode, ...others } = queryParameter;
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/external-supplier-reqs/${extSupplierReqId}`,
        method: 'GET',
        data: {},
        params: { customizeUnitCode, ...workFlowCode, ...others },
      };
    },
    submit: ({ data }) => {
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/external-supplier-reqs/save`,
        method: 'POST',
        data: data && data[0],
        params: { customizeUnitCode },
      };
    },
  },
});

// 审批表单头信息DS
const getCommonInfoDS = ({ isEdit }) => ({
  fields: [
    {
      name: 'remark',
    },
    {
      name: 'reqNumber',
      disabled: true,
      label: intl.get('sslm.supplierWarehouse.model.warehouse.applyNum').d('申请单号'),
    },
    {
      name: 'creationDate',
      disabled: true,
      type: 'dateTime',
      label: intl.get('sslm.supplierWarehouse.model.warehouse.creationTime').d('创建时间'),
    },
    {
      name: 'creator',
      disabled: true,
      label: intl.get('sslm.supplierWarehouse.model.warehouse.creator').d('创建人'),
    },
    {
      name: 'supplierName',
      required: isEdit,
      label: intl.get('sslm.supplierWarehouse.model.warehouse.supplierName').d('供应商名称'),
    },
    {
      name: 'supplierTypeCode',
      required: isEdit,
      lookupCode: 'SSLM.SUPPLIER_TYPE_CODE',
      label: intl.get('sslm.supplierWarehouse.model.warehouse.supplierType').d('供应商类型'),
    },
    {
      name: 'unitNameLov',
      type: 'object',
      lovCode: 'SPRM.USER_UNIT',
      ignore: 'always',
      noCache: true,
      textField: 'unitName',
      label: intl.get('sslm.supplierWarehouse.model.warehouse.ownunitName').d('所属部门'),
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
      name: 'reqTypeCode',
      disabled: true,
      lookupCode: 'SSLM.EXTERNAL_SUP_REQ_TYPE',
      defaultValue: 'SUP_NEW_REQ',
      label: intl.get('sslm.supplierWarehouse.model.warehouse.applyType').d('单据类型'),
    },
  ],
  transport: {
    read: ({ dataSet: { queryParameter } }) => {
      const { extSupplierReqId, workFlowCode, ...others } = queryParameter;
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/external-supplier-reqs/${extSupplierReqId}`,
        method: 'GET',
        data: {},
        params: {
          customizeUnitCode: 'SSLM.EASY_SUPPLIER_WAREHOUSE_WORKFLOW.AF_BASIC',
          ...workFlowCode,
          ...others,
        },
      };
    },
  },
});

// 校验手机格式
const mobilephoneValidator = (value, name, record) => {
  const testReg = record.get('internationalTelCode') === '+86' ? PHONE : NOT_CHINA_PHONE;
  if (value && !testReg.test(value)) {
    return intl.get('hzero.common.validation.phone').d('手机格式不正确');
  }
  return true;
};

// 联系人DS
const getContactDS = ({
  isEdit,
  supplierId,
  customizeUnitCode = 'SSLM.EASY_SUPPLIER_WAREHOUSE.CONTACT_INFO',
}) => ({
  cacheSelection: true,
  autoLocateFirst: false,
  paging: !supplierId, // 变更信息不分页，因数据要全部传给后端
  primaryKey: 'extContactReqId',
  selection: isEdit ? 'multiple' : false,
  fields: [
    {
      name: 'name',
      required: true,
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
    // {
    //   name: 'mobilephoneField',
    //   label: intl.get('sslm.supplierWarehouse.model.warehouse.mobilePhone').d('移动电话'),
    // },
    {
      name: 'mobilephone',
      label: intl.get('sslm.supplierWarehouse.model.warehouse.mobilePhone').d('移动电话'),
      validator: mobilephoneValidator,
      required: true,
      type: 'tel',
      regionField: 'internationalTelCode',
    },
    {
      name: 'internationalTelCode',
      defaultValue: '+86',
      lookupCode: 'HPFM.IDD',
      required: true,
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
      dynamicProps: {
        defaultValue: ({ dataSet }) => {
          const hasDefaultFlag = isEmpty(dataSet.toData());
          if (hasDefaultFlag) {
            return 1;
          }
          return 0;
        },
      },
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
    read: ({
      dataSet: {
        parent: { queryParameter },
      },
      params,
    }) => {
      const { extSupplierReqId, workFlowCode, ...others } = queryParameter;
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/ext-supplier-contact-reqs/${extSupplierReqId}`,
        method: 'GET',
        data: {},
        params: { customizeUnitCode, ...params, ...workFlowCode, ...others },
      };
    },
    destroy: ({ data, params }) => {
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/ext-supplier-contact-reqs/batch-delete`,
        method: 'DELETE',
        data,
        params: { customizeUnitCode, ...params },
      };
    },
  },
  events: {
    load: ({ dataSet }) => {
      dataSet.forEach(record => {
        Object.assign(record, { status: 'update' });
      });
    },
  },
});

// 地址DS
const getAddressDS = ({
  isEdit,
  supplierId,
  customizeUnitCode = 'SSLM.EASY_SUPPLIER_WAREHOUSE.ADDRESS_INFO',
}) => ({
  cacheSelection: true,
  autoLocateFirst: false,
  paging: !supplierId, // 变更信息不分页，因数据要全部传给后端
  primaryKey: 'extAddressReqId',
  selection: isEdit ? 'multiple' : false,
  fields: [
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
      name: 'countryCode',
      bind: 'countryLov.countryCode',
    },
    {
      name: 'quickIndex',
      bind: 'countryLov.quickIndex',
    },
    {
      name: 'regionPathName',
      label: intl.get('sslm.supplierWarehouse.model.warehouse.province').d('省/市/区'),
      validator: (value, name, record) => {
        const { countryCode, quickIndex, isLeaf = true, regionId } = record.get([
          'countryCode',
          'quickIndex',
          'isLeaf',
          'regionId',
        ]);
        if (countryCode === 'CN' || quickIndex === 'CN') {
          if (!isLeaf && regionId) {
            return intl.get('sslm.common.view.message.lastRegion').d('须选择填写至最末级地区');
          }
          return true;
        }
        return true;
      },
    },
    {
      name: 'regionId',
    },
    {
      name: 'addressDetail',
      type: 'intl',
      required: true,
      label: intl.get('sslm.supplierWarehouse.model.warehouse.detailedAddress').d('详细地址'),
    },
    {
      name: 'postCode',
      type: 'string',
      label: intl.get('sslm.supplierWarehouse.model.warehouse.postalCode').d('邮政编码'),
      dynamicProps: {
        pattern: ({ record }) =>
          record.get('countryCode') === 'CN' || record.get('quickIndex') === 'CN'
            ? /^[0-9]*$/
            : false,
        minLength: ({ record }) =>
          record.get('countryCode') === 'CN' || record.get('quickIndex') === 'CN' ? 6 : null,
        maxLength: ({ record }) =>
          record.get('countryCode') === 'CN' || record.get('quickIndex') === 'CN' ? 6 : null,
        defaultValidationMessages: ({ record }) => {
          return record.get('countryCode') === 'CN' || record.get('quickIndex') === 'CN'
            ? {
                tooShort: intl
                  .get(`spfm.address.model.address.validate.postCode`)
                  .d('请输入6位数字'),
              }
            : {};
        },
      },
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
    read: ({
      dataSet: {
        parent: { queryParameter },
      },
      params,
    }) => {
      const { extSupplierReqId, workFlowCode, ...others } = queryParameter;
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/ext-supplier-address-reqs/${extSupplierReqId}`,
        method: 'GET',
        data: {},
        params: {
          customizeUnitCode,
          ...params,
          ...workFlowCode,
          ...others,
        },
      };
    },
    destroy: ({ data, params }) => {
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/ext-supplier-address-reqs/batch-delete`,
        method: 'DELETE',
        params: {
          customizeUnitCode,
          ...params,
        },
        data,
      };
    },
  },
  events: {
    load: ({ dataSet }) => {
      dataSet.forEach(record => {
        Object.assign(record, { status: 'update' });
      });
    },
    update: ({ record, name }) => {
      switch (name) {
        case 'countryLov':
          record.set('regionPathName', null);
          record.set('regionId', null);
          break;
        default:
          break;
      }
    },
  },
});

// 银行账户DS
const getBankAccountDS = ({
  isEdit,
  supplierId,
  customizeUnitCode = 'SSLM.EASY_SUPPLIER_WAREHOUSE.BANK_ACCOUNT',
}) => ({
  cacheSelection: true,
  autoLocateFirst: false,
  paging: !supplierId, // 变更信息不分页，因数据要全部传给后端
  primaryKey: 'extBkAccountReqId',
  selection: isEdit ? 'multiple' : false,
  fields: [
    {
      name: 'countryId',
      required: true,
      type: 'object',
      lovCode: 'HPFM.COUNTRY',
      noCache: true,
      textField: 'countryName',
      label: intl.get('spfm.bank.model.bank.bankCountry').d('国家/地区'),
      transformRequest: value => value && value.countryId,
      transformResponse: (value, data) => {
        const { countryId, countryName } = data;
        return value
          ? {
              countryId,
              countryName,
            }
          : null;
      },
    },
    // {
    //   name: 'bankLov',
    //   type: 'object',
    //   lovCode: 'SPFM.COMPANY.BANK',
    //   textField: 'bankCode',
    //   required: true,
    //   noCache: true,
    //   ignore: 'always',
    //   label: intl.get('sslm.supplierWarehouse.model.warehouse.bankCode').d('银行代码'),
    // },
    {
      name: 'bankId',
      bind: 'correspondentLov.bankId',
    },
    {
      name: 'bankCode',
      label: intl.get('sslm.supplierWarehouse.model.warehouse.bankCode').d('银行代码'),
      bind: 'correspondentLov.bankCode',
    },
    {
      name: 'bankName',
      required: true,
      bind: 'correspondentLov.bankName',
      label: intl.get('sslm.supplierWarehouse.model.warehouse.bankName').d('银行名称'),
    },
    {
      name: 'correspondentLov',
      type: 'object',
      lovCode: 'SMDM.BANK_BRANCK_FIRM_TENANT',
      noCache: true,
      required: true,
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
      required: true,
      label: intl.get('sslm.supplierWarehouse.model.warehouse.openeBankName').d('开户行名称'),
    },
    {
      name: 'bankAccountName',
      required: true,
      label: intl.get('sslm.supplierWarehouse.model.warehouse.accountName').d('账户名称'),
    },
    {
      name: 'bankAccountNum',
      required: true,
      label: intl.get('sslm.supplierWarehouse.model.warehouse.bankAccount').d('银行账号'),
      pattern: /^[0-9A-Za-z-@._,/]*$/,
      defaultValidationMessages: {
        patternMismatch: intl
          .get('sslm.supplierWarehouse.view.validatioin.bankAccountNum')
          .d('银行账号应为数字，字母或"-@._,/"'),
      },
    },
    {
      name: 'accountNature',
      lookupCode: 'SPFM.NATURE_OF_ACCOUNT',
      label: intl.get(`sslm.supplierWarehouse.model.warehouse.accountNature`).d('账户性质'),
    },
    {
      name: 'accountPurpose',
      lookupCode: 'SPFM.PURPOSE_OF_ACCOUNT',
      label: intl.get(`sslm.supplierWarehouse.model.warehouse.accountPurpose`).d('账户用途'),
    },
    {
      name: 'currencyLov',
      lovCode: 'SMDM.CURRENCY_SQL',
      type: 'object',
      label: intl.get(`sslm.supplierWarehouse.model.warehouse.currencyName`).d('币种'),
      lovPara: { tenantId: organizationId },
    },
    {
      name: 'currencyId',
      type: 'string',
      bind: 'currencyLov.currencyId',
    },
    {
      name: 'currencyCode',
      type: 'string',
      bind: 'currencyLov.currencyCode',
    },
    {
      name: 'currencyName',
      type: 'string',
      bind: 'currencyLov.currencyName',
    },
    {
      name: 'currencyIdMeaning',
      type: 'string',
      bind: 'currencyLov.currencyName',
    },
    {
      name: 'bankIdentifyCodeType',
      lookupCode: 'SPFM.BANK_IDENTIFY_CODE_TYPE',
      label: intl.get('sslm.common.model.bank.bankIdentifyCodeType').d('银行识别码类型'),
    },
    {
      name: 'bankIdentifyCode',
      label: intl.get('sslm.common.model.bank.bankIdentifyCode').d('银行识别码'),
      dynamicProps: {
        required: ({ record }) => Boolean(record.get('bankIdentifyCodeType')),
      },
    },
    {
      name: 'paymentTypeLov',
      lovCode: 'SMDM.PAYMENT_TYPE',
      type: 'object',
      label: intl.get(`sslm.supplierWarehouse.model.warehouse.paymentType`).d('付款方式'),
      lovPara: { tenantId: organizationId },
      noCache: true,
    },
    {
      name: 'paymentType',
      type: 'string',
      bind: 'paymentTypeLov.typeCode',
    },
    {
      name: 'paymentTypeId',
      type: 'string',
      bind: 'paymentTypeLov.typeId',
    },
    {
      name: 'paymentTypeIdMeaning',
      type: 'string',
      bind: 'paymentTypeLov.typeName',
    },
    {
      name: 'masterFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      label: intl.get('sslm.supplierWarehouse.model.warehouse.mainAccount').d('主账号'),
      dynamicProps: {
        defaultValue: ({ dataSet }) => {
          const hasDefaultFlag = isEmpty(dataSet.toData());
          if (hasDefaultFlag) {
            return 1;
          }
          return 0;
        },
      },
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
    read: ({
      dataSet: {
        parent: { queryParameter },
      },
    }) => {
      const { extSupplierReqId, workFlowCode, ...others } = queryParameter;
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/ext-sup-bk-account-reqs/${extSupplierReqId}`,
        method: 'GET',
        data: {},
        params: { customizeUnitCode, ...workFlowCode, ...others },
      };
    },
    destroy: ({ data }) => {
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/ext-sup-bk-account-reqs/batch-delete`,
        method: 'DELETE',
        data,
        params: { customizeUnitCode },
      };
    },
  },
  events: {
    load: ({ dataSet }) => {
      dataSet.forEach(record => {
        Object.assign(record, { status: 'update' });
      });
    },
  },
});

// 附件户DS
const getAttachmentDS = ({
  isEdit,
  supplierId,
  customizeUnitCode = 'SSLM.EASY_SUPPLIER_WAREHOUSE.ATTACHMENT',
}) => ({
  cacheSelection: true,
  autoLocateFirst: false,
  paging: !supplierId, // 变更信息不分页，因数据要全部传给后端
  primaryKey: 'extAttachmentReqId',
  selection: isEdit ? 'multiple' : false,
  fields: [
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
    read: ({
      dataSet: {
        parent: { queryParameter },
      },
      params,
    }) => {
      const { extSupplierReqId, workFlowCode, ...others } = queryParameter;
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/ext-supplier-attachment-reqs/${extSupplierReqId}`,
        method: 'GET',
        data: {},
        params: {
          customizeUnitCode,
          ...params,
          ...workFlowCode,
          ...others,
        },
      };
    },
    destroy: ({ data, params }) => {
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/ext-supplier-attachment-reqs/batch-delete`,
        method: 'DELETE',
        params: {
          customizeUnitCode,
          ...params,
        },
        data,
      };
    },
  },
  events: {
    load: ({ dataSet }) => {
      dataSet.forEach(record => {
        Object.assign(record, { status: 'update' });
      });
    },
  },
});

// 采购/财务头信息DS
const getPurchaseHeaderDS = ({ customizeUnitCode }) => ({
  primaryKey: 'extPfReqId',
  fields: [
    {
      name: 'programmeGroups',
      lookupCode: 'SSLM.PROGRAMME_GROUPS',
      lovPara: {
        tenantId: organizationId,
      },
      label: intl.get('spfm.importErp.model.importErp.planGroups').d('计划组'),
    },
    {
      name: 'schemeGroup',
      type: 'string',
      label: intl.get('sslm.supplierInform.model.supplierInform.schemeGroup').d('方案组'),
    },
    {
      name: 'accountGroup',
      type: 'object',
      lovCode: 'SSLM.SYNC_ACCOUNT_GROUP',
      textField: 'meaning',
      valueField: 'value',
      lovPara: {
        tenantId: organizationId,
      },
      label: intl.get('sslm.supplierInform.model.supplierInform.accountGroup').d('账户组'),
      transformRequest: value => value && value.value,
      transformResponse: (value, data) => {
        const { accountGroup, accountGroupMeaning } = data || {};
        if (!accountGroup) {
          return null;
        } else {
          return {
            value: accountGroup,
            meaning: accountGroupMeaning,
          };
        }
      },
    },
    {
      name: 'reconciliationAccount',
      type: 'object',
      lovCode: 'SSLM.RECONCILIATION_ACCOUNT',
      textField: 'meaning',
      valueField: 'value',
      transformRequest: value => value && value.value,
      transformResponse: (value, data) => {
        const { reconciliationAccount, reconciliationAccountMeaning } = data || {};
        if (!reconciliationAccount) {
          return null;
        } else {
          return {
            value: reconciliationAccount,
            meaning: reconciliationAccountMeaning,
          };
        }
      },
      lovPara: {
        tenantId: organizationId,
      },
      label: intl.get('sslm.supplierInform.model.supplierInform.controlAccount').d('统驭科目'),
    },
    {
      name: 'ouId',
      type: 'object',
      lovCode: 'SPFM.USER_AUTH.OU_CODE',
      textField: 'ouCode',
      valueField: 'ouId',
      label: intl.get('sslm.supplierInform.model.supplierInform.erpCompanyCode').d('erp公司代码'),
      transformRequest: value => value && value.ouId,
      transformResponse: (value, data) => {
        const { ouId, ouCode } = data || {};
        if (!ouId) {
          return null;
        } else {
          return {
            ouId,
            ouCode,
          };
        }
      },
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
      name: 'frozenFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 0,
      label: intl.get('sslm.supplierInform.model.supplierInform.accountFlag').d('记账冻结'),
    },
    {
      name: 'paymentFrozen',
      type: 'string',
      lookupCode: 'SSLM.PAYMENT_FROZEN',
      lovPara: {
        tenantId: organizationId,
      },
      label: intl.get('spfm.importErp.model.importErp.paymentFreezeCode').d('付款冻结代码'),
    },
  ],
  transport: {
    read: ({
      dataSet: {
        parent: { queryParameter },
      },
    }) => {
      const { extSupplierReqId, workFlowCode, ...others } = queryParameter;
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/ext-supplier-pf-req/${extSupplierReqId}`,
        method: 'GET',
        data: {},
        params: { customizeUnitCode, ...workFlowCode, ...others },
      };
    },
  },
  events: {
    load: ({ dataSet }) => {
      dataSet.forEach(record => {
        Object.assign(record, { status: 'update' });
      });
    },
  },
});

// 采购/财务行信息DS
const getPurchaseLineDS = ({
  isEdit,
  supplierId,
  customizeUnitCode = 'SSLM.EASY_SUPPLIER_WAREHOUSE.PURCHASE_LINE',
}) => ({
  paging: !supplierId, // 变更信息不分页，因数据要全部传给后端
  selection: isEdit ? 'multiple' : false,
  primaryKey: 'extPfLineReqId',
  fields: [
    {
      name: 'organizationCode',
      type: 'object',
      textField: 'organizationCode',
      valueField: 'organizationCode',
      lovCode: 'SPFM.USER_AUTH.PURORG_CODE',
      label: intl.get('sslm.supplierInform.model.supplierInform.organizationCode').d('采购组织'),
      required: true,
      transformRequest: value => value && value.organizationCode,
      transformResponse: (value, data) => {
        const { organizationCode, purchaseOrgId, organizationName } = data || {};
        if (!organizationCode) {
          return null;
        } else {
          return {
            organizationCode,
            purchaseOrgId,
            organizationName,
          };
        }
      },
    },
    {
      name: 'purchaseOrgId',
      type: 'string',
      bind: 'organizationCode.purchaseOrgId',
    },
    {
      name: 'organizationName',
      type: 'string',
      bind: 'organizationCode.organizationName',
      label: intl
        .get('sslm.supplierInform.model.supplierInform.organizationName')
        .d('采购组织名称'),
    },
    {
      name: 'purchaseAgentId',
      type: 'object',
      lovCode: 'SMDM.PURCHASE_AGENT',
      textField: 'purchaseAgentName',
      valueField: 'purchaseAgentId',
      lovPara: {
        tenantId: organizationId,
      },
      label: intl.get('sslm.supplierInform.model.supplierInform.purchaseAgent').d('采购员'),
      transformRequest: value => value && value.purchaseAgentId,
      transformResponse: (value, data) => {
        const { purchaseAgentId, purchaseAgentName } = data || {};
        if (!purchaseAgentId) {
          return null;
        } else {
          return {
            purchaseAgentId,
            purchaseAgentName,
          };
        }
      },
    },
    {
      name: 'termId',
      type: 'object',
      lovCode: 'SSLM.PAYMENT.TERM',
      textField: 'termName',
      valueField: 'termId',
      lovPara: {
        tenantId: organizationId,
      },
      label: intl.get('sslm.supplierInform.model.supplierInform.termName').d('付款条款'),
      required: true,
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
      name: 'typeCode',
      type: 'object',
      lovCode: 'SMDM.PAYMENT_TYPE',
      textField: 'typeName',
      valueField: 'typeCode',
      lovPara: {
        tenantId: organizationId,
      },
      label: intl.get('sslm.supplierInform.model.supplierInform.payMethod').d('付款方式'),
      transformRequest: value => value && value.typeCode,
      transformResponse: (value, data) => {
        const { typeCode, typeName } = data || {};
        if (!typeCode) {
          return null;
        } else {
          return {
            typeCode,
            typeName,
          };
        }
      },
    },
    {
      name: 'tradeTerms',
      lookupCode: 'SSLM.TRADE_TERMS',
      lovPara: {
        tenantId: organizationId,
      },
      label: intl.get('spfm.importErp.model.importErp.internationalCondition').d('国贸条件'),
    },
    {
      name: 'tradeTermsSite',
      label: intl.get('spfm.importErp.model.importErp.internationalSite').d('国贸地点'),
    },
    {
      name: 'currencyCode',
      required: true,
      type: 'object',
      lovCode: 'SMDM.CURRENCY',
      textField: 'currencyName',
      valueField: 'currencyCode',
      label: intl.get('sslm.supplierInform.model.supplierInform.currencyCode').d('订单货币'),
      transformRequest: value => value && value.currencyCode,
      transformResponse: (value, data) => {
        const { currencyCode, currencyName } = data || {};
        if (!currencyCode) {
          return null;
        } else {
          return {
            currencyCode,
            currencyName,
          };
        }
      },
    },
    {
      name: 'reconciliationAccount',
      required: true,
      type: 'object',
      lovCode: 'SSLM.RECONCILIATION_ACCOUNT',
      lovPara: {
        tenantId: organizationId,
      },
      textField: 'meaning',
      valueField: 'value',
      label: intl.get('sslm.supplierInform.model.supplierInform.controlAccount').d('统驭科目'),
      transformRequest: value => value && value.value,
      transformResponse: (value, data) => {
        const { reconciliationAccount, reconciliationAccountMeaning } = data || {};
        if (!reconciliationAccount) {
          return null;
        } else {
          return {
            value: reconciliationAccount,
            meaning: reconciliationAccountMeaning,
          };
        }
      },
    },
    {
      name: 'sortNumber',
      required: true,
      numberGrouping: false,
      min: 0,
      type: 'number',
      label: intl.get(`sslm.supplierInform.model.supplierInform.sortNumber`).d('排序码'),
    },
    {
      name: 'frozenFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 0,
      label: intl.get(`sslm.supplierInform.model.purchase.frozenFlag`).d('采购冻结'),
    },
  ],
  transport: {
    read: ({
      dataSet: {
        parent: { queryParameter },
      },
    }) => {
      const { extSupplierReqId, workFlowCode, ...others } = queryParameter;
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/ext-supplier-pf-line-req`,
        method: 'GET',
        data: {},
        params: {
          extSupplierReqId,
          customizeUnitCode,
          ...workFlowCode,
          ...others,
        },
      };
    },
    destroy: ({ data }) => {
      const ids = data.map(item => item.extPfLineReqId);
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/ext-supplier-pf-line-req/deletePfLines`,
        method: 'DELETE',
        data: ids,
      };
    },
  },
  events: {
    load: ({ dataSet }) => {
      dataSet.forEach(record => {
        Object.assign(record, { status: 'update' });
      });
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
  getCommonInfoDS,
};
