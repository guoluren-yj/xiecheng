import intl from 'utils/intl';
import { SRM_SPUC, SRM_SLOD } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import { MAX_BIGNUMBER_NUMBER } from '@/routes/components/utils/constant';

const organizationId = getCurrentOrganizationId();
// 送货 头
// const headerDeliveryDS = (poLineLocationId, deliveryStrategyId) => ({
//   selection: false,
//   autoLocateFirst: false,
//   fields: [
//     {
//       name: 'netReceivedQuantity',
//       max: MAX_BIGNUMBER_NUMBER,
//       label: intl.get(`slod.orderExecution.common.netReceivedQuantity`).d('总执行数量'),
//     },
//   ],
//   transport: {
//     read: () => {
//       return {
//         url: `${SRM_SPUC}/v1/${organizationId}/asn-lines/${poLineLocationId}/es-asn-lines-new`,
//         method: 'GET',
//       };
//     },
//   },
// });
// 送货 行
const deliveryDS = (poLineLocationId, deliveryStrategyId) => ({
  selection: false,
  autoLocateFirst: false,
  pageSize: 20,
  fields: [
    {
      name: 'asnNum',
      label: intl.get(`slod.orderExecution.common.asnNum`).d('送货单据编号|行号'),
    },
    {
      name: 'displayAsnLineNum',
      label: intl.get(`slod.orderExecution.common.displayAsnLineNum`).d('行号'),
    },
    {
      name: 'asnStatusMeaning',
      label: intl.get(`slod.orderExecution.common.asnStatusMeaning`).d('送货单据状态'),
    },
    {
      name: 'creationDate',
      type: 'dateTime',
      label: intl.get(`slod.orderExecution.common.asnNumTime`).d('送货单创建时间'),
    },
    {
      name: 'shipQuantity',
      type: 'number',
      label: intl.get(`slod.orderExecution.common.shipQuantity`).d('执行数量'),
    },
    {
      name: 'createdUserName',
      label: intl.get('slod.orderExecution.common.createdUserName').d('创建人'),
    },
  ],
  transport: {
    read: () => {
      return {
        url: deliveryStrategyId
          ? `${SRM_SLOD}/v1/${organizationId}/delivery/asn/link-line/po/${poLineLocationId}`
          : `${SRM_SPUC}/v1/${organizationId}/asn-lines/${poLineLocationId}/es-asn-lines-new`,
        method: 'GET',
        transformResponse: (data) => {
          const formatData = JSON.parse(data);
          return formatData?.asnDetailLineVOS
            ? {
                ...formatData.asnDetailLineVOS,
                netReceivedQuantity: formatData.netReceivedQuantity,
              }
            : formatData;
        },
      };
    },
  },
});
// 收货 头
const headerReceiptDS = () => ({
  selection: false,
  fields: [
    {
      name: 'netReceivedQuantity',
      max: MAX_BIGNUMBER_NUMBER,
      label: intl.get(`slod.orderExecution.common.netReceivedQuantity`).d('总执行数量'),
    },
  ],
  transport: {
    read: ({ dataSet }) => {
      const {
        queryParameter: { poLineLocationId },
      } = dataSet;
      return {
        url: `${SRM_SPUC}/v1/${organizationId}/rcv-trx-line/po-rcv-records-new?poLineLocationId=${poLineLocationId}`,
        method: 'POST',
      };
    },
  },
});
// 收货 行
const receiptDS = () => ({
  pageSize: 20,
  selection: false,
  fields: [
    {
      name: 'displayTrxNum',
      label: intl.get(`slod.orderExecution.common.displayTrxNum`).d('收货单据编号|行号'),
    },
    {
      name: 'trxLineNum',
      label: intl.get(`slod.orderExecution.common.trxLineNum`).d('行号'),
    },
    {
      name: 'rcvStatusMeaning',
      label: intl.get(`slod.orderExecution.common.rcvStatusCodeMeaning`).d('收货单据状态'),
    },
    {
      name: 'creationDate',
      type: 'dateTime',
      label: intl.get(`slod.orderExecution.common.trxDate`).d('收货单创建时间'),
    },
    {
      name: 'rcvTrxTypeName',
      label: intl.get(`sodr.workspace.common.rcvTrxTypeName`).d('执行类型'),
    },
    {
      name: 'quantity',
      type: 'number',
      max: MAX_BIGNUMBER_NUMBER,
      label: intl.get(`slod.orderExecution.common.quantity`).d('执行数量'),
    },
    {
      name: 'createdUserName',
      label: intl.get('slod.orderExecution.common.createdUserName').d('创建人'),
    },
  ],
  transport: {
    read: ({ dataSet }) => {
      const {
        queryParameter: { poLineLocationId },
      } = dataSet;
      return {
        url: `${SRM_SPUC}/v1/${organizationId}/rcv-trx-line/po-rcv-records-new?poLineLocationId=${poLineLocationId}`,
        method: 'POST',
        transformResponse: (data) => {
          const dataJson = JSON.parse(data)?.poRcvRecordsDTOS;
          return dataJson;
        },
      };
    },
  },
});
// 对账
const settlementDS = () => ({
  selection: false,
  autoLocateFirst: false,
  pageSize: 20,
  fields: [
    {
      name: 'billNum',
      label: intl.get(`slod.orderExecution.common.accountNum`).d('对账单据编号|行号'),
    },
    {
      name: 'lineNum',
      label: intl.get(`slod.orderExecution.common.lineNum`).d('行号'),
    },
    {
      name: 'billStatusMeaning',
      label: intl.get(`slod.orderExecution.common.accountStatusMeaning`).d('对账单据状态'),
    },
    {
      name: 'creationDate',
      type: 'dateTime',
      label: intl.get(`slod.orderExecution.common.accountCreationDate`).d('对账单创建时间'),
    },
    {
      name: 'quantity',
      type: 'number',
      max: MAX_BIGNUMBER_NUMBER,
      label: intl.get(`slod.orderExecution.common.quantity`).d('执行数量'),
    },
    {
      name: 'createdUserName',
      label: intl.get('slod.orderExecution.common.createdUserName').d('创建人'),
    },
  ],
  transport: {
    read: () => {
      return {
        url: `/ssta/v1/${organizationId}/bill-lines/supplier`,
        method: 'GET',
      };
    },
  },
});
// 开票
const billDS = () => ({
  selection: false,
  pageSize: 20,
  autoLocateFirst: false,
  fields: [
    {
      name: 'settleHeaderNum',
      label: intl.get(`slod.orderExecution.common.settleHeaderNum`).d('开票单据编号|行号'),
    },
    {
      name: 'lineNum',
      label: intl.get(`slod.orderExecution.model.lineNum`).d('行号'),
    },
    {
      name: 'settleStatusMeaning',
      label: intl.get(`slod.orderExecution.common.settleStatusMeaning`).d('开票单据状态'),
    },
    {
      name: 'creationDate',
      type: 'dateTime',
      label: intl.get(`slod.orderExecution.common.creationDate`).d('开票单创建时间'),
    },
    {
      name: 'quantity',
      type: 'number',
      max: MAX_BIGNUMBER_NUMBER,
      label: intl.get(`slod.orderExecution.model.common.quantitys`).d('执行数量'),
    },
    {
      name: 'createdUserName',
      label: intl.get('slod.orderExecution.common.createdUserName').d('创建人'),
    },
  ],
  transport: {
    read: () => {
      return {
        url: `/ssta/v1/${organizationId}/settle-lines/supplier`,
        method: 'GET',
      };
    },
  },
});
export { deliveryDS, headerReceiptDS, receiptDS, settlementDS, billDS };
