import { noop } from 'lodash';
import { DataToJSON, FieldType } from 'choerodon-ui/dataset/data-set/enum';
import type { DataSetProps } from 'choerodon-ui/dataset/data-set/DataSet';

import intl from 'utils/intl';
import { SRM_SBDM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

import { amountFormatterOptions } from '../../../../utils/utils';
import { ActionMap, ActiveKey, GridCustCodeMap, SearchCustCodeMap } from '../../utils/type';
import { FillPayPoolGridCode, PaymentLineAddCodeMap } from '../../../PaymentWorkbench/utils/type';

export const pendingListDS = (): DataSetProps => listDS(ActiveKey.Pending);

export const listDS = (activeKey: ActiveKey): DataSetProps => {
  return {
    autoQuery: false,
    pageSize: 20,
    cacheSelection: true,
    dataToJSON: DataToJSON.selected,
    autoQueryAfterSubmit: false,
    primaryKey: activeKey === ActiveKey.Error ? 'payErrorId' : 'payId',
    fields: [
      {
        name: 'payNum',
        label: intl.get('sbsm.paymentPool.model.paymentPool.payTransactionNum').d('支付事务编号'),
      },
      {
        name: 'payErrorNum',
        label: intl.get('sbsm.paymentPool.model.paymentPool.payTransactionNum').d('支付事务编号'),
      },
      {
        name: 'documentAndLineNum',
        label: intl.get('sbsm.paymentPool.model.paymentPool.sourceTransactionNumAndLineNum').d('来源事务编号-行号'),
      },
      {
        name: 'companyName',
        label: intl.get('sbsm.paymentPool.model.paymentPool.company').d('公司'),
      },
      {
        name: 'displaySupplierName',
        label: intl.get('sbsm.paymentPool.model.paymentPool.supplier').d('供应商'),
      },
      {
        name: 'currencyCode',
        label: intl.get('sbsm.paymentPool.model.paymentPool.currency').d('币种'),
      },
      {
        name: 'itemCode',
        label: intl.get('sbsm.paymentPool.model.paymentPool.settlementItemCode').d('结算商品编码'),
      },
      {
        name: 'itemName',
        label: intl.get('sbsm.paymentPool.model.paymentPool.settlementItemName').d('结算商品名称'),
      },
      {
        name: 'payAmount',
        label: intl.get('sbsm.paymentPool.model.paymentPool.pendingTotalAmount').d('待支付总金额'),
        type: FieldType.number,
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'payStatus',
        label: intl.get('sbsm.paymentPool.model.paymentPool.paymentStatus').d('支付状态'),
        lookupCode: 'SBSM.PAY_POOL_STATUS',
      },
      {
        name: 'payOccupyAmount',
        label: intl.get('sbsm.paymentPool.model.paymentPool.paymentSubmittedAmount').d('支付单已提交金额'),
        type: FieldType.number,
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'enablePayAmount',
        label: intl.get('sbsm.paymentPool.model.paymentPool.paymentInitiateableAmount').d('支付单可发起金额'),
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
      {
        name: 'payTypeName',
        label: intl.get('sbsm.paymentPool.model.paymentPool.paymentMethod').d('付款方式'),
      },
      {
        name: 'exPaymentDate',
        label: intl.get('sbsm.paymentPool.model.paymentPool.expectedPayDate').d('期望付款日期'),
        type: FieldType.date,
      },
      {
        name: 'errorTypeMeaning',
        label: intl.get('sbsm.paymentPool.model.paymentPool.importFailureType').d('导入失败类型'),
      },
      {
        name: 'errorMsg',
        label: intl.get('sbsm.paymentPool.model.paymentPool.importFailureReason').d('导入失败原因'),
      },
    ],
    queryParameter: {
      action: ActionMap[activeKey],
      customizeUnitCode: [GridCustCodeMap[activeKey], SearchCustCodeMap[activeKey]].join(),
    },
    transport: {
      read: ({ data }) => {
        let url = '';
        const { payHeaderId } = data;
        // 支付单新增行查询
        if (payHeaderId) url = `${SRM_SBDM}/v1/${getCurrentOrganizationId()}/pay-headers/pay-pool/${payHeaderId}`;
        else if (activeKey === 'error') url = `${SRM_SBDM}/v1/${getCurrentOrganizationId()}/pay-pool-errors/list`;
        else url = `${SRM_SBDM}/v1/${getCurrentOrganizationId()}/pay-pools/list`;
        return { url, method: 'GET' };
      },
      submit: ({ dataSet, data }): any => {
        const submitType = dataSet?.getState('submitType');
        const payHeaderId = dataSet?.getQueryParameter('payHeaderId');
        switch (submitType) {
          case 'hold':
            return {
              url: `${SRM_SBDM}/v1/${getCurrentOrganizationId()}/pay-pools/suspend`,
              method: 'PUT',
            };
          case 'revokeHold':
            return {
              url: `${SRM_SBDM}/v1/${getCurrentOrganizationId()}/pay-pools/resume`,
              method: 'PUT',
            };
          case 'return':
            return {
              url: `${SRM_SBDM}/v1/${getCurrentOrganizationId()}/pay-pools/return-back-association`,
              method: 'PUT',
              data: {
                payPoolDTOList: data,
                ...(dataSet?.getState('backParams') || {}),
              },
            };
          case 'createPayDocValidate':
            return {
              url: `${SRM_SBDM}/v1/${getCurrentOrganizationId()}/pay-headers/create/validate`,
              method: 'POST',
              params: { customizeUnitCode: FillPayPoolGridCode },
            };
          case 'createPayDoc':
            return {
              url: `${SRM_SBDM}/v1/${getCurrentOrganizationId()}/pay-headers/create`,
              method: 'POST',
              params: { customizeUnitCode: FillPayPoolGridCode },
            };
          case 'addPayLine': // 支付单新增行
            return {
              url: `${SRM_SBDM}/v1/${getCurrentOrganizationId()}/pay-lines/create/${payHeaderId}`,
              method: 'POST',
              params: { customizeUnitCode: PaymentLineAddCodeMap.Grid },
            };
          case 'createAll':
            return {
              url: `${SRM_SBDM}/v1/${getCurrentOrganizationId()}/pay-headers/create/batch`,
              method: 'GET',
              data: dataSet?.queryDataSet?.current?.toData() || {},
              params: dataSet?.props?.queryParameter || {},
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

export const fillListInfoDS = (): DataSetProps => {
  return {
    autoCreate: true,
    forceValidate: true,
    fields: [
      {
        name: 'backReason',
        label: intl.get('sbsm.paymentPool.model.paymentPool.backReason').d('退回原因'),
      },
    ],
  };
};

export const backTipsListDS = (): DataSetProps => {
  return {
    autoCreate: true,
    forceValidate: true,
    selection: false,
    fields: [
      {
        name: 'payNum',
        label: intl.get('sbsm.paymentPool.model.paymentPool.payTransactionNum').d('支付事务编号'),
      },
      {
        name: 'payStatus',
        label: intl.get('sbsm.paymentPool.model.paymentPool.paymentStatus').d('支付状态'),
        lookupCode: 'SBSM.PAY_POOL_STATUS',
      },
      {
        name: 'documentAndLineNum',
        label: intl.get('sbsm.paymentPool.model.paymentPool.sourceTransactionNumAndLineNum').d('来源事务编号-行号'),
      },
      {
        name: 'companyName',
        label: intl.get('sbsm.paymentPool.model.paymentPool.company').d('公司'),
      },
      {
        name: 'displaySupplierName',
        label: intl.get('sbsm.paymentPool.model.paymentPool.supplier').d('供应商'),
      },
      {
        name: 'payAmount',
        label: intl.get('sbsm.paymentPool.model.paymentPool.pendingTotalAmount').d('待支付总金额'),
        type: FieldType.number,
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'payTypeName',
        label: intl.get('sbsm.paymentPool.model.paymentPool.paymentMethod').d('付款方式'),
      },
    ],
    transport: {
      read: ({ dataSet }) => {
        const payIdList = dataSet?.getState('payIdList') || [];
        return {
          url: `${SRM_SBDM}/v1/${getCurrentOrganizationId()}/pay-pools/associationList`,
          method: 'POST',
          data: { payIdList },
        };
      },
    },
  };
};
