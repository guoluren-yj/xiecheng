import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_DATA_SDRP } from '@/utils/config';

const organizationId = getCurrentOrganizationId();

export default function ReportDs({ customizeUnitCodes }) {
  return {
    autoQuery: false,
    pageSize: 20,
    fields: [
      {
        label: intl.get('sdrp.settleReconciliation.model.billStatusMeaning').d('对账状态'),
        name: 'billStatusMeaning',
      },
      {
        label: intl.get('sdrp.settleReconciliation.model.ecStatementsCode').d('电商对账单编码'),
        name: 'ecStatementsCode',
      },
      {
        label: intl.get('sdrp.settleReconciliation.model.autoBillNum').d('结算对账记录编码'),
        name: 'autoBillNum',
      },
      {
        label: intl.get('sdrp.settleReconciliation.model.statementsAmount').d('电商对账单含税金额'),
        name: 'statementsAmount',
      },
      {
        label: intl
          .get('sdrp.settleReconciliation.model.taxIncludedAmount')
          .d('结算对账记录含税金额'),
        name: 'taxIncludedAmount',
      },
      {
        label: intl.get('sdrp.settleReconciliation.model.explain').d('说明'),
        name: 'explain',
      },
      {
        label: intl
          .get('sdrp.settleReconciliation.model.currentProcessingService')
          .d('当前处理服务'),
        name: 'currentProcessingService',
      },
      {
        label: intl.get('sdrp.settleReconciliation.model.validityStatusMeaning').d('商城账单状态'),
        name: 'statementsStatusMeaning',
      },
      {
        label: intl
          .get('sdrp.settleReconciliation.model.invoiceBillStatusMeaning')
          .d('结算账单状态'),
        name: 'invoiceBillStatusMeaning',
      },
      {
        label: intl.get('sdrp.settleReconciliation.model.cecFromCodeMeaning').d('来源电商'),
        name: 'cecFromCodeMeaning',
      },
      {
        label: intl.get('sdrp.settleReconciliation.model.statementsTime').d('账单推送时间'),
        name: 'statementsTime',
      },
      {
        label: intl.get('sdrp.settleReconciliation.model.companyName').d('对账公司'),
        name: 'companyName',
      },
      {
        label: intl.get('sdrp.settleReconciliation.model.supplierName').d('对账供应商'),
        name: 'supplierName',
      },
    ],
    transport: {
      read: ({ params }) => {
        return {
          url: `${SRM_DATA_SDRP}/v1/${organizationId}/e-commerce/report/settle-reconciliation`,
          method: 'GET',
          params: {
            ...params,
            customizeUnitCode: customizeUnitCodes.join(','),
          },
        };
      },
    },
  };
}

export const ReportDetailDs = ({ autoBillNum }) => {
  return {
    autoQuery: true,
    pageSize: 20,
    selection: false,
    fields: [
      {
        label: intl.get('sdrp.settleReconciliation.model.detail.autoBillNum').d('结算对账记录编码'),
        name: 'autoBillNum',
      },
      {
        label: intl
          .get('sdrp.settleReconciliation.model.detail.autoBillStatusMeaning')
          .d('对账状态'),
        name: 'autoBillStatusMeaning',
      },
      {
        label: intl
          .get('sdrp.settleReconciliation.model.detail.billStatusMeaning')
          .d('自动核对结果'),
        name: 'billStatusMeaning',
      },
      {
        label: intl.get('sdrp.settleReconciliation.model.detail.billRemark').d('对账意见'),
        name: 'billRemark',
      },
      {
        label: intl.get('sdrp.settleReconciliation.model.detail.asnNum').d('电商送货单编号|行号'),
        name: 'asnNum',
      },
      {
        label: intl.get('sdrp.settleReconciliation.model.detail.ecPoSubNum').d('电商子订单编号'),
        name: 'ecPoSubNum',
      },
      {
        label: intl.get('sdrp.settleReconciliation.model.detail.itemCode').d('结算商品编码'),
        name: 'itemCode',
      },
      {
        label: intl.get('sdrp.settleReconciliation.model.detail.itemName').d('结算商品名称'),
        name: 'itemName',
      },
      {
        label: intl
          .get('sdrp.settleReconciliation.model.detail.taxIncludedAmount')
          .d('电商子订单含税金额'),
        name: 'taxIncludedAmount',
      },
      {
        label: intl.get('sdrp.settleReconciliation.model.detail.billOccupiedNums').d('对账单编号'),
        name: 'billOccupiedNums',
      },
      {
        label: intl.get('sdrp.settleReconciliation.model.detail.settleNum').d('结算事务编号'),
        name: 'settleNum',
      },
      {
        label: intl
          .get('sdrp.settleReconciliation.model.detail.sourceSettleNum')
          .d('结算事务来源编号|行号'),
        name: 'sourceSettleNum',
      },
    ],
    transport: {
      read: ({ params }) => {
        return {
          url: `${SRM_DATA_SDRP}/v1/${organizationId}/e-commerce/report/settle-reconciliation/detail`,
          method: 'GET',
          params: {
            ...params,
            autoBillNum,
          },
        };
      },
    },
  };
};
