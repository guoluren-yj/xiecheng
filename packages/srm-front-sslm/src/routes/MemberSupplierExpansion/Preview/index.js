/*
 * @Date: 2024-08-08 10:12:09
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React from 'react';
import { compose } from 'lodash';

import formatterCollections from 'utils/intl/formatterCollections';

import StoreProvider from '../stores';
import PreviewDetail from './Detail';

const Index = props => {
  return (
    <StoreProvider {...props}>
      <PreviewDetail {...props} />
    </StoreProvider>
  );
};

export default compose(
  formatterCollections({
    code: [
      'sslm.common',
      'spfm.enterprise',
      'spfm.contactPerson',
      'sslm.supplierManage',
      'sslm.memberExpansion',
      'spfm.supplierRegister',
    ],
  })
)(Index);
