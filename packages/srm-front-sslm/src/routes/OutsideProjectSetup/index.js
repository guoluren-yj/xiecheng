/*
 * @Description: 外部寻源-Index
 * @Date: 2025-05-21 16:12:54
 * @Author: zuoxiangyu <xiangyu.zuo@gong-link.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2025, Hand
 */
import React from 'react';

import { ListProvider } from './ListProvider';
import Contents from './Content';

const Index = props => {
  return (
    <ListProvider {...props}>
      <Contents />
    </ListProvider>
  );
};

export default Index;
