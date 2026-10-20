// import { connect } from 'dva';
// import { Form } from 'hzero-ui';
// import withCustomize from 'srm-front-cuz/lib/h0Customize';

// import { getCurrentOrganizationId } from 'utils/utils';
// import formatterCollections from 'utils/intl/formatterCollections';
// import remote from 'hzero-front/lib/utils/remote';
import CombineComponent from '@/routes/components/CombineComponent';
import { BID } from '@/utils/globalVariable';

import { AcceptRfxNotice, hocComponent } from './index';

export default CombineComponent({
  sourceKey: BID,
})(hocComponent(AcceptRfxNotice, { bidFlag: true }));
