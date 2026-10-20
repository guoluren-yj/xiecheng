import CombineComponent from '@/routes/components/CombineComponent';
import { BID, BID_LOWERCASE } from '@/utils/globalVariable';

import { HocComponent, ApplyToInquiryNew } from './index';

const hocBidUpdate = (NewComponent) => {
  return CombineComponent({
    sourceKeyLowerCase: BID_LOWERCASE,
    sourceKey: BID,
  })(HocComponent(NewComponent, BID));
};

export default hocBidUpdate(ApplyToInquiryNew);
