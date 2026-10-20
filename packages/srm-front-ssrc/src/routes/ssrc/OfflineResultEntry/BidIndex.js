import { connect } from 'dva';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import formatterCollections from 'utils/intl/formatterCollections';
import remote from 'hzero-front/lib/utils/remote';

import CombineComponent from '@/routes/components/CombineComponent';
import { BID } from '@/utils/globalVariable';

import { OfflineResultEntry } from './index';

const HOCComponent = (Comp) => {
  return CombineComponent({
    sourceKey: BID,
  })(
    withCustomize({
      unitCode: [
        'SSRC.BID_OFFLINE_RESULT_ENTRY.LIST', // 线下寻源结果录入列表code
        'SSRC.BID_OFFLINE_RESULT_ENTRY.FILTER', // 线下寻源结果录入查询
      ],
    })(
      connect(({ offlineResultEntryBid, loading }) => ({
        modelName: 'offlineResultEntryBid',
        offlineResultEntryBid,
        offlineResultEntry: offlineResultEntryBid,
        fetchRFxListLoading: loading.effects['offlineResultEntryBid/fetchRFxList'],
        fetchQuotationFeedBackLoading: loading.effects['offlineResultEntryBid/quotationFeedBack'],
      }))(
        formatterCollections({ code: ['ssrc.offlineResultEntry', 'ssrc.common'] })(
          remote({
            code: 'SSRC_OFFLINE_RESULT_ENTRY',
          })(Comp)
        )
      )
    )
  );
};

export default HOCComponent(OfflineResultEntry);
