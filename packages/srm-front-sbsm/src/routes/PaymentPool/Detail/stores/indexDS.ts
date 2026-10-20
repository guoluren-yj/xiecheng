import { isNil } from 'lodash';
import { FieldType } from 'choerodon-ui/dataset/data-set/enum';
import type { DataSetProps } from 'choerodon-ui/dataset/data-set/DataSet';

import intl from 'utils/intl';
import { SRM_SBDM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

import { amountFormatterOptions } from '../../../../utils/utils';
import { ErrorHeadCustCodeMap, ExeCustCodeMap, HeadCustCodeMap } from '../../utils/type';

export const headerDS = (payId, payErrorId): DataSetProps => {
  return {
    autoQuery: true,
    fields: [
      {
        name: 'companyNum',
        label: intl.get('sbsm.paymentPool.model.paymentPool.companyNum').d('公司编码'),
      },
      {
        name: 'companyName',
        label: intl.get('sbsm.paymentPool.model.paymentPool.companyName').d('公司名称'),
      },
      {
        name: 'displaySupplierNum',
        label: intl.get('sbsm.paymentPool.model.paymentPool.supplierNum').d('供应商编码'),
      },
      {
        name: 'displaySupplierName',
        label: intl.get('sbsm.paymentPool.model.paymentPool.supplierName').d('供应商名称'),
      },
      {
        name: 'payBankName',
        label: intl.get('sbsm.paymentPool.model.paymentPool.purchaseBankName').d('采购方银行名称'),
      },
      {
        name: 'payBankBranchName',
        label: intl.get('sbsm.paymentPool.model.paymentPool.purchaseBankBranchName').d('采购方开户行名称'),
      },
      {
        name: 'payBankFirm',
        label: intl.get('sbsm.paymentPool.model.paymentPool.purchaseBankBranchCode').d('采购方联行行号'),
      },
      {
        name: 'payBankAccountNum',
        label: intl.get('sbsm.paymentPool.model.paymentPool.purchaseBankAccount').d('采购方银行账号'),
      },
      {
        name: 'payBankAccountName',
        label: intl.get('sbsm.paymentPool.model.paymentPool.purchaseBankAccountName').d('采购方银行账号名称'),
      },
      {
        name: 'bankName',
        label: intl.get('sbsm.paymentPool.model.paymentPool.supplierBankName').d('供应商银行名称'),
      },
      {
        name: 'bankBranchName',
        label: intl.get('sbsm.paymentPool.model.paymentPool.supplierBankBranchName').d('供应商开户行名称'),
      },
      {
        name: 'bankFirm',
        label: intl.get('sbsm.paymentPool.model.paymentPool.supplierBankBranchCode').d('供应商联行行号'),
      },
      {
        name: 'bankAccountNum',
        label: intl.get('sbsm.paymentPool.model.paymentPool.supplierBankAccount').d('供应商银行账号'),
      },
      {
        name: 'bankAccountName',
        label: intl.get('sbsm.paymentPool.model.paymentPool.supplierBankAccountName').d('供应商银行账号名称'),
      },
      {
        name: 'ouName',
        label: intl.get('sbsm.paymentPool.model.paymentPool.businessEntity').d('业务实体'),
      },
      {
        name: 'supplierSiteName',
        label: intl.get('sbsm.paymentPool.model.paymentPool.supplierSite').d('供应商地点'),
      },
      {
        name: 'payNum',
        label: intl.get('sbsm.paymentPool.model.paymentPool.payTransactionNum').d('支付事务编号'),
      },
      {
        name: 'payErrorNum',
        label: intl.get('sbsm.paymentPool.model.paymentPool.errorPoolTransactionNum').d('错误池事务编号'),
      },
      {
        name: 'documentSystemMeaning',
        label: intl.get('sbsm.paymentPool.model.paymentPool.dataSourceSystem').d('数据来源系统'),
      },
      {
        name: 'documentTypeMeaning',
        label: intl.get('sbsm.paymentPool.model.paymentPool.dataSourceType').d('数据来源类型'),
      },
      {
        name: 'payAmount',
        label: intl.get('sbsm.paymentPool.model.paymentPool.pendingTotalAmount').d('待支付总金额'),
        type: FieldType.number,
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'currencyCode',
        label: intl.get('sbsm.paymentPool.model.paymentPool.currency').d('币种'),
      },
      {
        name: 'payTypeName',
        label: intl.get('sbsm.paymentPool.model.paymentPool.paymentMethod').d('付款方式'),
      },
      {
        name: 'payFormMeaning',
        label: intl.get('sbsm.paymentPool.model.paymentPool.paymentForm').d('付款形式'),
      },
      {
        name: 'exPaymentDate',
        type: FieldType.date,
        label: intl.get('sbsm.paymentPool.model.paymentPool.expectedPayDate').d('期望付款日期'),
      },
      {
        name: 'payStatus',
        label: intl.get('sbsm.paymentPool.model.paymentPool.paymentStatus').d('支付状态'),
        lookupCode: 'SBSM.PAY_POOL_STATUS',
      },
      {
        name: 'documentNum',
        label: intl.get('sbsm.paymentPool.model.paymentPool.sourceTransactionCode').d('来源事务编号'),
      },
      {
        name: 'documentLineNum',
        label: intl.get('sbsm.paymentPool.model.paymentPool.sourceTransactionLineNum').d('来源事务行号'),
      },
      {
        name: 'itemCode',
        label: intl.get('sbsm.paymentPool.model.paymentPool.settlementGoodsCode').d('结算商品编码'),
      },
      {
        name: 'itemName',
        label: intl.get('sbsm.paymentPool.model.paymentPool.settlementGoodsName').d('结算商品名称'),
      },
      {
        name: 'srmPoNum',
        label: intl.get('sbsm.paymentPool.model.paymentPool.purchaseOrderCode').d('采购订单编号'),
      },
      {
        name: 'srmPoLineNum',
        label: intl.get('sbsm.paymentPool.model.paymentPool.purchaseOrderLineNum').d('采购订单行号'),
      },
      {
        name: 'pcNum',
        label: intl.get('sbsm.paymentPool.model.paymentPool.agreementCode').d('协议编码'),
      },
      {
        name: 'pcSubjectLineNum',
        label: intl.get('sbsm.paymentPool.model.paymentPool.agreementLineNum').d('协议标的行号'),
      },
      {
        name: 'agentName',
        label: intl.get('sbsm.paymentPool.model.paymentPool.purchaser').d('采购员'),
      },
      {
        name: 'createdByName',
        label: intl.get('sbsm.paymentPool.model.paymentPool.creator').d('创建人'),
      },
      {
        name: 'creationDate',
        type: FieldType.dateTime,
        label: intl.get('sbsm.paymentPool.model.paymentPool.creationDate').d('创建时间'),
      },
      {
        name: 'paySavedAmount',
        label: intl.get('sbsm.paymentPool.model.paymentPool.paymentSavedAmount').d('支付单已保存金额'),
        type: FieldType.number,
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'payOccupyAmount',
        label: intl.get('sbsm.paymentPool.model.paymentPool.paymentSubmittedAmount').d('支付单已提交金额'),
        type: FieldType.number,
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'payCompleteAmount',
        label: intl.get('sbsm.paymentPool.model.paymentPool.paymentCheckedAmount').d('支付单已审核金额'),
        type: FieldType.number,
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'payingAmount',
        label: intl.get('sbsm.paymentPool.model.paymentPool.paymentDirectAmount').d('支付单银企直联支付发起金额'),
        type: FieldType.number,
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'paidAmount',
        label: intl.get('sbsm.paymentPool.model.paymentPool.paymentCompletedAmount').d('支付单支付完成金额'),
        type: FieldType.number,
        computedProps: { formatterOptions: amountFormatterOptions },
      },
    ],
    queryParameter: {
      customizeUnitCode: !isNil(payErrorId) ? Object.values(ErrorHeadCustCodeMap).join() : Object.values(HeadCustCodeMap).join(),
    },
    transport: {
      read: {
        url: !isNil(payErrorId)
          ? `${SRM_SBDM}/v1/${getCurrentOrganizationId()}/pay-pool-errors/detail/${payErrorId}`
          : `${SRM_SBDM}/v1/${getCurrentOrganizationId()}/pay-pools/detail/${payId}`,
        method: 'get',
      },
    },
  };
};

export const executionDS = (payId): DataSetProps => {
  return {
    pageSize: 20,
    autoQuery: false,
    selection: false,
    primaryKey: 'stageId',
    fields: [
      {
        name: 'payHeaderNum',
        label: intl.get('sbsm.paymentPool.model.execution.payDocNum').d('支付单据编号'),
      },
      {
        name: 'payLineNum',
        label: intl.get('sbsm.paymentPool.model.execution.payDocLineNum').d('支付单据行号'),
      },
      {
        name: 'payAmount',
        label: intl.get('sbsm.paymentPool.model.execution.payAmount').d('支付金额'),
        type: FieldType.number,
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'recordTypeMeaning',
        label: intl.get('sbsm.paymentPool.model.execution.payRecordType').d('支付记录类型'),
      },
      {
        name: 'recordStatusMeaning',
        label: intl.get('sbsm.paymentPool.model.execution.paymentOperateType').d('支付单操作类型'),
      },
      {
        name: 'creationDate',
        label: intl.get('sbsm.paymentPool.model.execution.operateDate').d('操作日期'),
        type: FieldType.date,
      },
      {
        name: 'operationSourceMeaning',
        label: intl.get('sbsm.paymentPool.model.execution.operateSource').d('操作来源'),
      },
      {
        name: 'companyNum',
        label: intl.get('sbsm.paymentPool.model.execution.docCompanyNum').d('单据公司编码'),
      },
      {
        name: 'companyName',
        label: intl.get('sbsm.paymentPool.model.execution.docCompanyName').d('单据公司名称'),
      },
      {
        name: 'displaySupplierNum',
        label: intl.get('sbsm.paymentPool.model.execution.docSupplierCompanyNum').d('单据供应商公司编码'),
      },
      {
        name: 'displaySupplierName',
        label: intl.get('sbsm.paymentPool.model.execution.docSupplierCompanyName').d('单据供应商公司名称'),
      },
      {
        name: 'currencyCode',
        label: intl.get('sbsm.paymentPool.model.execution.currency').d('币种'),
      },
      {
        name: 'payTypeName',
        label: intl.get('sbsm.paymentPool.model.execution.thisPayMethod').d('本次付款方式'),
      },
      {
        name: 'payFormMeaning',
        label: intl.get('sbsm.paymentPool.model.execution.thisPayForm').d('本次付款形式'),
      },
    ],
    queryParameter: {
      payId,
      customizeUnitCode: Object.values(ExeCustCodeMap).join(),
    },
    transport: {
      read: {
        url: `${SRM_SBDM}/v1/${getCurrentOrganizationId()}/pay-pool-stages/list`,
        method: 'get',
      },
    },
  };
};
