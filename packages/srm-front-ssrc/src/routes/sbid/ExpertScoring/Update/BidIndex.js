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
    connect(({ expertScoringBidHall, loading }) => ({
      expertScoringBidHall,
      modelName: 'expertScoringBidHall',
      queryScoringSupplierLoading: loading.effects['expertScoringBidHall/fetchScoringSupplier'],
      queryScoringQuotationLoading: loading.effects['expertScoringBidHall/fetchScoringQuotation'],
      queryScoringHeaderLoading: loading.effects['expertScoringBidHall/fetchScoringHeader'],
      queryScoringIndicLoading: loading.effects['expertScoringBidHall/fetchScoringIndic'],
      savePreApplyLoading: loading.effects['expertScoringBidHall/savePretrialApplication'],
      submitPreApplyLoading: loading.effects['expertScoringBidHall/submitPretrialApplication'],
      saveScoreingLoading: loading.effects['expertScoringBidHall/saveScoreing'],
      fetchScoreElementLoading: loading.effects['expertScoringBidHall/fetchScoreElementList'],
      submitExpertLoading: loading.effects['expertScoringBidHall/submitScoreing'],
      saveExpertLoading: loading.effects['expertScoringBidHall/saveElementScoreing'],
      submitElementExpertLoading: loading.effects['expertScoringBidHall/submitElementScoreing'],
      querySupplierExchangeEditLoading:
        loading.effects['expertScoringBidHall/querySupplierExchangeEdit'],
      saveExchangeEditLoading: loading.effects['expertScoringBidHall/saveExchangeEdit'],
      fetchQuotationDetailLoading: loading.effects['expertScoringBidHall/fetchQuotationDetail'],
      fetchLadderLevelTableLoading: loading.effects['expertScoringBidHall/fetchLadderLevelTable'],
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
        },
      }
    )(com)
  );

export default hocComponent(ExpertScoring);
export { hocComponent, ExpertScoring };
