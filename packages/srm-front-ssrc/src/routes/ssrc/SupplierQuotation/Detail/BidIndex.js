import { connect } from 'dva';
import { Form } from 'hzero-ui';
import withCustomize from 'srm-front-cuz/lib/h0Customize';

import { getCurrentOrganizationId } from 'utils/utils';
import remote from 'hzero-front/lib/utils/remote';
import formatterCollections from 'utils/intl/formatterCollections';
import CombineComponent from '@/routes/components/CombineComponent';
import { BID } from '@/utils/globalVariable';

import { Detail } from './index';

const hocComponent = (NewComponent) => {
  return withCustomize({
    unitCode: [
      'SSRC.BID_SUPPLIER_PARTICIPATE.ITEM_LINE',
      'SSRC.BID_SUPPLIER_PARTICIPATE.BASE_FORM',
      'SSRC.BID_SUPPLIER_PARTICIPATE.OTHERS_FORM',
      'SSRC.BID_SUPPLIER_PARTICIPATE.PRELIMINARY_QUALIFICATION',
    ],
  })(
    formatterCollections({
      code: [
        'ssrc.supplierQuotation',
        'ssrc.bidHall',
        'ssrc.common',
        'ssrc.inquiryHall',
        'ssrc.offlineResultEntry',
      ],
    })(
      connect(({ inquiryHall, supplierQuotationNewBid, loading }) => ({
        inquiryHall,
        supplierQuotationNewBid,
        supplierQuotation: supplierQuotationNewBid,
        modelName: 'supplierQuotationNewBid',
        organizationId: getCurrentOrganizationId(),
        headerLoding: loading.effects['supplierQuotationNewBid/fetchHeadDataList'],
        ParticipateLoading: loading.effects['supplierQuotationNewBid/fatchParticipate'],
        abandonLoading: loading.effects['supplierQuotationNewBid/fatchAbandon'],
        fetchLadderLevelTableLoading:
          loading.effects['supplierQuotationNewBid/fetchLadderLevelyTable'],
        fetchItemLineLoading: loading.effects['supplierQuotationNewBid/fetchItemsDataList'],
      }))(
        Form.create({ fieldNameProp: null })(
          remote(
            {
              code: 'SSRC_SUPPLIER_QUOTATION_DETAIL',
              name: 'remote',
            },
            {
              events: {
                remoteBeforeHandleParticipateBatch() {},
              },
            }
          )(NewComponent)
        )
      )
    )
  );
};

export default CombineComponent({
  sourceKey: BID,
})(hocComponent(Detail));
