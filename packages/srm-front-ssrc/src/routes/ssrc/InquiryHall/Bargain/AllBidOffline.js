import withCustomize from 'srm-front-cuz/lib/c7nCustomize';

import { All } from './All';

const HOCComponent = (Com) => {
  return withCustomize({
    unitCode: ['SSRC.BID_HALL_BARGAIN.ALLQUOTATION_OFFLINE'],
  })(Com);
};

export default HOCComponent(All);
