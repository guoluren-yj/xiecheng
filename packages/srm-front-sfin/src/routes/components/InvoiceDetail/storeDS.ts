import { FieldType } from 'choerodon-ui/dataset/data-set/enum';
import type { DataSetProps } from 'choerodon-ui/dataset/data-set/DataSet';

import intl from 'utils/intl';
import { SRM_FINANCE } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

import { amountFormatterOptions, priceFormatterOptions } from '../../../utils/utils';
import { getCuszCode } from './type';

const tenantId = getCurrentOrganizationId();
const apiPrefix = `${SRM_FINANCE}/v1/${tenantId}`;

export type DocType = 'taxInvoice' | 'invoiceCheck';
export const primaryKeyMap: Record<DocType, string> = {
  taxInvoice: 'taxInvoiceLineId',
  invoiceCheck: 'taxInvoiceCheckId',
};

export const invoiceHeaderDS = (invoiceHeaderId: string | number, docType): DataSetProps => {
  const CuszCode = getCuszCode(docType);
  return {
    autoQuery: true,
    paging: false,
    primaryKey: primaryKeyMap[docType],
    fields: [
      {
        name: 'invoiceCode',
        type: FieldType.string,
        label: intl.get('sfin.invoice.model.invoice.invoiceCode').d('发票代码'),
      },
      {
        name: 'invoiceNumber',
        type: FieldType.string,
        label: intl.get('sfin.invoice.model.invoice.invoiceNumber').d('发票号码'),
      },
      {
        name: 'billingDate',
        type: FieldType.date,
        label: intl.get('sfin.invoice.model.invoice.invoicingDate').d('开票日期'),
      },
      {
        name: 'invoiceTypeCodeMeaning',
        type: FieldType.string,
        label: intl.get('sfin.invoice.model.invoice.invoiceSpecies').d('发票种类'),
      },
      {
        name: 'checkCode',
        type: FieldType.string,
        label: intl.get('sfin.invoice.model.invoice.checkCode').d('校验码'),
      },
      {
        name: 'supplierCompanyName',
        type: FieldType.string,
        label: intl.get('sfin.invoice.model.invoice.sellerName').d('销方名称'),
      },
      {
        name: 'supUnifiedSocialCode',
        type: FieldType.string,
        label: intl.get('sfin.invoice.model.invoice.sellerTaxNumber').d('销方税号'),
      },
      {
        name: 'supAccount',
        type: FieldType.string,
        label: intl.get('sfin.invoice.model.invoice.sellerBankAccountNum').d('销方银行账号'),
      },
      {
        name: 'supAddrAndTel',
        type: FieldType.string,
        label: intl.get('sfin.invoice.model.invoice.sellerAddressTele').d('销方地址电话'),
      },
      {
        name: 'machineNum',
        type: FieldType.string,
        label: intl.get('sfin.invoice.model.invoice.machineNo').d('机器编号'),
      },
      {
        name: 'companyName',
        type: FieldType.string,
        label: intl.get('sfin.invoice.model.invoice.buyerName').d('购方名称'),
      },
      {
        name: 'purUnifiedSocialCode',
        type: FieldType.string,
        label: intl.get('sfin.invoice.model.invoice.buyerTaxNumber').d('购方税号'),
      },
      {
        name: 'purAccount',
        type: FieldType.string,
        label: intl.get('sfin.invoice.model.invoice.buyerBankAccountNum').d('购方银行账号'),
      },
      {
        name: 'purAddrAndTel',
        type: FieldType.string,
        label: intl.get('sfin.invoice.model.invoice.buyerAddressTele').d('购方地址电话'),
      },
      {
        name: 'totalAmount',
        type: FieldType.number,
        label: intl.get('sfin.invoice.model.invoice.invoiceAmount').d('发票金额'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'taxAmount',
        type: FieldType.number,
        label: intl.get('sfin.invoice.model.invoice.invoiceTaxAmount').d('发票税额'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'taxIncludedAmount',
        type: FieldType.number,
        label: intl.get('sfin.invoice.model.invoice.priceAndTaxTotal').d('价税合计'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'attachmentUuid',
        type: FieldType.attachment,
        label: intl.get('hzero.common.button.uploadView').d('附件查看'),
        bucketName: window.$$env.PRIVATE_BUCKET || 'private-bucket',
        bucketDirectory: 'finance-invoice',
      },
      {
        name: 'zeroTaxRateFlag',
        type: FieldType.string,
        label: intl.get('sfin.invoice.model.invoice.zeroTaxRateFlag').d('零税率标志'),
      },
      {
        name: 'tollFlag',
        type: FieldType.string,
        label: intl.get('sfin.invoice.model.invoice.tollFeeSign').d('通行费标志'),
      },
      {
        name: 'invalidFlagMeaning',
        type: FieldType.string,
        label: intl.get('sfin.invoice.model.invoice.obsoleteSign').d('作废标志'),
      },
      {
        name: 'drawer',
        type: FieldType.string,
        label: intl.get('sfin.invoice.model.invoice.drawer').d('开票人'),
      },
      {
        name: 'payee',
        type: FieldType.string,
        label: intl.get('sfin.invoice.model.invoice.payee').d('收款人'),
      },
      {
        name: 'reviewer',
        type: FieldType.string,
        label: intl.get('sfin.invoice.model.invoice.reviewer').d('复核人'),
      },
      {
        name: 'blueInvoiceNum',
        type: FieldType.string,
        label: intl.get('sfin.invoice.model.invoice.blueInvoiceNum').d('蓝票发票代码'),
      },
      {
        name: 'blueInvoiceCode',
        type: FieldType.string,
        label: intl.get('sfin.invoice.model.invoice.blueInvoiceCode').d('蓝票发票号码'),
      },
      {
        name: 'fileUrl',
        type: FieldType.string,
        label: intl.get('sfin.invoice.model.invoice.fileURL').d('文件URL'),
      },
      {
        name: 'remark',
        type: FieldType.string,
        label: intl.get('sfin.invoice.model.invoice.remark').d('备注'),
      },
    ],
    queryParameter: {
      customizeUnitCode: [
        CuszCode.BasicFormCode,
        CuszCode.BuyerFormCode,
        CuszCode.SellerFormCode,
        CuszCode.OtherFormCode,
      ].join(),
    },
    transport: {
      read: () => {
        const urlMap: Record<DocType, string> = {
          taxInvoice: `${apiPrefix}/tax-invoice-lines/detail/${invoiceHeaderId}`,
          invoiceCheck: `${apiPrefix}/tax-invoice-check/detail/${invoiceHeaderId}`,
        };
        return {
          url: urlMap[docType],
          method: 'GET',
        };
      },
    },
  };
};

const getLineDiffFields = (docType: DocType) => {
  if (docType === 'taxInvoice') {
    return [
      {
        name: 'netAmount',
        type: FieldType.number,
        label: intl.get('sfin.invoice.model.invoice.amount').d('金额'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'taxIncludedPrice',
        type: FieldType.number,
        label: intl.get('sfin.invoice.model.invoice.unitPriceIncludingTax').d('单价(含税)'),
        computedProps: { formatterOptions: priceFormatterOptions },
      },
      {
        name: 'netPrice',
        type: FieldType.number,
        label: intl.get('sfin.invoice.model.invoice.unitPriceExcludingTax').d('单价(不含税)'),
        computedProps: { formatterOptions: priceFormatterOptions },
      },
      {
        name: 'specificationsModel',
        type: FieldType.object,
        label: intl.get('sfin.invoice.model.invoice.specificationModel').d('规格型号'),
      },
      {
        name: 'uom',
        type: FieldType.string,
        label: intl.get('sfin.invoice.model.invoice.unit').d('单位'),
      },
      {
        name: 'trafficType',
        type: FieldType.string,
        label: intl.get('sfin.invoice.model.invoice.type').d('类型'),
      },
      {
        name: 'trafficDateStart',
        type: FieldType.date,
        label: intl.get('sfin.invoice.model.invoice.passDateFromToll').d('通行日期起（通行费）'),
      },
      {
        name: 'trafficDateEnd',
        type: FieldType.date,
        label: intl.get('sfin.invoice.model.invoice.passDateToToll').d('通行日期至（通行费）'),
      },
    ];
  } else if (docType === 'invoiceCheck') {
    return [
      {
        name: 'amount',
        type: FieldType.number,
        label: intl.get('sfin.invoice.model.invoice.amount').d('金额'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'unitPrice',
        type: FieldType.number,
        label: intl.get('sfin.invoice.model.invoice.unitPriceExcludingTax').d('单价(不含税)'),
        computedProps: { formatterOptions: priceFormatterOptions },
      },
      {
        name: 'specificationModel',
        type: FieldType.object,
        label: intl.get('sfin.invoice.model.invoice.specificationModel').d('规格型号'),
      },
      {
        name: 'unit',
        type: FieldType.string,
        label: intl.get('sfin.invoice.model.invoice.unit').d('单位'),
      },
    ];
  }
  return [];
};

export const invoiceLineDS = (invoiceHeaderId: string | number, docType): DataSetProps => {
  const CuszCode = getCuszCode(docType);
  const diffFields = getLineDiffFields(docType);
  return {
    pageSize: 20,
    autoQuery: false,
    selection: false,
    fields: [
      {
        name: 'itemName',
        type: FieldType.string,
        label: intl.get('sfin.invoice.model.invoice.goodsOrTaxableServiceName').d('货物或应税劳务，服务名称'),
      },
      {
        name: 'quantity',
        type: FieldType.number,
        label: intl.get('sfin.invoice.model.invoice.quantity').d('数量'),
      },
      {
        name: 'taxRate',
        type: FieldType.string,
        label: intl.get('sfin.invoice.model.invoice.taxRate').d('税率'),
      },
      {
        name: 'taxAmount',
        type: FieldType.number,
        label: intl.get('sfin.invoice.model.invoice.taxAmount').d('税额'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'taxIncludedAmount',
        type: FieldType.number,
        label: intl.get('sfin.invoice.model.invoice.amountIncludingTax').d('金额(含税)'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'plateNo',
        type: FieldType.string,
        label: intl.get('sfin.invoice.model.invoice.licensePlateNumToll').d('车牌号(通行费)'),
      },
      ...diffFields,
    ],
    queryParameter: {
      customizeUnitCode: CuszCode.LineGridCode,
    },
    transport: {
      read: () => {
        const urlMap: Record<DocType, string> = {
          taxInvoice: `${apiPrefix}/tax-invoice-sub-lines/${invoiceHeaderId}`,
          invoiceCheck: `${apiPrefix}/tax-invoice-check/info-line/${invoiceHeaderId}`,
        };
        return {
          url: urlMap[docType],
          method: 'GET',
        };
      },
    },
  };
};