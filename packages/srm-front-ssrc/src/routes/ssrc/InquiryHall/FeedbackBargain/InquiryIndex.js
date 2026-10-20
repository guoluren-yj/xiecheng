import { connect } from 'dva';
import { getCurrentOrganizationId } from 'utils/utils';
import { Form } from 'hzero-ui';
import remote from 'hzero-front/lib/utils/remote';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
// import mixCustomize from 'srm-front-cuz/lib/mixCustomize';

import formatterCollections from 'utils/intl/formatterCollections';
import CombineComponent from '@/routes/components/CombineComponent';
import { INQUIRY } from '@/utils/globalVariable';

import { FeedbackBargain } from './index';

const HOCComponent = (Comp) => {
  return withCustomize({
    unitCode: [
      'SSRC.INQUIRY_HALL.BARGAIN.HEADER_BUTTONS', // 头部按钮组
      'SSRC.INQUIRY_HALL.BARGAIN.ALL_QUOTATION',
      'SSRC.INQUIRY_HALL.BARGAIN.QUOTATION_SUPPLIER',
      'SSRC.INQUIRY_HALL.BARGAIN.QUOTATION_ITEM',
      'SSRC.INQUIRY_HALL.BARGAIN.TABS', // 页签
      'SSRC.INQUIRY_HALL.BARGAIN.BASEINFO_FORM', // BASE FORM
      'SSRC.INQUIRY_HALL.BARGAIN.CARD_HEADER',
      'SSRC.INQUIRY_HALL.BARGAIN.CARD_BASE_INFO',
      'SSRC.INQUIRY_HALL.BARGAIN.CARD_QUOTATIONS',
    ],
  })(
    Form.create({ fieldNameProp: null })(
      formatterCollections({ code: ['ssrc.inquiryHall', 'ssrc.common', 'ssrc.supplierQuotation'] })(
        connect(({ inquiryHallNew, loading }) => ({
          inquiryHallNew,
          inquiryHall: inquiryHallNew,
          loading: {
            fetchHeaderLoading: loading.effects['inquiryHallNew/fetchInquiryHeaderDetail'],
            fetchItemLineLoading: loading.effects['inquiryHallNew/fetchItemLine'],
            fetchBargainSupplierLineLoading:
              loading.effects['inquiryHallNew/fetchSupplierLineBarginPrice'],
            fetchAllLineLoading: loading.effects['inquiryHallNew/fetchAllLine'],
            fetchAloneItemLineLoading: loading.effects['inquiryHallNew/fetchAloneItemLine'],
            fetchAloneSupplierItemLineLoading:
              loading.effects['inquiryHallNew/fetchAloneSupplierItemLine'],
            save: loading.effects['inquiryHallNew/saveInquiryHallFullQuation'],
            submit: loading.effects['inquiryHallNew/submitInquiryHallFullQuation'],
            latestQuotationSearchLoading: loading.effects['inquiryHallNew/fetchLatestQuotation'],
            priceComparisonSearchLoading: loading.effects['inquiryHallNew/fetchLatestQuotation'],
            fetchBarginLadderLevelyTableLoading:
              loading.effects['inquiryHallNew/fetchBarginLadderLevelyTable'],
            saveBarginLadderLevelLoading: loading.effects['inquiryHallNew/saveBarginLadderLevel'],
            saveCounterOffersBulkLoading:
              loading.effects['inquiryHallNew/handleSaveCounterOffersBulk'],
            querySupplierExchangeEditLoading:
              loading.effects['inquiryHallNew/querySupplierExchangeEdit'],
            saveExchangeEditLoading: loading.effects['inquiryHallNew/saveExchangeEdit'],
          },
          fetchPriceChartLoading: loading.effects['inquiryHallNew/fetchPriceChartsData'],
          fetchQuotationDetailLoading: loading.effects['inquiryHallNew/fetchQuotationDetail'],
          organizationId: getCurrentOrganizationId(),
          modelName: 'inquiryHallNew',
        }))(
          remote(
            // 二开项目埋点
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
  sourceKey: INQUIRY,
})(HOCComponent(FeedbackBargain));
