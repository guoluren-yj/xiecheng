import { connect } from 'dva';
import { Form } from 'hzero-ui';
import { compose } from 'lodash';
import remote from 'hzero-front/lib/utils/remote';
import withCustomize from 'srm-front-cuz/lib/h0Customize';

import { getCurrentOrganizationId } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';

import { Detail } from './index';

const hocComponent = (Com) => {
  return compose(
    withCustomize({
      unitCode: [
        'SSRC.QUERY_QUOTATION_DETAIL.QUOTATION_LINE',
        'SSRC.QUERY_QUOTATION_DETAIL.ITEM_LINE',
        'SSRC.QUERY_QUOTATION_DETAIL.BASE_FORM',
        'SSRC.QUERY_QUOTATION_DETAIL.OTHERS_FORM',
        'SSRC.QUERY_QUOTATION_DETAIL.PRELIMINARY_QUALIFICATION', // 资格预审
        'SSRC.QUERY_QUOTATION_DETAIL.HEADER_BUTTONS', // 头部按钮组
        'SSRC.QUERY_QUOTATION_DETAIL.ROUND_QUOTATION_LINE',
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
    connect(({ inquiryHall, supplierQuotationPub, loading }) => ({
      inquiryHall,
      supplierQuotationPub,
      supplierQuotation: supplierQuotationPub,
      modelName: 'supplierQuotationPub',
      fetchFeedBackBarginHistoryLoading:
        loading.effects['supplierQuotationPub/fetchFeedBackBarginHistory'],
      organizationId: getCurrentOrganizationId(),
      headerLoding: loading.effects['supplierQuotationPub/fetchHeadDataList'],
      fetchLadderLevelTableLoading: loading.effects['inquiryHall/fetchLadderLevelTable'],
      queryRoundQuotationLineDetailLoading:
        loading.effects['supplierQuotationPub/queryRoundQuotationLineDetail'],
      printLoading: loading.effects['supplierQuotationPub/queryPrint'],
    })),
    Form.create({ fieldNameProp: null }),
    remote({
      code: 'SSRC_QUERY_QUOTATION_DETAIL',
      name: 'remote',
    }, {
      events: {

      },
    })
  )(Com);
};

export default hocComponent(Detail);
export { hocComponent, Detail };
