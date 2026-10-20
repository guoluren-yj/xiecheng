import { LadderLevelModal, hocLadderLevel } from './LadderLevelModalPrepare';

const LadderLevelModalPrepareBid = hocLadderLevel(LadderLevelModal, {
  currentPageSymbol: 'INQUIRY_BID',
});
export default LadderLevelModalPrepareBid;
