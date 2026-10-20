import CombineComponent from '@/routes/components/CombineComponent';
import { BID } from '@/utils/globalVariable';
import { HOCComponent, SourcingResult } from './index';

export default CombineComponent({
  sourceKey: BID,
  bidFlag: true,
})(HOCComponent(SourcingResult, BID));
