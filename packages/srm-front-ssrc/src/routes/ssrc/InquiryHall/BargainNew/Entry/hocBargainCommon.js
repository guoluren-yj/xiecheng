import { Form } from 'hzero-ui';
import { connect } from 'dva';
import { observer } from 'mobx-react';
import { noop, compose } from 'lodash';
import remote from 'hzero-front/lib/utils/remote';

// import withCustomize from 'srm-front-cuz/lib/h0Customize';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import formatterCollections from 'utils/intl/formatterCollections';
import { getCurrentOrganizationId } from 'utils/utils';

import CombineComponent from '@/routes/components/CombineComponent';
import { INQUIRY } from '@/utils/globalVariable';

const hocBargainCommon = (NewComponent, options = {}) => {
  const { modelName = 'bargainInquiryHall', bidFlag = false, sourceKey = INQUIRY } = options || {};

  const unitCodes = !bidFlag
    ? [
        'SSRC.INQUIRY_HALL_BARGAIN.ALLQUOTATION',
        'SSRC.INQUIRY_HALL_BARGAIN.ALLQUOTATION_OFFLINE',
        'SSRC.INQUIRY_HALL_BARGAIN.ITEMDETAILS',
        'SSRC.INQUIRY_HALL_BARGAIN.ITEMDETAILS_OFFLINE',
        'SSRC.INQUIRY_HALL_BARGAIN.SUPPLIER', // 成本备注
        'SSRC.INQUIRY_HALL_BARGAIN.SUPPLIER_OFFLINE',
        'SSRC.INQUIRY_HALL_BARGAIN.TABS_OFFLINE', // 线下议价详情-TAB页
        'SSRC.INQUIRY_HALL_BARGAIN.TABS_ONLINE', // 线上议价详情-TAB页
        'SSRC.INQUIRY_HALL_BARGAIN.ONLINE_BTNS', // 线上议价头按钮组
        'SSRC.INQUIRY_HALL_BARGAIN.START_ONLINE_BARGAIN', // 发起议价弹框
        'SSRC.INQUIRY_HALL_BARGAIN.HEADER', // 线上议价头
        'SSRC.INQUIRY_HALL_BARGAIN.HEADER_INFO', // 头信息卡片
        'SSRC.INQUIRY_HALL_BARGAIN.BASE_INFO_CARD', // 基本信息卡片
        'SSRC.INQUIRY_HALL_BARGAIN.QUTATION_TABLE_CARD', // 报价明细表格卡片
        'SSRC.INQUIRY_HALL_BARGAIN.OFFLINE_BTNS', // 线下议价-头按钮
      ]
    : [
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
      ];

  return compose(
    CombineComponent({ sourceKey }),
    Form.create({ fieldNameProp: null }),
    withCustomize({
      unitCode: unitCodes,
    }),
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
        'sscux.ssrc',
      ],
    }),
    connect(({ inquiryHall, loading, ...others }) => ({
      inquiryHall,
      modelName,
      ...others, // entry bid / rfx
      allLoading: loading.global,
      headerLoading: loading.effects[`${modelName}/fetchBargainHeader`],
      supplierLineBargainLoading: loading.effects[`${modelName}/fetchBargainFullDetails`],
      itemLineBargainLoading: loading.effects[`${modelName}/fetchBargainFullDetails`],
      // saveCounterOffersBulkLoading: loading.effects[`${modelName}/saveCounterOffersBulk`],
      // saveCounterOffersOfflineLoading:
      //   loading.effects[`${modelName}/saveCounterOffersOffline`],
      handleSaveAllLoading: loading.effects[`${modelName}/handleSaveAllOnline`],
      fetchSupplierLineBargainLoading:
        loading.effects[`${modelName}/fetchSupplierLineBargainPrice`],
      fetchItemDetailsInfoLoading: loading.effects[`${modelName}/fetchItemDetailsInfo`],
      saveBarginLadderLevelLoading: loading.effects['inquiryHall/saveBarginLadderLevel'],
      fetchBarginLadderLevelyTableLoading:
        loading.effects['inquiryHall/fetchBarginLadderLevelyTable'],
      fetchQuotationDetailLoading: loading.effects['inquiryHall/fetchQuotationDetail'],
      handleSaveAllOfflineLoading: loading.effects[`${modelName}/handleSaveAllOffline`],
      handleStartAllLoading: loading.effects[`${modelName}/handleStartAllNew`],
      bargainOnFinishedLoading: loading.effects[`${modelName}/bargainOnFinished`],
      endLoading: loading.effects[`${modelName}/bargainOnEnd`],
      organizationId: getCurrentOrganizationId(),
    })),
    remote(
      {
        code: 'SSRC_BARGAIN_NEW',
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
          completeBargainOperation(props = {}) {
            const { successCallBack = noop } = props || {};
            successCallBack();
          },
        },
      }
    )
  )(observer(NewComponent));
};

export { hocBargainCommon };
