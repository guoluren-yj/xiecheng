import { BID } from '@/utils/globalVariable';
import CombineComponent from '@/routes/components/CombineComponent';
import { withStandardCompEnhancer, PretrialApplicationModal } from './PretrialApplicationModal';

const BidPretrialApplicationModal = (Comp) =>
  CombineComponent({
    sourceKey: BID,
  })(withStandardCompEnhancer(Comp, `${BID}_`));

export default BidPretrialApplicationModal(PretrialApplicationModal);
