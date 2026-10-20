import { connect } from 'dva';
import { compose } from 'lodash';
import formatterCollections from 'utils/intl/formatterCollections';
import remote from 'hzero-front/lib/utils/remote';

import { ReviewClarification } from './index';

const HOCComponent = (Comp) => {
  return compose(
    connect(({ expertScoringInquiryHall, loading }) => ({
      expertScoringInquiryHall,
      modelName: 'expertScoringInquiryHall',
      isLoading: loading.effects['expertScoringInquiryHall/fetchClarifyNotifyDataList'],
      loadingMyQuestion: loading.effects['expertScoringInquiryHall/queryMyQuestionList'],
      loadingDelete: loading.effects['expertScoringInquiryHall/deleteQuestionRows'],
    })),
    formatterCollections({
      code: ['ssrc.expertScoring'],
    }),
    remote({
      code: 'SSRC_EXPERT_REVIEW_CLARIFICATION',
      name: 'expertReviewClarification',
    })
  )(Comp);
};

export default HOCComponent(ReviewClarification);
