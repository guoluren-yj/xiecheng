import { connect } from 'dva';
import { Form } from 'hzero-ui';
import { noop } from 'lodash';
import remote from 'hzero-front/lib/utils/remote';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import formatterCollections from 'utils/intl/formatterCollections';

import { getCurrentOrganizationId } from 'utils/utils';
import SrcEvaluationDetail from '../../../sbid/BidHall/BidEvaluation';

const hocRfxEvaluation = (NewComponent) => {
  return withCustomize({
    unitCode: [
      'SSRC.EXPERT_SCORE_MANAGE.SUPPLIER_LINE',
      'SSRC.EXPERT_SCORE_MANAGE.EXPERT_LINE',
      'SSRC.EXPERT_SCORE_MANAGE.EXPERT_LINE_RFI',
      'SSRC.EXPERT_SCORE_MANAGE.EXPERT.SCORE_LINE_RFX',
      'SSRC.EXPERT_SCORE_MANAGE.SUPPLIER.SCORE_LINE_RFX_V2',
      'SSRC.EXPERT_SCORE_MANAGE.ROUND_QUOTATION_LINE',
      'SSRC.EXPERT_SCORE_MANAGE.HEADER_BUTTON',
      'SSRC.EXPERT_SCORE_MANAGE.ROUND_MODAL_BUTTON',
      'SSRC.EXPERT_SCORE_MANAGE.REVIEW_LINE',
    ],
  })(
    formatterCollections({
      code: [
        'ssrc.bidHall',
        'ssrc.inquiryHall',
        'ssrc.expertScoring',
        'ssrc.common',
        'ssrc.supplierQuotation',
        'scux.ssrc',
        'ssrc.expert',
      ],
    })(
      connect(({ inquiryHallNew, bidHallInquiry, loading }) => ({
        inquiryHallNew,
        inquiryHall: inquiryHallNew,
        bidHallInquiry,
        modelName: 'inquiryHallNew',
        modelBidName: 'bidHallInquiry',
        fetchExpertScoreInfoLoading: loading.effects['bidHallInquiry/fetchExpertScoreInfo'],
        fetchScoreLineLoading: loading.effects['bidHallInquiry/fetchScoreLine'],
        fetchSupplierListLoading: loading.effects['inquiryHallNew/fetchSupplierList'],
        saveEvaluateSummaryLoading:
          loading.effects['inquiryHallNew/saveEvaluateSummary'] ||
          loading.effects['inquiryHallNew/saveReviewEvaluateSummary'] ||
          loading.effects['bidHallInquiry/saveReviewEvaluateSummary'],
        submitEvaluateSummaryLoading:
          loading.effects['inquiryHallNew/submitEvaluateSummary'] ||
          loading.effects['inquiryHallNew/submitReviewEvaluateSummary'] ||
          loading.effects['bidHallInquiry/submitReviewEvaluateSummary'],
        fetchIPCoincidenceRateLoading: loading.effects['inquiryHallNew/fetchIPCoincidenceRate'],
        roundBeginScoreLoading: loading.effects['inquiryHallNew/roundBeginScore'],
        beginRoundQuotationLoading: loading.effects['inquiryHallNew/beginRoundQuotation'],
        fetchRfxScoreItemLinesLoading: loading.effects['inquiryHallNew/fetchRfxScoreItemLines'],
        fetchReScoringAllLoading: loading.effects['inquiryHallNew/reScoringAll'],
        organizationId: getCurrentOrganizationId(),
      }))(
        Form.create({ fieldNameProp: null })(
          remote(
            {
              code: 'SSRC_EXPERT_SCORING_BUSS_SUM',
              name: 'exportScoringBussSum',
            },
            {
              events: {
                // 选择议价方式
                selectBargainWay(eventProps) {
                  const { selectBargainWay } = eventProps;
                  selectBargainWay();
                },
                // 打开议价弹框回调
                directBargain(eventProps) {
                  const { directBargain } = eventProps;
                  directBargain();
                },
                // 确认及汇总提交事件
                remoteSureAndSubmit(props) {
                  const { sureAndSubmit = noop } = props;
                  sureAndSubmit();
                },
                beforeJump() {},
                // 开始评分事件
                remoteStartScore(eventProps) {
                  const { handleStartScoreJump } = eventProps || {};
                  if (handleStartScoreJump) {
                    handleStartScoreJump();
                  }
                },
                // 处理挂载组件时需要用到的二开数据
                handleFetchRemoteData() {},
              },
            }
          )(NewComponent)
        )
      )
    )
  );
};
const HOCComponent = hocRfxEvaluation(SrcEvaluationDetail);

export default HOCComponent;
