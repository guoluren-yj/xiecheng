import { connect } from 'dva';
import { getCurrentOrganizationId, getCurrentUserId } from 'utils/utils';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import formatterCollections from 'utils/intl/formatterCollections';
import CombineComponent from '@/routes/components/CombineComponent';
import { BID } from '@/utils/globalVariable';

import { CheckPrice } from './index';

const HOCComponent = (Comp) => {
  return withCustomize({
    unitCode: [
      'SSRC.NEW_BID_HALL_CHECK_PRICE.TAB_ITEM_DTL',
      'SSRC.NEW_BID_HALL_CHECK_PRICE.TAB_ALL_QUOTATION_DETAIL',
      'SSRC.NEW_BID_HALL_CHECK_PRICE.HEADER_INFO',
      'SSRC.NEW_BID_HALL_CHECK_PRICE.TAB_SUPPLIER',
      'SSRC.NEW_BID_HALL_CHECK_PRICE.COST', // 成本备注
      'SSRC.NEW_BID_HALL_CHECK_PRICE.QUOTATION_BATCH_MAINTAIN_FROM', // 成本备注
      'SSRC.NEW_BID_HALL_CHECK_PRICE.ITEM_LINE_ADD', // 补充物料编码],
      'SSRC.NEW_BID_HALL_CHECK_PRICE.ITEMSINFO_TABS',
      'SSRC.NEW_BID_HALL_CHECK_PRICE.HEADER_COLLAPSE',
      'SSRC.NEW_BID_HALL_CHECK_PRICE.HEAD_BUTTONS', // 头部按钮组
      // 'SSRC.NEW_BID_HALL_CHECK_PRICE.IPCOINCIDENCE_TABLE', // IP重合率表格
    ],
  })(
    formatterCollections({
      code: [
        'ssrc.inquiryHall',
        'ssrc.common',
        'ssrc.expertScoring',
        'ssrc.bidHall',
        'ssrc.queryRfq',
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
};

export default CombineComponent({
  sourceKey: BID,
})(HOCComponent(CheckPrice));
