import CombineComponent from '@/routes/components/CombineComponent';
import { BID, BID_LOWERCASE } from '@/utils/globalVariable';

import { hocUpdate, UpdateComponent } from '../index.js';

const hocBidUpdate = (NewComponent) => {
  return CombineComponent({
    sourceKeyLowerCase: BID_LOWERCASE,
    sourceKey: BID,
  })(hocUpdate(NewComponent, BID));
};

export default hocBidUpdate(UpdateComponent);

export { hocBidUpdate };
