import withCustomize from 'srm-front-cuz/lib/h0Customize';
import formatterCollections from 'utils/intl/formatterCollections';
import CombineComponent from '@/routes/components/CombineComponent';
import { BID } from '@/utils/globalVariable';

import { LadderLevelModal } from './index';

const hocComponent = (Com) => {
  return withCustomize({
    unitCode: ['SSRC.NEW_BID_HALL_CHECK_PRICE.LADDER_INQUIRY_TABLE'], // 阶梯报价-表格信息
  })(formatterCollections({ code: ['ssrc.inquiryHall'] })(Com));
};

export default CombineComponent({
  sourceKey: BID,
})(hocComponent(LadderLevelModal));
