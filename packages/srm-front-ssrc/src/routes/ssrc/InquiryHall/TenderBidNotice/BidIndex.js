import { HOCComponent, BidNotice } from './index';
import CombineComponent from '@/routes/components/CombineComponent';

import { BID } from '@/utils/globalVariable';

export default CombineComponent({
  sourceKey: BID,
})(HOCComponent(BidNotice));
