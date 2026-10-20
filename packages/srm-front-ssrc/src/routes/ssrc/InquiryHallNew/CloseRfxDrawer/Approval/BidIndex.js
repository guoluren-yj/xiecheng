import { BID, BID_LOWERCASE } from '@/utils/globalVariable';
import CombineComponent from '@/routes/components/CombineComponent';
// import formatterCollections from 'utils/intl/formatterCollections';

import { Index, hocComponent } from './index';

// const HOCComponent = (Com) => {
//   return formatterCollections({
//     code: ['ssrc.inquiryHall', 'ssrc.common'],
//   })(Com);
// };

export default CombineComponent({
  sourceKey: BID,
  sourceKeyLowercase: BID_LOWERCASE,
})(hocComponent(Index, { bidFlag: 1 }));
