/*
 * @Description: file content
 * @Author: jiwei.liu01@hand-china.com
 * @Date: 2022-08-18 11:14:38
 * @version: 0.0.1
 * @copyright: Copyright (c) 2022, Hand
 */
import React from 'react';
import { ModalProvider } from 'choerodon-ui/pro';

import List from './List';
import StoreProvider from './stores';

const App = (props) => (
  <StoreProvider {...props}>
    <ModalProvider>
      <List {...props} />
    </ModalProvider>
  </StoreProvider>
);
export default App;
