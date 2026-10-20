import { connect } from 'dva';
import { Form } from 'hzero-ui';
import { compose, noop } from 'lodash';
import remote from 'hzero-front/lib/utils/remote';
import withCustomize from 'srm-front-cuz/lib/h0Customize';

import { getCurrentOrganizationId, getCurrentUserId } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';

import { ConfirmCandidate } from './index';

const hocComponent = (Com) => {
  return compose(
    withCustomize({
      unitCode: [
        'SSRC.EXPERT_SCORE_MANAGE.LINE_DETAIL',
        'SSRC.EXPERT_SCORE_MANAGE.LINE_EDIT',
        'SSRC.EXPERT_SCORE_MANAGE.SECTION_HEADER_BUTTONS',
        'SSRC.EXPERT_SCORE_MANAGE.HEADER_BASE',
        'SSRC.EXPERT_SCORE_MANAGE.LINE_VIEW',
        'SSRC.EXPERT_SCORE_MANAGE.CONFIRM_CANDIDATE_OTHERINFO_FORM',
        'SSRC.EXPERT_SCORE_MANAGE.CONFIRM_CANDIDATE_DETAIL_ITEMLINE_TABLE',
        'SSRC.EXPERT_SCORE_MANAGE.CONFIRM_CANDIDATE_HEADER_COLLAPSE',
        'SSRC.EXPERT_SCORE_MANAGE.CONFIRM_CANDIDATE_BASIC_TABS',
        'SSRC.EXPERT_SCORE_MANAGE.CONFIRM_CANDIDATE_HEADER_BUTTONS',
      ],
    }),
    Form.create({ fieldNameProp: null }),
    formatterCollections({
      code: ['ssrc.inquiryHall', 'ssrc.common', 'ssrc.bidHall', 'scux.ssrc', 'ssrc.scux'],
    }),
    connect(({ inquiryHallBid, loading }) => ({
      inquiryHallBid,
      inquiryHall: inquiryHallBid,
      modelName: 'inquiryHallBid',
      fetchEvaluateSummaryLoading: loading.effects['inquiryHallBid/fetchEvaluateSummary'],
      fetchScoreDetailLoading: loading.effects['inquiryHallBid/fetchScoreDetail'],
      saveRfxCandidateLoading: loading.effects['inquiryHallBid/saveRfxCandidate'],
      submitRfxCandidateLoading: loading.effects['inquiryHallBid/submitRfxCandidate'],
      fetchInquiryHallUpdateLoading: loading.effects['inquiryHallBid/fetchInquiryHeaderDetail'],
      fetchItemLineLoading: loading.effects['inquiryHallBid/fetchItemLine'],
      fetchQuotationDetailLoading: loading.effects['inquiryHallBid/fetchQuotationDetail'],
      fetchLadderLevelLoading: loading.effects['inquiryHallBid/fetchLadderLevelyTable'],
      returnToSummaryLoading: loading.effects['inquiryHallBid/returnToSummary'],
      organizationId: getCurrentOrganizationId(),
      userId: getCurrentUserId(),
    }))
  )(
    remote(
      {
        code: 'SSRC_EVALUATION_PROC_MANAGE_CONFIRM_CANDIDATE',
        name: 'remote',
      },
      {
        events: {
          onSubmit(eventProps) {
            // 标准click逻辑
            const { onSubmit = noop } = eventProps || {};
            onSubmit();
          },
          handleAfterCreateNewTemplate() {},
        },
      }
    )(Com)
  );
};

export default hocComponent(ConfirmCandidate);
export { hocComponent, ConfirmCandidate };
