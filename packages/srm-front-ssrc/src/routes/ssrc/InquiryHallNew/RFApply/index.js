/*
 * @Descripttion: 申请转RF--Index
 * @version:
 * @Author: yiping.liu<yiping.liu@going-link.com>
 * @Date: 2021-08-06 10:37:33
 * @LastEditors: yiping.liu
 */
import React from 'react';
import WithCustomizeC7N from 'srm-front-cuz/lib/c7nCustomize';

import Page from './Page';
import { StoreProvider } from './store';

const Index = (props) => {
  return (
    <StoreProvider {...props}>
      <Page {...props} />
    </StoreProvider>
  );
};

export default WithCustomizeC7N({
  unitCode: [],
})(Index);
