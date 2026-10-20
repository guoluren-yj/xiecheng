/*
 * @Description:
 * @Date: 2020-08-20 14:21:53
 * @author: zhangyongxuan <yongxuan.zhang@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2020, Hand
 */

import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';

// import { getDatas } from '@/utils/utils';

const organizationId = getCurrentOrganizationId();

// 头
const formDs = () => ({
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
      label: intl.get('ssta.costSheet.model.costSheet.supplierCompanyName').d('销方名称'),
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
      label: intl.get('ssta.costSheet.model.costSheet.purname').d('购方名称'),
    },
    {
      name: 'purUnifiedSocialCode',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.purUnifiedcode').d('购方税号'),
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
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.sstaAmount').d('发票金额'),
    },
    {
      name: 'taxAmount',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.sstataxAmount').d('发票税额'),
    },
    {
      name: 'taxIncludedAmount',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.amountMerge').d('价税合计'),
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
  // autoQuery: true,
  primaryKey: 'invoiceHeaderId',
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
      label: intl.get('ssta.costSheet.model.costSheet.chargsseCode').d('货物或应税劳务，服务名称'),
    },
    {
      name: 'netAmount',
      type: 'string',

      label: intl.get('ssta.costSheet.model.costSheet.flagsAmounts').d('金额'),
    },
    {
      name: 'quantity',
      type: 'string',

      label: intl.get('ssta.costSheet.model.costSheet.quantitys').d('数量'),
    },

    {
      name: 'taxRate',
      type: 'string',
      label: intl.get('ssta.costSheet.model.costSheet.taxtheRate').d('税率'),
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
      name: 'taxIncludedAmount;',
      type: 'number',
      label: intl.get('ssta.costSheet.model.costSheet.thetaxIncludesdAmount').d('含税金额'),
    },
    {
      name: 'netPrice',
      type: 'number',
      label: intl.get('ssta.costSheet.model.costSheet.thenetPrice').d('不含税单价'),
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
  },
});
const newDs = () => ({
  autoCreate: true,
  primaryKey: 'invoiceHeaderId',
  // autoQuery: true,
  // selection: 'multiple',
  // table表单显示的字段
  fields: [
    {
      name: 'taxAmount',
      type: 'string',
      required: true,
      label: intl.get('ssta.costSheet.model.costSheet.thetaxAmount').d('税额'),
    },
    {
      label: intl
        .get(`ssta.purchaseInvoicePool.model.purchaseInvoicePool.invoiceSpecies`)
        .d('发票种类'),
      type: 'string',
      name: 'invoiceSpecies',
      required: true,
      lookupCode: 'SSTA.INVOICE_TYPE',
    },
    // {
    //   name: 'invoiceTypeList',
    //   type: 'object',

    //   lookupCode: 'SSTA.INVOICE_POOL_TYPE',
    //   label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.taxType').d('发票类型'),
    //   required: true,
    //   // validator: validatorRender,
    // },
    {
      name: 'invoiceType',
      bind: 'invoiceSpecies.value',
    },
    {
      name: 'invoiceCode',
      type: 'string',
      label: intl
        .get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.invoiceCode')
        .d('发票代码'),
      required: true,
    },
    {
      name: 'invoiceNumber',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.telCode').d('发票号码'),
      required: true,
    },

    {
      name: 'invoicingDate',
      type: 'date',
      label: intl
        .get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.invoiceTime')
        .d('开票日期'),
      dynamicProps: {
        required: ({ dataSet }) => dataSet.enableCheckFlag,
      },
    },
    {
      name: 'companyNameLov',
      type: 'object',
      // lovCode: 'SSTA.USER_AUTH_COMPANY.WITH_TAXCODE',
      lovCode: 'SSTA.USER_AUTH.CUSTOMER_WITH_TAX',
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
      lovCode: 'SSTA.USER_AUTH_SUPPLIER_COMPANY_WITH_TAX',
      // lovCode: 'SSTA.USER_AUTH_SUPPLIER_WITH_TAX',

      // required: true,

      lovPara: {
        tenantId: getCurrentOrganizationId(),
      },
      label: intl
        .get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.supplierCompanyName')
        .d('销方'),
    },
    {
      name: 'supplierCompanyName',
      bind: 'supplierCompanyNameLov.companyName',
    },
    {
      name: 'supUnifiedSocialCode',
      bind: 'supplierCompanyNameLov.unifiedSocialCode',
    },
    {
      name: 'supplierCompanyId',
      bind: 'supplierCompanyNameLov.companyId',
    },
    {
      name: 'supplierTenantId',
      bind: 'supplierCompanyNameLov.supplierTenantId',
    },
    {
      name: 'netAmount',
      type: 'string',
      required: true,
      label: intl
        .get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.netAmount')
        .d('不含税金额'),
    },
    {
      name: 'checkCode',
      type: 'string',
      label: intl
        .get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.checkcodeWarning')
        .d('校验码 (多位时请输入后6位即可)'),
      pattern: /^[a-zA-Z\d]+$/,
      defaultValidationMessages: {
        patternMismatch: intl
          .get('ssta.purchaseInvoicePool.view.validation.onlyDigitOrLetter')
          .d('请输入字母或者数字'),
      },
      dynamicProps: {
        required: ({ dataSet, record }) =>
          dataSet.enableCheckFlag && record.get('invoiceSpecies')?.includes('ORDINARY'),
      },
    },
    {
      name: 'memo',
      type: 'string',
      label: intl.get('ssta.purchaseInvoicePool.model.purchaseInvoicePool.memo').d('备忘说明'),
    },
  ],
});

export { formDs, tableDs, newDs };
