import { DataToJSON, FieldType } from 'choerodon-ui/dataset/data-set/enum';
import type { DataSetProps } from 'choerodon-ui/dataset/data-set/DataSet';

import intl from 'utils/intl';
import { SRM_SSTA } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

import { DepositDetailGridUnitCode, DepositHeadUnitCode } from '../../utils/type';
import { amountFormatterOptions } from '../../../../utils/utils';

const tenantId = getCurrentOrganizationId();
const apiPrefix = `${SRM_SSTA}/v1/${tenantId}`;

export const depositHeaderDS = (depositId: string): DataSetProps => {
  return {
    paging: false,
    autoQuery: true,
    forceValidate: true,
    primaryKey: 'depositId',
    dataToJSON: DataToJSON.all,
    fields: [
      {
        name: 'depositNum',
        type: FieldType.string,
        label: intl.get('ssta.sourcingCost.model.sourcingCost.depositNum').d('保证金编号'),
      },
      {
        name: 'paymentTypeMeaning',
        type: FieldType.string,
        label: intl.get('ssta.sourcingCost.model.sourcingCost.payType').d('缴纳类型'),
      },
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
        label: intl.get('ssta.sourcingCost.model.sourcingCost.depositAmount').d('保证金金额'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'remainingPaymentAmount',
        type: FieldType.number,
        label: intl.get('ssta.sourcingCost.model.sourcingCost.depositRemainingPayAmount').d('保证金剩余缴纳金额'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'paidAmount',
        type: FieldType.number,
        label: intl.get('ssta.sourcingCost.model.sourcingCost.depositPaidAmount').d('保证金已缴纳金额'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'remainingRefundableAmount',
        type: FieldType.number,
        label: intl.get('ssta.sourcingCost.model.sourcingCost.depositRemainingReturnableAmount').d('保证金剩余可退回金额'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'payForServerAmount',
        type: FieldType.number,
        label: intl.get('ssta.sourcingCost.model.sourcingCost.depositPayForServerAmount').d('保证金缴纳服务费金额'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'returnAmount',
        type: FieldType.number,
        label: intl.get('ssta.sourcingCost.model.sourcingCost.depositReturnedAmountAmount').d('保证金已退回金额'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'payOutAmount',
        type: FieldType.number,
        label: intl.get('ssta.sourcingCost.model.sourcingCost.depositTransferOutAmount').d('保证金转出金额'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'paymentRuleMeaning',
        type: FieldType.string,
        label: intl.get('ssta.sourcingCost.model.sourcingCost.depositPayRule').d('保证金缴纳规则'),
      },
      {
        name: 'returnRuleMeaning',
        type: FieldType.string,
        label: intl.get('ssta.sourcingCost.model.sourcingCost.depositReturnRule').d('保证金退回规则'),
      },
      {
        name: 'supplierQuoteFlag',
        label: intl.get('ssta.sourcingCost.model.sourcingCost.supplierCanQuotePriceFlag').d('供应商可报价标识'),
        lookupCode: 'HPFM.FLAG',
      },
    ],
    queryParameter: { depositId, customizeUnitCode: Object.values(DepositHeadUnitCode).join() },
    transport: {
      read: () => {
        return {
          url: `${apiPrefix}/deposits/detail`,
          method: 'GET',
        };
      },
    },
  };
};

export const payRecordDS = (workflowBatch?: string | number): DataSetProps => {
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
        name: 'depositNum',
        type: FieldType.string,
        label: intl.get('ssta.sourcingCost.model.sourcingCost.depositNum').d('保证金编号'),
      },
      {
        name: 'paymentCategory',
        type: FieldType.string,
        label: intl.get('ssta.sourcingCost.model.sourcingCost.paymentType').d('支付类型'),
        lookupCode: 'SDEP.DEPOSIT_PAYMENT_CATEGORY',
      },
      {
        name: 'depositPayRecordStatus',
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
        name: 'initiateCampMeaning',
        type: FieldType.string,
        label: intl.get('ssta.sourcingCost.model.sourcingCost.initiatorCamp').d('发起方阵营'),
      },
      {
        name: 'syncModeMeaning',
        type: FieldType.string,
        label: intl.get('ssta.sourcingCost.model.sourcingCost.returnSupplierSyncExtSysFlag').d('退回供应商是否同步外部系统'),
      },
      {
        name: 'processInstanceId',
        type: FieldType.string,
        label: intl.get('ssta.sourcingCost.model.sourcingCost.workflowProcessIdentification').d('工作流流程标识'),
      },
    ],
    queryParameter: {
      workflowBatch,
      customizeUnitCode: DepositDetailGridUnitCode.PAY,
    },
    transport: {
      read: ({ data }) => {
        const { depositId } = data;
        return {
          url: `${apiPrefix}/deposit-pay-records/list/${depositId}`,
          method: 'GET',
        };
      },
    },
  };
};

export const transferOutDS = (): DataSetProps => {
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
        name: 'depositNum',
        type: FieldType.string,
        label: intl.get('ssta.sourcingCost.model.sourcingCost.depositNum').d('保证金编号'),
      },
      {
        name: 'transferTypeMeaning',
        type: FieldType.string,
        label: intl.get('ssta.sourcingCost.model.sourcingCost.transferOutDocumentType').d('转出单据类型'),
      },
      {
        name: 'type',
        type: FieldType.string,
        label: intl.get('ssta.sourcingCost.model.sourcingCost.transferOutType').d('转出类型'),
        lookupCode: 'SDEP.DEPOSIT_PAYMENT_CATEGORY',
      },
      {
        name: 'depositTransferRecordStatusMeaning',
        type: FieldType.string,
        label: intl.get('ssta.sourcingCost.model.sourcingCost.transferRecordStatus').d('转出记录状态'),
      },
      {
        name: 'transferAmount',
        type: FieldType.number,
        label: intl.get('ssta.sourcingCost.model.sourcingCost.transferOutAmount').d('转出金额'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'transferDate',
        type: FieldType.dateTime,
        label: intl.get('ssta.sourcingCost.model.sourcingCost.transferOutTime').d('转出时间'),
      },
      {
        name: 'associateNumAndLineNum',
        type: FieldType.string,
        label: intl.get('ssta.sourcingCost.model.sourcingCost.associateDocumentNumAndLineNum').d('关联单据编号-行号'),
      },
    ],
    queryParameter: {
      customizeUnitCode: DepositDetailGridUnitCode.TRANS_OUT,
    },
    transport: {
      read: ({ data }) => {
        const { depositId } = data;
        return {
          url: `${apiPrefix}/deposit-transfer-records/list/${depositId}`,
          method: 'GET',
        };
      },
    },
  };
};
