import { DataToJSON, FieldType } from 'choerodon-ui/dataset/data-set/enum';
import type { DataSetProps } from 'choerodon-ui/dataset/data-set/DataSet';

import intl from 'utils/intl';
import { SRM_SSTA } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

import {
  TenderListGridCustCode,
  TenderSearchCustCode,
  DepositListGridCustCode,
  DepositListSearchCustCode,
  ServiceListGridCustCode,
  ServiceListSearchCustCode,
} from '../../utils/type';
import { QueryListUrlMap } from '../../utils/api';
import type { ActiveKey } from '../../utils/type';
import { amountFormatterOptions, transformSupplierData } from '../../../../utils/utils';

const tenantId = getCurrentOrganizationId();
const apiPrefix = `${SRM_SSTA}/v1/${tenantId}`;

export const tenderTableDS = (activeKey: ActiveKey, remote: any): DataSetProps => {
  const ds = {
    autoQuery: false,
    pageSize: 20,
    selection: false,
    primaryKey: 'tenderFeesId',
    dataToJSON: DataToJSON.dirty,
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
        label: intl.get('ssta.common.model.common.company').d('公司'),
      },
      {
        name: 'supplierCompanyName',
        type: FieldType.string,
        label: intl.get('ssta.common.model.common.supplier').d('供应商'),
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
        name: 'syncStatus',
        type: FieldType.string,
        label: intl.get('ssta.sourcingCost.model.sourcingCost.syncStatus').d('同步状态'),
        lookupCode: 'SDEP.SYNC_STATUS',
      },
    ],
    queryParameter: {
      customizeUnitCode: [TenderListGridCustCode[activeKey], TenderSearchCustCode[activeKey]].join(),
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
      submit: ({ dataSet }): any => {
        const submitType = dataSet?.getState('submitType');
        if (submitType === 'confirmCancelInv') {
          return {
            url: `${apiPrefix}/tender-feess/invoice-tender-fees-invoice`,
            method: 'POST',
          };
        }
      },
    },
  };
  const remoteDs = remote
  ? remote.process('SSTA.SOURCING_COST_PUR_CUX.TENDER_TABLE_DS', ds, { activeKey })
  : ds;
  return remoteDs;
};

export const depositTableDS = (activeKey: ActiveKey, remote: any): DataSetProps => {
  const ds =  {
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
        label: intl.get('ssta.common.model.common.company').d('公司'),
      },
      {
        name: 'supplierCompanyName',
        type: FieldType.string,
        label: intl.get('ssta.common.model.common.supplier').d('供应商'),
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
  const remoteDs = remote
  ? remote.process('SSTA.SOURCING_COST_PUR_CUX.DEPOSIT_TABLE_DS', ds, { activeKey })
  : ds;
  return remoteDs;
};

export const serviceTableDS = (activeKey: ActiveKey, remote?: any): DataSetProps => {
  const ds = {
    autoQuery: false,
    pageSize: 20,
    selection: false,
    primaryKey: 'serverFeesId',
    dataToJSON: DataToJSON.dirty, // submit方法会用到，谨慎修改
    fields: [
      {
        name: 'serverFeesStatus',
        type: FieldType.string,
        label: intl.get('ssta.sourcingCost.model.sourcingCost.serverFeesStatus').d('服务费状态'),
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
        label: intl.get('ssta.sourcingCost.model.sourcingCost.serverFeesNumber').d('服务费编号'),
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
        label: intl.get('ssta.common.model.common.company').d('公司'),
      },
      {
        name: 'supplierCompanyName',
        type: FieldType.string,
        label: intl.get('ssta.common.model.common.supplier').d('供应商'),
      },
      {
        name: 'currencyCode',
        type: FieldType.string,
        label: intl.get('ssta.common.model.common.currency').d('币种'),
      },
      {
        name: 'amount',
        type: FieldType.number,
        label: intl.get('ssta.sourcingCost.model.sourcingCost.serverFeesAmount').d('服务费金额'),
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
        name: 'remainingPaymentAmount',
        type: FieldType.number,
        label: intl.get('ssta.sourcingCost.model.sourcingCost.remainingPayAmount').d('剩余缴纳金额'),
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
      submit: ({ dataSet, data }): any => {
        const submitType = dataSet?.getState('submitType');
        switch (submitType) {
          case 'return':
            return {
              url: `${apiPrefix}/server-feess/return-server-fees`,
              method: 'POST',
              data: data[0],
            };
          case 'revokeAmountChange':
            return {
              url: `${apiPrefix}/server-feess/server-fees-change-revoke`,
              method: 'POST',
              data: data[0],
            };
          default:
        }
      },
    },
  };

  const remoteDs = remote
    ? remote.process('SSTA.SOURCING_COST_PUR_CUX.SERVICE_TABLE_DS', ds, { activeKey })
    : ds;
  return remoteDs;
};
