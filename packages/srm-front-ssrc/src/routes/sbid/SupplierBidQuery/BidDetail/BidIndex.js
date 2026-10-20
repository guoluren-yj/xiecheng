import { connect } from 'dva';
import { Form } from 'hzero-ui';
import { compose } from 'lodash';
import withCustomize from 'srm-front-cuz/lib/h0Customize';

import { getCurrentOrganizationId } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';

import { Detail } from './index';

const hocComponent = (com) =>
  compose(
    withCustomize({
      unitCode: [
        'SSRC.BID_QUERY_BID_DETAIL.LINE',
        'SSRC.BID_QUERY_BID_DETAIL.LINE_NONE',
        'SSRC.BID_QUERY_BID_DETAIL.HEADER_INFO',
      ],
    }),
    connect(({ supplierBidQueryBid, loading }) => ({
      supplierBidQueryBid,
      supplierBidQuery: supplierBidQueryBid,
      modelName: 'supplierBidQueryBid',
      organizationId: getCurrentOrganizationId(),
      headerLoding: loading.effects['supplierBidQueryBid/queryQuotationHeader'],
    })),
    formatterCollections({
      code: ['ssrc.supplierBidQuery', 'ssrc.bidHall', 'ssrc.supplierQuotation'],
    }),
    Form.create({ fieldNameProp: null })
  )(com);

export default hocComponent(Detail);
export { hocComponent, Detail };
