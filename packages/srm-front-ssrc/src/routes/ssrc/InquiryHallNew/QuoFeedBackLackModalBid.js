import CombineComponent from '@/routes/components/CombineComponent';
import { BID } from '@/utils/globalVariable';
import { HOCComponent, QuoFeedBackLackModal } from './QuoFeedBackLackModal';

export default CombineComponent({
  sourceKey: BID,
})(HOCComponent(QuoFeedBackLackModal, BID));
