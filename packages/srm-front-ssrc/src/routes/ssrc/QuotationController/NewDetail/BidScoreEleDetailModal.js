import { connect } from 'dva';
import withCustomize from 'srm-front-cuz/lib/h0Customize';

import CombineComponent from '@/routes/components/CombineComponent';

import { ScoreEleDetailModal } from './ScoreEleDetailModal';

// 引用类型函数
const hocComponent = (Com) => {
  return withCustomize({
    unitCode: [
      'SSRC.BID_QUOTATION_CONTROLLER_DETAIL.WEIGHT_TABLE', // 询价要求-评分要素-评分要素细项-权重法
      'SSRC.BID_QUOTATION_CONTROLLER_DETAIL.SCORE_TABLE', // 询价要求-评分要素-评分要素细项-二分法
    ],
  })(
    connect(({ inquiryHall, bidHall, loading }) => ({
      inquiryHall,
      bidHall,
      loading: loading.effects['inquiryHall/fetchScoreDetailLevelTwoOfQuotationController'],
      save: loading.effects['inquiryHall/updateScoreDetailLevelTwoOfQuotationController'],
      deleting: loading.effects['inquiryHall/deleteDetail'],
    }))(Com)
  );
};

export default CombineComponent({ bidFlag: true })(hocComponent(ScoreEleDetailModal));
