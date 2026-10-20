import type { DataSetProps } from 'choerodon-ui/dataset/data-set/DataSet';
import { DataToJSON, FieldType } from 'choerodon-ui/dataset/data-set/enum';
import intl from 'utils/intl';
import { SRM_SSTA } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

import { gridCodeMap } from '.';
import { amountFormatterOptions } from '../../../../utils/utils';

const tenantId = getCurrentOrganizationId();
const apiPrefix = `${SRM_SSTA}/v1/${tenantId}`;

export type DocType = 'tender' | 'service';
// 区分招标文件费和服务费
export const feeIdNameMap: Record<DocType, string> = {
  tender: 'tenderFeesId',
  service: 'serverFeesId',
};
// 区分招标文件费和服务费
export const feeInvStatusNameMap: Record<DocType, string> = {
  tender: 'tenderFeesInvoiceStatus',
  service: 'serverFeesInvoiceStatus',
};
// 区分招标文件费和服务费
export const primaryKeyMap: Record<DocType, string> = {
  tender: 'tenderFeesInvoiceRecordId',
  service: 'serverFeesInvoiceRecordId',
};

export const invoiceRecordDS = (docType: DocType): DataSetProps => {
  const feeIdName = feeIdNameMap[docType];
  return {
    pageSize: 20,
    autoQuery: false,
    selection: false,
    dataToJSON: DataToJSON.selected,
    primaryKey: primaryKeyMap[docType],
    fields: [
      {
        name: 'lineNum',
        type: FieldType.string,
        label: intl.get(`ssta.invoice.model.invoice.lineNumber`).d('行号'),
      },
      {
        name: 'invoiceStatus',
        type: FieldType.string,
        label: intl.get(`ssta.invoice.model.invoice.invoiceStatus`).d('发票状态'),
        lookupCode: 'SDEP.INVOICE_STATUS',
      },
      {
        name: 'invoiceCode',
        type: FieldType.string,
        label: intl.get(`ssta.invoice.model.invoice.invoiceCode`).d('发票代码'),
      },
      {
        name: 'invoiceNum',
        type: FieldType.string,
        label: intl.get(`ssta.invoice.model.invoice.invoiceNumber`).d('发票号码'),
      },
      {
        name: 'invoicingDate',
        type: FieldType.date,
        label: intl.get(`ssta.invoice.model.invoice.invoicingDate`).d('开票日期'),
      },
      {
        name: 'netAmount',
        type: FieldType.number,
        label: intl.get(`ssta.invoice.model.invoice.amountExcludingTax`).d('金额(不含税)'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'taxAmount',
        type: FieldType.number,
        label: intl.get(`ssta.invoice.model.invoice.taxAmount`).d('税额'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'taxIncludedAmount',
        type: FieldType.number,
        label: intl.get(`ssta.invoice.model.invoice.amountIncludingTax`).d('金额(含税)'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'invoiceTypeMeaning',
        type: FieldType.string,
        label: intl.get(`ssta.invoice.model.invoice.invoiceSpecies`).d('发票种类'),
      },
      {
        name: 'deductFlag',
        type: FieldType.boolean,
        label: intl.get(`ssta.invoice.model.invoice.deductFlag`).d('是否抵扣'),
        trueValue: 1,
        falseValue: 0,
      },
      {
        name: 'checkCode',
        type: FieldType.string,
        label: intl.get(`ssta.invoice.model.invoice.checkCode`).d('校验码'),
      },
      {
        name: 'supplierCompanyName',
        type: FieldType.string,
        label: intl.get('ssta.invoice.model.invoice.sellerName').d('销方名称'),
      },
      {
        name: 'companyName',
        type: FieldType.string,
        label: intl.get('ssta.invoice.model.invoice.buyerName').d('购方名称'),
      },
      {
        name: 'supUnifiedSocialCode',
        type: FieldType.string,
        label: intl.get('ssta.invoice.model.invoice.SellerTaxpayerIdentifyNum').d('销方纳税人识别号'),
      },
      {
        name: 'purUnifiedSocialCode',
        type: FieldType.string,
        label: intl.get('ssta.invoice.model.invoice.BuyerTaxpayerIdentifyNum').d('购方纳税人识别号'),
      },
      {
        name: 'invoiceUrl',
        type: FieldType.string,
        label: intl.get(`ssta.invoice.model.invoice.elecInvoiceAddress`).d('电子发票地址'),
      },
      {
        name: 'attachmentUuid',
        type: FieldType.attachment,
        label: intl.get('hzero.common.button.uploadView').d('附件查看'),
        bucketName: window.$$env.PRIVATE_BUCKET || 'private-bucket',
        bucketDirectory: 'finance-invoice',
      },
      {
        name: 'fileUrl',
        type: FieldType.string,
        label: intl.get('ssta.invoice.model.invoice.fileURL').d('文件URL'),
      },
      {
        name: 'ocrFileUrl',
        type: FieldType.string,
        label: intl.get('ssta.invoice.model.invoice.ocrFile').d('OCR文件'),
      },
      {
        name: 'ofdFileUrl',
        type: FieldType.string,
        label: intl.get('ssta.invoice.model.invoice.ofdFile').d('OFD文件'),
      },
    ],
    queryParameter: { customizeUnitCode: gridCodeMap[docType] },
    transport: {
      read: ({ data }) => {
        const { [feeIdName]: feeId } = data;
        const urlMap: Record<DocType, string> = {
          tender: `${apiPrefix}/tender-fees-invoice-records/list/${feeId}`,
          service: `${apiPrefix}/server-fees-invoice-records/list/${feeId}`,
        };
        return {
          url: urlMap[docType],
          method: 'GET',
        };
      },
      submit: ({ dataSet }): any => {
        const submitType = dataSet?.getState('submitType');
        switch (submitType) {
          case 'invoiceVoid':
            return {
              url: `${apiPrefix}/tender-fees-invoice-records/red-or-cancel`,
              method: 'POST',
            };
          case 'getRedInkInfoSheet':
            return {
              url: `${apiPrefix}/tender-fees-invoice-records/query-red-info`,
              method: 'POST',
            };
          default:
        }
      },
    },
  };
};