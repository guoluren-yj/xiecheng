import { toJS } from 'mobx';
import { noop, isNil, isObject } from 'lodash';
import type { DataSetProps } from 'choerodon-ui/dataset/data-set/DataSet';
import { FieldType, DataToJSON, FieldIgnore } from 'choerodon-ui/dataset/data-set/enum';

import intl from 'utils/intl';
import { SRM_SBDM, PRIVATE_BUCKET } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

import { amountFormatterOptions } from '../../../../utils/utils';
import {
  BUCKET_DIRECTORY,
  HeadCustCodeMap,
  MatchLineGridCode,
  BepResultGridCode,
  FillHeadCustCodeMap,
  FlowCardCustCodeMap,
  PaymentLineGridCode,
  StatementLineCodeMap,
} from '../../utils/type';

export const headerDS = (payHeaderId?: string | number): DataSetProps => {
  return {
    paging: false,
    autoQuery: !isNil(payHeaderId),
    forceValidate: true,
    primaryKey: 'payHeaderId',
    dataToJSON: DataToJSON.all,
    autoQueryAfterSubmit: false,
    cascadeParams: () => ({}),
    queryParameter: {
      payHeaderId,
      customizeUnitCode: [HeadCustCodeMap.Basic, HeadCustCodeMap.Attachment].join(),
    },
    fields: [
      {
        name: 'payNum',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.payDocNum').d('支付单编号'),
      },
      {
        name: 'payStatus',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.payDocStatus').d('支付单状态'),
        lookupCode: 'SBSM.PAY_HEADER_STATUS',
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
        name: 'payForm',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.paymentForm').d('付款形式'),
        lookupCode: 'SBSM.PAY_FORM',
      },
      {
        name: 'payAmount',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.totalAmount').d('总金额'),
        type: FieldType.number,
        computedProps: { formatterOptions: amountFormatterOptions },
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
        name: 'remark',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.remark').d('备注'),
      },
      {
        name: 'reverseReason',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.reverseReason').d('冲销原因'),
      },
      {
        name: 'cancelReason',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.cancelReason').d('取消原因'),
      },
      {
        name: 'attachmentUuid',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.attachment').d('附件'),
        type: FieldType.attachment,
        bucketName: PRIVATE_BUCKET,
        bucketDirectory: BUCKET_DIRECTORY,
      },
    ],
    transport: {
      read: ({ data }): any => {
        const { payHeaderId } = data;
        if (isNil(payHeaderId)) return;
        return {
          url: `${SRM_SBDM}/v1/${getCurrentOrganizationId()}/pay-headers/detail/${payHeaderId}`,
          method: 'get',
        };
      },
      submit: ({ dataSet, data, params }): any => {
        const cacheData = dataSet?.getState('cacheData');
        const submitType = dataSet?.getState('submitType');
        if (cacheData) {
          data.forEach(item => Object.assign(item, toJS(cacheData)));
          if (dataSet) dataSet.setState('cacheData', null);
        }
        const { payHeaderId } = data[0];
        const options = {
          url: '',
          method: 'PUT',
          data: ['cancel', 'submitValidate', 'submit', 'payCancel'].includes(submitType) ? data : data[0],
          params: {
            ...params,
            customizeUnitCode: [
              BepResultGridCode,
              PaymentLineGridCode,
              HeadCustCodeMap.Basic,
              HeadCustCodeMap.Attachment,
              StatementLineCodeMap.BepForm,
              StatementLineCodeMap.PaperGrid,
              StatementLineCodeMap.OfflineGrid,
              ...Object.values(FlowCardCustCodeMap),
              ...Object.values(FillHeadCustCodeMap),
            ].join(),
          },
        };
        switch (submitType) {
          case 'update':
            options.url = `${SRM_SBDM}/v1/${getCurrentOrganizationId()}/pay-headers/update`;
            break;
          case 'submitValidate':
            options.url = `${SRM_SBDM}/v1/${getCurrentOrganizationId()}/pay-headers/submit/validate`;
            break;
          case 'submit':
            options.url = `${SRM_SBDM}/v1/${getCurrentOrganizationId()}/pay-headers/submit`;
            break;
          case 'confirm':
            options.url = `${SRM_SBDM}/v1/${getCurrentOrganizationId()}/pay-headers/confirm`;
            break;
          case 'cancel':
            options.url = `${SRM_SBDM}/v1/${getCurrentOrganizationId()}/pay-headers/cancel`;
            break;
          case 'bepCancel':
            Object.assign(options, {
              url: `${SRM_SBDM}/v1/${getCurrentOrganizationId()}/pay-headers/cancel/pay-bep/${payHeaderId}`,
              method: 'POST',
            });
            break;
          case 'payCancel':
            options.url = `${SRM_SBDM}/v1/${getCurrentOrganizationId()}/pay-headers/cancel/confirm`;
            break;
            case 'reverse':
            Object.assign(options, {
              url: `${SRM_SBDM}/v1/${getCurrentOrganizationId()}/pay-headers/reverse`,
              method: 'POST',
            });
            break;
            default:
        }
        return options;
      },
    },
    feedback: {
      submitSuccess: noop,
    },
  };
};

export const paymentLineDS = (): DataSetProps => {
  return {
    // paging: false,
    pageSize: 20,
    autoQuery: false,
    forceValidate: true,
    cacheSelection: true,
    primaryKey: 'payLineId',
    autoQueryAfterSubmit: false,
    cascadeParams: (record) => record.get(['payHeaderId']),
    fields: [
      {
        name: 'lineNum',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.payDocPayLineNum').d('支付单支付行编号'),
      },
      {
        name: 'payNum',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.payTransactionNum').d('支付事务编号'),
      },
      {
        name: 'documentNumAndLineNum',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.srcTransactionNumAndLineNum').d('来源事务编号-行号'),
      },
      {
        name: 'itemCode',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.paymentItemCode').d('支付商品编码'),
      },
      {
        name: 'itemName',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.paymentItemName').d('支付商品名称'),
      },
      {
        name: 'payAmount',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.thisPayAmount').d('本次支付金额'),
        type: FieldType.number,
        computedProps: { formatterOptions: amountFormatterOptions },
        dynamicProps: {
          precision: ({ record }) => record.get('amountPrecision'),
        },
      },
      {
        name: 'remark',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.lineRemark').d('行备注'),
      },
      {
        name: 'srmPoNum',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.srmPoNum').d('采购订单编号'),
      },
    ],
    queryParameter: {
      customizeUnitCode: PaymentLineGridCode,
    },
    transport: {
      read: ({ data }): any => {
        const { payHeaderId } = data;
        return {
          url: `${SRM_SBDM}/v1/${getCurrentOrganizationId()}/pay-lines/${payHeaderId}`,
          method: 'GET',
        };
      },
      destroy: ({ dataSet }) => {
        const payHeaderId = dataSet?.parent?.current?.get('payHeaderId');
        return {
          url: `${SRM_SBDM}/v1/${getCurrentOrganizationId()}/pay-lines/${payHeaderId}/cancel`,
          method: 'PUT',
        };
      },
    },
    feedback: {
      submitSuccess: () => { },
    },
  };
};

export const statementLineDS = (): DataSetProps => {
  return {
    // paging: false,
    pageSize: 20,
    autoQuery: false,
    forceValidate: true,
    cacheSelection: true,
    primaryKey: 'statementLineId',
    autoQueryAfterSubmit: false,
    cascadeParams: (record) => record.get(['payHeaderId', 'payForm']),
    fields: [
      {
        name: 'lineNum',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.payDocSettlementLineNum').d('支付单流水行号'),
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
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.payAmount').d('支付金额'),
        type: FieldType.number,
        required: true,
        computedProps: { formatterOptions: amountFormatterOptions },
        dynamicProps: {
          precision: ({ record }) => record.get('amountPrecision'),
        },
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
        name: 'payBankLov',
        type: FieldType.object,
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.purchaseBankName').d('采购方银行名称'),
        lovCode: 'SBSM.COMPANY_BANK_ACCOUNT_PURCHASER',
        textField: 'bankName',
        ignore: FieldIgnore.always,
        transformResponse: (value: any, data: any) => {
          if (isObject(value) || isNil(data)) return value;
          const { payBankId, payBankName, payBankBranchName, payBankFirm, payBankAccountNum, payBankAccountName, bankDirectLinkOrgInfoCode } = data;
          if (isNil(payBankId) || isNil(payBankName)) return null;
          return {
            bankId: payBankId,
            bankName: payBankName,
            bankBranchName: payBankBranchName,
            bankFirm: payBankFirm,
            bankAccountNum: payBankAccountNum,
            bankAccountName: payBankAccountName,
            bankDirectLinkOrgInfoCode,
          };
        },
        dynamicProps: {
          required: ({ record }) => record.cascadeParent?.get('payForm') === 'BANK_CORPORATE_EXPRESS',
          lovPara: ({ record }) => ({
            companyId: record.cascadeParent?.get('companyId'),
            tenantId: getCurrentOrganizationId(),
          }),
        },
      },
      {
        name: 'payBankId',
        bind: 'payBeiInfo.payBankId',
      },
      {
        name: 'payBankName',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.purchaseBankName').d('采购方银行名称'),
        bind: 'payBeiInfo.payBankName',
        dynamicProps: {
          required: ({ record }) => record.cascadeParent?.get('payForm') === 'BANK_CORPORATE_EXPRESS',
        },
      },
      {
        name: 'payBankBranchName',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.purchaseBankBranchName').d('采购方开户行名称'),
        bind: 'payBeiInfo.payBankBranchName',
        dynamicProps: {
          required: ({ record }) => record.cascadeParent?.get('payForm') === 'BANK_CORPORATE_EXPRESS',
        },
      },
      {
        name: 'payBankFirm',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.purchaseBankBranchCode').d('采购方联行行号'),
        bind: 'payBeiInfo.payBankFirm',
        dynamicProps: {
          required: ({ record }) => record.cascadeParent?.get('payForm') === 'BANK_CORPORATE_EXPRESS',
        },
      },
      {
        name: 'payBankAccountNum',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.purchaseBankAccount').d('采购方银行账号'),
        bind: 'payBeiInfo.payBankAccountNum',
        dynamicProps: {
          required: ({ record }) => record.cascadeParent?.get('payForm') === 'BANK_CORPORATE_EXPRESS',
        },
      },
      {
        name: 'payBankAccountName',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.purchaseBankAccountName').d('采购方银行账号名称'),
        bind: 'payBeiInfo.payBankAccountName',
        dynamicProps: {
          required: ({ record }) => record.cascadeParent?.get('payForm') === 'BANK_CORPORATE_EXPRESS',
        },
      },
      {
        name: 'bankDirectLinkOrgInfoCode',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.bankDirectLinkOrgInfoCode').d('银企直联组织信息代码'),
        bind: 'payBeiInfo.bankDirectLinkOrgInfoCode',
        dynamicProps: {
          required: ({ record }) => record.cascadeParent?.get('payForm') === 'BANK_CORPORATE_EXPRESS',
        },
      },
      {
        name: 'bankLov',
        type: FieldType.object,
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.supplierBankName').d('供应商银行名称'),
        lovCode: 'SBSM.COMPANY_BANK_ACCOUNT',
        textField: 'bankName',
        ignore: FieldIgnore.always,
        transformResponse: (value: any, data: any) => {
          if (isObject(value) || isNil(data)) return value;
          const { bankId, bankName, bankBranchName, bankFirm, bankAccountNum, bankAccountName } = data || {};
          if (isNil(bankId) || isNil(bankName)) return null;
          return {
            bankId,
            bankName,
            bankBranchName,
            bankFirm,
            bankAccountNum,
            bankAccountName,
          };
        },
        dynamicProps: {
          required: ({ record }) => record.cascadeParent?.get('payForm') === 'BANK_CORPORATE_EXPRESS',
          lovPara: ({ record }) => {
            return {
              ...(record.cascadeParent?.get([
                'companyId',
                'supplierId',
                'supplierCompanyId',
              ]) || {}),
              tenantId: getCurrentOrganizationId(),
            };
          },
        },
      },
      {
        name: 'bankId',
        bind: 'payBeiInfo.bankId',
      },
      {
        name: 'bankName',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.supplierBankName').d('供应商银行名称'),
        bind: 'payBeiInfo.bankName',
        dynamicProps: {
          required: ({ record }) => record.cascadeParent?.get('payForm') === 'BANK_CORPORATE_EXPRESS',
        },
      },
      {
        name: 'bankBranchName',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.supplierBankBranchName').d('供应商开户行名称'),
        bind: 'payBeiInfo.bankBranchName',
        dynamicProps: {
          required: ({ record }) => record.cascadeParent?.get('payForm') === 'BANK_CORPORATE_EXPRESS',
        },
      },
      {
        name: 'bankFirm',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.supplierBankBranchCode').d('供应商联行行号'),
        bind: 'payBeiInfo.bankFirm',
        dynamicProps: {
          required: ({ record }) => record.cascadeParent?.get('payForm') === 'BANK_CORPORATE_EXPRESS',
        },
      },
      {
        name: 'bankAccountNum',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.supplierBankAccount').d('供应商银行账号'),
        bind: 'payBeiInfo.bankAccountNum',
        dynamicProps: {
          required: ({ record }) => record.cascadeParent?.get('payForm') === 'BANK_CORPORATE_EXPRESS',
        },
      },
      {
        name: 'bankAccountName',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.supplierBankAccountName').d('供应商银行账号名称'),
        bind: 'payBeiInfo.bankAccountName',
        dynamicProps: {
          required: ({ record }) => record.cascadeParent?.get('payForm') === 'BANK_CORPORATE_EXPRESS',
        },
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
      customizeUnitCode: Object.values(StatementLineCodeMap).join(),
    },
    transport: {
      read: ({ data }): any => {
        const { payHeaderId, payForm } = data;
        const urlMap = {
          'BANK_CORPORATE_EXPRESS': `${SRM_SBDM}/v1/${getCurrentOrganizationId()}/pay-statement-lines/bank-info/${payHeaderId}`,
          'BANK_PAPER': `${SRM_SBDM}/v1/${getCurrentOrganizationId()}/pay-statement-lines/bank-paper/${payHeaderId}`,
          'OFFLINE_PAY': `${SRM_SBDM}/v1/${getCurrentOrganizationId()}/pay-statement-lines/list/${payHeaderId}`,
        };
        delete data.payForm;
        return {
          url: urlMap[payForm],
          method: 'GET',
        };
      },
      destroy: ({ dataSet }) => {
        const payHeaderId = dataSet?.parent?.current?.get('payHeaderId');
        return {
          url: `${SRM_SBDM}/v1/${getCurrentOrganizationId()}/pay-statement-lines/${payHeaderId}/delete`,
          method: 'DELETE',
        };
      },
    },
    events: {
      update: ({ name, value, record }) => {
        if (name === 'payBankLov') {
          const { bankId, bankName, bankBranchName, bankFirm, bankAccountNum, bankAccountName, bankDirectLinkOrgInfoCode } = value || {};
          record.set({
            payBankId: bankId,
            payBankName: bankName,
            payBankBranchName: bankBranchName,
            payBankFirm: bankFirm,
            payBankAccountNum: bankAccountNum,
            payBankAccountName: bankAccountName,
            bankDirectLinkOrgInfoCode,
          });
        } else if (name === 'bankLov') {
          const { bankId, bankName, bankBranchName, bankFirm, bankAccountNum, bankAccountName } = value || {};
          record.set({
            bankId,
            bankName,
            bankBranchName,
            bankFirm,
            bankAccountNum,
            bankAccountName,
          });
        }
      },
    },
    feedback: {
      submitSuccess: () => { },
    },
  };
};

export const matchLineDS = (): DataSetProps => {
  return {
    // paging: false,
    pageSize: 20,
    autoQuery: false,
    selection: false,
    autoQueryAfterSubmit: false,
    cascadeParams: (record) => record.get(['payHeaderId']),
    fields: [
      {
        name: 'statementLineNum',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.statementLineNum').d('流水行编号'),
      },
      {
        name: 'matchAmount',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.matchAmount').d('匹配金额'),
        type: FieldType.number,
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'payLineNum',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.matchPayLineNum').d('匹配支付行号'),
      },
      {
        name: 'payNum',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.payTransactionNum').d('支付事务编号'),
      },
      {
        name: 'itemCode',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.paymentItemCode').d('支付商品编码'),
      },
      {
        name: 'itemName',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.paymentItemName').d('支付商品名称'),
      },
      {
        name: 'matchRuleMeaning',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.autoMatchRule').d('自动匹配规则'),
      },
    ],
    queryParameter: {
      customizeUnitCode: MatchLineGridCode,
    },
    transport: {
      read: ({ data }): any => {
        const { payHeaderId, statementLineId } = data;
        if (statementLineId) {
          return {
            url: `${SRM_SBDM}/v1/${getCurrentOrganizationId()}/pay-statement-lines/match-detail/${statementLineId}`,
            method: 'GET',
          };
        } else if (payHeaderId) {
          return {
            url: `${SRM_SBDM}/v1/${getCurrentOrganizationId()}/pay-statement-lines/match/${payHeaderId}`,
            method: 'GET',
          };
        }
      },
    },
  };
};

export const bepResultDS = (): DataSetProps => {
  return {
    // paging: false,
    pageSize: 20,
    autoQuery: false,
    selection: false,
    autoQueryAfterSubmit: false,
    cascadeParams: (record) => record.get(['payHeaderId']),
    fields: [
      {
        name: 'payStatus',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.payStatus').d('支付状态'),
        lookupCode: 'SBSM.BEP_RECORD_STATUS',
      },
      {
        name: 'bepRecordNum',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.bepRecordNum').d('银企支付记录编号'),
      },
      {
        name: 'payCommandNum',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.payInstrucNumber').d('支付指令编号'),
      },
      {
        name: 'statementLineNum',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.payDocSettlementLineNum').d('支付单流水行号'),
      },
      {
        name: 'verificationCode',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.payDocSmsCode').d('支付单短信验证码'),
      },
      {
        name: 'payInitiationDate',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.payInitiationTime').d('发起支付时间'),
        type: FieldType.dateTime,
      },
      {
        name: 'payAmount',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.payAmount').d('支付金额'),
        type: FieldType.number,
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'bepRequestStatus',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.bepRequestStatus').d('支付申请状态'),
        lookupCode: 'SBSM.BEP_REQUEST_STATUS',
      },
      {
        name: 'payFailedReason',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.payResultInfo').d('支付结果信息'),
      },
      {
        name: 'createByName',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.creator').d('创建人'),
      },
      {
        name: 'sdatPayNum',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.bepPayPlatformNum').d('SDAT支付平台单号'),
      },
      {
        name: 'bankSerialNum',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.bankSerialNum').d('银行流水号'),
      },
    ],
    queryParameter: {
      customizeUnitCode: BepResultGridCode,
    },
    transport: {
      read: ({ data }): any => {
        const { payHeaderId } = data;
        return {
          url: `${SRM_SBDM}/v1/${getCurrentOrganizationId()}/pay-bep-records/list/by/${payHeaderId}`,
          method: 'GET',
        };
      },
    },
  };
};


