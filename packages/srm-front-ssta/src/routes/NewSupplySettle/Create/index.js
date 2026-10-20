/*
 * @Description: file content
 * @Date: 2022-02-09 11:39:02
 * @Author: JSS <shangshang.jing@gong-link.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2022, Hand
 */
import React from 'react';

import CreateModal from './CreateModal';
import { CreateStore } from '../Detail/StoreProvider';

const Index = (props) => {
  return (
    <CreateStore {...props}>
      <CreateModal />
    </CreateStore>
  );
};

export default Index;
