import CombineComponent from '@/routes/components/CombineComponent';
import { BID } from '@/utils/globalVariable';

import { SupplierRecord, withStandardCompEnhancer } from './OperationBid';

const BidHOCComponent = (Comp) =>
  CombineComponent({
    sourceKey: BID,
  })(withStandardCompEnhancer(Comp, BID));

export default BidHOCComponent(SupplierRecord);

export { BidHOCComponent };
