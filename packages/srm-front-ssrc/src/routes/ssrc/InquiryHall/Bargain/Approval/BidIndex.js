import { connect } from 'dva';
import { Form } from 'hzero-ui';

import withCustomize from 'srm-front-cuz/lib/h0Customize';
import formatterCollections from 'utils/intl/formatterCollections';
import { getCurrentOrganizationId } from 'utils/utils';
import CombineComponent from '@/routes/components/CombineComponent';
import { BID } from '@/utils/globalVariable';

import { Bargain } from './index';

const HOCComponent = (Comp) => {
  return Form.create({ fieldNameProp: null })(
    withCustomize({
      unitCode: [
        'SSRC.BID_HALL_BARGAIN.ALLQUOTATION',
        // 'SSRC.BID_HALL_BARGAIN.ALLQUOTATION_OFFLINE',
        // 'SSRC.BID_HALL_BARGAIN.ITEMDETAILS',
        // 'SSRC.BID_HALL_BARGAIN.ITEMDETAILS_OFFLINE',
        // 'SSRC.BID_HALL_BARGAIN.SUPPLIER', // 成本备注
        // 'SSRC.BID_HALL_BARGAIN.SUPPLIER_OFFLINE',
      ],
    })(
      connect(({ inquiryHall, bargain, loading }) => ({
        inquiryHall,
        bargain,
        fetchBargainFullDetLoading: loading.effects['bargain/fetchBargainFullDetails'],
        supplierLineBargainLoading: loading.effects['bargain/fetchBargainFullDetails'],
        itemLineBargainLoading: loading.effects['bargain/fetchBargainFullDetails'],
        saveCounterOffersBulkLoading: loading.effects['bargain/saveCounterOffersBulk'],
        saveCounterOffersOfflineLoading: loading.effects['bargain/saveCounterOffersOffline'],
        handleSaveAllLoading: loading.effects['bargain/handleSaveAllOnline'],
        fetchSupplierLineBargainLoading: loading.effects['bargain/fetchSupplierLineBargainPrice'],
        fetchItemDetailsInfoLoading: loading.effects['bargain/fetchItemDetailsInfo'],
        saveBarginLadderLevelLoading: loading.effects['inquiryHall/saveBarginLadderLevel'],
        fetchBarginLadderLevelyTableLoading:
          loading.effects['inquiryHall/fetchBarginLadderLevelyTable'],
        fetchQuotationDetailLoading: loading.effects['inquiryHall/fetchQuotationDetail'],
        handleSaveAllOfflineLoading: loading.effects['bargain/handleSaveAllOffline'],
        handleStartAllLoading: loading.effects['bargain/handleStartAll'],
        bargainOnFinishedLoading: loading.effects['bargain/bargainOnFinished'],
        organizationId: getCurrentOrganizationId(),
      }))(
        formatterCollections({
          code: ['ssrc.inquiryHall', 'ssrc.bidHall', 'ssrc.common', 'sscux.ssrc',],
        })(Comp)
      )
    )
  );
};

export default CombineComponent({
  sourceKey: BID,
})(HOCComponent(Bargain));
