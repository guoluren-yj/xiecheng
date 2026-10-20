/*
 * @Description: file content
 * @Author: jiwei.liu01@hand-china.com
 * @Date: 2022-05-23 17:09:36
 * @version: 0.0.1
 * @copyright: Copyright (c) 2022, Hand
 */
import React from 'react';

import List from './List';
import StoreProvider from './StoreProvider';

const App = (props) => (
  <StoreProvider {...props}>
    <List {...props} />
  </StoreProvider>
);
export default App;
