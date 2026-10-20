import { compose } from 'lodash';
import { connect } from 'dva';

import { getCurrentOrganizationId } from 'utils/utils';
import cacheComponent from 'components/CacheComponent';
import formatterCollections from 'utils/intl/formatterCollections';

import { Question } from './index';

const Hooc = (Com) => {
  return compose(
    formatterCollections({
      code: ['ssrc.bidHall', 'ssrc.inquiryHall', 'ssrc.common'],
    }),
    connect(({ inquiryHallNewPub, loading }) => ({
      modelName: 'inquiryHallNewPub',
      inquiryHallNewPub,
      inquiryHall: inquiryHallNewPub,
      Loading: loading.effects['inquiryHallNewPub/fetchMaintainList'],
      clarLoading: loading.effects['inquiryHallNewPub/fetchClarList'],
      organizationId: getCurrentOrganizationId(),
    })),
    cacheComponent({ cacheKey: '/ssrc/bid-hall/inter-question/:sourceHeaId/:bidNum' })
  )(Com);
};

export default Hooc(Question);
export { Hooc, Question };
