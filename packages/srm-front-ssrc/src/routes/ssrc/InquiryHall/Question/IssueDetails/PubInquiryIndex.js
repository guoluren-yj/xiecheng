import { connect } from 'dva';
import { compose } from 'lodash';

import { getCurrentOrganizationId } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import withCustomize from 'srm-front-cuz/lib/h0Customize';

import { IssueDetails } from './index';

const Hooc = (Com) => {
  return compose(
    withCustomize({
      unitCode: [],
    }),
    formatterCollections({
      code: ['ssrc.bidHall', 'ssrc.inquiryHall', 'ssrc.common', 'ssrc.question'],
    }),
    connect(({ inquiryHallNewPub, loading }) => ({
      inquiryHallNewPub,
      inquiryHall: inquiryHallNewPub,
      modelName: 'inquiryHallNewPub',
      formLoading: loading.effects['inquiryHallNewPub/queryIssueHeader'],
      lineLoading: loading.effects['inquiryHallNewPub/queryIssueLine'],
      organizationId: getCurrentOrganizationId(),
    }))
  )(Com);
};

export default Hooc(IssueDetails);
export { Hooc, IssueDetails };
