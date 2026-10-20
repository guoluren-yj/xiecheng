import withCustomize from 'srm-front-cuz/lib/c7nCustomize';

import { All } from './All';

const HOCComponent = (Com) => {
  return withCustomize({
    unitCode: ['SSRC.INQUIRY_HALL_BARGAIN.ALLQUOTATION_OFFLINE'],
  })(Com);
};

export { HOCComponent };

export default HOCComponent(All);
