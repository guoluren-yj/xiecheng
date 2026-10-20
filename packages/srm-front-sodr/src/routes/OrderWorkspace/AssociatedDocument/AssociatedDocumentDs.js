import intl from 'utils/intl';
import { SRM_SPUC, SRM_SSTA, SRM_SLOD } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import { MAX_QUAN_NUMBER } from '@/routes/components/utils/constant';

const organizationId = getCurrentOrganizationId();

// 送货 行
const deliveryDS = (poLineLocationId, deliveryStrategyId) => ({
  selection: false,
  autoLocateFirst: false,
  pageSize: 20,
  fields: [
    {
      name: 'asnNum',
      label: intl.get(`sodr.workspace.common.asnNums`).d('送货单据编号-行号'),
    },
    {
      name: 'displayAsnLineNum',
      label: intl.get(`sodr.workspace.common.displayAsnLineNum`).d('行号'),
    },
    {
      name: 'asnStatusMeaning',
      label: intl.get(`sodr.workspace.common.asnStatusMeaning`).d('送货单据状态'),
    },
    {
      name: 'creationDate',
      label: intl.get(`sodr.workspace.common.asnNumTime`).d('送货单创建时间'),
    },
    {
      name: 'shipQuantity',
      type: 'number',
      label: intl.get(`sodr.workspace.common.shipQuantity`).d('执行数量'),
    },
    {
      name: 'createdUserName',
      label: intl.get('sodr.workspace.common.createdUserName').d('创建人'),
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

// 收货 行
const receiptDS = () => ({
  selection: false,
  pageSize: 20,
  fields: [
    {
      name: 'displayTrxNum',
      label: intl.get(`sodr.workspace.common.displayTrxNums`).d('收货单据编号-行号'),
    },
    {
      name: 'trxLineNum',
      label: intl.get(`sodr.workspace.common.trxLineNum`).d('行号'),
    },
    {
      name: 'rcvStatusMeaning',
      label: intl.get(`sodr.workspace.common.rcvStatusCodeMeaning`).d('收货单据状态'),
    },
    {
      name: 'creationDate',
      label: intl.get(`sodr.workspace.common.trxDate`).d('收货单创建时间'),
    },
    {
      name: 'rcvTrxTypeName',
      label: intl.get(`sodr.workspace.common.rcvTrxTypeName`).d('执行类型'),
    },
    {
      name: 'quantity',
      type: 'number',
      max: MAX_QUAN_NUMBER,
      label: intl.get(`sodr.workspace.common.quantity`).d('执行数量'),
    },
    {
      name: 'createdUserName',
      label: intl.get('sodr.workspace.common.createdUserName').d('创建人'),
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
  pageSize: 20,
  autoLocateFirst: false,
  fields: [
    {
      name: 'billNum',
      label: intl.get(`sodr.workspace.common.accountNums`).d('对账单据编号-行号'),
    },
    {
      name: 'lineNum',
      label: intl.get(`sodr.workspace.common.lineNum`).d('行号'),
    },
    {
      name: 'billStatusMeaning',
      label: intl.get(`sodr.workspace.common.accountStatusMeaning`).d('对账单据状态'),
    },
    {
      name: 'creationDate',
      label: intl.get(`sodr.workspace.common.accountCreationDate`).d('对账单创建时间'),
    },
    {
      name: 'quantity',
      type: 'number',
      max: MAX_QUAN_NUMBER,
      label: intl.get(`sodr.workspace.common.quantity`).d('执行数量'),
    },
    {
      name: 'createdUserName',
      label: intl.get('sodr.workspace.common.createdUserName').d('创建人'),
    },
  ],
  transport: {
    read: () => {
      return {
        url: `${SRM_SSTA}/v1/${organizationId}/bill-lines/purchaser`,
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
      label: intl.get(`sodr.workspace.common.settleHeaderNums`).d('开票单据编号-行号'),
    },
    {
      name: 'lineNum',
      label: intl.get(`sodr.workspace.model.lineNum`).d('行号'),
    },
    {
      name: 'settleStatusMeaning',
      label: intl.get(`sodr.workspace.common.settleStatusMeaning`).d('开票单据状态'),
    },
    {
      name: 'creationDate',
      label: intl.get(`sodr.workspace.common.creationDate`).d('开票单创建时间'),
    },
    {
      name: 'quantity',
      type: 'number',
      max: MAX_QUAN_NUMBER,
      label: intl.get(`sodr.workspace.model.common.quantitys`).d('执行数量'),
    },
    {
      name: 'createdUserName',
      label: intl.get('sodr.workspace.common.createdUserName').d('创建人'),
    },
  ],
  transport: {
    read: () => {
      return {
        url: `${SRM_SSTA}/v1/${organizationId}/settle-lines/purchaser`,
        method: 'GET',
      };
    },
  },
});

// 付款
const paymentDS = ({ poNum, poLineNum }) => ({
  paging: false,
  selection: false,
  autoLocateFirst: false,
  fields: [
    {
      name: 'documentNumAndLine',
      label: intl.get(`sodr.workspace.common.paymentDocumentNumAndLines`).d('结算单编号-行号'),
    },
    {
      name: 'recordStatusMeaning',
      label: intl.get(`sodr.workspace.model.paymentSettleStatus`).d('结算单状态'),
    },
    {
      name: 'paymentAmount',
      label: intl.get(`sodr.workspace.common.paymentAmount`).d('执行金额'),
    },
    {
      name: 'supplierCompanyName',
      label: intl.get(`sodr.workspace.common.paymentSupplierCompanyName`).d('执行供应商'),
    },
    {
      name: 'companyName',
      label: intl.get(`sodr.workspace.model.common.paymentCompanyName`).d('执行公司'),
    },
    {
      name: 'paymentType',
      label: intl.get(`sodr.workspace.model.common.paymentType`).d('付款类型'),
    },
    {
      name: 'paymentDate',
      label: intl.get(`sodr.workspace.model.common.paymentDate`).d('付款日期'),
    },
    {
      name: 'recordSource',
      label: intl.get(`sodr.workspace.model.common.paymentRecordSource`).d('付款来源'),
    },
  ],
  transport: {
    read: () => {
      return {
        url: `${SRM_SSTA}/v1/${organizationId}/settle-sub-records/payment/record/detail`,
        method: 'GET',
        data: {
          poNum,
          poLineNum,
          action: 'PAYMENT',
          customizeUnitCode: 'SODR.WORKSPACE_CHECKCONTECTDOC.PAYMENT_TABLE',
        },
      };
    },
  },
});

const advanceChargeDS = () => ({
  selection: false,
  pageSize: 20,
  fields: [
    {
      name: 'settleHeaderNum',
      label: intl.get('sodr.workspace.model.advanceCharge.settleHeaderNum').d('结算单编号-行号'),
    },
    {
      name: 'settleStatus',
      label: intl.get('sodr.workspace.model.advanceCharge.settleStatus').d('结算单状态'),
    },
    {
      name: 'settleType',
      label: intl.get('sodr.workspace.model.advanceCharge.settleType').d('预付款类型'),
    },
    {
      name: 'prepaymentAmount',
      type: 'currency',
      label: intl.get('sodr.workspace.model.advanceCharge.prepaymentAmount').d('执行金额'),
    },
    {
      name: 'supplierCompanyName',
      label: intl.get('sodr.workspace.model.advanceCharge.supplierCompanyName').d('执行供应商'),
    },
    {
      name: 'companyName',
      label: intl.get('sodr.workspace.model.advanceCharge.companyName').d('执行公司'),
    },
    {
      name: 'settleHeaderCreationDate',
      type: 'date',
      label: intl
        .get('sodr.workspace.model.advanceCharge.settleHeaderCreationDate')
        .d('预付款日期'),
    },
    {
      name: 'createdUserName',
      label: intl.get('sodr.workspace.model.advanceCharge.createdUserName').d('创建人'),
    },
  ],
  queryParameter: {
    customizeUnitCode: 'SODR.WORKSPACE_CHECKCONTECTDOC.ADVANCECHARGE_TABLE',
    settleStatusCodeList:
      'SUBMITED,CONFIRM,CANCELING,SUBMITED_APPROVING,WAIT_SUPPLIER_CANCEL,WAIT_SUPPLIER_CONFIRM,CANCEL_APPROVING,ES_SUBMITED_APPROVING,ES_CANCEL_APPROVING,SYSTEM_SUBMITING,SYSTEM_CONFIRMING,SYSTEM_RETURNING',
  },
  transport: {
    read() {
      return {
        url: `${SRM_SSTA}/v1/${organizationId}/pre-payment-lines-remote/remote/purchaser`,
        method: 'GET',
      };
    },
  },
});

export { deliveryDS, receiptDS, settlementDS, billDS, paymentDS, advanceChargeDS };
