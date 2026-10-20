/*
 * @Description:
 * @Version: 2.0
 * @Autor: wangmiao
 * @Date: 2021-07-09 17:34:01
 * @LastEditors: yiping.liu
 * @LastEditTime: 2023-02-09 13:52:31
 */
/**
 * 寻源大厅 - 公用评标过程管理页面
 * @date: 2019-0８０１２
 * @author: zoukang <kang.zou@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */
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
      connect(({ inquiryHall, bidHall, loading }) => ({
        bidHall,
        inquiryHall,
        modelName: 'inquiryHall',
        fetchExpertScoreInfoLoading: loading.effects['bidHall/fetchExpertScoreInfo'],
        fetchScoreLineLoading: loading.effects['bidHall/fetchScoreLine'],
        fetchSupplierListLoading: loading.effects['inquiryHall/fetchSupplierList'],
        saveEvaluateSummaryLoading:
          loading.effects['inquiryHall/saveEvaluateSummary'] ||
          loading.effects['inquiryHall/saveReviewEvaluateSummary'] ||
          loading.effects['bidHall/saveReviewEvaluateSummary'],
        submitEvaluateSummaryLoading:
          loading.effects['inquiryHall/submitEvaluateSummary'] ||
          loading.effects['inquiryHall/submitReviewEvaluateSummary'] ||
          loading.effects['bidHall/submitReviewEvaluateSummary'],
        fetchIPCoincidenceRateLoading: loading.effects['inquiryHall/fetchIPCoincidenceRate'],
        roundBeginScoreLoading: loading.effects['inquiryHall/roundBeginScore'],
        beginRoundQuotationLoading: loading.effects['inquiryHall/beginRoundQuotation'],
        fetchRfxScoreItemLinesLoading: loading.effects['inquiryHall/fetchRfxScoreItemLines'],
        fetchReScoringAllLoading: loading.effects['inquiryHall/reScoringAll'],
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

export { SrcEvaluationDetail, hocRfxEvaluation };
export default HOCComponent;
