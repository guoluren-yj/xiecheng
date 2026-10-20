import { FieldType } from 'choerodon-ui/dataset/data-set/enum';
import type { DataSetProps } from 'choerodon-ui/dataset/data-set/DataSet';

import intl from 'utils/intl';

import {
  TenderListGridCustCode,
  TenderListSearchCustCode,
  DepositListGridCustCode,
  DepositListSearchCustCode,
  ServiceListGridCustCode,
  ServiceListSearchCustCode,
} from '../../utils/type';
import { QueryListUrlMap } from '../../utils/api';
import type { ActiveKey } from '../../utils/type';
import { amountFormatterOptions, transformSupplierData } from '../../../../utils/utils';

export const tenderTableDS = (activeKey: ActiveKey): DataSetProps => {
  return {
    autoQuery: false,
    pageSize: 20,
    selection: false,
    primaryKey: 'tenderFeesId',
    fields: [
      {
        name: 'tenderFeesStatus',
        type: FieldType.string,
        label: intl.get('ssta.sourcingCost.model.sourcingCost.tendeFilerFeeStatus').d('招标文件费状态'),
        lookupCode: 'SDEP.TENDER_FEES_STATUS',
      },
      {
        name: 'operation',
        type: FieldType.string,
        label: intl.get('hzero.common.button.action').d('操作'),
      },
      {
        name: 'tenderFeesPaymentStatus',
        type: FieldType.string,
        label: intl.get('ssta.sourcingCost.model.sourcingCost.payStatus').d('缴纳状态'),
        lookupCode: 'SDEP.TENDER_FEES_PAYMENT_STATUS',
      },
      {
        name: 'tenderFeesInvoiceStatus',
        type: FieldType.string,
        label: intl.get('ssta.sourcingCost.model.sourcingCost.invoicingStatus').d('开票状态'),
        lookupCode: 'SDEP.TENDER_FEES_INVOICE_STATUS',
      },
      {
        name: 'tenderFeesNum',
        type: FieldType.string,
        label: intl.get('ssta.sourcingCost.model.sourcingCost.tenderFileFeeNumber').d('招标文件费编号'),
      },
      {
        name: 'sourceDocumentTypeMeaning',
        type: FieldType.string,
        label: intl.get('ssta.sourcingCost.model.sourcingCost.sourceDocumentType').d('寻源单据类型'),
      },
      {
        name: 'sourceDocumentNum',
        type: FieldType.string,
        label: intl.get('ssta.sourcingCost.model.sourcingCost.sourceDocumentNumber').d('寻源单据编号'),
      },
      {
        name: 'sourceDocumentTitle',
        type: FieldType.string,
        label: intl.get('ssta.sourcingCost.model.sourcingCost.sourceDocumentTitle').d('寻源单据标题'),
      },
      {
        name: 'companyName',
        type: FieldType.string,
        label: intl.get('ssta.sourcingCost.model.sourcingCost.tenderCompany').d('招标公司'),
      },
      {
        name: 'supplierCompanyName',
        type: FieldType.string,
        label: intl.get('ssta.sourcingCost.model.sourcingCost.tenderSupplier').d('招标供应商'),
      },
      {
        name: 'currencyCode',
        type: FieldType.string,
        label: intl.get('ssta.common.model.common.currency').d('币种'),
      },
      {
        name: 'amount',
        type: FieldType.number,
        label: intl.get('ssta.sourcingCost.model.sourcingCost.tenderFileFeeAmount').d('招标文件费金额'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'techAttachmentUuid',
        type: FieldType.attachment,
        label: intl.get('ssta.sourcingCost.model.sourcingCost.techAttachmentUuid').d('技术附件'),
      },
      {
        name: 'businessAttachmentUuid',
        type: FieldType.attachment,
        label: intl.get('ssta.sourcingCost.model.sourcingCost.businessAttachmentUuid').d('商务附件'),
      },
      {
        name: 'syncStatus',
        type: FieldType.string,
        label: intl.get('ssta.sourcingCost.model.sourcingCost.syncStatus').d('同步状态'),
        lookupCode: 'SDEP.SYNC_STATUS',
      },
    ],
    queryParameter: {
      customizeUnitCode: [TenderListGridCustCode[activeKey], TenderListSearchCustCode[activeKey]].join(),
    },
    transport: {
      read: ({ data }) => {
        const { supplierLovKey, ...otherData } = data;
        return {
          url: QueryListUrlMap[activeKey],
          method: 'GET',
          data: {
            ...otherData,
            ...transformSupplierData(supplierLovKey),
          },
        };
      },
    },
  };
};

export const depositTableDS = (activeKey: ActiveKey): DataSetProps => {
  return {
    autoQuery: false,
    pageSize: 20,
    selection: false,
    primaryKey: 'depositId',
    fields: [
      {
        name: 'depositStatus',
        type: FieldType.string,
        label: intl.get('ssta.sourcingCost.model.sourcingCost.depositStatus').d('保证金状态'),
        lookupCode: 'SDEP.DEPOSIT_STATUS',
      },
      {
        name: 'depositPaymentStatus',
        type: FieldType.string,
        label: intl.get('ssta.sourcingCost.model.sourcingCost.payStatus').d('缴纳状态'),
        lookupCode: 'SDEP.DEPOSIT_PAYMENT_STATUS',
      },
      {
        name: 'depositRefundStatus',
        type: FieldType.string,
        label: intl.get('ssta.sourcingCost.model.sourcingCost.returnStatus').d('退回状态'),
        lookupCode: 'SDEP.DEPOSIT_REFUND_STATUS',
      },
      {
        name: 'operation',
        label: intl.get('hzero.common.button.action').d('操作'),
      },
      {
        name: 'depositNum',
        type: FieldType.string,
        label: intl.get('ssta.sourcingCost.model.sourcingCost.depositNumber').d('保证金编号'),
      },
      {
        name: 'sourceDocumentTypeMeaning',
        type: FieldType.string,
        label: intl.get('ssta.sourcingCost.model.sourcingCost.sourceDocumentType').d('寻源单据类型'),
      },
      {
        name: 'sourceDocumentNum',
        type: FieldType.string,
        label: intl.get('ssta.sourcingCost.model.sourcingCost.sourceDocumentNumber').d('寻源单据编号'),
      },
      {
        name: 'sourceDocumentTitle',
        type: FieldType.string,
        label: intl.get('ssta.sourcingCost.model.sourcingCost.sourceDocumentTitle').d('寻源单据标题'),
      },
      {
        name: 'companyName',
        type: FieldType.string,
        label: intl.get('ssta.sourcingCost.model.sourcingCost.tenderCompany').d('招标公司'),
      },
      {
        name: 'supplierCompanyName',
        type: FieldType.string,
        label: intl.get('ssta.sourcingCost.model.sourcingCost.tenderSupplier').d('招标供应商'),
      },
      {
        name: 'currencyCode',
        type: FieldType.string,
        label: intl.get('ssta.common.model.common.currency').d('币种'),
      },
      {
        name: 'amount',
        type: FieldType.number,
        label: intl.get('ssta.sourcingCost.model.sourcingCost.depositAmount').d('保证金金额'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'paidAmount',
        type: FieldType.number,
        label: intl.get('ssta.sourcingCost.model.sourcingCost.paidAmount').d('已缴纳金额'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'remainingPaymentAmount',
        type: FieldType.number,
        label: intl.get('ssta.sourcingCost.model.sourcingCost.remainingPayAmount').d('剩余缴纳金额'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'payForServerAmount',
        type: FieldType.number,
        label: intl.get('ssta.sourcingCost.model.sourcingCost.transferServiceFeeAmount').d('转服务费金额'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'returnAmount',
        type: FieldType.number,
        label: intl.get('ssta.sourcingCost.model.sourcingCost.depositReturnedAmount').d('保证金已退回金额'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'payOutAmount',
        type: FieldType.number,
        label: intl.get('ssta.sourcingCost.model.sourcingCost.transferredOutAmount').d('已转出金额'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'syncStatus',
        type: FieldType.string,
        label: intl.get('ssta.sourcingCost.model.sourcingCost.syncStatus').d('同步状态'),
        lookupCode: 'SDEP.SYNC_STATUS',
      },
    ],
    queryParameter: {
      customizeUnitCode: [DepositListGridCustCode[activeKey], DepositListSearchCustCode[activeKey]].join(),
    },
    transport: {
      read: ({ data }) => {
        const { supplierLovKey, ...otherData } = data;
        return {
          url: QueryListUrlMap[activeKey],
          method: 'GET',
          data: {
            ...otherData,
            ...transformSupplierData(supplierLovKey),
          },
        };
      },
    },
  };
};

export const serviceTableDS = (activeKey: ActiveKey): DataSetProps => {
  return {
    autoQuery: false,
    pageSize: 20,
    primaryKey: 'serverFeesId',
    fields: [
      {
        name: 'serverFeesStatus',
        type: FieldType.string,
        label: intl.get('ssta.sourcingCost.model.sourcingCost.serviceFeeStatus').d('服务费状态'),
        lookupCode: 'SDEP.SERVER_FEES_STATUS',
      },
      {
        name: 'serverFeesPaymentStatus',
        type: FieldType.string,
        label: intl.get('ssta.sourcingCost.model.sourcingCost.payStatus').d('缴纳状态'),
        lookupCode: 'SDEP.SERVER_FEES_PAYMENT_STATUS',
      },
      {
        name: 'serverFeesInvoiceStatus',
        type: FieldType.string,
        label: intl.get('ssta.sourcingCost.model.sourcingCost.invoicingStatus').d('开票状态'),
        lookupCode: 'SDEP.SERVER_FEES_INVOICE_STATUS',
      },
      {
        name: 'operation',
        label: intl.get('hzero.common.button.action').d('操作'),
      },
      {
        name: 'serverFeesNum',
        type: FieldType.string,
        label: intl.get('ssta.sourcingCost.model.sourcingCost.serviceFeeNumber').d('服务费编号'),
      },
      {
        name: 'sourceDocumentTypeMeaning',
        type: FieldType.string,
        label: intl.get('ssta.sourcingCost.model.sourcingCost.sourceDocumentType').d('寻源单据类型'),
      },
      {
        name: 'sourceDocumentNum',
        type: FieldType.string,
        label: intl.get('ssta.sourcingCost.model.sourcingCost.sourceDocumentNumber').d('寻源单据编号'),
      },
      {
        name: 'sourceDocumentTitle',
        type: FieldType.string,
        label: intl.get('ssta.sourcingCost.model.sourcingCost.sourceDocumentTitle').d('寻源单据标题'),
      },
      {
        name: 'companyName',
        type: FieldType.string,
        label: intl.get('ssta.sourcingCost.model.sourcingCost.tenderCompany').d('招标公司'),
      },
      {
        name: 'supplierCompanyName',
        type: FieldType.string,
        label: intl.get('ssta.sourcingCost.model.sourcingCost.tenderSupplier').d('招标供应商'),
      },
      {
        name: 'currencyCode',
        type: FieldType.string,
        label: intl.get('ssta.common.model.common.currency').d('币种'),
      },
      {
        name: 'amount',
        type: FieldType.number,
        label: intl.get('ssta.sourcingCost.model.sourcingCost.serviceFeeAmount').d('服务费金额'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'paidAmount',
        type: FieldType.number,
        label: intl.get('ssta.sourcingCost.model.sourcingCost.paidAmount').d('已缴纳金额'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'returnAmount',
        type: FieldType.number,
        label: intl.get('ssta.sourcingCost.model.sourcingCost.returnAmount').d('退回金额'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'syncStatus',
        type: FieldType.string,
        label: intl.get('ssta.sourcingCost.model.sourcingCost.syncStatus').d('同步状态'),
        lookupCode: 'SDEP.SYNC_STATUS',
      },
    ],
    queryParameter: {
      customizeUnitCode: [ServiceListGridCustCode[activeKey], ServiceListSearchCustCode[activeKey]].join(),
    },
    transport: {
      read: ({ data }) => {
        const { supplierLovKey, ...otherData } = data;
        return {
          url: QueryListUrlMap[activeKey],
          method: 'GET',
          data: {
            ...otherData,
            ...transformSupplierData(supplierLovKey),
          },
        };
      },
    },
  };
};