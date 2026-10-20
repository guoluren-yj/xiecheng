import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_DATA_SDRP } from '@/utils/config';

const tenantId = getCurrentOrganizationId();

export default function ReportDs({ customizeUnitCodes }) {
  return {
    // autoQuery: true,//仅筛选器进行一次查询
    // selection: false,
    pageSize: 20,
    fields: [
      {
        label: intl.get('sdrp.arrivalWork.model.orderTypeMeaning').d('来源单据类型'),
        name: 'orderTypeName',
      },
      {
        label: intl.get('sdrp.arrivalWork.model.sourceStatusMeaning').d('状态'),
        name: 'rcvStatusCodeMeaning',
      },
      {
        label: intl.get('sdrp.arrivalWork.model.orderStatus').d('收货节点'),
        name: 'nodeConfigName',
      },
      {
        label: intl.get('sdrp.arrivalWork.model.returnedFlag').d('收货/退货'),
        name: 'returnedFlagMeaning',
      },
      {
        label: intl.get('sdrp.arrivalWork.model.buyer').d('收货类型'),
        name: 'rcvTypeName',
      },
      {
        label: intl.get('sdrp.arrivalWork.model.billMatchedFlag').d('对账状态'),
        name: 'billMatchedFlag',
      },
      {
        label: intl.get('sdrp.arrivalWork.model.invoiceMatchedStatus').d('开票状态'),
        name: 'invoiceMatchedStatus',
      },
      {
        label: intl.get('sdrp.arrivalWork.model.paymentStatusMeaning').d('付款状态'),
        name: 'paymentStatus',
      },
      {
        label: intl.get('sdrp.arrivalWork.model.remark').d('采购方行备注'),
        name: 'remark',
      },
      {
        label: intl.get('sdrp.arrivalWork.model.ossphPcNum').d('来源协议号-行号'),
        name: 'fromPcHeaderAndLineNum',
      },
      {
        label: intl.get('sdrp.arrivalWork.model.soruceOsphDisplayPoNum').d('来源订单号-行号'),
        name: 'fromDisplayPoHeaderAndLineNum',
      },
      {
        label: intl.get('sdrp.arrivalWork.model.companyName').d('公司'),
        name: 'companyName',
      },
      {
        label: intl.get('sdrp.arrivalWork.model.supplierName').d('供应商'),
        name: 'supplierCompanyName',
      },
      {
        label: intl.get('sdrp.arrivalWork.model.sinvNumLineNum').d('接收单号'),
        name: 'displayTrxHeaderAndLineNum',
      },
      {
        label: intl.get('sdrp.arrivalWork.model.itemId').d('物料编码'),
        name: 'itemCode',
      },
      {
        label: intl.get('sdrp.arrivalWork.model.itemName').d('物料名称'),
        name: 'itemName',
      },
      {
        label: intl.get('sdrp.arrivalWork.model.uomName').d('单位'),
        name: 'uomName',
      },
      {
        label: intl.get('sdrp.arrivalWork.model.quantity').d('执行数量'),
        name: 'quantity',
      },
      {
        label: intl.get('sdrp.arrivalWork.model.needByDate').d('需求日期'),
        name: 'needByDate',
      },
      {
        label: intl.get('sdrp.arrivalWork.model.trxDate').d('实际操作日期'),
        name: 'trxDate',
      },
      {
        label: intl.get('sdrp.arrivalWork.model.differenceDeliveryDays').d('到货天数差异'),
        name: 'differenceDeliveryDays',
      },

      {
        label: intl.get('sdrp.arrivalWork.model.netPrice').d('单价（无税）'),
        name: 'netPrice',
      },
      {
        label: intl.get('sdrp.arrivalWork.model.taxRate').d('税率'),
        name: 'taxRate',
      },
      {
        label: intl.get('sdrp.arrivalWork.model.taxIncludedPrice').d('单价（含税）'),
        name: 'taxIncludedPrice',
      },
      {
        label: intl.get('sdrp.arrivalWork.model.taxIncludedAmount').d('执行金额(含税)'),
        name: 'taxIncludedAmount',
      },
      {
        label: intl.get('sdrp.arrivalWork.model.sumOssrtlQuantity').d('已收货数量'),
        name: 'sumOssrtlQuantity',
      },
      {
        label: intl.get('sdrp.arrivalWork.model.unSumOssrtlQuantity').d('未收货数量'),
        name: 'unSumOssrtlQuantity',
      },
      {
        label: intl.get('sdrp.arrivalWork.model.sumSsslQuantity').d('已发票校验数量'),
        name: 'sumSsslQuantity',
      },
      {
        label: intl.get('sdrp.arrivalWork.model.unSumSsslQuantity').d('未发票校验数量'),
        name: 'unSumSsslQuantity',
      },
      {
        label: intl.get('sdrp.arrivalWork.model.sumSsslTaxIncludedAmount').d('已发票校验金额'),
        name: 'sumSsslTaxIncludedAmount',
      },
      {
        label: intl.get('sdrp.arrivalWork.model.unSumSsslTaxIncludedAmount').d('未发票校验金额'),
        name: 'unSumSsslTaxIncludedAmount',
      },
      {
        label: intl.get('sdrp.arrivalWork.model.ssslPaymentAmount').d('已付款金额'),
        name: 'ssslPaymentAmount',
      },
      {
        label: intl.get('sdrp.arrivalWork.model.unSsslPaymentAmount').d('未付款金额'),
        name: 'unSsslPaymentAmount',
      },
    ],
    transport: {
      read: ({ params }) => {
        return {
          url: `${SRM_DATA_SDRP}/v1/${tenantId}/spuc/report/sinv-goods-arrive`,
          method: 'GET',
          params: {
            ...params,
            tenantId,
            customizeUnitCode: customizeUnitCodes.join(','),
          },
        };
      },
    },
  };
}
