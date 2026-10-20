import { compose } from 'lodash';
import { connect } from 'dva';

import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { getCurrentOrganizationId } from 'utils/utils';
import cacheComponent from 'components/CacheComponent';
import formatterCollections from 'utils/intl/formatterCollections';
import remote from 'hzero-front/lib/utils/remote';

import { INQUIRY } from '@/utils/globalVariable';

import { Question } from './index';

// SSRC.INQUIRY_HALL.NEW_CLARIFY.LIST_CLARIFICATION

const Hooc = (Com, pageSymbol = INQUIRY) => {
  return compose(
    withCustomize({
      unitCode: [
        `SSRC.INQUIRY_HALL.NEW_CLARIFY.LIST_CLARIFICATION`, // 澄清涵维护
        `SSRC.INQUIRY_HALL.NEW_CLARIFY.LIST_CLARIFICATION_SEARCH`,
        `SSRC.INQUIRY_HALL.NEW_CLARIFY.LIST_HEADER_BUTTONS`, // 澄清涵维护-头按钮组
        `SSRC.INQUIRY_HALL.NEW_CLARIFY.LIST_RELATIVE_QUESTION`, // 澄清涵维护-相关问题
      ],
    }),
    formatterCollections({
      code: ['ssrc.bidHall', 'ssrc.inquiryHall', 'ssrc.common'],
    }),
    connect(({ inquiryHallNew, loading }) => ({
      modelName: 'inquiryHallNew',
      inquiryHallNew,
      inquiryHall: inquiryHallNew,
      Loading: loading.effects['inquiryHallNew/fetchMaintainList'],
      clarLoading: loading.effects['inquiryHallNew/fetchClarList'],
      organizationId: getCurrentOrganizationId(),
      sourceKey: pageSymbol,
    })),
    cacheComponent({ cacheKey: '/ssrc/bid-hall/inter-question/:sourceHeaId/:bidNum' }),
    remote({
      code: 'SSRC_INQUIRY_HALL_QUESTION',
      name: 'questionRemote',
    })
  )(Com);
};

export default Hooc(Question);
export { Hooc, Question };
