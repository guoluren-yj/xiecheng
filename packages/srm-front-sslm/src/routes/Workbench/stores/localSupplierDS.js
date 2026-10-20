import intl from 'utils/intl';
import { SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
// import {lovQueryAxiosConfig} from '_utils/c7nUiConfig';

const organizationId = getCurrentOrganizationId();

const getLocalSupplierListDS = () => ({
  selection: false,
  pageSize: 20,
  fields: [
    {
      name: 'supplierNum',
      label: intl.get('sslm.workbench.model.workbench.localSupplierNum').d('本地供应商编码'),
    },
    {
      name: 'supplierName',
      label: intl.get('sslm.workbench.model.workbench.localSupplierName').d('本地供应商名称'),
    },
    {
      name: 'companyNum',
      label: intl.get('sslm.workbench.model.workbench.platformSupplierNum').d('平台供应商编码'),
    },
    {
      name: 'companyName',
      label: intl.get('sslm.workbench.model.workbench.platformSupplierName').d('平台供应商名称'),
    },
    {
      name: 'sourceDate',
      type: 'date',
      label: intl.get('sslm.workbench.model.workbench.sourceDate').d('关联平台供应商时间'),
    },
    {
      name: 'externalSystemCode',
      label: intl.get('sslm.workbench.model.workbench.sourceSystem').d('来源系统'),
    },
    {
      name: 'option',
      label: intl.get('hzero.common.button.action').d('操作'),
    },
    {
      name: 'passport',
      label: intl.get('sslm.workbench.model.workbench.passport').d('护照'),
    },
    {
      name: 'supplierUnifiedSocialCode',
      label: intl
        .get('sslm.workbench.model.workbench.supplierUnifiedSocialCode')
        .d('统一社会信用码'),
    },
    {
      name: 'idNum',
      label: intl.get('sslm.workbench.model.workbench.idNum').d('身份证号'),
    },
    {
      name: 'supplierDunsCode',
      label: intl.get('sslm.workbench.model.workbench.supplierDunsCode').d('邓白氏编码'),
    },
    {
      name: 'supplierOrganizingInstitutionCode',
      label: intl
        .get('sslm.workbench.model.workbench.supplierOrganizingInstitutionCode')
        .d('组织机构代码'),
    },
    {
      name: 'businessRegistrationNumber',
      label: intl
        .get('sslm.workbench.model.workbench.businessRegistrationNumber')
        .d('企业注册登记号/税号'),
    },
    {
      name: 'relevantEnterprise',
      type: 'object',
      noCache: true,
      lovCode: 'SSLM.TENANT_SUPPLIER_CATE',
      lovPara: { tenantId: organizationId },
      // lovQueryAxiosConfig: (code, config) => {
      //   const lovConfig = lovQueryAxiosConfig(code, config);
      //   const optionHeaders ={
      //     's-lov-view-code': 'SSLM.TENANT_SUPPLIER_CATE',
      //     's-lov-display-field': 'supplierCompanyName',
      //   };
      //   return {
      //     ...lovConfig,
      //     headers: {
      //       ...lovConfig.headers,
      //       ...optionHeaders,
      //       },
      //     };
      //   },
    },
    {
      name: 'relevantRecords',
      label: intl.get('sslm.workbench.model.workbench.relevantRecords').d('关联记录'),
    },
  ],
  transport: {
    read: ({ data }) => {
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/external-suppliers`,
        method: 'GET',
        data: {
          ...data,
          customizeUnitCode:
            'SSLM.SUPPLIER_WORKBENCH_LOCAL.SEARCH_BAR,SSLM.SUPPLIER_WORKBENCH_LOCAL.LIST',
        },
      };
    },
  },
});

const getLocalSupplierFormDS = supplierId => ({
  autoQuery: true,
  paging: false,
  fields: [
    {
      name: 'supplierNum',
      label: intl.get('sslm.workbench.model.workbench.localSupplierNum').d('本地供应商编码'),
    },
    {
      name: 'supplierName',
      label: intl.get('sslm.workbench.model.workbench.localSupplierName').d('本地供应商名称'),
    },
    {
      name: 'supplierTypeMeaning',
      label: intl.get('sslm.supplierWarehouse.model.warehouse.supplierType').d('供应商类型'),
    },
    {
      name: 'idNum',
      label: intl.get('sslm.workbench.model.workbench.idNum').d('身份证号'),
    },
    {
      name: 'passport',
      label: intl.get('sslm.workbench.model.workbench.passport').d('护照'),
    },
    {
      name: 'unifiedSocialCode',
      label: intl.get('sslm.supplierWarehouse.model.warehouse.socialCode').d('统一社会信用代码'),
    },
    {
      name: 'organizingInstitutionCode',
      label: intl
        .get('sslm.workbench.model.workbench.supplierOrganizingInstitutionCode')
        .d('组织机构代码'),
    },
    {
      name: 'dunsCode',
      label: intl.get('sslm.workbench.model.workbench.supplierDunsCode').d('邓白氏编码'),
    },
    {
      name: 'businessRegistrationNumber',
      label: intl
        .get('sslm.workbench.model.workbench.businessRegistrationNumber')
        .d('企业注册登记号/税号'),
    },

    {
      name: 'externalSystemName',
      label: intl.get('sslm.workbench.model.workbench.sourceSystem').d('来源系统'),
    },
    {
      name: 'enabledFlag',
      label: intl.get(`hzero.common.status.enable`).d('启用'),
    },
    {
      name: 'termName',
      label: intl.get('spfm.importErp.model.importErp.termName').d('付款条款'),
    },
    {
      name: 'paymentTypeName',
      label: intl.get('sslm.supplierWarehouse.model.warehouse.paymentType').d('付款方式'),
    },
  ],
  transport: {
    read: {
      url: `${SRM_SSLM}/v1/${organizationId}/external-suppliers/queryExtSupplier`,
      method: 'GET',
      data: { supplierId, customizeUnitCode: 'SSLM.SUPPLIER_WORKBENCH_LOCAL.BASE_INFO' },
    },
  },
});

const getContactDS = supplierId => ({
  selection: false,
  autoQuery: true,
  pageSize: 20,
  fields: [
    {
      name: 'name',
      type: 'secret',
      label: intl.get('spfm.supplier.model.erpSupplierDetail.name').d('姓名'),
    },
    {
      name: 'genderMeaning',
      label: intl.get('spfm.supplier.model.erpSupplierDetail.genderMeaning').d('性别'),
    },
    {
      name: 'idTypeMeaning',
      label: intl.get('spfm.supplier.model.erpSupplierDetail.idType').d('证件类型'),
    },
    {
      name: 'idNumber',
      type: 'secret',
      label: intl.get('spfm.supplier.model.erpSupplierDetail.idNumber').d('证件号码'),
    },
    {
      name: 'contactTypeMeaning',
      label: intl.get('spfm.supplier.model.erpSupplierDetail.contactType').d('联系人类型'),
    },
    {
      name: 'position',
      label: intl.get('spfm.supplier.model.erpSupplierDetail.position').d('职位'),
    },
    {
      name: 'mobilephone',
      type: 'secret',
      label: intl.get('spfm.supplier.model.erpSupplierDetail.mobilephone').d('电话'),
    },
    {
      name: 'mail',
      type: 'secret',
      label: intl.get('spfm.supplier.model.erpSupplierDetail.mail').d('邮箱'),
    },
    {
      name: 'defaultFlag',
      label: intl.get('spfm.certificationApproval.model.contactTable.defaultFlag').d('默认联系人'),
    },
  ],
  transport: {
    read: {
      url: `${SRM_SSLM}/v1/${organizationId}/ext-supplier-contacts/${supplierId}`,
      method: 'GET',
      data: { supplierId, customizeUnitCode: 'SSLM.SUPPLIER_WORKBENCH_LOCAL.CONTACTS' },
    },
  },
});

const getAddressDS = supplierId => ({
  selection: false,
  autoQuery: true,
  pageSize: 20,
  fields: [
    {
      name: 'countryName',
      label: intl.get('spfm.supplier.model.erpSupplierDetail.countryName').d('国家'),
    },
    {
      name: 'regionName',
      label: intl.get('spfm.supplier.model.erpSupplierDetail.regionName').d('地区'),
    },
    {
      name: 'cityName',
      label: intl.get(`spfm.importErp.model.importErp.cityName`).d('城市'),
    },
    {
      name: 'address',
      label: intl.get('spfm.supplier.model.erpSupplierDetail.address').d('详细地址'),
    },
    {
      name: 'zipCode',
      label: intl.get('spfm.supplier.model.erpSupplierDetail.zipCode').d('邮政编码'),
    },
  ],
  transport: {
    read: {
      url: `${SRM_SSLM}/v1/${organizationId}/ext-supplier-address/${supplierId}`,
      method: 'GET',
      data: { supplierId, customizeUnitCode: 'SSLM.SUPPLIER_WORKBENCH_LOCAL.ADDRESS' },
    },
  },
});

const getBankAccountDS = supplierId => ({
  selection: false,
  autoQuery: true,
  pageSize: 20,
  fields: [
    {
      name: 'bankCountryCode',
      label: intl.get(`spfm.bank.model.bank.bankCountry`).d('国家/地区'),
    },
    {
      name: 'bankCode',
      label: intl.get('spfm.supplier.model.erpSupplierDetail.bankCode').d('银行代码'),
    },
    {
      name: 'bankName',
      label: intl.get('spfm.supplier.model.erpSupplierDetail.bankName').d('银行名称'),
    },
    {
      name: 'bankFirm',
      label: intl.get(`spfm.bank.model.bank.bankFirm`).d('联行行号'),
    },
    {
      name: 'depositBank',
      label: intl.get('spfm.supplier.model.erpSupplierDetail.depositBank').d('开户行名称'),
    },
    {
      name: 'bankAccountName',
      label: intl.get('spfm.supplier.model.erpSupplierDetail.bankAccountName').d('账户名称'),
    },
    {
      name: 'bankAccountNum',
      type: 'secret',
      label: intl.get('spfm.supplier.model.erpSupplierDetail.bankAccountNum').d('银行账户'),
    },
    {
      name: 'mainAccountFlagMeaning',
      label: intl.get('spfm.supplier.model.erpSupplierDetail.mainAccountFlagMeaning').d('主账户'),
    },
    {
      name: 'enabledFlag',
      label: intl.get(`hzero.common.status.enable`).d('启用'),
    },
    {
      name: 'intlBankAccountNum',
      label: intl.get('spfm.bank.model.bank.intlBankAccount').d('IBAN码'),
    },
    {
      label: intl.get('spfm.supplier.model.erpSupplierDetail.accountNature').d('账户性质'),
      name: 'accountNatureMeaning',
    },
    {
      label: intl.get('spfm.supplier.model.erpSupplierDetail.accountPurpose').d('账户用途'),
      name: 'accountPurposeMeaning',
    },
    {
      label: intl.get('spfm.supplier.model.erpSupplierDetail.currencyName').d('币种'),
      name: 'currencyIdMeaning',
    },
    {
      name: 'bankIdentifyCodeTypeMeaning',
      label: intl.get('sslm.common.model.bank.bankIdentifyCodeType').d('银行识别码类型'),
    },
    {
      name: 'bankIdentifyCode',
      label: intl.get('sslm.common.model.bank.bankIdentifyCode').d('银行识别码'),
    },
    {
      label: intl.get('spfm.supplier.model.erpSupplierDetail.paymentType').d('付款方式'),
      name: 'paymentTypeIdMeaning',
    },
  ],
  transport: {
    read: {
      url: `${SRM_SSLM}/v1/${organizationId}/ext-sup-bank-accts/${supplierId}`,
      method: 'GET',
      data: { supplierId, customizeUnitCode: 'SSLM.SUPPLIER_WORKBENCH_LOCAL.BANK_ACCT' },
    },
  },
});

const getSiteDS = supplierId => ({
  selection: false,
  autoQuery: true,
  pageSize: 20,
  fields: [
    {
      name: 'supplierSiteCode',
      label: intl.get('spfm.supplier.model.erpSupplierDetail.supplierSiteCode').d('地点代码'),
    },
    {
      name: 'supplierSiteName',
      label: intl.get('spfm.supplier.model.erpSupplierDetail.supplierSiteName').d('地点名称'),
    },
    {
      name: 'ouCode',
      label: intl.get('spfm.supplier.model.erpSupplierDetail.ouCode').d('业务实体编码'),
    },
    {
      name: 'ouName',
      label: intl.get('spfm.supplier.model.erpSupplierDetail.ouName').d('业务实体名称'),
    },
    {
      name: 'enabledFlag',
      label: intl.get(`hzero.common.status.enable`).d('启用'),
    },
  ],
  transport: {
    read: {
      url: `${SRM_SSLM}/v1/${organizationId}/ext-supplier-sites/${supplierId}`,
      method: 'GET',
      data: { supplierId, customizeUnitCode: 'SSLM.SUPPLIER_WORKBENCH_LOCAL.SUPPLIER_SITE' },
    },
  },
});

// 采购财务-头
const getPurchaseHeaderDS = supplierId => ({
  paging: false,
  autoCreate: true,
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
      defaultValue: 0,
      label: intl.get('sslm.supplierInform.model.supplierInform.accountFlag').d('记账冻结'),
    },
    {
      name: 'paymentFrozen',
      label: intl.get('spfm.importErp.model.importErp.paymentFreezeCode').d('付款冻结代码'),
    },
  ],
  transport: {
    read: {
      url: `${SRM_SSLM}/v1/${organizationId}/ext-supplier-pf/queryPf`,
      method: 'GET',
      data: { supplierId, customizeUnitCode: 'SSLM.SUPPLIER_WORKBENCH_LOCAL.PURCHASE_HEADER' },
    },
  },
});

// 采购财务-行
const getPurchaseLineDS = supplierId => ({
  selection: false,
  autoQuery: true,
  paging: false,
  fields: [
    {
      name: 'organizationCode',
      label: intl.get('sslm.supplierInform.model.supplierInform.organizationCode').d('采购组织'),
    },
    {
      name: 'organizationName',
      label: intl
        .get('sslm.supplierInform.model.supplierInform.organizationName')
        .d('采购组织名称'),
    },
    {
      name: 'purchaseAgentName',
      label: intl.get('sslm.supplierInform.model.supplierInform.purchaseAgent').d('采购员'),
    },
    {
      name: 'termName',
      label: intl.get('sslm.supplierInform.model.supplierInform.termName').d('付款条款'),
    },
    {
      name: 'typeName',
      label: intl.get('sslm.supplierInform.model.supplierInform.payMethod').d('付款方式'),
    },
    {
      name: 'tradeTermsMeaning',
      label: intl.get('spfm.importErp.model.importErp.internationalCondition').d('国贸条件'),
    },
    {
      name: 'tradeTermsSite',
      label: intl.get('spfm.importErp.model.importErp.internationalSite').d('国贸地点'),
    },
    {
      name: 'currencyName',
      label: intl.get('sslm.supplierInform.model.supplierInform.currencyCode').d('订单货币'),
    },
    {
      name: 'reconciliationAccountMeaning',
      label: intl.get('sslm.supplierInform.model.supplierInform.controlAccount').d('统驭科目'),
    },
    {
      name: 'sortNumber',
      numberGrouping: false,
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
    read: {
      url: `${SRM_SSLM}/v1/${organizationId}/ext-supplier-pf-line/queryPfLines`,
      method: 'GET',
      data: { supplierId, customizeUnitCode: 'SSLM.SUPPLIER_WORKBENCH_LOCAL.PURCHASE_LINE' },
    },
  },
});

export {
  getLocalSupplierListDS,
  getLocalSupplierFormDS,
  getContactDS,
  getAddressDS,
  getBankAccountDS,
  getSiteDS,
  getPurchaseHeaderDS,
  getPurchaseLineDS,
};
