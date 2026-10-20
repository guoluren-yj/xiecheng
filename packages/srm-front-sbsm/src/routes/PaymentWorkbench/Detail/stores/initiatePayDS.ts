import type { DataSet } from 'choerodon-ui/pro';
import { DataToJSON, FieldType } from 'choerodon-ui/dataset/data-set/enum';
import type { DataSetProps } from "choerodon-ui/dataset/data-set/DataSet";

import intl from 'utils/intl';
import { SRM_SBDM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

import { InitiatePayCodeMap } from '../../utils/type';
import { amountFormatterOptions } from '../../../../utils/utils';

export const bepListDS = (topSelected): DataSetProps => {
  return {
    paging: false,
    autoQuery: true,
    selection: false,
    dataToJSON: DataToJSON.all,
    fields: [
      {
        name: 'payHeaderNum',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.payDocNum').d('支付单编号'),
      },
      {
        name: 'payAmount',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.thisPayAmount').d('本次支付金额'),
        type: FieldType.number,
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'currencyCode',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.currency').d('币种'),
      },
      {
        name: 'creationDate',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.initialDate').d('发起日期'),
        type: FieldType.date,
      },
      {
        name: 'payBankAccountNum',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.payerAccountNo').d('付款方账户号码'),
      },
      {
        name: 'payBankAccountName',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.payerAccountName').d('付款方账户名称'),
      },
      {
        name: 'bankAccountName',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.payeeAccountName').d('收款方账户名称'),
      },
    ],
    transport: {
      read: {
        url: `${SRM_SBDM}/v1/${getCurrentOrganizationId()}/pay-statement-lines/pay-bep-confirm/list`,
        method: 'post',
        data: topSelected.map(item => item.key),
        params: { customizeUnitCode: InitiatePayCodeMap.BepGrid },
      },
    },
  };
};

export const verificationDS = (topSelected): DataSetProps => {
  return {
    paging: false,
    autoCreate: true,
    forceValidate: true,
    dataToJSON: DataToJSON.all,
    fields: [
      {
        name: 'verificationCode',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.verificationCode').d('验证码'),
        required: true,
      },
    ],
    transport: {
      submit: ({ data, dataSet }): any => {
        const submitType = dataSet?.getState('submitType');
        const { verificationCode } = data[0] || {};
        if (submitType === 'sendCode') {
          return {
            url: `${SRM_SBDM}/v1/${getCurrentOrganizationId()}/pay-headers/send-captcha`,
            method: 'post',
            data: topSelected.map(item => item.key),
          };
        } else if (submitType === 'initiateBep') {
          return {
            url: `${SRM_SBDM}/v1/${getCurrentOrganizationId()}/pay-headers/initiate/pay-bep`,
            method: 'post',
            data: topSelected.map(item => ({ ...item.toData(), verificationCode })),
            params: { customizeUnitCode: InitiatePayCodeMap.BepGrid },
          };
        }
      },
    },
  };
};

export const offlineListDS = (headerDs: DataSet): DataSetProps => {
  return {
    paging: false,
    autoQuery: true,
    dataToJSON: DataToJSON.all,
    fields: [
      {
        name: 'lineNum',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.statementLineNum').d('流水行编号'),
      },
      {
        name: 'companyName',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.company').d('公司'),
      },
      {
        name: 'displaySupplierName',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.supplier').d('供应商'),
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
        name: 'payStatus',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.payStatus').d('支付状态'),
        lookupCode: 'SBSM.PAY_STATEMENT_STATUS',
        required: true,
      },
    ],
    queryParameter: {
      customizeUnitCode: InitiatePayCodeMap.OfflineGrid,
    },
    transport: {
      read: (): any => {
        const payHeaderId = headerDs.current?.get('payHeaderId');
        if (!payHeaderId) return;
        return {
          url: `${SRM_SBDM}/v1/${getCurrentOrganizationId()}/pay-statement-lines/off-line/${payHeaderId}`,
          method: 'get',
        };
      },
      submit: ({ data, dataSet }): any => {
        const headerData = headerDs.current?.toJSONData();
        return {
          url: `${SRM_SBDM}/v1/${getCurrentOrganizationId()}/pay-headers/offline/confirm`,
          method: 'put',
          data: [{
            ...headerData,
            inputPayStatementLineDTOList: data,
          }],
          params: { customizeUnitCode: dataSet?.getQueryParameter('customizeUnitCode') },
        };
      },
    },
    events: {
      beforeLoad: ({ data }) => {
        data.forEach(item => delete item.payStatus);
      },
    },
  };
};

export const paperListDS = (headerDs: DataSet): DataSetProps => {
  return {
    // paging: false,
    autoQuery: true,
    dataToJSON: DataToJSON.all,
    fields: [
      {
        name: 'lineNum',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.statementLineNum').d('流水行编号'),
      },
      {
        name: 'companyName',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.company').d('公司'),
      },
      {
        name: 'displaySupplierName',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.supplier').d('供应商'),
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
        name: 'paperAmount',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.paperAmount').d('票据金额'),
        type: FieldType.number,
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'payStatus',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.payStatus').d('支付状态'),
        lookupCode: 'SBSM.PAY_STATEMENT_STATUS',
        required: true,
      },
    ],
    queryParameter: {
      customizeUnitCode: InitiatePayCodeMap.PaperGrid,
    },
    transport: {
      read: (): any => {
        const payHeaderId = headerDs.current?.get('payHeaderId');
        if (!payHeaderId) return;
        return {
          url: `${SRM_SBDM}/v1/${getCurrentOrganizationId()}/pay-statement-lines/bank-paper/${payHeaderId}`,
          method: 'get',
        };
      },
      submit: ({ data, dataSet }): any => {
        const headerData = headerDs.current?.toJSONData();
        return {
          url: `${SRM_SBDM}/v1/${getCurrentOrganizationId()}/pay-headers/bank-paper/confirm`,
          method: 'put',
          data: [{
            ...headerData,
            inputPayStatementLineDTOList: data,
          }],
          params: { customizeUnitCode: dataSet?.getQueryParameter('customizeUnitCode') },
        };
      },
    },
    events: {
      beforeLoad: ({ data }) => {
        data.forEach(item => delete item.payStatus);
      },
    },
  };
};

export const batchEditDS = (): DataSetProps => {
  return {
    autoCreate: true,
    forceValidate: true,
    fields: [
      {
        name: 'payStatus',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.payStatus').d('支付状态'),
        lookupCode: 'SBSM.PAY_STATEMENT_STATUS',
      },
    ],
  };
};