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
    connect(({ expertScoringBidHall, loading }) => ({
      expertScoringBidHall,
      modelName: 'expertScoringBidHall',
      queryScoringSupplierLoading: loading.effects['expertScoringBidHall/fetchQueryReviewSupplier'],
      queryScoringQuotationLoading: loading.effects['expertScoringBidHall/fetchScoringQuotation'],
      queryScoringHeaderLoading: loading.effects['expertScoringBidHall/fetchScoringHeader'],
      queryScoringIndicLoading: loading.effects['expertScoringBidHall/fetchScoringIndic'],
      savePreApplyLoading: loading.effects['expertScoringBidHall/savePretrialApplication'],
      submitPreApplyLoading: loading.effects['expertScoringBidHall/submitPretrialApplication'],
      saveScoreingLoading: loading.effects['expertScoringBidHall/fetchSaveReviewScoring'],
      fetchScoreElementLoading: loading.effects['expertScoringBidHall/fetchScoreElementList'],
      submitExpertLoading: loading.effects['expertScoringBidHall/fetchSubmitReviewScoring'],
      saveExpertLoading: loading.effects['expertScoringBidHall/fetchSaveReviewElementScoring'],
      submitElementExpertLoading: loading.effects['expertScoringBidHall/submitElementScoreing'],
      querySupplierExchangeEditLoading:
        loading.effects['expertScoringBidHall/querySupplierExchangeEdit'],
      saveExchangeEditLoading: loading.effects['expertScoringBidHall/saveExchangeEdit'],
      fetchQuotationDetailLoading: loading.effects['expertScoringBidHall/fetchQuotationDetail'],
      fetchLadderLevelTableLoading: loading.effects['expertScoringBidHall/fetchLadderLevelTable'],
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
