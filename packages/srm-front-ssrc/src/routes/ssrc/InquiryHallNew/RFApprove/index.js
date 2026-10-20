/*
 * @Descripttion: 寻源过程控制--审批
 * @version:
 * @Author: yiping.liu<yiping.liu@going-link.com>
 * @Date: 2021-07-26 10:15:22
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
