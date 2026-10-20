import { LadderLevelModal, hocLadderLevel } from './LadderLevelModal';

const LadderLevelModalNewBid = hocLadderLevel(LadderLevelModal, {
  currentPageSymbol: 'BID_HALL',
});
export default LadderLevelModalNewBid;
