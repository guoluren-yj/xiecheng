/**
 * 对于标准组件的高阶进行再一次封装 - 适用于二开高阶
 * 返回高阶修饰后的标准组件
 */
import { connect } from 'dva';

import withCustomize from 'srm-front-cuz/lib/h0Customize';
import formatterCollections from 'utils/intl/formatterCollections';
import { getCurrentOrganizationId, getCurrentUserId } from 'utils/utils';

export function withStandardCompEnhancer(Comp) {
  const HOCComponent = withCustomize({
    unitCode: [
      'SSRC.INQUIRY_HALL_CHECK_PRICE.TAB_ITEM_DTL',
      'SSRC.INQUIRY_HALL_CHECK_PRICE.TAB_ALL_QUOTATION_DETAIL',
      'SSRC.INQUIRY_HALL_CHECK_PRICE.HEADER_INFO',
      'SSRC.INQUIRY_HALL_CHECK_PRICE.TAB_SUPPLIER',
      'SSRC.INQUIRY_HALL_CHECK_PRICE.COST', // 成本备注
      'SSRC.INQUIRY_HALL_CHECK_PRICE.QUOTATION_BATCH_MAINTAIN_FROM', // 成本备注
      'SSRC.INQUIRY_HALL_CHECK_PRICE.ITEM_LINE_ADD', // 补充物料编码],
      'SSRC.INQUIRY_HALL_CHECK_PRICE.ITEMSINFO_TABS',
      'SSRC.INQUIRY_HALL_CHECK_PRICE.HEADER_COLLAPSE',
      'SSRC.INQUIRY_HALL_CHECK_PRICE.HEAD_BUTTONS', // 头部按钮组
      // 'SSRC.INQUIRY_HALL_CHECK_PRICE.IPCOINCIDENCE_TABLE', // IP重合率表格
    ],
  })(
    formatterCollections({
      code: [
        'ssrc.inquiryHall',
        'ssrc.common',
        'ssrc.expertScoring',
        'ssrc.bidHall',
        'ssrc.queryRfq',
        'inquryHall',
      ],
    })(
      connect(({ inquiryHall, priceComparison, loading }) => ({
        inquiryHall,
        priceComparison,
        allLoading:
          loading.effects['inquiryHall/saveCheckPrice'] ||
          loading.effects['inquiryHall/submitCheckPrice'] ||
          loading.effects['inquiryHall/checkPriceSectionSubmitValidate'] ||
          loading.effects['inquiryHall/validateBeforeSubmit'] ||
          loading.effects['inquiryHall/fetchInquiryHeaderDetail'],
        fetchHeaderLoading: loading.effects['inquiryHall/fetchInquiryHeaderDetail'],
        fetchItemLineLoading: loading.effects['inquiryHall/fetchItemLine'],
        fetchSupplierLineLoading: loading.effects['inquiryHall/fetchSupplierLineCheckPrice'],
        fetchQuoteLineLoading: loading.effects['inquiryHall/fetchQuoteLine'],
        // saveCheckPriceLoading: loading.effects['inquiryHall/saveCheckPrice'], // 合并loading性能 会优于 单个拆分loading, 前提是二者共同控制
        // submitCheckPriceLoading: loading.effects['inquiryHall/submitCheckPrice'],
        fetchLadderLevelTableLoading: loading.effects['inquiryHall/fetchLadderLevelTable'],
        fetchPriceChartLoading: loading.effects['inquiryHall/fetchPriceChartsData'],
        fetchIPCoincidenceRateLoading: loading.effects['inquiryHall/fetchIPCoincidenceRate'],
        beginRoundQuotationLoading: loading.effects['inquiryHall/beginRoundQuotation'],
        querySupplierExchangeEditLoading: loading.effects['inquiryHall/querySupplierExchangeEdit'],
        saveExchangeEditLoading: loading.effects['inquiryHall/saveExchangeEdit'],
        changeCheckWayLoading: loading.effects['inquiryHall/changeRfxDetailLayout'],
        batchMaintainQuotateLineLoading:
          loading.effects['inquiryHall/batchMaintainItemQuotationLine'],
        fetchQueryPriceInfoLoading: loading.effects['inquiryHall/fetchQueryPriceInfo'],
        organizationId: getCurrentOrganizationId(),
        userId: getCurrentUserId(),
      }))(Comp)
    )
  );
  return HOCComponent;
}
