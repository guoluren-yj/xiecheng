import lookupStore from './LookupCodeStore';
import lovStore from './LovCodeStore';
import attachmentStore from './AttachmentStore';
import dateCodeStore from './DateCodeStore';

const stores: any = {
  LovCodeStore: lovStore,
  LookupCodeStore: lookupStore,
  AttachmentStore: attachmentStore,
  DateCodeStore: dateCodeStore,
};

export default stores;
