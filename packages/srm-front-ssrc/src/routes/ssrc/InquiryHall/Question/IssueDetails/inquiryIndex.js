import { connect } from 'dva';
import { compose } from 'lodash';
import remote from 'hzero-front/lib/utils/remote';
import { getCurrentOrganizationId } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import withCustomize from 'srm-front-cuz/lib/h0Customize';

import { INQUIRY } from '@/utils/globalVariable';
import { IssueDetails } from './index';

const Hooc = (Com, pageSymbol = INQUIRY) => {
  return compose(
    withCustomize({
      unitCode: ['SSRC.INQUIRY_HALL.NEW_CLARIFY.QUESTION_DETAILS_TABLE'],
    }),
    formatterCollections({
      code: ['ssrc.bidHall', 'ssrc.inquiryHall', 'ssrc.common', 'ssrc.question'],
    }),
    connect(({ inquiryHallNew, loading }) => ({
      inquiryHallNew,
      inquiryHall: inquiryHallNew,
      modelName: 'inquiryHallNew',
      formLoading: loading.effects['inquiryHallNew/queryIssueHeader'],
      lineLoading: loading.effects['inquiryHallNew/queryIssueLine'],
      organizationId: getCurrentOrganizationId(),
      sourceKey: pageSymbol,
    })),
    remote({
      code: 'SSRC_INQUIRY_HALL_QUESTION_ISSUE_DETAILS',
      name: 'issueDetailsRemote',
    })
  )(Com);
};

export default Hooc(IssueDetails);
export { Hooc, IssueDetails };
