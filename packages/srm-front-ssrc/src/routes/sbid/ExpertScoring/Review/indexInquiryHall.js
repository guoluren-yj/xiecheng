import { Form } from 'hzero-ui';
import { compose } from 'lodash';
import { connect } from 'dva';
import { getCurrentOrganizationId } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import remote from 'hzero-front/lib/utils/remote';

import { Review } from './index';

const HOCComponent = (Comp) => {
  return compose(
    withCustomize({
      unitCode: [
        'SSRC.EXPERT_SCORE_REVIEW.ELEMENT_LINE_DETAIL',
        'SSRC.EXPERT_SCORE_REVIEW.ELEMENT_LINE_EDIT',
        'SSRC.EXPERT_SCORE_REVIEW.SUPPLIER_HEADER_DETAIL',
        'SSRC.EXPERT_SCORE_REVIEW.SUPPLIER_HEADER_EDIT',
        'SSRC.EXPERT_SCORE_REVIEW.SUPPLIER_LINE_DETAIL',
        'SSRC.EXPERT_SCORE_REVIEW.SUPPLIER_LINE_EDIT',
        'SSRC.EXPERT_SCORE_REVIEW.QUOTATION_LINE',
      ],
    }),
    connect(({ expertScoringInquiryHall, loading }) => ({
      expertScoringInquiryHall,
      modelName: 'expertScoringInquiryHall',
      queryScoringSupplierLoading:
        loading.effects['expertScoringInquiryHall/fetchQueryReviewSupplier'],
      queryScoringQuotationLoading:
        loading.effects['expertScoringInquiryHall/fetchScoringQuotation'],
      queryScoringHeaderLoading: loading.effects['expertScoringInquiryHall/fetchScoringHeader'],
      queryScoringIndicLoading: loading.effects['expertScoringInquiryHall/fetchScoringIndic'],
      savePreApplyLoading: loading.effects['expertScoringInquiryHall/savePretrialApplication'],
      submitPreApplyLoading: loading.effects['expertScoringInquiryHall/submitPretrialApplication'],
      saveScoreingLoading: loading.effects['expertScoringInquiryHall/fetchSaveReviewScoring'],
      fetchScoreElementLoading: loading.effects['expertScoringInquiryHall/fetchScoreElementList'],
      submitExpertLoading: loading.effects['expertScoringInquiryHall/fetchSubmitReviewScoring'],
      saveExpertLoading: loading.effects['expertScoringInquiryHall/fetchSaveReviewElementScoring'],
      submitElementExpertLoading: loading.effects['expertScoringInquiryHall/submitElementScoreing'],
      querySupplierExchangeEditLoading:
        loading.effects['expertScoringInquiryHall/querySupplierExchangeEdit'],
      saveExchangeEditLoading: loading.effects['expertScoringInquiryHall/saveExchangeEdit'],
      fetchQuotationDetailLoading: loading.effects['expertScoringInquiryHall/fetchQuotationDetail'],
      fetchLadderLevelTableLoading:
        loading.effects['expertScoringInquiryHall/fetchLadderLevelTable'],
      organizationId: getCurrentOrganizationId(),
    })),
    formatterCollections({
      code: [
        'ssrc.expertScoring',
        'ssrc.supplierBidQuery',
        'ssrc.inquiryHall',
        'ssrc.common',
        'ssrc.supplierQuotation',
      ],
    }),
    Form.create({ fieldNameProp: null }),
    remote(
      {
        code: 'SSRC_INITIAL_REVIEW',
        name: 'remote',
      },
      {
        events: {
          handleCuxBeforeSubmitElementExpert() {},
          handleCuxBeforeSubmitExpert() {},
        },
      }
    )
  )(Comp);
};

export default HOCComponent(Review);
