import { connect } from 'dva';
import { Form } from 'hzero-ui';

import { FilterForm } from './FilterForm';

const HOCComponent = (Com) => {
  return connect(({ inquiryHall }) => ({
    inquiryHall,
    applyToInquirySearchData: inquiryHall.applyToInquirySearchData,
    modelName: 'inquiryHall',
  }))(Form.create({ fieldNameProp: null })(Com));
};

export default HOCComponent(FilterForm);
