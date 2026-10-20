/**
 * 专家评分节点 - 询价单
 */
import mixCustomize from 'srm-front-cuz/lib/mixCustomize';

import { INQUIRY_HALL } from '@/utils/globalVariable';
import ExpertScoringNew from './ExpertScoringNew';

const withStandardCompEnhancer = (Comp, options = {}) => {
  const { type = INQUIRY_HALL } = options || {};

  return mixCustomize({
    unitCode: [
      `SSRC.${type}_DETAIL.EXPERT_SCORE_BASEINFO`,
      `SSRC.${type}_DETAIL.HEADER_RFX`,
      `SSRC.${type}_DETAIL.EXPERT_SCORE_SUMMARY_RESULT`,
      `SSRC.${type}_DETAIL.EXPERT_REVIEW_SUMMARY_LIST`,
      `SSRC.${type}_DETAIL.EXPERT_REVIEW_INDICATE_HEADER_NEW`,
      `SSRC.${type}_DETAIL.EXPERT_REVIEW_INDICATE_LIST`,
    ],
    c7nUnit: [
      `SSRC.${type}_DETAIL.EXPERT_SCORE_BASEINFO`,
      `SSRC.${type}_DETAIL.HEADER_RFX`,
      `SSRC.${type}_DETAIL.EXPERT_REVIEW_SUMMARY_LIST`,
      `SSRC.${type}_DETAIL.EXPERT_REVIEW_INDICATE_HEADER_NEW`,
      `SSRC.${type}_DETAIL.EXPERT_REVIEW_INDICATE_LIST`,
    ],
  })(Comp);
};

export default withStandardCompEnhancer(ExpertScoringNew);
export { withStandardCompEnhancer, ExpertScoringNew };
