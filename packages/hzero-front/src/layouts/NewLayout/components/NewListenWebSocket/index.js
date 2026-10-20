/**
 * NewListenWebSocket
 * @author Hugh <huazhen.wu01@going-link.com>
 * @date 2022/7/7
 * @copyright 2022 © ZHENYUN
 */

import React from 'react';
import { connect } from 'dva';
import DefaultListenWebSocket from '../../../components/DefaultListenWebSocket';

const NewListenWebSocket = function NewListenWebSocket(props) {
  const { menuHidden } = props;
  return menuHidden ? null : <DefaultListenWebSocket />;
};

export default connect(({ global = {} }) => ({
  menuHidden: global.menuHidden, // 隐藏菜单
}))(NewListenWebSocket);
