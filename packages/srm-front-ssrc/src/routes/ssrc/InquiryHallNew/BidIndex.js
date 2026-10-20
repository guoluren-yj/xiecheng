import CombineComponent from '@/routes/components/CombineComponent';
import { BID, BID_LOWERCASE } from '@/utils/globalVariable';

import { InquiryHall } from './index';
import { withStandardCompEnhancer } from './standardCompEnhancerCreator';

const hocBidIndex = (comp) => {
  return CombineComponent({
    sourceKeyLowerCase: BID_LOWERCASE,
    sourceKey: BID,
  })(withStandardCompEnhancer(comp, BID));
};

export { hocBidIndex };
export default hocBidIndex(InquiryHall);
