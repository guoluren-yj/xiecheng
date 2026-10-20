import CombineComponent from '@/routes/components/CombineComponent';
import { INQUIRY } from '@/utils/globalVariable';
import { IsOpenDoubleUnitHOC } from '@/utils/utils';

import { withStandardCompEnhancer, Index } from '../index';

export default IsOpenDoubleUnitHOC()(
  CombineComponent({
    sourceKey: INQUIRY,
    detailFlag: true,
  })(withStandardCompEnhancer(Index))
);

export { withStandardCompEnhancer, Index };
