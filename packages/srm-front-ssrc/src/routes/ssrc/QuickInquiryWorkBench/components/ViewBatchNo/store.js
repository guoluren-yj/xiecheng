import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';
import { SRM_SSRC } from '_utils/config';

const tableDS = ({ rfqItemId = '', rfqHeaderId = '' }) => {
  return {
    autoQuery: true,
    primaryKey: 'rfqQuotationId',
    pageSize: 20,
    selection: false,
    fields: [
      {
        name: 'itemCode',
        label: intl.get('ssrc.quickInquiry.model.quickInquiry.itemCode').d('物料编码'),
      },
      {
        name: 'itemName',
        label: intl.get('ssrc.quickInquiry.model.quickInquiry.itemName').d('物料名称'),
      },
      {
        name: 'itemCategoryName',
        label: intl.get('ssrc.quickInquiry.model.quickInquiry.itemCategoryName').d('物料类别名称'),
      },
      {
        label: intl.get(`ssrc.common.model.unit`).d('单位'),
        name: 'secondaryUomName',
      },
      {
        name: 'uomName',
        label: intl.get(`ssrc.common.model.inquiryHall.basicUomName`).d('基本单位'),
      },
      {
        label: intl.get(`ssrc.quickInquiry.model.quickInquiry.targetPriceType`).d('目标单价类型'),
        name: 'targetPriceType',
        lookupCode: 'SFIN.BENCHMARK_PRICE',
      },
      {
        label: intl.get(`ssrc.common.model.targetPrice`).d('目标单价'),
        name: 'secondaryTargetPrice',
        type: 'number',
      },
      {
        name: 'targetPrice',
        label: intl.get(`ssrc.common.model.inquiryHall.basicTargetPrice`).d('基本目标单价'),
        type: 'number',
      },
      {
        name: 'ouName',
        label: intl.get('ssrc.quickInquiry.model.quickInquiry.ouName').d('业务实体'),
      },
      {
        name: 'invOrganizationName',
        label: intl.get('ssrc.quickInquiry.model.quickInquiry.invOrganizationName').d('库存组织'),
      },
      {
        label: intl.get(`ssrc.quickInquiry.model.quickInquiry.taxIncludedPrice`).d('单价（含税）'),
        name: 'localQuotationSecPrice',
        type: 'number',
      },
      {
        label: intl
          .get(`ssrc.quickInquiry.model.quickInquiry.basicTaxIncludedPrice`)
          .d('基本单价（含税）'),
        name: 'localQuotationPrice',
        type: 'number',
      },
      {
        label: intl.get(`ssrc.quickInquiry.model.quickInquiry.netPrice`).d('单价（不含税）'),
        name: 'localNetSecPrice',
        type: 'number',
      },
      {
        label: intl
          .get(`ssrc.quickInquiry.model.quickInquiry.basicNetPrice`)
          .d('基本单价（不含税）'),
        name: 'localNetPrice',
        type: 'number',
      },
      {
        label: intl.get(`ssrc.quickInquiry.model.quickInquiry.ladderInquiry`).d('阶梯报价'),
        name: 'ladderInquiry',
      },
      {
        label: intl.get(`ssrc.quickInquiry.model.quickInquiry.currencyCode`).d('币种'),
        name: 'currencyCode',
      },
      {
        label: intl.get(`ssrc.quickInquiry.model.quickInquiry.tax`).d('税率'),
        name: 'taxRate',
        type: 'number',
      },
      {
        label: intl.get(`ssrc.quickInquiry.model.quickInquiry.exchangeRate`).d('汇率'),
        name: 'exchangeRate',
        type: 'number',
      },
      {
        name: 'supplierCompanyNum',
        label: intl.get('ssrc.quickInquiry.model.quickInquiry.supplierCompanyNum').d('供应商编码'),
      },
      {
        name: 'supplierCompanyName',
        label: intl.get('ssrc.quickInquiry.model.quickInquiry.supplierCompanyName').d('供应商名称'),
      },
      {
        label: intl
          .get(`ssrc.quickInquiry.model.quickInquiry.quotationExpiryDateFrom`)
          .d('报价有效期从'),
        name: 'quotationExpiryDateFrom',
        type: 'date',
      },
      {
        label: intl
          .get(`ssrc.quickInquiry.model.quickInquiry.quotationExpiryDateTo`)
          .d('报价有效期至'),
        name: 'quotationExpiryDateTo',
        type: 'date',
      },
    ],
    transport: {
      read: ({ data, params = {} }) => {
        return {
          url: `${SRM_SSRC}/v1/${getCurrentOrganizationId()}/purchase/quick-rfq-quotations/view/quotation-batchNo`,
          method: 'POST',
          params: {
            ...(data || {}),
            ...(params || {}),
            customizeUnitCode:
              'SSRC.QUICK_INQUIRY.LIST.VIEW_BATCH_NO_LINE,SSRC.QUICK_INQUIRY.LIST.VIEW_BATCH_NO_LINE_FILTER',
          },
          data: { rfqItemId, rfqHeaderId },
        };
      },
    },
    events: {
      query: () => {
        // 若没有rfqHeaderId rfqItemId 阻止查询
        if (!rfqHeaderId || !rfqItemId) return false;
      },
    },
  };
};

export { tableDS };
