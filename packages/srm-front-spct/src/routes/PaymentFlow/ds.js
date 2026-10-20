import intl from 'utils/intl';
import { SRM_SPCT } from '@/utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();
const tableDs = () => ({
  autoQuery: true,
  cacheSelection: true,
  primaryKey: 'transactionSerialNum',
  pageSize: 20,
  fields: [
    {
      label: intl.get('spct.paymentFlow.model.status').d('状态'),
      name: 'statusMeaning',
    },
    {
      label: intl.get('spct.paymentFlow.model.transactionSerialNum').d('支付平台单号'),
      name: 'transactionSerialNum',
    },
    {
      label: intl.get('spct.paymentFlow.model.associatedDocumentNum').d('业务单据号'),
      name: 'merchantOrderNum',
    },
    {
      label: intl.get('spct.paymentFlow.model.channelTradeNo').d('支付渠道交易流水号'),
      name: 'channelTradeNo',
    },
    {
      label: intl.get('spct.paymentFlow.model.transactionTypeMeaning').d('交易类型'),
      name: 'transactionTypeMeaning',
    },
    {
      label: intl.get('spct.paymentFlow.model.amountOfMoney').d('金额'),
      name: 'amount',
    },
    {
      label: intl.get('spct.paymentFlow.model.currency').d('币种'),
      name: 'currencyName',
    },
    {
      label: intl.get('spct.paymentFlow.model.channelCode').d('支付渠道'),
      name: 'channelMeaning',
    },
    {
      label: intl.get('spct.paymentFlow.model.creationTime').d('创建时间'),
      name: 'creationDate',
    },
    {
      label: intl.get('spct.paymentFlow.model.payTagMeaning').d('请求来源'),
      name: 'payTagMeaning',
    },
    {
      label: intl.get('spct.paymentFlow.model.createdByName').d('操作人 ​'),
      name: 'createdByName',
    },
    {
      label: intl.get('spct.paymentFlow.model.lastUpDateDate').d('交易完成时间'),
      name: 'lastUpdateDate',
    },
  ],
  transport: {
    read({ data }) {
      return {
        url: `${SRM_SPCT}/v1/${organizationId}/payment-orders/flow`,
        method: 'GET',
        data: {
          ...data,
          customizeUnitCode: 'SPCT.PAYMENT.FLOW.QUERY.TABLE.INFO',
        },
      };
    },
  },
});

export { tableDs };
