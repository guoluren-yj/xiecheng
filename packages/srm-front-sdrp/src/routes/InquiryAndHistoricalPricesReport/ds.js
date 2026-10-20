import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_DATA_SDRP } from '@/utils/config';

const tenantId = getCurrentOrganizationId();

export default function ReportDs({ customizeUnitCodes }) {
  return {
    pageSize: 20,
    fields: [
      {
        label: intl.get('sdrp.inquiry.model.rfxNum').d('RFX单号'),
        name: 'rfxNum',
      },
      {
        label: intl.get('sdrp.inquiry.model.rfxLineItemNum').d('行号'),
        name: 'rfxLineItemNum',
      },
      {
        label: intl.get('sdrp.inquiry.model.rfxTitle').d('标题'),
        name: 'rfxTitle',
      },
      {
        label: intl.get('sdrp.inquiry.model.rfxStatusMeaning').d('状态'),
        name: 'rfxStatusMeaning',
      },
      {
        label: intl.get('sdrp.inquiry.model.creationDate').d('创建日期'),
        name: 'creationDate',
      },
      {
        label: intl.get('sdrp.inquiry.model.itemCode').d('物料编码'),
        name: 'itemCode',
      },
      {
        label: intl.get('sdrp.inquiry.model.itemName').d('物料名称'),
        name: 'itemName',
      },
      {
        label: intl.get('sdrp.inquiry.model.categoryCode').d('品类编码'),
        name: 'categoryCode',
      },
      {
        label: intl.get('sdrp.inquiry.model.categoryName').d('品类名称'),
        name: 'categoryName',
      },
      {
        label: intl.get('sdrp.inquiry.model.supplierCompanyNum').d('供应商编码'),
        name: 'supplierCompanyNum',
      },
      {
        label: intl.get('sdrp.inquiry.model.supplierCompanyName').d('供应商名称'),
        name: 'supplierCompanyName',
      },
      {
        label: intl.get('sdrp.inquiry.model.companyName').d('公司'),
        name: 'companyName',
      },
      {
        label: intl.get('sdrp.inquiry.model.organizationName').d('采购组织'),
        name: 'organizationName',
      },
      {
        label: intl.get('sdrp.inquiry.model.invOrganizationName').d('库存组织'),
        name: 'invOrganizationName',
      },
      {
        label: intl.get('sdrp.inquiry.model.purchaseAgentName').d('采购员'),
        name: 'purchaseAgentName',
      },
      {
        label: intl.get('sdrp.inquiry.model.realName').d('询价单创建人'),
        name: 'realName',
      },
      {
        label: intl.get('sdrp.inquiry.model.quotationStartDate').d('报价开始时间'),
        name: 'quotationStartDate',
      },
      {
        label: intl.get('sdrp.inquiry.model.quotationEndDate').d('报价截止时间'),
        name: 'quotationEndDate',
      },
      {
        label: intl.get('sdrp.inquiry.model.allottedQuantity').d('需求数量'),
        name: 'rfxQuantity',
      },
      {
        label: intl.get('sdrp.inquiry.model.validQuotationPrice').d('有效报价'),
        name: 'validQuotationPrice',
      },
      {
        label: intl.get('sdrp.inquiry.model.minTaxIncludedPrice').d('订单最低价'),
        name: 'minTaxIncludedPrice',
      },
      {
        label: intl
          .get('sdrp.inquiry.model.minTaxIncludedPriceAndPoNumLineNum')
          .d('订单最低价-来源单号'),
        name: 'minTaxIncludedPriceAndPoNumLineNum',
      },
      {
        label: intl.get('sdrp.inquiry.model.maxTaxIncludedPrice').d('订单最高价'),
        name: 'maxTaxIncludedPrice',
      },
      {
        label: intl
          .get('sdrp.inquiry.model.maxTaxIncludedPriceAndPoNumLineNum')
          .d('订单最高价-来源单号'),
        name: 'maxTaxIncludedPriceAndPoNumLineNum',
      },
      {
        label: intl.get('sdrp.inquiry.model.avgTaxIncludedPrice').d('订单均价'),
        name: 'avgTaxIncludedPrice',
      },
      {
        label: intl.get('sdrp.inquiry.model.domesticTaxIncludedPrice').d('订单最近一次价格'),
        name: 'domesticTaxIncludedPrice',
      },
      {
        label: intl.get('sdrp.inquiry.model.poNumLineNum').d('订单最近一次价格-来源单号'),
        name: 'poNumLineNum',
      },
      {
        label: intl.get('sdrp.inquiry.model.poDiffPrice').d('与订单价格差异'),
        name: 'poDiffPrice',
      },
      {
        label: intl.get('sdrp.inquiry.model.poDiffAmount').d('与订单差异金额'),
        name: 'poDiffAmount',
      },
      {
        label: intl.get('sdrp.inquiry.model.plMinTaxIncludedPrice').d('价格库最低价'),
        name: 'plMinTaxIncludedPrice',
      },
      {
        label: intl.get('sdrp.inquiry.model.plMinPoNumLineNum').d('价格库最低价-来源单号'),
        name: 'plMinPoNumLineNum',
      },
      {
        label: intl.get('sdrp.inquiry.model.plMaxTaxIncludedPrice').d('价格库最高价'),
        name: 'plMaxTaxIncludedPrice',
      },
      {
        label: intl.get('sdrp.inquiry.model.plMaxPoNumLineNum').d('价格库最高价-来源单号'),
        name: 'plMaxPoNumLineNum',
      },
      {
        label: intl.get('sdrp.inquiry.model.plAvgTaxIncludedPrice').d('价格库均价'),
        name: 'plAvgTaxIncludedPrice',
      },
      {
        label: intl.get('sdrp.inquiry.model.taxIncludedPrice').d('价格库最近一次价格'),
        name: 'taxIncludedPrice',
      },
      {
        label: intl.get('sdrp.inquiry.model.plPoNumLineNum').d('价格库最近一次价格-来源单号'),
        name: 'plPoNumLineNum',
      },
      {
        label: intl.get('sdrp.inquiry.model.plDiffPrice').d('与价格库均价差异'),
        name: 'plDiffPrice',
      },
      {
        label: intl.get('sdrp.inquiry.model.plDiffAmount').d('与价格库差异金额'),
        name: 'plDiffAmount',
      },
    ],
    transport: {
      read: ({ params }) => {
        return {
          url: `${SRM_DATA_SDRP}/v1/${tenantId}/price/report/inquiryQuotationPrice`,
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
