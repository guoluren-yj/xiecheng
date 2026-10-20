import CombineComponent from '@/routes/components/CombineComponent';
import { IsOpenDoubleUnitHOC } from '@/utils/utils';
import { BID } from '@/utils/globalVariable';

import { withStandardCompEnhancer, Index } from '../indexBid';

export default IsOpenDoubleUnitHOC()(
  CombineComponent({
    sourceKey: BID,
    detailFlag: true,
  })(withStandardCompEnhancer(Index))
);

export { withStandardCompEnhancer, Index };
