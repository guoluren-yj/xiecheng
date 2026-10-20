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
      'SSRC.BID_HALL.BARGAIN.HEADER_BUTTONS_NEW', // 头部按钮
      'SSRC.BID_HALL.BARGAIN.ALL_QUOTATION',
      'SSRC.BID_HALL.BARGAIN.QUOTATION_SUPPLIER',
      'SSRC.BID_HALL.BARGAIN.QUOTATION_ITEM',
      'SSRC.BID_HALL.BARGAIN.TABS', // 页签
      'SSRC.BID_HALL.BARGAIN.BASEINFO_FORM', // BASE FORM
      'SSRC.BID_HALL.BARGAIN.CARD_HEADER',
      'SSRC.BID_HALL.BARGAIN.CARD_BASE_INFO',
      'SSRC.BID_HALL.BARGAIN.CARD_QUOTATIONS',
    ],
  })(
    Form.create({ fieldNameProp: null })(
      formatterCollections({ code: ['ssrc.inquiryHall', 'ssrc.common', 'ssrc.supplierQuotation'] })(
        connect(({ inquiryHall, loading }) => ({
          inquiryHall,
          loading: {
            fetchHeaderLoading: loading.effects['inquiryHall/fetchInquiryHeaderDetail'],
            fetchItemLineLoading: loading.effects['inquiryHall/fetchItemLine'],
            fetchBargainSupplierLineLoading:
              loading.effects['inquiryHall/fetchSupplierLineBarginPrice'],
            // fetchAllLineLoading: loading.effects['inquiryHall/fetchAllLine'],
            fetchAloneItemLineLoading: loading.effects['inquiryHall/fetchAloneItemLine'],
            fetchAloneSupplierItemLineLoading:
              loading.effects['inquiryHall/fetchAloneSupplierItemLine'],
            save: loading.effects['inquiryHall/saveInquiryHallFullQuation'],
            submit: loading.effects['inquiryHall/submitInquiryHallFullQuation'],
            latestQuotationSearchLoading: loading.effects['inquiryHall/fetchLatestQuotation'],
            priceComparisonSearchLoading: loading.effects['inquiryHall/fetchLatestQuotation'],
            fetchBarginLadderLevelyTableLoading:
              loading.effects['inquiryHall/fetchBarginLadderLevelyTable'],
            saveBarginLadderLevelLoading: loading.effects['inquiryHall/saveBarginLadderLevel'],
            saveCounterOffersBulkLoading:
              loading.effects['inquiryHall/handleSaveCounterOffersBulk'],
            querySupplierExchangeEditLoading:
              loading.effects['inquiryHall/querySupplierExchangeEdit'],
            saveExchangeEditLoading: loading.effects['inquiryHall/saveExchangeEdit'],
          },
          fetchPriceChartLoading: loading.effects['iinquiryHall/fetchPriceChartsData'],
          fetchQuotationDetailLoading: loading.effects['inquiryHall/fetchQuotationDetail'],
          organizationId: getCurrentOrganizationId(),
          modelName: 'inquiryHall',
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
