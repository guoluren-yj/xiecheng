import { connect } from 'dva';
import { compose } from 'lodash';
import { getCurrentOrganizationId } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import withCustomize from 'srm-front-cuz/lib/h0Customize';

import { BID } from '@/utils/globalVariable';

import { IssueDetails } from './index';

// SSRC.BID_HALL.NEW_CLARIFY.QUESTION_DETAILS_TABLE

const Hooc = (Com, pageSymbol = BID) => {
  return compose(
    withCustomize({
      unitCode: [`SSRC.${pageSymbol}_HALL.NEW_CLARIFY.QUESTION_DETAILS_TABLE`],
    }),
    formatterCollections({
      code: ['ssrc.bidHall', 'ssrc.inquiryHall', 'ssrc.common', 'ssrc.question'],
    }),
    connect(({ inquiryHallBid, loading }) => ({
      inquiryHallBid,
      inquiryHall: inquiryHallBid,
      modelName: 'inquiryHallBid',
      formLoading: loading.effects['inquiryHallBid/queryIssueHeader'],
      lineLoading: loading.effects['inquiryHallBid/queryIssueLine'],
      organizationId: getCurrentOrganizationId(),
      sourceKey: pageSymbol,
    }))
  )(Com);
};

export default Hooc(IssueDetails);
export { Hooc, IssueDetails };
