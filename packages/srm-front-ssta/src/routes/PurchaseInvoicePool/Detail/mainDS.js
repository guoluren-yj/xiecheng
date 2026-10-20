import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

// 头
const formDs = () => ({
  // autoQuery: true,
  autoCreate: true,
  fields: [
    {
      name: 'invoiceCode',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.invoiceCode').d('发票代码'),
    },
    {
      name: 'invoiceNum',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.invoiceNum').d('发票号码'),
    },
    {
      name: 'invoicingDate',
      type: 'date',
      label: intl.get('ssta.costSheet.model.costSheet.invoicingDate').d('开票日期'),
      disabled: true,
    },
    {
      name: 'invoiceTypeMeaning',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.invoiceTypeMeaning').d('发票种类'),
    },
    {
      name: 'sumCheckTimes',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.sumCheckTimes').d('累计查验次数'),
    },
    {
      name: 'checkTimes',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.checkTimes').d('当天查验次数'),
    },
    {
      name: 'checkCode',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.checkCode').d('校验码'),
    },
    {
      name: 'supplierCompanyName',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.supcompanysName').d('销方名称'),
    },
    {
      name: 'supUnifiedSocialCode',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.supUnifiedSocialCode').d('销方税号'),
    },
    {
      name: 'supAccount',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.supAccount').d('销方银行账号'),
    },
    {
      name: 'supAddrAndTel',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.supAddrAndTel').d('销方地址电话'),
    },
    {
      name: 'machineNum',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.machineNum').d('机器编号'),
    },
    {
      name: 'companyName',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.buyscompanyName').d('购方名称'),
    },
    {
      name: 'purUnifiedSocialCode',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.pure').d('购方税号'),
    },
    {
      name: 'purAccount',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.purAccount').d('购方银行账号'),
    },
    {
      name: 'purAddrAndTel',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.purAddrAndTel').d('购方地址电话'),
    },
    {
      name: 'netAmount',
      type: 'number',
      label: intl.get('ssta.costSheet.model.costSheet.netAmountMeaningno').d('金额(不含税)'),
    },
    {
      name: 'taxAmount',
      type: 'number',
      label: intl.get('ssta.costSheet.model.costSheet.thetaxAmount').d('税额'),
    },
    {
      name: 'taxIncludedAmount',
      type: 'number',
      label: intl.get('ssta.costSheet.model.costSheet.taxIncludedAmountMeaning').d('金额(含税)'),
    },
    {
      name: 'zeroTaxRateFlag',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.zeroTaxRateFlag').d('零税率标志'),
    },
    {
      name: 'tollFlag',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.tollFlag').d('通行费标志'),
    },
    {
      name: 'invalidFlagMeaning',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.invalidFlag').d('作废标志'),
    },
    {
      name: 'invoiceSpecialMark',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.invoiceSpecialMark').d('特殊票种标志'),
      lookupCode: 'SSTA.INVOICE_SPECIAL_MARK',
    },
    {
      name: 'drawer',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.drawer').d('开票人'),
    },

    {
      name: 'payee',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.payee').d('收款人'),
    },
    {
      name: 'reviewer',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.reviewer').d('复核人'),
    },
    {
      name: 'blueInvoiceNum',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.blueInvoiceNum').d('蓝票发票代码'),
    },
    {
      name: 'blueInvoiceCode',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.blueInvoiceCode').d('蓝票发票号码'),
    },
    {
      name: 'fileUrl',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.fileUrl').d('文件url'),
    },
    {
      name: 'jpgUrl',
      type: 'string',
      label: intl.get('ssta.common.view.message.ofdFileUrl').d('OFD文件'),
    },
    {
      name: 'xmlSourceFileUrl',
      type: 'string',
      label: intl.get('ssta.common.model.invoice.xmlFile').d('XML文件'),
    },
    {
      name: 'ocrFileUrl',
      type: 'string',
      label: intl.get(`ssta.costSheet.view.message.checkOCRFile`).d('OCR识别文件'),
    },
    {
      name: 'aiAttachmentUrl',
      type: 'string',
      label: intl.get(`ssta.common.model.common.aiRecognizeFile`).d('AI识别文件'),
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
    {
      name: 'attachmentUuid',
      type: 'attachment',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.reve2rs2eNum').d('附件查看'),
      bucketName: window.$$env.PRIVATE_BUCKET || 'private-bucket',
      bucketDirectory: 'finance-invoice',
    },
    {
      name: 'remark',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.remark').d('备注'),
    },
  ],
  transport: {
    read: ({ data }) => {
      const { invoiceHeaderId } = data;

      return {
        url: `/ssta/v1/${organizationId}/invoice-header/detail/${invoiceHeaderId}`,
        method: 'GET',
      };
    },
  },
});

// 行DS
const tableDs = () => ({
  pageSize: 20,
  // autoQuery: true,
  primaryKey: 'lineId',
  // table表单显示的字段
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
    },
    {
      name: 'netAmount',
      type: 'number',
      label: intl.get('ssta.costSheet.model.costSheet.netAmountMeaningno').d('金额(不含税)'),
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
    },
    {
      name: 'taxIncludedPrice',
      type: 'number',
      label: intl.get('ssta.costSheet.model.costSheet.taxIncssludedAmount').d('含税单价'),
    },
    {
      name: 'taxIncludedAmount',
      type: 'number',
      label: intl.get('ssta.costSheet.model.costSheet.thetaxIncludesdAmount').d('含税金额'),
    },
    {
      name: 'netPrice',
      type: 'number',
      label: intl.get('ssta.costSheet.model.costSheet.thenetsPrice').d('不含税单价'),
    },
    {
      name: 'spec',
      type: 'object',
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
      const {
        //  chargeHeaderId,
        invoiceHeaderId,
      } = data;
      return {
        url: `/ssta/v1/${organizationId}/invoice-line/${invoiceHeaderId}`,
        method: 'GET',
        // data: {
        //   invoiceHeaderId,
        //   // chargeHeaderId
        // },
      };
    },
    // destroy: ({ data }) => {
    //   return {
    //     url: `/ssta/v1/${organizationId}/charge-lines/batch/cancel`,
    //     data,
    //     method: 'PUT',
    //   };
    // },
    // submit: ({ data }) => {
    //   return {
    //     url: `/ssta/v1/${organizationId}/charge-lines/batch/save`,
    //     data,
    //     method: 'PUT',
    //   };
    // },
  },
});

export { formDs, tableDs };
