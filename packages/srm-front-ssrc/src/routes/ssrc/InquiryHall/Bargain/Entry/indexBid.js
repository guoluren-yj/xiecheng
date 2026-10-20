import { connect } from 'dva';
import { getCurrentOrganizationId } from 'utils/utils';
import { Form } from 'hzero-ui';
import { noop } from 'lodash';
import remote from 'hzero-front/lib/utils/remote';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import formatterCollections from 'utils/intl/formatterCollections';
import CombineComponent from '@/routes/components/CombineComponent';
import { BID } from '@/utils/globalVariable';

import { Bargain } from '../index';

const HOCComponent = (Comp) => {
  return Form.create({ fieldNameProp: null })(
    withCustomize({
      unitCode: [
        'SSRC.BID_HALL_BARGAIN.ALLQUOTATION',
        'SSRC.BID_HALL_BARGAIN.ALLQUOTATION_OFFLINE',
        'SSRC.BID_HALL_BARGAIN.ITEMDETAILS',
        'SSRC.BID_HALL_BARGAIN.ITEMDETAILS_OFFLINE',
        'SSRC.BID_HALL_BARGAIN.SUPPLIER', // 成本备注
        'SSRC.BID_HALL_BARGAIN.SUPPLIER_OFFLINE',
        'SSRC.BID_HALL_BARGAIN.TABS_OFFLINE', // 线下议价详情-TAB页
        'SSRC.BID_HALL_BARGAIN.TABS_ONLINE', // 线上议价详情-TAB页
        'SSRC.BID_HALL_BARGAIN.ONLINE_BTNS', // 线上头按钮组
        'SSRC.BID_HALL_BARGAIN.START_ONLINE_BARGAIN', // 发起议价弹框
        'SSRC.BID_HALL_BARGAIN.HEADER', // 线上议价头
        'SSRC.BID_HALL_BARGAIN.HEADER_INFO', // 头信息卡片
        'SSRC.BID_HALL_BARGAIN.BASE_INFO_CARD', // 基本信息卡片
        'SSRC.BID_HALL_BARGAIN.QUTATION_TABLE_CARD', // 报价明细表格卡片
        'SSRC.BID_HALL_BARGAIN.OFFLINE_BTNS', // 线下议价-头按钮
      ],
    })(
      formatterCollections({
        code: [
          'ssrc.inquiryHall',
          'ssrc.bidHall',
          'hzero.common',
          'ssrc.supplierQuotation',
          'ssrc.offlineResultEntry',
          'ssrc.common',
          'ssrc.priceLibraryNew',
          'ssrc.rf',
          'scux.ssrc',
        ],
      })(
        connect(({ inquiryHall, bargainBidHall, loading }) => ({
          inquiryHall,
          bargainBidHall,
          bargain: bargainBidHall,
          modelName: 'bargainBidHall',
          allLoading: loading.global,
          fetchBargainFullDetLoading: loading.effects['bargainBidHall/fetchBargainFullDetails'],
          supplierLineBargainLoading: loading.effects['bargainBidHall/fetchBargainFullDetails'],
          itemLineBargainLoading: loading.effects['bargainBidHall/fetchBargainFullDetails'],
          saveCounterOffersBulkLoading: loading.effects['bargainBidHall/saveCounterOffersBulk'],
          saveCounterOffersOfflineLoading:
            loading.effects['bargainBidHall/saveCounterOffersOffline'],
          handleSaveAllLoading: loading.effects['bargainBidHall/handleSaveAllOnline'],
          fetchSupplierLineBargainLoading:
            loading.effects['bargainBidHall/fetchSupplierLineBargainPrice'],
          fetchItemDetailsInfoLoading: loading.effects['bargainBidHall/fetchItemDetailsInfo'],
          saveBarginLadderLevelLoading: loading.effects['inquiryHall/saveBarginLadderLevel'],
          fetchBarginLadderLevelyTableLoading:
            loading.effects['inquiryHall/fetchBarginLadderLevelyTable'],
          fetchQuotationDetailLoading: loading.effects['inquiryHall/fetchQuotationDetail'],
          handleSaveAllOfflineLoading: loading.effects['bargainBidHall/handleSaveAllOffline'],
          handleStartAllLoading: loading.effects['bargainBidHall/handleStartAll'],
          bargainOnFinishedLoading: loading.effects['bargainBidHall/bargainOnFinished'],
          endLoading: loading.effects['bargainBidHall/bargainOnEnd'],
          organizationId: getCurrentOrganizationId(),
        }))(
          remote(
            {
              code: 'SSRC_BARGAIN',
              name: 'remote',
            },
            {
              events: {
                handleGetBackPath(props = {}) {
                  const { getBackPath = noop, ...otherParams } = props || {};
                  getBackPath(otherParams);
                },
                handleJumpOnlineSucceed(props = {}) {
                  const { jumpOnlineSucceed = noop } = props || {};
                  jumpOnlineSucceed(props);
                },
                handleJumpOfflineSucceed(props = {}) {
                  const { jumpOfflineSucceed = noop } = props || {};
                  jumpOfflineSucceed(props);
                },
                beforeJump() {},
                handleRemoteAfterFetchSupplierLineBargainPrice() {},
              },
            }
          )(Comp)
        )
      )
    )
  );
};

export default CombineComponent({
  sourceKey: BID,
})(HOCComponent(Bargain));
export { HOCComponent, Bargain };
