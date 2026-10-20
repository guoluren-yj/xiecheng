/*
 * @Date: 2024-07-30 14:35:32
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React from 'react';
import { compose } from 'lodash';
import formatterCollections from 'utils/intl/formatterCollections';

import StoreProvider from './stores';
import MemberExpansion from './MemberExpansion';

const Index = props => {
  return (
    <StoreProvider {...props}>
      <MemberExpansion {...props} />
    </StoreProvider>
  );
};

export default compose(
  formatterCollections({
    code: ['sslm.common', 'sslm.memberExpansion', 'sslm.supplierManage', 'sslm.supplierDetail'],
  })
)(Index);
