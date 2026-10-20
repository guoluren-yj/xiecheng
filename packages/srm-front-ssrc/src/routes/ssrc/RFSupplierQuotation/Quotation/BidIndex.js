import CombineComponent from '@/routes/components/CombineComponent';

import { hocComponent, QuotationComponent } from './index.js';

const hocBidUpdate = (NewComponent) => {
  return CombineComponent({
    bidFlag: 1,
  })(hocComponent(NewComponent, { bidFlag: 1 }));
};

export default hocBidUpdate(QuotationComponent);
