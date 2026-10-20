import CombineComponent from '@/routes/components/CombineComponent';
import { BID } from '@/utils/globalVariable';

import { Details, hocComponent } from './index';

export default CombineComponent({
  sourceKey: BID,
})(hocComponent(Details, BID));
