import withCustomize from 'srm-front-cuz/lib/h0Customize';
import formatterCollections from 'utils/intl/formatterCollections';
import { connect } from 'dva';
import { noop } from 'lodash';
import { withRouter } from 'dva/router';
import remote from 'hzero-front/lib/utils/remote';

import CombineComponent from '@/routes/components/CombineComponent';
import { BID } from '@/utils/globalVariable';
import { PriceComparison } from './index';

const hocPriceComparison = (NewComponent) => {
  return CombineComponent({
    sourceKey: BID,
  })(
    withCustomize({
      unitCode: [
        'SSRC.BID_HALL.PRICE_COMPARISON.THIS_QUOTATION',
        'SSRC.BID_HALL.PRICE_COMPARISON.TAB_COMPARISON.HEADER_BUTTONS',
        'SSRC.BID_HALL.PRICE_COMPARISON.THIS_QUOTATION_TOTAL',
      ],
    })(
      formatterCollections({
        code: ['ssrc.priceComparison', 'ssrc.common', 'ssrc.inquiryHall', 'scux.ssrc'],
      })(
        connect(({ priceComparison, loading }) => ({
          priceComparison,
          fetchPriceItemLoading:
            loading.effects['priceComparison/fetchPriceComparisonItem'] ||
            loading.effects['priceComparison/fetchPriceComparisonSupplier'],
          savingConfigLoading: loading.effects['priceComparison/savePriceComparisonConfig'],
          fetchQuotationDetailLoading:
            loading.effects['priceComparison/fetchQuotationDetailSideMenu'],
          fetchQuotationDetailDataLoading:
            loading.effects['priceComparison/fetchQuotationDetailData'],
          exportQuotationDetailLoading: loading.effects['priceComparison/exportQuotationDetail'],
          fetchLatestLoading: loading.effects['priceComparison/fetchLatestQuotation'],
          fetchThisQuoteLoading: loading.effects['priceComparison/fetchThisQuoteProcessChart'],
          fetchThisQuoteTableLoading: loading.effects['priceComparison/fetchThisQuoteProcessTable'],
          fetchThisQuoteTotalLoading: loading.effects['priceComparison/fetchThisQuoteTotalTable'],
          fetchHistoryAnalysisLoading:
            loading.effects['priceComparison/fetchHistoryPriceAnalysisChart'],
          fetchHistoryAnalysisTableLoading:
            loading.effects['priceComparison/fetchHistoryPriceAnalysisTable'],
          exportLatestOfferLoading: loading.effects['priceComparison/exportLatestOffer'],
          exportPriceComparisonLoading: loading.effects['priceComparison/exportPriceComparison'],
          exportThisQuoteProcessLoading: loading.effects['priceComparison/exportThisQuoteProcess'],
        }))(
          withRouter(
            formatterCollections({
              code: ['ssrc.priceComparison'],
            })(
              remote(
                {
                  code: 'srm-front-ssrc/priceComparison', // 对应二开模块暴露的Expose的编码， 命名规范：模块编码+功能编码
                  name: 'remote',
                },
                {
                  events: {
                    afterQuerySet() {},
                    addEventListenerRemote() {},
                    fetchQuotationDetailContrast(props) {
                      const { fetchQuotationDetailSideMenu = noop } = props;
                      fetchQuotationDetailSideMenu();
                    },
                    getRemoteExport(props) {
                      const { getExport = noop } = props || {};
                      getExport();
                    },
                    setColumnSelected() {},
                    setHisPriceChart() {},
                  },
                }
                // 默认Expose属性，当没有二开Expose时会走此逻辑
              )(NewComponent)
            )
          )
        )
      )
    )
  );
};

export default hocPriceComparison(PriceComparison);

export { hocPriceComparison, PriceComparison };
