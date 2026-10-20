import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_SSTA } from '_utils/config';

const organizationId = getCurrentOrganizationId();
const prefix = `ssta.taxControl`;
const mainTableDs = () => ({
  selection: 'multiple',
  cacheSelection: true,
  // table表单显示的字段
  dataToJSON: 'selected',
  fields: [
    {
      name: 'taxpayerName',
      type: 'string',
      label: intl.get(`${prefix}.model.taxControl.taxpayerName`).d('纳税人名称'),
    },
    {
      name: 'taxpayerNumber',
      type: 'string',
      label: intl.get(`${prefix}.model.taxControl.taxpayerNum`).d('纳税人识别号'),
    },
    {
      name: 'bankName',
      type: 'string',
      label: intl.get(`${prefix}.model.taxControl.bankName`).d('企业开户行名称'),
    },
    {
      name: 'bankAccount',
      type: 'string',
      label: intl.get(`${prefix}.model.taxControl.bankAccount`).d('企业开户行账户'),
    },
    {
      name: 'address',
      type: 'string',
      label: intl.get(`${prefix}.model.taxControl.address`).d('企业地址'),
    },
    {
      name: 'telephone',
      type: 'string',
      label: intl.get(`${prefix}.model.taxControl.telephone`).d('企业电话'),
    },
    {
      name: 'companyTypeMeaning',
      type: 'string',
      label: intl.get(`${prefix}.model.companyTypeMeaning`).d('企业类型'),
    },

    {
      name: 'taxAuthorityCode',
      type: 'string',
      label: intl.get(`${prefix}.model.taxControl.competentTaxNum`).d('主管税务机关代码'),
    },
    {
      name: 'taxAuthorityName',
      type: 'string',
      label: intl.get(`${prefix}.model.taxControl.competentTaxName`).d('主管税务机关名称'),
    },
    {
      name: 'issueAreaNumber',
      type: 'string',
      label: intl.get(`${prefix}.model.taxControl.issueAreaNum`).d('发行地区编号'),
    },
    {
      name: 'extNumber',
      type: 'string',
      label: intl.get(`${prefix}.model.extensionPhone`).d('分机号'),
    },
    {
      name: 'productType',
      type: 'string',
      label: intl.get(`${prefix}.model.productType`).d('产品/设备类型'),
      lookupCode: 'SDIM.PRODUCT_TYPE',
    },
    {
      name: 'taxDiskNumber',
      type: 'string',
      label: intl.get(`${prefix}.model.deviceNum`).d('设备编号'),
    },
    {
      name: 'taxDiskType',
      type: 'string',
      label: intl.get(`${prefix}.model.deviceInfo`).d('设备信息'),
    },
    {
      name: 'authorizeExpirationDate',
      type: 'string',
      label: intl.get(`${prefix}.model.authorizeExpirationDate`).d('授权截止日期'),
    },
    {
      name: 'lastUpdateDate',
      type: 'string',
      label: intl.get(`${prefix}.model.updateInfoDate`).d('信息更新时间'),
    },
    {
      name: 'curDate',
      type: 'string',
      label: intl.get(`${prefix}.model.curDate`).d('当前时钟'),
    },
    {
      name: 'startDate',
      type: 'string',
      label: intl.get(`${prefix}.model.startDate`).d('启用时间'),
    },
    {
      name: 'operation',
      type: 'string',
      label: intl.get('hzero.common.table.column.options').d('操作'),
    },

    {
      name: 'companySource',
      type: 'string',
      label: intl.get(`${prefix}.model.companySource`).d('企业来源'),
    },
    {
      name: 'taxDiskType',
      type: 'string',
      label: intl.get(`${prefix}.model.taxDiskType`).d('纳税性质'),
    },
    {
      name: 'taxProvince',
      type: 'string',
      label: intl.get(`${prefix}.model.taxProvince`).d('纳税省份'),
    },
    {
      name: 'singleInvoiceAmountLimit',
      type: 'string',
      label: intl.get(`${prefix}.model.singleInvoiceAmountLimit`).d('单张发票开票限额'),
    },
    {
      name: 'requiredPhoneFlag',
      type: 'string',
      label: intl
        .get(`${prefix}.model.requiredPhoneFlag`)
        .d('短信交付手机号是否必填（仅对电票有效）'),
    },
    {
      name: 'smsPushType',
      type: 'string',
      label: intl.get(`${prefix}.model.smsPushType`).d('交付短信是否自动发送（仅对电票有效）'),
    },
    {
      name: 'requiredEmailFlag',
      type: 'string',
      label: intl
        .get(`${prefix}.model.requiredEmailFlag`)
        .d('邮箱交付邮箱地址是否必填（仅对电票有效）'),
    },
    {
      name: 'emailPushType',
      type: 'string',
      label: intl.get(`${prefix}.model.emailPushType`).d('交付邮件是否自动发送（仅对电票有效）'),
    },
  ],
  transport: {
    /**
     * 查询
     */
    read: () => {
      return {
        url: `${SRM_SSTA}/v1/${organizationId}/direct-tax-ctrl-headers?customizeUnitCode=SDIM.TAX_CONTROL.HEADER_GRID`,
        method: 'GET',
      };
    },
  },
});

const searchDs = () => ({
  autoCreate: true,
  forceValidate: true,
  fields: [
    {
      name: 'companyLov',
      type: 'object',
      ignore: 'always',
      label: intl.get('ssta.taxControl.model.taxControl.enterpriseInfo').d('企业信息'),
      lovCode: 'SDIM.USER_AUTHORITY.COMPANY',
      required: true,
    },
    {
      name: 'supplierCompanyId',
      bind: 'companyLov.supplierCompanyId',
    },
    {
      name: 'supplierCompanyName',
      bind: 'companyLov.supplierCompanyName',
    },
    {
      name: 'supplierUnifiedSocialCode',
      bind: 'companyLov.supplierUnifiedSocialCode',
    },
    {
      name: 'supplierTenantId',
      bind: 'companyLov.supplierTenantId',
    },
    {
      name: 'supplierCompanyNum',
      bind: 'companyLov.supplierCompanyNum',
    },
    {
      name: 'customerLov',
      type: 'object',
      lovCode: 'SDIM.USER_AUTH.CUSTORM',
      ignore: 'always',
      label: intl.get(`ssta.taxControl.model.taxControl.customerName`).d('客户名称'),
      required: true,
    },
    {
      name: 'purchaserCompanyId',
      bind: 'customerLov.purchaserCompanyId',
    },
    {
      name: 'purchaserTenantId',
      bind: 'customerLov.purchaserTenantId',
    },
    {
      name: 'purchaserCompanyNum',
      bind: 'customerLov.purchaserCompanyNum',
    },
  ],
  transport: {
    submit: ({ data }) => {
      return {
        url: `${SRM_SSTA}/v1/${organizationId}/direct-tax-ctrl-headers/sync`,
        method: 'POST',
        data: data[0],
      };
    },
  },
});

const searchInfoDs = () => ({
  fields: [
    {
      name: 'supplierCompanyLov',
      type: 'object',
      label: '',
      lovCode: 'SSTA.USER_AUTH_COMPANY.WITH_TAXCODE',
      noCache: true,
      // multiple: true,
      valueField: 'partnerId',
      ignore: 'always',
      lovPara: { tenantId: organizationId },
    },
    {
      name: 'supplierCompanyId',
      type: 'string',
      bind: 'supplierCompanyLov.supplierCompanyId',
    },
  ],
});

const updateDs = () => ({
  autoQuery: false,
  selection: 'multiple',
  fields: [
    {
      name: 'invoiceTypeMeaning',
      type: 'string',
      label: intl.get(`${prefix}.model.taxControl.billType`).d('发票种类'),
    },
    {
      name: 'operation',
      type: 'string',
      label: intl.get('hzero.common.table.column.options').d('操作'),
    },
    {
      name: 'authorizeTaxRate',
      type: 'string',
      label: intl.get(`${prefix}.model.taxControl.authorTaxRate`).d('授权税率'),
    },
    {
      name: 'limitAmount',
      type: 'number',
      label: intl.get(`${prefix}.model.taxControl.solaBillLimit`).d('单张开票限额'),
    },

    {
      name: 'offLineLimitAmount',
      type: 'number',
      label: intl.get(`${prefix}.model.taxControl.offLineLimit`).d('离线限额'),
    },
    {
      name: 'offLineRemainAmount',
      type: 'number',
      label: intl.get(`${prefix}.model.taxControl.offLineLeftAmount`).d('离线剩余金额'),
    },
    {
      name: 'offLineTime',
      type: 'string',
      label: intl.get(`${prefix}.model.taxControl.offLineTime`).d('离线时限'),
    },
    {
      name: 'offLineExtensionInfo',
      type: 'string',
      label: intl.get(`${prefix}.model.taxControl.offLineInfo`).d('离线扩展信息'),
    },
    {
      name: 'uploadDeadLineDate',
      type: 'string',
      label: intl.get(`${prefix}.model.taxControl.uploadDate`).d('上传截止日期'),
    },
    {
      name: 'lockDate',
      type: 'string',
      label: intl.get(`${prefix}.model.taxControl.lockDate`).d('锁死日期'),
    },
    {
      name: 'curInvoiceNumber',
      type: 'string',
      label: intl.get(`${prefix}.model.taxControl.currentBillNum`).d('当前发票号码'),
    },
    {
      name: 'curInvoiceCode',
      type: 'string',
      label: intl.get(`${prefix}.model.taxControl.currentBillCode`).d('当前发票代码'),
    },
    {
      name: 'curRemainingCount',
      type: 'number',
      label: intl.get(`${prefix}.model.taxControl.curRemainingCount`).d('当前剩余卷份数'),
    },
    {
      name: 'totalRemainingCount',
      type: 'number',
      label: intl.get(`${prefix}.model.taxControl.totalRemainingCount`).d('总剩余份数'),
    },
    {
      name: 'queryDate',
      type: 'string',
      label: intl.get(`${prefix}.model.taxControl.queryDate`).d('查询时间'),
    },

    {
      name: 'invoiceTerminalCode',
      type: 'string',
      label: intl.get(`${prefix}.model.taxControl.invoiceTerminalCode`).d('开票终端号'),
    },
    {
      name: 'productType',
      type: 'string',
      label: intl.get(`${prefix}.model.taxControl.productType`).d('税控设备类型'),
    },
    {
      name: 'invoiceMode',
      type: 'string',
      label: intl.get(`${prefix}.model.taxControl.invoiceMode`).d('开票模式'),
    },
    {
      name: 'digitAccount',
      type: 'string',
      label: intl.get(`${prefix}.model.taxControl.digitAccount`).d('数电账号'),
    },
    {
      name: 'digitAccountRole',
      type: 'string',
      label: intl.get(`${prefix}.model.taxControl.digitAccountRole`).d('角色'),
    },
  ],
  transport: {
    /**
     * 查询
     */
    read: () => {
      return {
        url: `${SRM_SSTA}/v1/${organizationId}/direct-tax-ctrl-lines?customizeUnitCode=SDIM.TAX_CONTROL.LINE_GRID`,
        method: 'GET',
      };
    },
  },
});

const recordDs = () => ({
  autoQuery: false,
  fields: [],
  transport: {
    /**
     * 查询
     */
    read: () => {
      return {
        url: `${SRM_SSTA}/v1/${organizationId}/direct-tax-ctrl-actions`,
        method: 'GET',
      };
    },
  },
});

const taxDs = () => ({
  cacheSelection: true,
  // table表单显示的字段
  dataToJSON: 'selected',
  selection: 'single',
  fields: [
    {
      name: 'supplierCompanyNum',
      type: 'string',
      label: intl.get(`${prefix}.view.message.companyCode`).d('公司编码'),
    },
    {
      name: 'supplierCompanyName',
      type: 'string',
      label: intl.get(`${prefix}.view.message.companyName`).d('公司名称'),
    },
    {
      name: 'supUnifiedSocialCode',
      type: 'string',
      label: intl.get(`${prefix}.view.message.companyTax`).d('公司税号'),
    },
    {
      name: 'purchaserCompanyNum',
      type: 'string',
      label: intl.get(`${prefix}.view.message.companyCustomerCode`).d('客户公司编码'),
    },
    {
      name: 'purchaserCompanyName',
      type: 'string',
      label: intl.get(`${prefix}.view.message.companyCustomerName`).d('客户公司名称'),
    },
    {
      name: 'purUnifiedSocialCode',
      type: 'string',
      label: intl.get(`${prefix}.view.message.companyCustomerTax`).d('客户公司税号'),
    },
  ],
  queryFields: [],
  transport: {
    /**
     * 查询
     */
    read: () => {
      return {
        url: `${SRM_SSTA}/v1/lovs/sql/data?lovCode=SSTA.USER_AUTH.PURCHASER.WITH_TAX&tenantId=${organizationId}`,
        method: 'GET',
      };
    },
  },
});

export { mainTableDs, updateDs, recordDs, searchDs, searchInfoDs, taxDs };
