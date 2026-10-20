// import { Form } from 'hzero-ui';
// import { connect } from 'dva';
// import { observer } from 'mobx-react';
// import { noop } from 'lodash';
// import remote from 'hzero-front/lib/utils/remote';

// // import withCustomize from 'srm-front-cuz/lib/h0Customize';
// import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
// import formatterCollections from 'utils/intl/formatterCollections';
// import { getCurrentOrganizationId } from 'utils/utils';

import { Bargain } from '../index';

import { hocBargainCommon } from './hocBargainCommon';

// const hocBargain = (NewComponent) => {
//   return Form.create({ fieldNameProp: null })(
//     withCustomize({
//       unitCode: [
//         'SSRC.INQUIRY_HALL_BARGAIN.ALLQUOTATION',
//         'SSRC.INQUIRY_HALL_BARGAIN.ALLQUOTATION_OFFLINE',
//         'SSRC.INQUIRY_HALL_BARGAIN.ITEMDETAILS',
//         'SSRC.INQUIRY_HALL_BARGAIN.ITEMDETAILS_OFFLINE',
//         'SSRC.INQUIRY_HALL_BARGAIN.SUPPLIER', // 成本备注
//         'SSRC.INQUIRY_HALL_BARGAIN.SUPPLIER_OFFLINE',
//         'SSRC.INQUIRY_HALL_BARGAIN.TABS_OFFLINE', // 线下议价详情-TAB页
//         'SSRC.INQUIRY_HALL_BARGAIN.TABS_ONLINE', // 线上议价详情-TAB页
//         'SSRC.INQUIRY_HALL_BARGAIN.ONLINE_BTNS', // 线上议价头按钮组
//         'SSRC.INQUIRY_HALL_BARGAIN.START_ONLINE_BARGAIN', // 发起议价弹框
//         'SSRC.INQUIRY_HALL_BARGAIN.HEADER', // 线上议价头
//         'SSRC.INQUIRY_HALL_BARGAIN.HEADER_INFO', // 头信息卡片
//         'SSRC.INQUIRY_HALL_BARGAIN.BASE_INFO_CARD', // 基本信息卡片
//         'SSRC.INQUIRY_HALL_BARGAIN.QUTATION_TABLE_CARD', // 报价明细表格卡片
//       ],
//     })(
//       formatterCollections({
//         code: [
//           'ssrc.inquiryHall',
//           'ssrc.bidHall',
//           'hzero.common',
//           'ssrc.supplierQuotation',
//           'ssrc.offlineResultEntry',
//           'ssrc.common',
//           'ssrc.priceLibraryNew',
//           'ssrc.rf',
//           'scux.ssrc',
//           'sscux.ssrc',
//         ],
//       })(
//         connect(({ inquiryHall, bargainInquiryHall, loading }) => ({
//           inquiryHall,
//           bargainInquiryHall,
//           modelName: 'bargainInquiryHall',
//           allLoading: loading.global,
//           headerLoading: loading.effects['bargainInquiryHall/fetchBargainHeader'],
//           supplierLineBargainLoading: loading.effects['bargainInquiryHall/fetchBargainFullDetails'],
//           itemLineBargainLoading: loading.effects['bargainInquiryHall/fetchBargainFullDetails'],
//           saveCounterOffersBulkLoading: loading.effects['bargainInquiryHall/saveCounterOffersBulk'],
//           saveCounterOffersOfflineLoading:
//             loading.effects['bargainInquiryHall/saveCounterOffersOffline'],
//           handleSaveAllLoading: loading.effects['bargainInquiryHall/handleSaveAllOnline'],
//           fetchSupplierLineBargainLoading:
//             loading.effects['bargainInquiryHall/fetchSupplierLineBargainPrice'],
//           fetchItemDetailsInfoLoading: loading.effects['bargainInquiryHall/fetchItemDetailsInfo'],
//           saveBarginLadderLevelLoading: loading.effects['inquiryHall/saveBarginLadderLevel'],
//           fetchBarginLadderLevelyTableLoading:
//             loading.effects['inquiryHall/fetchBarginLadderLevelyTable'],
//           fetchQuotationDetailLoading: loading.effects['inquiryHall/fetchQuotationDetail'],
//           handleSaveAllOfflineLoading: loading.effects['bargainInquiryHall/handleSaveAllOffline'],
//           handleStartAllLoading: loading.effects['bargainInquiryHall/handleStartAll'],
//           bargainOnFinishedLoading: loading.effects['bargainInquiryHall/bargainOnFinished'],
//           endLoading: loading.effects['bargainInquiryHall/bargainOnEnd'],
//           organizationId: getCurrentOrganizationId(),
//         }))(
//           remote(
//             {
//               code: 'SSRC_BARGAIN_NEW',
//               name: 'remote',
//             },
//             {
//               events: {
//                 handleGetBackPath(props = {}) {
//                   const { getBackPath = noop, ...otherParams } = props || {};
//                   getBackPath(otherParams);
//                 },
//                 handleJumpOnlineSucceed(props = {}) {
//                   const { jumpOnlineSucceed = noop } = props || {};
//                   jumpOnlineSucceed(props);
//                 },
//                 handleJumpOfflineSucceed(props = {}) {
//                   const { jumpOfflineSucceed = noop } = props || {};
//                   jumpOfflineSucceed(props);
//                 },
//                 beforeJump() {},
//               },
//             }
//           )(observer(NewComponent))
//         )
//       )
//     )
//   );
// };

const hocBargain = (Com) => {
  return hocBargainCommon(Com, { bidFlag: false, modelName: 'bargainInquiryHall' });
};

export default hocBargain(Bargain);
export { hocBargain, Bargain };
