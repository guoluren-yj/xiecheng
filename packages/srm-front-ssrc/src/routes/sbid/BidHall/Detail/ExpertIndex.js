import { connect } from 'dva';
import { Form } from 'hzero-ui';
import { compose } from 'lodash';
import withCustomize from 'srm-front-cuz/lib/h0Customize';

import { getCurrentOrganizationId, getCurrentUserId } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';

import { Detail } from './index';

const hocComponent = (com) =>
  compose(
    withCustomize({
      unitCode: [
        'SSRC.BID_HALL_DETAIL.ITEM_LINE_TAB',
        'SSRC.BID_HALL_DETAIL.HEADER',
        'SSRC.BID_HALL_DETAIL.ITEM_LINE',
        'SSRC.BID_HALL_DETAIL.ITEM_LINE_NONE',
        'SSRC.BID_EVENT_DETAIL.TAB_ITEM',
        'SSRC.BID_HALL_DETAIL.TAB_SUPPLIER_READ',
        'SSRC.BID_HALL_DETAIL.OTHER.INFO',
        'SSRC.BID_HALL_DETAIL.EXPERT_SCORE',
        'SSRC.BID_HALL_DETAIL.SCORE_INDICS',
        'SSRC.BID_HALL_DETAIL.PREPARE_SUPPLIER', // 招标准备-供应商table
        'SSRC.BID_HALL_DETAIL.DETAIL_BIDDING_GROUP',
        'SSRC.BID_HALL_DETAIL.MARKED_BASIC_INFO',
        'SSRC.BID_HALL_DETAIL.MARKED_LINE_INFO',
        'SSRC.BID_EVENT_DETAIL.TAB_PACK',
      ],
    }),
    connect(({ bidHallExpert, bidEventQueryExpert, resultsQuery, loading }) => ({
      bidHallExpert,
      modelName: 'bidHallExpert',
      bidEventQuery: bidEventQueryExpert,
      bidEventQueryExpert,
      resultsQuery,
      otherModelName: 'bidEventQueryExpert',
      fetchbidHallUpdateLoading: loading.effects['bidHallExpert/fetchBidHeaderDetail'],
      fetchItemLineLoading: loading.effects['bidHallExpert/fetchItemLine'],
      fetchSupplierLineloading: loading.effects['bidHallExpert/fetchSupplierLine'],
      fetchBidMembersLoading: loading.effects['bidHallExpert/fetchBidMembers'],
      supplierRecordLoading: loading.effects['bidHallExpert/supplierRecord'],
      fetchTempelateDetailDataLoading: loading.effects['bidHallExpert/fetchTempelateDetailData'],
      fetchExpertAllocationDataLoading: loading.effects['bidHallExpert/fetchExpertAllocationData'],
      fetchScoringElementLoading: loading.effects['bidHallExpert/fetchScoringElementData'],
      fetchEvaluateIndicAssignLoading: loading.effects['bidTask/fetchEvaluateIndicAssign'],
      fetchPretrialPanelLoading: loading.effects['bidHallExpert/fetchPretrialPanel'],
      prequalDetailBidDetailLoading: loading.effects['bidHallExpert/prequalDetailBidDetail'],
      fetchHeaderInfoLoading: loading.effects['bidHallExpert/fetchHeaderInfo'],
      quotationDetailBidDetailLoading: loading.effects['bidHallExpert/quotationDetailBidDetail'],
      fetchHistoryApprovalLoading: loading.effects['bidHallExpert/fetchHistoryApproval'],
      fetchScoreDetailsLoading: loading.effects['bidHallExpert/bidEvaluationDetails'],
      queryCalibrationLoading: loading.effects['bidEventQueryExpert/fetchCalibrationQuotation'], // 供应商行点击查询物料行
      organizationId: getCurrentOrganizationId(),
      userId: getCurrentUserId(),
    })),
    formatterCollections({
      code: [
        'ssrc.bidHall',
        'ssrc.bidTask',
        'ssrc.inquiryHall',
        'ssrc.common',
        'ssrc.bidEventQuery',
        'ssrc.qualiExam',
        'hwfp.common',
        'hwfp.task',
      ],
    }),
    Form.create({ fieldNameProp: null })
  )(com);

export default hocComponent(Detail);
export { hocComponent, Detail };
