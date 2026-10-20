import { isEmpty } from 'lodash';
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
// import { getDatas } from '@/utils/utils';

const organizationId = getCurrentOrganizationId();

const invoiceValidator = (value, name, record) => {
  // eslint-disable-next-line prefer-destructuring
  const dataSet = record.dataSet;
  const invoiceConfigMap = dataSet.getState('invoiceConfigMap') || [];
  const invoiceType = record.get('invoiceType');
  const invoiceTypeConfigItem = invoiceConfigMap.find((item) => item.invoiceType === invoiceType);
  if (!invoiceTypeConfigItem || isEmpty(invoiceTypeConfigItem) || !value?.length) return true;
  const targetInvoiceLength = Number(invoiceTypeConfigItem[`${name}Length`]);
  return value.length !== targetInvoiceLength
    ? intl
        .get('ssta.common.validate.message.fieldOverLength', { len: targetInvoiceLength })
        .d('字段长度异常，根据配置表仅能输入{len}位字符')
    : true;
};

const newDs = (customizeUnitCode, action) => ({
  primaryKey: 'invoiceHeaderId',
  autoQueryAfterSubmit: false,
  queryParameter: {
    customizeUnitCode:
      action === 'add' ? 'SSTA.PURINVOICE_POOL_LIST.HANDLE_CREATE' : 'SSTA.PURINVOICE_POOL_LIST.HANDLE_EDIT',
  },
  // table表单显示的字段
  fields: [
    {
      name: 'invoiceType',
      type: 'string',

      lookupCode: 'SSTA.INVOICE_POOL_TYPE',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.taxType').d('发票类型'),
      required: true,
      // validator: validatorRender,
    },
    // {
    //   name: 'invoiceType',
    //   bind: 'invoiceTypeList.value',
    // },
    {
      name: 'invoiceCode',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.invoiceCode').d('发票代码'),

      dynamicProps: {
        required: ({ record }) =>
          !['17', '18', '19', '83', '87', '98', '99', '105'].includes(record.get('invoiceType')),
        disabled: ({ record }) => ['18', '19', '83', '87', '98', '99', '105'].includes(record.get('invoiceType')),
      },
      validator: invoiceValidator,
    },
    {
      name: 'invoiceNum',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.telCode').d('发票号码'),
      required: true,
      validator: invoiceValidator,
    },

    {
      name: 'invoicingDate',
      type: 'date',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.invoiceTime').d('开票日期'),
      dynamicProps: {
        required: ({ record }) => record.getState('enableCheckFlag'),
      },
    },
    {
      name: 'companyNameLov',
      type: 'object',
      // lovCode: 'SSTA.USER_AUTH_COMPANY.WITH_TAXCODE',
      lovCode: 'SSTA.USER_AUTH_COMPANY.WITH_TAXCODE',
      // required: true,
      lovPara: {
        tenantId: getCurrentOrganizationId(),
      },
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.buier').d('购方'),
      // required: true,
    },
    {
      name: 'companyName',
      bind: 'companyNameLov.companyName',
    },
    {
      name: 'purUnifiedSocialCode',
      bind: 'companyNameLov.unifiedSocialCode',
    },
    {
      name: 'companyId',
      bind: 'companyNameLov.companyId',
    },
    {
      name: 'supplierCompanyNameLov',
      type: 'object',

      lovCode: 'SSTA.USER_AUTH.EXT_SUPPLIER_SUP',

      // required: true,

      lovPara: {
        tenantId: getCurrentOrganizationId(),
      },
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.supplierCompanyName').d('销方'),
      valueField: 'lovKey',
    },
    {
      name: 'supplierCompanyName',
      bind: 'supplierCompanyNameLov.displaySupplierName',
    },
    {
      name: 'supUnifiedSocialCode',
      bind: 'supplierCompanyNameLov.supUnifiedSocialCode',
    },
    {
      name: 'supplierCompanyId',
      bind: 'supplierCompanyNameLov.supplierCompanyId',
    },
    {
      name: 'extUnifiedSocialCode',
      bind: 'supplierCompanyNameLov.extUnifiedSocialCode',
    },
    {
      name: 'supplierId',
      bind: 'supplierCompanyNameLov.supplierId',
    },
    {
      name: 'supplierName',
      bind: 'supplierCompanyNameLov.supplierName',
    },
    {
      name: 'supplierNum',
      bind: 'supplierCompanyNameLov.supplierNum',
    },
    {
      name: 'supplierTenantId',
      bind: 'belongSupplierCompanyIdLov.supplierTenantId',
    },
    {
      name: 'netAmount',
      type: 'number',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.netAmount').d('不含税金额'),
      dynamicProps: {
        required: ({ dataSet, record }) => {
          const { invoiceLineList } = dataSet.children;
          const { ocrFileUrl, ofdFileUrl } = record.get(['ocrFileUrl', 'ofdFileUrl']);
          return !!ocrFileUrl || !!ofdFileUrl || invoiceLineList?.length === 0;
        },
      },
    },
    {
      name: 'taxAmount',
      type: 'number',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.nettaxAmount').d('税额'),
      dynamicProps: {
        required: ({ dataSet, record }) => {
          const { invoiceLineList } = dataSet.children;
          const { ocrFileUrl, ofdFileUrl } = record.get(['ocrFileUrl', 'ofdFileUrl']);
          return !!ocrFileUrl || !!ofdFileUrl || invoiceLineList?.length === 0;
        },
      },
    },
    {
      name: 'checkCode',
      type: 'string',
      label: intl
        .get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.checkcodeWarning')
        .d('校验码 (多位时请输入后6位即可)'),
      pattern: /^[a-zA-Z\d]+$/,
      defaultValidationMessages: {
        patternMismatch: intl.get('ssta.purchaseInvoicePool.view.validation.onlyDigitOrLetter').d('请输入字母或者数字'),
      },
      dynamicProps: {
        required: ({ record }) =>
          record.getState('enableCheckFlag') && ['04', '10', '11'].includes(record.get('invoiceType')),
      },
    },
    {
      name: 'memo',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.memo').d('备忘说明'),
    },
    {
      name: 'belongCompanyIdLov',
      type: 'object',
      // lovCode: 'SSTA.USER_AUTH_COMPANY.WITH_TAXCODE',
      lovCode: 'SPFM.USER_AUTH.COMPANY',
      // required: true,
      lovPara: {
        tenantId: getCurrentOrganizationId(),
      },
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.belongCompanyId').d('所属公司'),
      required: true,
    },
    {
      name: 'belongCompanyId',
      bind: 'belongCompanyIdLov.companyId',
    },
    {
      name: 'belongCompanyName',
      bind: 'belongCompanyIdLov.companyName',
    },
    {
      name: 'belongSupplierCompanyIdLov',
      type: 'object',
      // lovCode: 'SSTA.USER_AUTH_COMPANY.WITH_TAXCODE',
      lovCode: 'SSTA.USER_AUTH.EXT_SUPPLIER_SUP',
      required: true,
      lovPara: {
        tenantId: getCurrentOrganizationId(),
      },
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.belongSupplierCompanyId').d('所属供应商'),
      // required: true,
    },

    {
      name: 'belongSupplierCompanyId',
      bind: 'belongSupplierCompanyIdLov.supplierCompanyId',
    },
    {
      name: 'belongSupplierCompanyName',
      bind: 'belongSupplierCompanyIdLov.displaySupplierName',
    },
    {
      name: 'belongSupplierId',
      bind: 'belongSupplierCompanyIdLov.supplierId',
    },
    {
      name: 'supplierTenantId',
      bind: 'belongSupplierCompanyIdLov.supplierTenantId',
    },
    {
      name: 'attachmentUuid',
      type: 'attachment',
    },
    {
      name: 'uniSee',
      type: 'string',
    },
    {
      name: 'aiAttachmentUrl',
      type: 'string',
    },
    {
      name: 'buyerContact',
      type: 'string',
      label: intl.get('ssta.common.model.common.buyerContact').d('购方联系人'),
    },
    {
      name: 'sellerContact',
      type: 'string',
      label: intl.get('ssta.common.model.common.sellerContact').d('销方联系人'),
    },
    {
      name: 'beneficiaryBank',
      type: 'string',
      label: intl.get('ssta.common.model.common.beneficiaryBank').d('收款银行'),
    },
    {
      name: 'beneficiaryBankAddress',
      type: 'string',
      label: intl.get('ssta.common.model.common.beneficiaryBankAddress').d('收款银行地址'),
    },
    {
      name: 'beneficiaryAccountNum',
      type: 'string',
      label: intl.get('ssta.common.model.common.beneficiaryAccountNum').d('收款银行账号'),
    },
    {
      name: 'beneficiaryAccountName',
      type: 'string',
      label: intl.get('ssta.common.model.common.beneficiaryAccountName').d('收款银行账户名称'),
    },
    {
      name: 'paymentTerms',
      type: 'string',
      label: intl.get('ssta.common.model.common.paymentTerms').d('支付条款'),
    },
  ],

  transport: {
    read: ({ data }) => {
      const { invoiceHeaderId } = data;

      return {
        url: `/ssta/v1/${organizationId}/invoice-header/detail/${invoiceHeaderId}`,
        method: 'GET',
        // data: {
        //   customizeUnitCode: customizeCode,
        // },
      };
    },
    submit: ({ data, params }) => {
      const { netAmount, taxAmount } = data[0];
      const newData = {
        ...data[0],
        camp: 'PURCHASER',
        netAmount: netAmount || 0,
        taxAmount: taxAmount || 0,
      };

      return {
        url: `/ssta/v1/${organizationId}/invoice-header/purchaser`,
        data: action === 'add' ? [newData] : newData,
        params: { ...params, customizeUnitCode },
        method: action === 'add' ? 'POST' : 'PUT',
      };
    },
  },
});

const newLineDs = (customizeCode) => ({
  autoQuery: false,
  primaryKey: 'lineId',
  // table表单显示的字段
  pageSize: 20,
  fields: [
    {
      name: 'lineNum',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.linseNum').d('行号'),
    },
    {
      name: 'itemName',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.chargsseCodeOrItemName').d('项目名称/货物或应税劳务，服务名称'),
      required: true,
    },
    {
      name: 'netAmount',
      type: 'number',
      label: intl.get('ssta.costSheet.model.costSheet.netAmountMeaningno').d('金额(不含税)'),
      required: true,
    },
    {
      name: 'quantity',
      type: 'number',
      label: intl.get('ssta.costSheet.model.costSheet.quantitys').d('数量'),
    },

    {
      name: 'taxRate',
      type: 'number',
      label: intl.get('ssta.costSheet.model.costSheet.theTaxsRate').d('税率'),
    },

    {
      name: 'taxAmount',
      type: 'number',
      label: intl.get('ssta.costSheet.model.costSheet.thetaxAmount').d('税额'),
      required: true,
    },
    // {
    //   name: 'taxIncludedPrice',
    //   type: 'number',
    //   label: intl.get('ssta.costSheet.model.costSheet.taxIncssludedAmount').d('含税单价'),
    // },
    // {
    //   name: 'taxIncludedAmount',
    //   type: 'number',
    //   label: intl.get('ssta.costSheet.model.costSheet.thetaxIncludesdAmount').d('含税金额'),
    // },
    {
      name: 'netPrice',
      type: 'number',
      label: intl.get('ssta.costSheet.model.costSheet.thenetsPrice').d('不含税单价'),
    },

    {
      name: 'spec',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.spec').d('规格型号'),
    },

    {
      name: 'uom',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.theUom').d('单位'),
    },
    // {
    //   name: 'expenseItem',
    //   type: 'string',
    //   label: intl.get('ssta.costSheet.model.costSheet.expenseItem').d('费用项目(货运发票)'),
    //   lookupCode: 'SSTA.CHARGE_TREATMENT_METHOD',
    // },
    {
      name: 'plateNo',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.plateNo').d('车牌号（通行费）'),
    },
    {
      name: 'trafficType',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.trafficType').d('类型'),
    },
    {
      name: 'trafficDateStart',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.trafficDateStart').d('通行日期起（通行费）'),
    },
    {
      name: 'trafficDateEnd',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.trafficDateEnd').d('通行日期至（通行费）'),
    },
  ],
  transport: {
    read: ({ data }) => {
      const { invoiceHeaderId } = data;
      return {
        url: `/ssta/v1/${organizationId}/invoice-line/${invoiceHeaderId}`,
        method: 'GET',
        data: { customizeUnitCode: customizeCode },
      };
    },
    destroy: ({ data, dataSet }) => {
      const headInfo = dataSet.getState('headInfo') || {};
      return {
        url: `/ssta/v1/${organizationId}/invoice-line?customizeUnitCode=${customizeCode}`,
        data: { ...headInfo, invoiceLineList: data },
        method: 'DELETE',
      };
    },
    submit: ({ data, dataSet }) => {
      const headInfo = dataSet.getState('headInfo') || {};
      return {
        url: `/ssta/v1/${organizationId}/invoice-line?customizeUnitCode=${customizeCode}`,
        data: { ...headInfo, invoiceLineList: data },
        method: 'POST',
      };
    },
  },
});

export { newDs, newLineDs };
