import { compose } from 'lodash';
import { connect } from 'dva';
import { Form } from 'hzero-ui';

import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { getCurrentOrganizationId } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';

import { BID } from '@/utils/globalVariable';
import { getClarifyDetailCode } from '../utils/util';

import { Detail } from './index';

const Hooc = (Com, pageSymbol = BID) => {
  return compose(
    withCustomize({
      unitCode: Object.values(getClarifyDetailCode(pageSymbol)),
    }),
    formatterCollections({
      code: ['ssrc.clarify', 'ssrc.common', 'ssrc.inquiryHall'],
    }),
    connect(({ inquiryHallBid, loading }) => ({
      inquiryHallBid,
      inquiryHall: inquiryHallBid,
      modelName: 'inquiryHallBid',
      detailsLoading: loading.effects['inquiryHallBid/fetchClarifyDetail'],
      tableLoading: loading.effects['inquiryHallBid/fetchClarifyReferIssue'],
      organizationId: getCurrentOrganizationId(),
      sourceKey: pageSymbol,
    })),
    Form.create({ fieldNameProp: null })
  )(Com);
};

export default Hooc(Detail);
export { Hooc, Detail };
