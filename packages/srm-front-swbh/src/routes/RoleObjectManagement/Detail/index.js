/*
 * @Description: file content
 * @Author: jiwei.liu01@hand-china.com
 * @Date: 2022-05-01 11:14:38
 * @version: 0.0.1
 * @copyright: Copyright (c) 2022, Hand
 */
import React from 'react';
import Detail from './Detail';
import StoreProvider from './StoreProvider';

const App = (props) => (
  <StoreProvider {...props}>
    <Detail {...props} />
  </StoreProvider>
);
export default App;
