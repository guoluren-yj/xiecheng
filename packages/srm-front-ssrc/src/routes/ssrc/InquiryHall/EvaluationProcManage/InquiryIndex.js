/**
 * 寻源大厅 - 公用评标过程管理页面
 * @date: 2019-0８０１２
 * @author: zoukang <kang.zou@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */

import { connect } from 'dva';
import { getCurrentOrganizationId, getCurrentUserId } from 'utils/utils';

import { INQUIRY } from '@/utils/globalVariable';

import SrcEvaluationProcManage from '../../../sbid/BidHall/BidEvaluationProcManage';

class Main extends SrcEvaluationProcManage {}

const hocComponent = (com) => {
  return connect(({ inquiryHallNew, loading }) => ({
    inquiryHallNew,
    inquiryHall: inquiryHallNew,
    modelName: 'inquiryHallNew',
    fetchBidEvaluateExpertScoringLoading:
      loading.effects['inquiryHallNew/fetchBidEvaluateExpertScoring'],
    organizationId: getCurrentOrganizationId(),
    userId: getCurrentUserId(),
    sourceKey: INQUIRY,
  }))(com);
};
export default hocComponent(Main);
export { hocComponent, Main };
