import { FieldType } from "choerodon-ui/dataset/data-set/enum";
import type { DataSetProps } from "choerodon-ui/dataset/data-set/DataSet";

import intl from "utils/intl";
import { SRM_SSTA } from '_utils/config';
import { getCurrentOrganizationId } from "utils/utils";

import { amountFormatterOptions } from "../../../../utils/utils";

export const payPoolDS = (settleNum): DataSetProps => {
  return {
    pageSize: 20,
    autoQuery: true,
    selection: false,
    fields: [
      {
        name: 'contractNumAndLineNum',
        label: intl.get('ssta.payPool.model.payPool.sourceDocumentNumAndLineNum').d('来源单据编号-行号'),
      },
      {
        name: 'documentAndLineNum',
        label: intl.get('ssta.payPool.model.payPool.settleTransactionNumAndLineNum').d('结算事务编号-行号'),
      },
      {
        name: 'payNum',
        label: intl.get('ssta.payPool.model.payPool.payTransactionNum').d('支付事务编号'),
      },
      {
        name: 'documentTypeMeaning',
        label: intl.get('ssta.payPool.model.payPool.payTransactionSourceType').d('支付事务来源类型'),
      },
      {
        name: 'payStatus',
        label: intl.get('ssta.payPool.model.payPool.payStatus').d('支付状态'),
        lookupCode: 'SBSM.PAY_POOL_STATUS',
      },
      {
        name: 'payAmount',
        label: intl.get('ssta.payPool.model.payPool.waitPayAmount').d('待支付总金额'),
        type: FieldType.number,
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'payCompleteAmount',
        label: intl.get('ssta.payPool.model.payPool.payDocPayCompletedAmount').d('支付单支付完成金额'),
        type: FieldType.number,
        computedProps: { formatterOptions: amountFormatterOptions },
      },
    ],
    queryParameter: {
      customizeUnitCode: '',
    },
    transport: {
      read: {
        url: `${SRM_SSTA}/v1/${getCurrentOrganizationId()}/settle-headers/${settleNum}/list-pay-pool`,
        method: 'get',
      },
    },
  };
};

export const executionDS = (payId): DataSetProps => {
  return {
    pageSize: 20,
    autoQuery: true,
    selection: false,
    primaryKey: 'stageId',
    fields: [
      {
        name: 'payHeaderNum',
        label: intl.get('ssta.payPool.model.execution.payDocNum').d('支付单据编号'),
      },
      {
        name: 'payLineNum',
        label: intl.get('ssta.payPool.model.execution.payDocLineNum').d('支付单据行号'),
      },
      {
        name: 'payAmount',
        label: intl.get('ssta.payPool.model.execution.payAmount').d('支付金额'),
        type: FieldType.number,
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'recordTypeMeaning',
        label: intl.get('ssta.payPool.model.execution.payRecordType').d('支付记录类型'),
      },
      {
        name: 'recordStatusMeaning',
        label: intl.get('ssta.payPool.model.execution.paymentOperateType').d('支付单操作类型'),
      },
      {
        name: 'creationDate',
        label: intl.get('ssta.payPool.model.execution.operateDate').d('操作日期'),
        type: FieldType.date,
      },
      {
        name: 'operationSourceMeaning',
        label: intl.get('ssta.payPool.model.execution.operateSource').d('操作来源'),
      },
      {
        name: 'companyNum',
        label: intl.get('ssta.payPool.model.execution.docCompanyNum').d('单据公司编码'),
      },
      {
        name: 'companyName',
        label: intl.get('ssta.payPool.model.execution.docCompanyName').d('单据公司名称'),
      },
      {
        name: 'displaySupplierNum',
        label: intl.get('ssta.payPool.model.execution.docSupplierCompanyNum').d('单据供应商公司编码'),
      },
      {
        name: 'displaySupplierName',
        label: intl.get('ssta.payPool.model.execution.docSupplierCompanyName').d('单据供应商公司名称'),
      },
      {
        name: 'currencyCode',
        label: intl.get('ssta.payPool.model.execution.currency').d('币种'),
      },
      {
        name: 'payTypeName',
        label: intl.get('ssta.payPool.model.execution.thisPayMethod').d('本次付款方式'),
      },
      {
        name: 'payFormMeaning',
        label: intl.get('ssta.payPool.model.execution.thisPayForm').d('本次付款形式'),
      },
    ],
    queryParameter: {
      customizeUnitCode: '',
    },
    transport: {
      read: {
        url: `${SRM_SSTA}/v1/${getCurrentOrganizationId()}/settle-headers/${payId}/list-pay-pool-record`,
        method: 'get',
      },
    },
  };
};