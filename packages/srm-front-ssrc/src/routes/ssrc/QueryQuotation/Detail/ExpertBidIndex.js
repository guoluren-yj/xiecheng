import { connect } from 'dva';
import { compose } from 'lodash';
import { Form } from 'hzero-ui';
import remote from 'hzero-front/lib/utils/remote';

import { BID } from '@/utils/globalVariable';
import { getCurrentOrganizationId } from 'utils/utils';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import formatterCollections from 'utils/intl/formatterCollections';
import CombineComponent from '@/routes/components/CombineComponent';

import { Detail } from './index';

const hocComponent = (Com) => {
  return compose(
    withCustomize({
      unitCode: [
        'SSRC.BID_QUERY_QUOTATION_DETAIL.QUOTATION_LINE',
        'SSRC.BID_QUERY_QUOTATION_DETAIL.ITEM_LINE',
        'SSRC.BID_QUERY_QUOTATION_DETAIL.BASE_FORM',
        'SSRC.BID_QUERY_QUOTATION_DETAIL.OTHERS_FORM',
        'SSRC.BID_QUERY_QUOTATION_DETAIL.PRELIMINARY_QUALIFICATION', // 资格预审
        'SSRC.BID_QUERY_QUOTATION_DETAIL.ROUND_QUOTATION_LINE',
        'SSRC.BID_QUERY_QUOTATION_DETAIL.HEADER_BUTTONS',
      ],
    }),
    formatterCollections({
      code: [
        'ssrc.queryQuotation',
        'ssrc.common',
        'ssrc.inquiryHall',
        'ssrc.bidHall',
        'ssrc.supplierQuotation',
        'hzero.common',
        'ssrc.scux',
        'sscux.ssrc',
      ],
    }),
    connect(({ inquiryHall, supplierQuotationExpertBid, loading }) => ({
      inquiryHall,
      supplierQuotationExpertBid,
      supplierQuotation: supplierQuotationExpertBid,
      modelName: 'supplierQuotationExpertBid',
      fetchFeedBackBarginHistoryLoading:
        loading.effects['supplierQuotationExpertBid/fetchFeedBackBarginHistory'],
      organizationId: getCurrentOrganizationId(),
      headerLoding: loading.effects['supplierQuotationExpertBid/fetchHeadDataList'],
      fetchLadderLevelTableLoading: loading.effects['inquiryHall/fetchLadderLevelTable'],
      queryRoundQuotationLineDetailLoading:
        loading.effects['supplierQuotationExpertBid/queryRoundQuotationLineDetail'],
    })),
    Form.create({ fieldNameProp: null }),
    CombineComponent({
      sourceKey: BID,
    }),
    remote({
      code: 'SSRC_QUERY_QUOTATION_DETAIL',
    }, {
      events: {
      },
    })
  )(Com);
};

export default hocComponent(Detail);
