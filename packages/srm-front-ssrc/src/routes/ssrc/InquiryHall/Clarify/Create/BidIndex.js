import { BID } from '@/utils/globalVariable';
import CombineComponent from '@/routes/components/CombineComponent';

import { HOCComponent, Create } from './index';

export default CombineComponent({
  sourceKey: BID,
})(HOCComponent(Create, BID));
