import { DataToJSON, FieldType } from 'choerodon-ui/dataset/data-set/enum';
import type { DataSetProps } from 'choerodon-ui/dataset/data-set/DataSet';

import intl from 'utils/intl';
import { SRM_SSTA } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

import { amountFormatterOptions } from '../../../../utils/utils';
import { ServiceDetailGridUnitCode, ServiceHeadUnitCode } from '../../utils/type';

const tenantId = getCurrentOrganizationId();
const apiPrefix = `${SRM_SSTA}/v1/${tenantId}`;

export const serviceHeaderDS = (serverFeesId: string): DataSetProps => {
  return {
    paging: false,
    autoQuery: true,
    forceValidate: true,
    primaryKey: 'serverFeesId',
    dataToJSON: DataToJSON.all,
    fields: [
      {
        name: 'serverFeesNum',
        type: FieldType.string,
        label: intl.get('ssta.sourcingCost.model.sourcingCost.serviceFeeNum').d('服务费编号'),
      },
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
        name: 'creationDate',
        type: FieldType.date,
        label: intl.get('ssta.common.model.common.createdDate').d('创建日期'),
      },
      {
        name: 'createdUserName',
        type: FieldType.string,
        label: intl.get('ssta.common.model.common.createdBy').d('创建人'),
      },
      {
        name: 'companyNum',
        type: FieldType.string,
        label: intl.get('ssta.common.model.common.companyNum').d('公司编码'),
      },
      {
        name: 'companyName',
        type: FieldType.string,
        label: intl.get('ssta.common.model.common.companyName').d('公司名称'),
      },
      {
        name: 'currencyCode',
        type: FieldType.string,
        label: intl.get('ssta.common.model.common.currency').d('币种'),
      },
      {
        name: 'supplierCompanyNum',
        type: FieldType.string,
        label: intl.get('ssta.common.model.common.supplierCode').d('供应商编码'),
      },
      {
        name: 'supplierCompanyName',
        type: FieldType.string,
        label: intl.get('ssta.common.model.common.supplierName').d('供应商名称'),
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
        name: 'remainingPaymentAmount',
        type: FieldType.number,
        label: intl.get('ssta.sourcingCost.model.sourcingCost.remainingPayAmount').d('剩余缴纳金额'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'invoiceRuleMeaning',
        type: FieldType.string,
        label: intl.get('ssta.sourcingCost.model.sourcingCost.serviceFeeInvoicingRule').d('服务费开票规则'),
      },
    ],
    queryParameter: { serverFeesId, customizeUnitCode: Object.values(ServiceHeadUnitCode).join() },
    transport: {
      read: () => {
        return {
          url: `${apiPrefix}/server-feess/detail`,
          method: 'GET',
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
};
export const payRecordDS = (workflowBatch?: string): DataSetProps => {
  return {
    pageSize: 20,
    autoQuery: false,
    selection: false,
    fields: [
      {
        name: 'lineNum',
        type: FieldType.string,
        label: intl.get('ssta.sourcingCost.model.sourcingCost.lineNum').d('行号'),
      },
      {
        name: 'serverFeesNum',
        type: FieldType.string,
        label: intl.get('ssta.sourcingCost.model.sourcingCost.serviceFeeNum').d('服务费编号'),
      },
      {
        name: 'paymentCategory',
        type: FieldType.string,
        label: intl.get('ssta.sourcingCost.model.sourcingCost.paymentType').d('支付类型'),
        lookupCode: 'SDEP.SERVER_PAYMENT_CATEGORY',
      },
      {
        name: 'serverPayRecordStatus',
        type: FieldType.string,
        label: intl.get('ssta.sourcingCost.model.sourcingCost.paymentRecordStatus').d('支付记录状态'),
        lookupCode: 'SDEP.RECORD_STATUS',
      },
      {
        name: 'paymentModeMeaning',
        type: FieldType.string,
        label: intl.get('ssta.sourcingCost.model.sourcingCost.paymentMethod').d('支付方式'),
      },
      {
        name: 'paymentAmount',
        type: FieldType.number,
        label: intl.get('ssta.sourcingCost.model.sourcingCost.paymentAmount').d('支付金额'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'paymentDate',
        type: FieldType.dateTime,
        label: intl.get('ssta.sourcingCost.model.sourcingCost.paymentTime').d('支付时间'),
      },
      {
        name: 'purchaserConfirmByName',
        type: FieldType.string,
        label: intl.get('ssta.sourcingCost.model.sourcingCost.purchaserConfirmBy').d('采购方确认人'),
      },
      {
        name: 'transferDepositNumAndLineNum',
        type: FieldType.string,
        label: intl.get('ssta.sourcingCost.model.sourcingCost.sourceDepositNumAndLineNum').d('来源保证金编号-行号'),
      },
      {
        name: 'remark',
        type: FieldType.string,
        label: intl.get('ssta.sourcingCost.model.sourcingCost.remark').d('备注'),
      },
      {
        name: 'approveModeMeaning',
        type: FieldType.string,
        label: intl.get('ssta.sourcingCost.model.sourcingCost.approveMethod').d('审批方式'),
      },
      {
        name: 'syncModeMeaning',
        type: FieldType.string,
        label: intl.get('ssta.sourcingCost.model.sourcingCost.syncExtSysFlag').d('是否同步外部系统'),
      },
      {
        name: 'processInstanceId',
        type: FieldType.string,
        label: intl.get('ssta.sourcingCost.model.sourcingCost.workflowProcessIdentification').d('工作流流程标识'),
      },
    ],
    queryParameter: { workflowBatch, customizeUnitCode: ServiceDetailGridUnitCode.PAY },
    transport: {
      read: ({ data }) => {
        const { serverFeesId } = data;
        return {
          url: `${apiPrefix}/server-pay-records/list/${serverFeesId}`,
          method: 'GET',
        };
      },
    },
  };
};