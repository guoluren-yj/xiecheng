import CombineComponent from '@/routes/components/CombineComponent';
import { BID, BID_LOWERCASE, INQUIRY_BID } from '@/utils/globalVariable';

import { hocUpdate } from './index.js';
import { hocUpdateDetail, Detail } from '../Detail';

class MainDetailComponent extends Detail {}

const ConfDetail = hocUpdateDetail(MainDetailComponent, INQUIRY_BID);

class MainBidComponent extends ConfDetail {}

export default CombineComponent({
  sourceKeyLowerCase: BID_LOWERCASE,
  sourceKey: BID,
})(hocUpdate(MainBidComponent, INQUIRY_BID));

export { hocUpdate, MainBidComponent };
