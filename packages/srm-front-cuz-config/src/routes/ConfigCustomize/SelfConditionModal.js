/* eslint-disable eqeqeq */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable no-underscore-dangle */
/* eslint-disable jsx-a11y/anchor-is-valid */
import { Form } from 'hzero-ui';
import { connect } from 'dva';

import BaseCondition from './BaseCondition';

export default connect(({ configCustomizeCuz }) => {
  const { codes, conditionList = [], validatorList = [], headerProps = {}, cacheWidget = {} } = configCustomizeCuz;
  return {
    codes,
    headerProps,
    conditionList,
    validatorList,
    cacheWidget,
  };
})(Form.create({ fieldNameProp: null })(BaseCondition));
