import CombineComponent from '@/routes/components/CombineComponent';
import { IsOpenDoubleUnitHOC } from '@/utils/utils';
import { BID } from '@/utils/globalVariable';

import { withStandardCompEnhancer, Index } from './index';

export default IsOpenDoubleUnitHOC()(
  CombineComponent({
    sourceKey: BID,
  })(withStandardCompEnhancer(Index))
);

export { withStandardCompEnhancer, Index };
