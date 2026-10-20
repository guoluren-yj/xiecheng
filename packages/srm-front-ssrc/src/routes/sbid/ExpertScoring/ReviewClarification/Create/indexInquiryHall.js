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
    connect(({ expertScoringInquiryHall, loading, user }) => ({
      user,
      expertScoringInquiryHall,
      modelName: 'expertScoringInquiryHall',
      organizationId: getCurrentOrganizationId(),
      userId: getCurrentUserId(),
      loadingSave: loading.effects['expertScoringInquiryHall/createClarifyNotifyQuestionList'],
      loadingDelete: loading.effects['expertScoringInquiryHall/deleteQuestionRows'],
      loadingTable: loading.effects['expertScoringInquiryHall/queryClarifyNotifyQuestionList'],
      loadingHeader: loading.effects['expertScoringInquiryHall/queryClarifyNotifyHeader'],
      loadingSubmit: loading.effects['expertScoringInquiryHall/submitClarifyNotifyQuestionList'],
    }))
  )(Comp);
};

export default HOCComponent(Update);
