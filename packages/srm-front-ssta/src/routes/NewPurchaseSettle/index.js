/*
 * @Description: file content
 * @Date: 2022-02-15 21:25:16
 * @Author: JSS <shangshang.jing@gong-link.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2022, Hand
 */
import React from 'react';

import List from './List';
import { ListStoreProvider } from './StoreProvider';

const Index = (props) => {
  return (
    <ListStoreProvider {...props}>
      <List />
    </ListStoreProvider>
  );
};

export default Index;
