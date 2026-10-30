/**
 * 专家评分修改 - 新询价大厅入口（二开）
 * 与 ./index 使用同一套二开组件，仅切换数据模型为 expertScoringInquiryHall
 */
import { connect } from 'dva';
import { Form } from 'hzero-ui';
import { compose } from 'lodash';
import remote from 'hzero-front/lib/utils/remote';
import withCustomize from 'srm-front-cuz/lib/h0Customize';

import { getCurrentOrganizationId } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';

import { ExpertScoring } from './index';

const hocComponent = (com) =>
  compose(
    withCustomize({
      unitCode: [
        'SSRC.EXPERT_SCORE_SCORING.QUOTATION_LINE_TECH',
        'SSRC.EXPERT_SCORE_SCORING.QUOTATION_LINE_BUSINESS',
        'SSRC.EXPERT_SCORE_SCORING.QUOTATION_LINE_BUSINESS_TECH',
        'SSRC.EXPERT_SCORE_SCORING.QUOTATION_LINE_TECH_RFX',
        'SSRC.EXPERT_SCORE_SCORING.QUOTATION_LINE_BUSINESS_RFX',
        'SSRC.EXPERT_SCORE_SCORING.QUOTATION_LINE_BUSINESS_TECH_RFX',
        'SSRC.EXPERT_SCORE_SCORING.HEADER_DETAIL_RFX',
        'SSRC.EXPERT_SCORE_SCORING.LINE_DETAIL_RFX',
        'SSRC.EXPERT_SCORE_SCORING.ELEMENT_LINE_DETAIL_RFX',
        'SSRC.EXPERT_SCORE_SCORING.HEADER_EDIT_RFX',
        'SSRC.EXPERT_SCORE_SCORING.HEADER_EDIT_RFI',
        'SSRC.EXPERT_SCORE_SCORING.HEADER_DETAIL_RFI',
        'SSRC.EXPERT_SCORE_SCORING.LINE_EDIT_RFX',
        'SSRC.EXPERT_SCORE_SCORING.HEADER_DETAIL_BID',
        'SSRC.EXPERT_SCORE_SCORING.HEADER_EDIT_BID',
        'SSRC.EXPERT_SCORE_SCORING.LINE_DETAIL_BID',
        'SSRC.EXPERT_SCORE_SCORING.LINE_EDIT_BID',
        'SSRC.EXPERT_SCORE_SCORING.ELEMENT_LINE_EDIT_RFX',
        'SSRC.EXPERT_SCORE_SCORING.HEADER_BUTTONS',
      ],
    }),
    connect(({ expertScoringInquiryHall, loading }) => ({
      expertScoringInquiryHall,
      modelName: 'expertScoringInquiryHall',
      queryScoringSupplierLoading: loading.effects['expertScoringInquiryHall/fetchScoringSupplier'],
      queryScoringQuotationLoading:
        loading.effects['expertScoringInquiryHall/fetchScoringQuotation'],
      queryScoringHeaderLoading: loading.effects['expertScoringInquiryHall/fetchScoringHeader'],
      queryScoringIndicLoading: loading.effects['expertScoringInquiryHall/fetchScoringIndic'],
      savePreApplyLoading: loading.effects['expertScoringInquiryHall/savePretrialApplication'],
      submitPreApplyLoading: loading.effects['expertScoringInquiryHall/submitPretrialApplication'],
      saveScoreingLoading: loading.effects['expertScoringInquiryHall/saveScoreing'],
      fetchScoreElementLoading:
        loading.effects['expertScoringInquiryHall/fetchScoreElementList'],
      submitExpertLoading: loading.effects['expertScoringInquiryHall/submitScoreing'],
      saveExpertLoading: loading.effects['expertScoringInquiryHall/saveElementScoreing'],
      submitElementExpertLoading:
        loading.effects['expertScoringInquiryHall/submitElementScoreing'],
      querySupplierExchangeEditLoading:
        loading.effects['expertScoringInquiryHall/querySupplierExchangeEdit'],
      saveExchangeEditLoading: loading.effects['expertScoringInquiryHall/saveExchangeEdit'],
      fetchQuotationDetailLoading: loading.effects['expertScoringInquiryHall/fetchQuotationDetail'],
      fetchLadderLevelTableLoading:
        loading.effects['expertScoringInquiryHall/fetchLadderLevelTable'],
      organizationId: getCurrentOrganizationId(),
    })),
    formatterCollections({
      code: [
        'ssrc.expertScoring',
        'ssrc.supplierBidQuery',
        'ssrc.inquiryHall',
        'ssrc.common',
        'ssrc.supplierQuotation',
        'scux.ssrc',
      ],
    }),
    Form.create({ fieldNameProp: null })
  )(
    remote(
      {
        code: 'SSRC_EXPERT_SCORING_BUSS',
        name: 'exportScoringBuss',
      },
      {
        events: {
          remoteTechInitDemesion(eventProps) {
            const { switchDimension = () => {} } = eventProps;
            switchDimension();
          },
          remoteSubmitElementExpert(eventProps) {
            const { handleSubmit = () => {} } = eventProps;
            handleSubmit();
          },
          remoteSubmitExpert(eventProps) {
            const { handleSubmit = () => {} } = eventProps;
            handleSubmit();
          },
          remoteStartScore(eventProps) {
            const { startScoreFunc = () => {} } = eventProps;
            startScoreFunc();
          },
          afterLoadedPageCuxHandle() {}, // cux
          cuxBeforeSwitchDimension() {},
        },
      }
    )(com)
  );

export default hocComponent(ExpertScoring);
export { hocComponent, ExpertScoring };
