import React from 'react';
import { compose } from 'lodash';
import { connect } from 'dva';
import OldWorkplace from './workplace';

const Comp = props => {
  return <OldWorkplace {...props} />;
};

export default compose(connect(state => state))(Comp);
