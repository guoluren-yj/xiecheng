import { noop } from 'lodash';
import { DataToJSON, FieldType } from 'choerodon-ui/dataset/data-set/enum';
import type { DataSetProps } from 'choerodon-ui/dataset/data-set/DataSet';

import intl from 'utils/intl';
import { SRM_SBDM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

import type { ActiveKey } from '../../utils/type';
import { amountFormatterOptions } from '../../../../utils/utils';
import { ActionMap, GridCustCodeMap, FilterCustCodeMap } from '../../utils/type';

export const wholeListDS = (activeKey: ActiveKey): DataSetProps => {
  return {
    autoQuery: false,
    pageSize: 20,
    cacheSelection: true,
    primaryKey: 'payHeaderId',
    dataToJSON: DataToJSON.selected,
    autoQueryAfterSubmit: false,
    fields: [
      {
        name: 'payStatus',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.payDocStatus').d('支付单状态'),
        lookupCode: 'SBSM.PAY_HEADER_STATUS',
      },
      {
        name: 'payNum',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.payDocNum').d('支付单编号'),
      },
      {
        name: 'companyNum',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.companyNum').d('公司编号'),
      },
      {
        name: 'companyName',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.companyName').d('公司名称'),
      },
      {
        name: 'ouName',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.businessEntity').d('业务实体'),
      },
      {
        name: 'displaySupplierNum',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.supplierNum').d('供应商编码'),
      },
      {
        name: 'displaySupplierName',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.supplierName').d('供应商名称'),
      },
      {
        name: 'supplierSiteName',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.supplierSite').d('供应商地点'),
      },
      {
        name: 'currencyCode',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.currency').d('币种'),
      },
      {
        name: 'payTypeName',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.paymentMethod').d('付款方式'),
      },
      {
        name: 'payFormMeaning',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.paymentForm').d('付款形式'),
      },
      {
        name: 'payAmount',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.totalAmount').d('总金额'),
        type: FieldType.number,
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'remark',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.remark').d('备注'),
      },
      {
        name: 'createdByName',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.createdBy').d('创建人'),
      },
      {
        name: 'creationDate',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.creationTime').d('创建时间'),
        type: FieldType.dateTime,
      },
      {
        name: 'approveBatchNum',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.payDocBatch').d('支付单批'),
      },
    ],
    queryParameter: {
      actionType: ActionMap[activeKey],
      customizeUnitCode: [GridCustCodeMap[activeKey], FilterCustCodeMap[activeKey]].join(),
    },
    transport: {
      read: ({ data, params }) => {
        const { customizeUnitCode } = data;
        return {
          url: `${SRM_SBDM}/v1/${getCurrentOrganizationId()}/pay-headers/list`,
          method: 'post',
          params: {
            ...params,
            customizeUnitCode,
          },
        };
      },
      submit: ({ dataSet }): any => {
        const submitType = dataSet?.getState('submitType');
        switch (submitType) {
          case 'submitValidate':
            return {
              url: `${SRM_SBDM}/v1/${getCurrentOrganizationId()}/pay-headers/submit/validate`,
              method: 'PUT',
            };
          case 'submit':
            return {
              url: `${SRM_SBDM}/v1/${getCurrentOrganizationId()}/pay-headers/submit`,
              method: 'PUT',
            };
          default:
        }
      },
    },
    feedback: {
      submitSuccess: noop,
    },
  };
};

export const paymentListDS = (activeKey: ActiveKey): DataSetProps => {
  return {
    autoQuery: false,
    pageSize: 20,
    cacheSelection: true,
    primaryKey: 'payLineId',
    dataToJSON: DataToJSON.selected,
    autoQueryAfterSubmit: false,
    fields: [
      {
        name: 'payStatus',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.payDocStatus').d('支付单状态'),
        lookupCode: 'SBSM.PAY_HEADER_STATUS',
      },
      {
        name: 'payHeaderNum',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.payDocNum').d('支付单编号'),
      },
      {
        name: 'companyNum',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.companyNum').d('公司编号'),
      },
      {
        name: 'companyName',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.companyName').d('公司名称'),
      },
      {
        name: 'ouName',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.businessEntity').d('业务实体'),
      },
      {
        name: 'displaySupplierNum',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.supplierNum').d('供应商编码'),
      },
      {
        name: 'displaySupplierName',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.supplierName').d('供应商名称'),
      },
      {
        name: 'supplierSiteName',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.supplierSite').d('供应商地点'),
      },
      {
        name: 'currencyCode',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.currency').d('币种'),
      },
      {
        name: 'payTypeName',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.paymentMethod').d('付款方式'),
      },
      {
        name: 'payFormMeaning',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.paymentForm').d('付款形式'),
      },
      {
        name: 'createdByName',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.createdBy').d('创建人'),
      },
      {
        name: 'creationDate',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.creationTime').d('创建时间'),
        type: FieldType.dateTime,
      },
      {
        name: 'approveBatchNum',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.payDocBatch').d('支付单批'),
      },
      {
        name: 'lineNum',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.payDocPayLineNum').d('支付单支付行编号'),
      },
      {
        name: 'payNum',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.payTransactionNum').d('支付事务编号'),
      },
      {
        name: 'documentSystemMeaning',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.dataSrcSystem').d('数据来源系统'),
      },
      {
        name: 'documentTypeMeaning',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.dataSrcType').d('数据来源类型'),
      },
      {
        name: 'documentNum',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.srcTransactionNum').d('来源事务编号'),
      },
      {
        name: 'documentLineNum',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.srcTransactionLineNum').d('来源事务行号'),
      },
      {
        name: 'itemCode',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.settlementItemCode').d('结算商品编码'),
      },
      {
        name: 'itemName',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.settlementItemName').d('结算商品名称'),
      },
      {
        name: 'payAmount',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.thisPayAmount').d('本次支付金额'),
        type: FieldType.number,
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'remark',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.lineRemark').d('行备注'),
      },
      {
        name: 'srmPoNum',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.srmPoNum').d('采购订单编号'),
      },
      {
        name: 'srmPoLineNum',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.srmPoLineNum').d('采购订单行号'),
      },
      {
        name: 'pcNum',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.pcNum').d('协议编码'),
      },
      {
        name: 'pcSubjectLineNum',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.pcSubjectLineNum').d('协议标的行号'),
      },
      {
        name: 'purchaseAgentName',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.purchaser').d('采购代理人'),
      },
    ],
    queryParameter: {
      customizeUnitCode: [GridCustCodeMap[activeKey], FilterCustCodeMap[activeKey]].join(),
    },
    transport: {
      read: ({ data, params }) => {
        const { customizeUnitCode } = data;
        return {
          url: `${SRM_SBDM}/v1/${getCurrentOrganizationId()}/pay-lines/list`,
          method: 'post',
          params: {
            ...params,
            customizeUnitCode,
          },
        };
      },
    },
  };
};

export const settlementListDS = (activeKey: ActiveKey): DataSetProps => {
  return {
    autoQuery: false,
    pageSize: 20,
    cacheSelection: true,
    primaryKey: 'statementLineId',
    dataToJSON: DataToJSON.selected,
    autoQueryAfterSubmit: false,
    fields: [
      {
        name: 'payHeaderStatus',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.payDocStatus').d('支付单状态'),
        lookupCode: 'SBSM.PAY_HEADER_STATUS',
      },
      {
        name: 'payHeaderNum',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.payDocNum').d('支付单编号'),
      },
      {
        name: 'companyNum',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.companyNum').d('公司编号'),
      },
      {
        name: 'companyName',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.companyName').d('公司名称'),
      },
      {
        name: 'ouName',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.businessEntity').d('业务实体'),
      },
      {
        name: 'displaySupplierNum',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.supplierNum').d('供应商编码'),
      },
      {
        name: 'displaySupplierName',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.supplierName').d('供应商名称'),
      },
      {
        name: 'supplierSiteName',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.supplierSite').d('供应商地点'),
      },
      {
        name: 'currencyCode',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.currency').d('币种'),
      },
      {
        name: 'payTypeName',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.paymentMethod').d('付款方式'),
      },
      {
        name: 'payFormMeaning',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.paymentForm').d('付款形式'),
      },
      {
        name: 'createdByName',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.createdBy').d('创建人'),
      },
      {
        name: 'creationDate',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.creationTime').d('创建时间'),
        type: FieldType.dateTime,
      },
      {
        name: 'payHeaderCreationDate',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.creationTime').d('创建时间'),
        type: FieldType.dateTime,
      },
      {
        name: 'approveBatchNum',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.payDocBatch').d('支付单批'),
      },
      {
        name: 'lineNum',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.payDocSettlementLineNum').d('支付单流水行号'),
      },
      {
        name: 'payBankName',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.purchaseBankName').d('采购方银行名称'),
      },
      {
        name: 'payBankBranchName',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.purchaseBankBranchName').d('采购方开户行名称'),
      },
      {
        name: 'payBankFirm',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.purchaseBankBranchCode').d('采购方联行行号'),
      },
      {
        name: 'payBankAccountNum',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.purchaseBankAccount').d('采购方银行账号'),
      },
      {
        name: 'payBankAccountName',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.purchaseBankAccountName').d('采购方银行账号名称'),
      },
      {
        name: 'bankName',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.supplierBankName').d('供应商银行名称'),
      },
      {
        name: 'bankBranchName',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.supplierBankBranchName').d('供应商开户行名称'),
      },
      {
        name: 'bankFirm',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.supplierBankBranchCode').d('供应商联行行号'),
      },
      {
        name: 'bankAccountNum',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.supplierBankAccount').d('供应商银行账号'),
      },
      {
        name: 'bankAccountName',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.supplierBankAccountName').d('供应商银行账号名称'),
      },
      {
        name: 'payAmount',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.payAmount').d('支付金额'),
        type: FieldType.number,
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'payStatus',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.payStatus').d('支付状态'),
        lookupCode: 'SBSM.PAY_STATEMENT_STATUS',
      },
      {
        name: 'payCommandNum',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.bankPaymentInstrucNumber').d('银企支付指令编号'),
      },
      {
        name: 'paperNum',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.bankBillNumber').d('票据号'),
      },
      {
        name: 'dataSourceMeaning',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.bankBillSource').d('票据来源'),
      },
      {
        name: 'paperTypeMeaning',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.bankBillType').d('票据类型'),
      },
      {
        name: 'paperStatus',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.bankBillActualStatus').d('票据实际状态'),
        lookupCode: 'SBSM.BAKN_PAPER_STATUS',
      },
      {
        name: 'receiveBankName',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.receivingBank').d('收票银行'),
      },
      {
        name: 'drawer',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.drawer').d('出票人'),
      },
      {
        name: 'acceptor',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.acceptor').d('承兑人'),
      },
      {
        name: 'payer',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.payer').d('付款人'),
      },
      {
        name: 'invoiceDate',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.receiptOrIssuanceDate').d('收票日/开立日'),
        type: FieldType.date,
      },
      {
        name: 'issueDate',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.draftDate').d('出票日'),
        type: FieldType.date,
      },
      {
        name: 'draftsDeadLine',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.dueDate').d('到期日'),
        type: FieldType.date,
      },
    ],
    queryParameter: {
      customizeUnitCode: [GridCustCodeMap[activeKey], FilterCustCodeMap[activeKey]].join(),
    },
    transport: {
      read: ({ data, params }) => {
        const { customizeUnitCode } = data;
        return {
          url: `${SRM_SBDM}/v1/${getCurrentOrganizationId()}/pay-statement-lines/list`,
          method: 'post',
          params: {
            ...params,
            customizeUnitCode,
          },
        };
      },
    },
  };
};
