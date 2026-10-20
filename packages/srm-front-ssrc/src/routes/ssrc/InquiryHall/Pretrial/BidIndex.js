import CombineComponent from '@/routes/components/CombineComponent';
import { BID } from '@/utils/globalVariable';

import { HOCComponent, CheckPrice } from './index';

export default CombineComponent({
  sourceKey: BID,
})(HOCComponent(CheckPrice, BID));
