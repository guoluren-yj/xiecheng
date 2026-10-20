import { connect } from 'dva';
import { compose } from 'lodash';
import { Form } from 'hzero-ui';
import formatterCollections from 'utils/intl/formatterCollections';
import { getCurrentUserId, getCurrentOrganizationId } from 'utils/utils';

import { Update } from './index';

const HOCComponent = (Comp) => {
  return compose(
    Form.create({ fieldNameProp: null }),
    formatterCollections({ code: ['ssrc.expertScoring'] }),
    connect(({ expertScoringBidHall, loading, user }) => ({
      user,
      expertScoringBidHall,
      modelName: 'expertScoringBidHall',
      organizationId: getCurrentOrganizationId(),
      userId: getCurrentUserId(),
      loadingSave: loading.effects['expertScoringBidHall/createClarifyNotifyQuestionList'],
      loadingDelete: loading.effects['expertScoringBidHall/deleteQuestionRows'],
      loadingTable: loading.effects['expertScoringBidHall/queryClarifyNotifyQuestionList'],
      loadingHeader: loading.effects['expertScoringBidHall/queryClarifyNotifyHeader'],
      loadingSubmit: loading.effects['expertScoringBidHall/submitClarifyNotifyQuestionList'],
    }))
  )(Comp);
};

export default HOCComponent(Update);
