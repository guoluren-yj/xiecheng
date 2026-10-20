import { connect } from 'dva';
import { compose } from 'lodash';
import formatterCollections from 'utils/intl/formatterCollections';
import remote from 'hzero-front/lib/utils/remote';

import { ReviewClarification } from './index';

const HOCComponent = (Comp) => {
  return compose(
    connect(({ expertScoringBidHall, loading }) => ({
      expertScoringBidHall,
      modelName: 'expertScoringBidHall',
      isLoading: loading.effects['expertScoringBidHall/fetchClarifyNotifyDataList'],
      loadingMyQuestion: loading.effects['expertScoringBidHall/queryMyQuestionList'],
      loadingDelete: loading.effects['expertScoringBidHall/deleteQuestionRows'],
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
