import { ReleasePrepareNewComponent, hocReleasePrepareNew } from './ReleasePrepareNew';

const ReleasePrepareNewBid = hocReleasePrepareNew(ReleasePrepareNewComponent, {
  currentPageSymbol: 'INQUIRY_BID',
});
export default ReleasePrepareNewBid;
