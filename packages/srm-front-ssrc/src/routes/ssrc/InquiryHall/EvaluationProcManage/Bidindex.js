/**
 * 寻源大厅 - 公用评标过程管理页面
 * @date: 2019-0８０１２
 * @author: zoukang <kang.zou@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */

import { connect } from 'dva';
import { getCurrentOrganizationId, getCurrentUserId } from 'utils/utils';

import { BID } from '@/utils/globalVariable';

import SrcEvaluationProcManage from '../../../sbid/BidHall/BidEvaluationProcManage';

class Main extends SrcEvaluationProcManage {}

const hocComponent = (com) => {
  return connect(({ inquiryHallBid, loading }) => ({
    inquiryHallBid,
    inquiryHall: inquiryHallBid,
    modelName: 'inquiryHallBid',
    fetchBidEvaluateExpertScoringLoading:
      loading.effects['inquiryHallBid/fetchBidEvaluateExpertScoring'],
    organizationId: getCurrentOrganizationId(),
    userId: getCurrentUserId(),
    sourceKey: BID,
  }))(com);
};
export default hocComponent(Main);
export { hocComponent, Main };
