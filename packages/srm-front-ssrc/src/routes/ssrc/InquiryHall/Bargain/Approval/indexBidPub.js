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
      connect(({ inquiryHall, bargainPub, loading }) => ({
        inquiryHall,
        bargainPub,
        modelName: 'bargainPub',
        fetchBargainFullDetLoading: loading.effects['bargainPub/fetchBargainFullDetails'],
        supplierLineBargainLoading: loading.effects['bargainPub/fetchBargainFullDetails'],
        itemLineBargainLoading: loading.effects['bargainPub/fetchBargainFullDetails'],
        saveCounterOffersBulkLoading: loading.effects['bargainPub/saveCounterOffersBulk'],
        saveCounterOffersOfflineLoading: loading.effects['bargainPub/saveCounterOffersOffline'],
        handleSaveAllLoading: loading.effects['bargainPub/handleSaveAllOnline'],
        fetchSupplierLineBargainLoading:
          loading.effects['bargainPub/fetchSupplierLineBargainPrice'],
        fetchItemDetailsInfoLoading: loading.effects['bargainPub/fetchItemDetailsInfo'],
        saveBarginLadderLevelLoading: loading.effects['inquiryHall/saveBarginLadderLevel'],
        fetchBarginLadderLevelyTableLoading:
          loading.effects['inquiryHall/fetchBarginLadderLevelyTable'],
        fetchQuotationDetailLoading: loading.effects['inquiryHall/fetchQuotationDetail'],
        handleSaveAllOfflineLoading: loading.effects['bargainPub/handleSaveAllOffline'],
        handleStartAllLoading: loading.effects['bargainPub/handleStartAll'],
        bargainOnFinishedLoading: loading.effects['bargainPub/bargainOnFinished'],
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
