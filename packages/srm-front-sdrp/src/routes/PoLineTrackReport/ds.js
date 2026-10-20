import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';

const tenantId = getCurrentOrganizationId();

export default function ReportDs({ customizeUnitCodes }) {
  return {
    // autoQuery: true, // 仅筛选器进行一次查询
    pageSize: 20,
    fields: [
      {
        label: intl.get('sdrp.poLine.model.poNum').d('SRM采购订单编号'),
        name: 'poNum',
      },
      {
        label: intl.get('sdrp.poLine.model.displayPoNum').d('展示订单编号'),
        name: 'displayPoNum',
      },
      {
        label: intl.get('sdrp.poLine.model.orderTypeName').d('采购订单类型'),
        name: 'orderTypeName',
      },
      {
        label: intl.get('sdrp.poLine.model.termName').d('付款条款'),
        name: 'termName',
      },
      {
        label: intl.get('sdrp.poLine.model.sourceBillTypeCodeMeaning').d('来源单据'),
        name: 'sourceBillTypeCodeMeaning',
      },
      {
        label: intl.get('sdrp.poLine.model.poSourcePlatformMeaning').d('来源平台'),
        name: 'poSourcePlatformMeaning',
      },
      {
        label: intl.get('sdrp.poLine.model.headerRemark').d('备注'),
        name: 'headerRemark',
      },
      {
        label: intl.get('sdrp.poLine.model.createdByName').d('创建人'),
        name: 'createdByName',
      },
      {
        label: intl.get('sdrp.poLine.model.unitCode').d('创建人部门编码'),
        name: 'unitCode',
      },
      {
        label: intl.get('sdrp.poLine.model.unitName').d('创建人部门描述'),
        name: 'unitName',
      },
      {
        label: intl.get('sdrp.poLine.model.creationDate').d('创建日期'),
        name: 'creationDate',
      },
      {
        label: intl.get('sdrp.poLine.model.statusCodeMeaning').d('采购订单状态'),
        name: 'statusCodeMeaning',
      },
      {
        label: intl.get('sdrp.poLine.model.syncStatusMeaning').d('同步状态'),
        name: 'syncStatusMeaning',
      },
      {
        label: intl.get('sdrp.poLine.model.companyName').d('公司'),
        name: 'companyName',
      },
      {
        label: intl.get('sdrp.poLine.model.organizationName').d('采购组织'),
        name: 'organizationName',
      },
      {
        label: intl.get('sdrp.poLine.model.supplierName').d('供应商名称'),
        name: 'supplierCompanyName',
      },
      {
        label: intl.get('sdrp.poLine.model.settleSupplierId').d('结算供应商描述'),
        name: 'settleSupplierId',
      },
      {
        label: intl.get('sdrp.poLine.model.purchaseAgentName').d('采购组'),
        name: 'agentName',
      },
      {
        label: intl.get('sdrp.poLine.model.displayLineNum').d('采购订单行项目'),
        name: 'displayLineNum',
      },
      {
        label: intl.get('sdrp.poLine.model.displayStatusMeaning').d('采购订单行项目状态'),
        name: 'displayStatusMeaning',
      },
      {
        label: intl.get('sdrp.poLine.model.freeFlag').d('采购订单行项目免费标识'),
        name: 'freeFlagMeaning',
      },
      {
        label: intl.get('sdrp.poLine.model.projectCategory').d('项目类别'),
        name: 'projectCategory',
      },
      {
        label: intl.get('sdrp.poLine.model.returnedFlag').d('采购订单行项目退货标识'),
        name: 'returnedFlagMeaning',
      },
      {
        label: intl.get('sdrp.poLine.model.promisedDate').d('承诺交货日期'),
        name: 'promiseDeliveryDate',
      },
      {
        label: intl.get('sdrp.poLine.model.accountAssignTypeName').d('账户分配类别'),
        name: 'accountAssignTypeName',
      },
      {
        label: intl.get('sdrp.poLine.model.costCodeName').d('成本中心编号&描述'),
        name: 'costIdForExport',
      },
      {
        label: intl.get('sdrp.poLine.model.wbsCodeName').d('wbs编号&描述'),
        name: 'wbsCodeName',
      },
      {
        label: intl.get('sdrp.poLine.model.itemName').d('物料号'),
        name: 'itemName',
      },
      {
        label: intl.get('sdrp.poLine.model.specifications').d('规格'),
        name: 'specifications',
      },
      {
        label: intl.get('sdrp.poLine.model.model').d('型号'),
        name: 'model',
      },
      {
        label: intl.get('sdrp.poLine.model.eanCode').d('货号'),
        name: 'eanCode',
      },
      {
        label: intl.get('sdrp.poLine.model.l1CategoryName').d('L1品类'),
        name: 'l1CategoryName',
      },
      {
        label: intl.get('sdrp.poLine.model.l2CategoryName').d('L2品类'),
        name: 'l2CategoryName',
      },
      {
        label: intl.get('sdrp.poLine.model.l3CategoryName').d('L3品类'),
        name: 'l3CategoryName',
      },
      {
        label: intl.get('sdrp.poLine.model.quantity').d('行项目数量'),
        name: 'quantity',
      },
      {
        label: intl.get('sdrp.poLine.model.uomName').d('订单单位'),
        name: 'uomName',
      },
      {
        label: intl.get('sdrp.poLine.model.rate').d('税率'),
        name: 'rate',
      },
      {
        label: intl.get('sdrp.poLine.model.unitPriceBatch').d('每（价格单位）'),
        name: 'unitPriceBatch',
      },
      {
        label: intl.get('sdrp.poLine.model.currencyCode').d('行币种'),
        name: 'currencyCode',
      },
      {
        label: intl.get('sdrp.poLine.model.headerCurrencyCode').d('头币种'),
        name: 'headerCurrencyCode',
      },
      {
        label: intl.get('sdrp.poLine.model.unitPrice').d('不含税单价'),
        name: 'unitPrice',
      },
      {
        label: intl.get('sdrp.poLine.model.enteredTaxIncludedPrice').d('含税单价'),
        name: 'enteredTaxIncludedPrice',
      },
      {
        label: intl.get('sdrp.poLine.model.lineAmount').d('不含税行项目金额'),
        name: 'lineAmount',
      },
      {
        label: intl.get('sdrp.poLine.model.taxIncludedLineAmount').d('含税行项目金额'),
        name: 'taxIncludedLineAmount',
      },
      {
        label: intl.get('sdrp.poLine.model.domesticCurrencyCode').d('订单头本位币'),
        name: 'domesticCurrencyCode',
      },
      {
        label: intl.get('sdrp.poLine.model.baseCurrencyCode').d('订单行-本位币'),
        name: 'baseCurrencyCode',
      },
      {
        label: intl.get('sdrp.poLine.model.domesticUnitPrice').d('不含税单价（订单本位币）'),
        name: 'domesticUnitPrice',
      },
      {
        label: intl.get('sdrp.poLine.model.domesticTaxIncludedPrice').d('含税单价（订单本位币）'),
        name: 'domesticTaxIncludedPrice',
      },
      {
        label: intl.get('sdrp.poLine.model.domesticLineAmount').d('不含税行项目金额（订单本位币）'),
        name: 'domesticLineAmount',
      },
      {
        label: intl
          .get('sdrp.poLine.model.domesticTaxIncludedLineAmount')
          .d('含税行项目金额（订单本位币）'),
        name: 'domesticTaxIncludedLineAmount',
      },
      {
        label: intl.get('sdrp.poLine.model.receiveToleranceQuantity').d('交货容差'),
        name: 'receiveToleranceQuantity',
      },
      {
        label: intl.get('sdrp.poLine.model.sumOssrtlQuantity').d('已收货数量'),
        name: 'sumOssrtlQuantity',
      },
      {
        label: intl.get('sdrp.poLine.model.unSumOssrtlQuantity').d('未收货数量'),
        name: 'unSumOssrtlQuantity',
      },
      {
        label: intl.get('sdrp.poLine.model.sumSsslQuantity').d('已发票校验数量'),
        name: 'sumSsslQuantity',
      },
      {
        label: intl.get('sdrp.poLine.model.unSumSsslQuantity').d('未发票校验数量'),
        name: 'unSumSsslQuantity',
      },
      {
        label: intl.get('sdrp.poLine.model.sumSsslTaxIncludedAmount').d('已发票校验金额'),
        name: 'sumSsslTaxIncludedAmount',
      },
      {
        label: intl.get('sdrp.poLine.model.unSumSsslTaxIncludedAmount').d('未发票校验金额'),
        name: 'unSumSsslTaxIncludedAmount',
      },
      {
        label: intl.get('sdrp.poLine.model.submitSumSplPrepaymentAmount').d('已提交预付金额'),
        name: 'submitSumSplPrepaymentAmount',
      },
      {
        label: intl.get('sdrp.poLine.model.sumSplPrepaymentAmount').d('已预付金额'),
        name: 'sumSplPrepaymentAmount',
      },
      {
        label: intl.get('sdrp.poLine.model.sumSplPrepaymentApplyAmount').d('预付已核销金额'),
        name: 'sumSplPrepaymentApplyAmount',
      },
      {
        label: intl.get('sdrp.poLine.model.ssslPaymentAmount').d('已付款金额'),
        name: 'ssslPaymentAmount',
      },
      {
        label: intl.get('sdrp.poLine.model.unSsslPaymentAmount').d('未付款金额'),
        name: 'unSsslPaymentAmount',
      },
      {
        label: intl.get('sdrp.poLine.model.billTaxIncludedAmount').d('已对账金额'),
        name: 'billTaxIncludedAmount',
      },
      {
        label: intl.get('sdrp.poLine.model.unBillTaxIncludedAmount').d('未对账金额'),
        name: 'unBillTaxIncludedAmount',
      },
      {
        label: intl.get('sdrp.poLine.model.sourceNumAndLine').d('寻源单号-行号'),
        name: 'sourceNumAndLine',
      },
      {
        label: intl.get('sdrp.poLine.model.contractNumAndLineNum').d('SRM合同号-行号'),
        name: 'contractNum',
      },
      {
        label: intl.get('sdrp.poLine.model.prNum').d('SRM采购申请号'),
        name: 'displayPrNum',
      },
      {
        label: intl.get('sdrp.poLine.model.prDisplayLineNum').d('SRM采购申请行项目号'),
        name: 'displayPrLineNum',
      },
      {
        label: intl.get('sdrp.poLine.model.requestName').d('申请人'),
        name: 'requestName',
      },
      {
        label: intl.get('sdrp.poLine.model.shipToThirdPartyAddress').d('收货地址'),
        name: 'shipToThirdPartyAddress',
      },
      {
        label: intl.get('sdrp.poLine.model.shipToThirdPartyContact').d('联系人信息'),
        name: 'shipToThirdPartyContact',
      },
      {
        label: intl.get('sdrp.poLine.model.priceSource').d('价格来源'),
        name: 'priceSource',
      },
      {
        label: intl.get('sdrp.poLine.model.priceSourceNumAndLine').d('价格来源单据号-行号'),
        name: 'priceSourceNumAndLine',
      },
      {
        label: intl.get('sdrp.poLine.model.lineRemark').d('备注'),
        name: 'lineRemark',
      },
      {
        label: intl.get('sdrp.poLine.model.needByDate').d('需求日期'),
        name: 'needByDate',
      },
      {
        label: intl.get('sdrp.poLine.model.startDateActive').d('SRM采购协议起始日期'),
        name: 'startDateActive',
      },
      {
        label: intl.get('sdrp.poLine.model.endDateActive').d('SRM采购协议终止日期'),
        name: 'endDateActive',
      },
      {
        label: intl.get('sdrp.poLine.model.assigneeName').d('审批人'),
        name: 'assigneeName',
      },
      {
        label: intl.get('sdrp.poLine.model.ahtEndTime').d('审批日期'),
        name: 'ahtEndTime',
      },
      {
        label: intl.get('sdrp.poLine.model.latestTrxDate').d('最晚到货时间'),
        name: 'latestTrxDate',
      },
      {
        label: intl.get('hzero.common.view.button.defaultDocFlowBtn').d('单据流'),
        name: 'docFlow',
      },
    ],
    transport: {
      read: ({ params }) => {
        return {
          url: `/sdrp/v1/${tenantId}/spuc/report/po-line-track`,
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
