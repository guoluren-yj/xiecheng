import { compose } from 'lodash';

import WithCustomizeC7N from 'srm-front-cuz/lib/c7nCustomize';
import formatterCollections from 'utils/intl/formatterCollections';
import remotes from 'hzero-front/lib/utils/remote';

import Page from './Page';

export default compose(
  WithCustomizeC7N({
    unitCode: [
      'SSRC.BID_VIEW_WIN_NOTICE.MEMBER_INFO',
      'SSRC.BID_VIEW_WIN_NOTICE.MEMBER_CARD',
      'SSRC.BID_VIEW_WIN_NOTICE.ATTACH_INFO',
      'SSRC.BID_VIEW_WIN_NOTICE.ATTACH_CARD',
      'SSRC.BID_VIEW_WIN_NOTICE.BASE_INFO',
      'SSRC.BID_VIEW_WIN_NOTICE.BASE_CARD',
      'SSRC.BID_VIEW_WIN_NOTICE.INFO',
      'SSRC.BID_VIEW_WIN_NOTICE.INFO_CARD',
    ],
    manualQuery: true,
  }),
  formatterCollections({
    code: [['ssrc.rfxNotice', 'ssrc.inquiryHall', 'hzero.c7nProUI', 'ssrc.common']],
  }),
  remotes(
    {
      code: 'SSRC_RFX_WIN_BID_NOTICE',
      name: 'remote',
    },
    {
      events: {},
    }
  )
)(Page);
