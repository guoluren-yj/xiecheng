import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { Form } from 'hzero-ui';
import CombineComponent from '@/routes/components/CombineComponent';
import { BID } from '@/utils/globalVariable';

import { LadderLevelModal } from './LadderLevelModal';

const hocComponent = (Com) => {
  return withCustomize({
    unitCode: [`SSRC.BID_SUPPLIER_QUOTATION.LADDER_INQUIRY_TABLE`],
  })(Form.create({ fieldNameProp: null })(Com));
};

export default CombineComponent({
  sourceKey: BID,
})(hocComponent(LadderLevelModal));
