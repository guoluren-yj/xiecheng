/**
 * ProcessConfiguration - 工作流单据整合入口界面
 * @date: 2022-06-29
 * @author: Lokya <kan.li01@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */

import React from 'react';
import StoreProvider from './store';
import ProcessConfiguration from './ProcessConfiguration';

export default (props) => (
  <StoreProvider {...props}>
    <ProcessConfiguration />
  </StoreProvider>
);
