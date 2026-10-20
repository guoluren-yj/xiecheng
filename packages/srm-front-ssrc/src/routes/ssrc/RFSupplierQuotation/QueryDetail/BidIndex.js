// hocComponent, SupplierQueryNew
import CombineComponent from '@/routes/components/CombineComponent';

import { hocComponent, SupplierQueryNew } from './index.js';

const hocBidUpdate = (NewComponent) => {
  return CombineComponent({
    bidFlag: 1,
  })(hocComponent(NewComponent, { bidFlag: 1 }));
};

export default hocBidUpdate(SupplierQueryNew);
