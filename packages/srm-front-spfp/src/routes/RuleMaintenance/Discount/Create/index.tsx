/*
 * @Description: 折扣规则新建弹框
 * @Date: 2023-03-22 10:50:25
 * @Author: MYT<yitian.mao@going-link.com>
 * @Version: 1.0.0
 * @Copyright: Copyright (c) 2021, ZhenYun
 */

import React from 'react';

import CreateModal from './CreateModal';
import { CreateStorProvider } from '../Detail/stores';


export default props => {
  return (
    <CreateStorProvider {...props}>
      <CreateModal />
    </CreateStorProvider>
  );
};
