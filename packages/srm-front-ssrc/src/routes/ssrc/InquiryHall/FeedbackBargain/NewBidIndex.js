import { connect } from 'dva';
import { getCurrentOrganizationId } from 'utils/utils';
import { Form } from 'hzero-ui';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
// import mixCustomize from 'srm-front-cuz/lib/mixCustomize';
import remote from 'hzero-front/lib/utils/remote';
import formatterCollections from 'utils/intl/formatterCollections';
import CombineComponent from '@/routes/components/CombineComponent';
import { BID } from '@/utils/globalVariable';

import { FeedbackBargain } from './index';

const HOCComponent = (Comp) => {
  return withCustomize({
    unitCode: [
      'SSRC.BID_HALL.BARGAIN.HEADER_BUTTONS', // 头部按钮
      'SSRC.BID_HALL.BARGAIN.ALL_QUOTATION',
      'SSRC.BID_HALL.BARGAIN.QUOTATION_SUPPLIER',
      'SSRC.BID_HALL.BARGAIN.QUOTATION_ITEM',
      'SSRC.BID_HALL.BARGAIN.TABS', // 页签
      'SSRC.BID_HALL.BARGAIN.BASEINFO_FORM', // BASE FORM
      'SSRC.BID_HALL.BARGAIN.CARD_HEADER',
      'SSRC.BID_HALL.BARGAIN.CARD_BASE_INFO',
      'SSRC.BID_HALL.BARGAIN.CARD_QUOTATIONS',
    ],
    // c7nUnit: [
    //   'SSRC.BID_HALL.BARGAIN.CARD_HEADER',
    //   'SSRC.BID_HALL.BARGAIN.CARD_BASE_INFO',
    //   'SSRC.BID_HALL.BARGAIN.CARD_QUOTATIONS',
    // ],
  })(
    Form.create({ fieldNameProp: null })(
      formatterCollections({ code: ['ssrc.inquiryHall', 'ssrc.common', 'ssrc.supplierQuotation'] })(
        connect(({ inquiryHallBid, loading }) => ({
          inquiryHallBid,
          inquiryHall: inquiryHallBid,
          loading: {
            fetchHeaderLoading: loading.effects['inquiryHallBid/fetchInquiryHeaderDetail'],
            fetchItemLineLoading: loading.effects['inquiryHallBid/fetchItemLine'],
            fetchBargainSupplierLineLoading:
              loading.effects['inquiryHallBid/fetchSupplierLineBarginPrice'],
            fetchAllLineLoading: loading.effects['inquiryHallBid/fetchAllLine'],
            fetchAloneItemLineLoading: loading.effects['inquiryHallBid/fetchAloneItemLine'],
            fetchAloneSupplierItemLineLoading:
              loading.effects['inquiryHallBid/fetchAloneSupplierItemLine'],
            save: loading.effects['inquiryHallBid/saveInquiryHallFullQuation'],
            submit: loading.effects['inquiryHallBid/submitInquiryHallFullQuation'],
            latestQuotationSearchLoading: loading.effects['inquiryHallBid/fetchLatestQuotation'],
            priceComparisonSearchLoading: loading.effects['inquiryHallBid/fetchLatestQuotation'],
            fetchBarginLadderLevelyTableLoading:
              loading.effects['inquiryHallBid/fetchBarginLadderLevelyTable'],
            saveBarginLadderLevelLoading: loading.effects['inquiryHallBid/saveBarginLadderLevel'],
            saveCounterOffersBulkLoading:
              loading.effects['inquiryHallBid/handleSaveCounterOffersBulk'],
            querySupplierExchangeEditLoading:
              loading.effects['inquiryHallBid/querySupplierExchangeEdit'],
            saveExchangeEditLoading: loading.effects['inquiryHallBid/saveExchangeEdit'],
          },
          fetchPriceChartLoading: loading.effects['inquiryHallBid/fetchPriceChartsData'],
          fetchQuotationDetailLoading: loading.effects['inquiryHallBid/fetchQuotationDetail'],
          organizationId: getCurrentOrganizationId(),
          modelName: 'inquiryHallBid',
        }))(
          remote(
            // 二开项目埋点，目前使用的项目【卫龙】！！！
            {
              code: 'SSRC_FEEDBACKBARGIN', // 对应二开模块暴露的Expose的编码， 命名规范：模块编码+功能编码
              name: 'ssrcRemote', // 默认 'remote'， 如有属性冲突可以改此属性
            }
          )(Comp)
        )
      )
    )
  );
};

export default CombineComponent({
  sourceKey: BID,
})(HOCComponent(FeedbackBargain));
