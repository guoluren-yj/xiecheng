/**
 * bidHall -  跳转寻源服务/rfx详情
 * @date: 2018-12-26
 * @author: zoukang <kang.zou@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */

import ssrcDetail from '@/routes/ssrc/InquiryHall/Detail';
import { connect } from 'dva';

@connect(({ bidHall, inquiryHall, global }) => ({
  bidHall,
  inquiryHall,
  global,
}))
class SsrcDetail extends ssrcDetail {}

export default SsrcDetail;
