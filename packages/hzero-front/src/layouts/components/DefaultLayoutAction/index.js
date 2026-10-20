/**
 * DefaultLayoutAction
 *
 * 通用的 一般情况下的 Layout 的 初始化流程
 *
 * @author WY <yang.wang06@hand-china.com>
 * @date 2019/8/27
 * @copyright 2019 © HAND
 */

import React, { Component } from 'react';
import { connect } from 'dva';
import dynamic from 'dva/dynamic';

import LoadingBar from 'components/NProgress/LoadingBar';

import { tabListen } from 'utils/menuTab';

class DefaultLayoutAction extends Component {
  componentDidMount() {
    // 清除首屏loading
    const loader = document.querySelector('#loader-wrapper');
    if (loader) {
      try {
        loader.parentNode.removeChild(loader);
      } catch (e) {
        loader.remove();
      }
      // 设置默认页面加载动画
      dynamic.setDefaultLoadingComponent(() => <LoadingBar />);
    }
    this.init();
  }

  init() {
    const { dispatch, currentUser = {}, isPubLayout } = this.props;
    const { language, currentRoleLevel, tenantId, tenantNum } = currentUser;
    dispatch({
      type: 'global/baseLazyInit',
      payload: {
        language,
      },
    }).then(() => {
      // 初始化菜单成功后 调用 tabListen 来触发手动输入的网址
      tabListen();
      dispatch({
        type: 'global/initActiveTabMenuId',
      });
      // 进入工作台读取业务规则中的日历开关
      dispatch({ type: 'global/queryGlobalCalendarEnable' });
      // 进入工作台查询配置表
      dispatch({ type: 'global/queryAmount10CalTax', payload: { tenantId, tenantNum } });
      // 查询证书信息
      dispatch({ type: 'global/fetchLicenseStatus' });
      // 查询消息未读数量
      dispatch({ type: 'global/fetchCount' });
      // 查询需控制无访问权限的路由清单
      if (!isPubLayout && currentRoleLevel !== 'site') {
        dispatch({ type: 'global/fetchUnauthorizedRouteList' });
      }
    });
  }

  render() {
    return null;
  }
}

export default connect(
  ({ user = {}, global = {} }) => ({
    currentUser: user.currentUser, // 当前用户
    isPubLayout: global.isPubLayout,
  }),
  null,
  null,
  { pure: true }
)(DefaultLayoutAction);
