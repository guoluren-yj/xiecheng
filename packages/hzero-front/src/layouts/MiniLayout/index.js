import React, { Component } from 'react';
import { connect } from 'dva';
import { Route } from 'dva/router';
import DocumentTitle from 'react-document-title';
import { Layout, Spin } from 'hzero-ui';
import moment from 'moment';
import 'moment-timezone';

import {
  extractAccessTokenFromHash,
  extractRefreshTokenFromHash,
  extractErrorMessageFromSearch,
  setAccessToken,
  setRefreshToken,
  setSession,
  setLanguageStorage,
} from 'utils/utils';
import { GMT2ETCMap } from 'utils/constants';
import { tabListen } from 'utils/menuTab';
import getTabRoutes from 'components/Router';
import Exception from 'components/Exception';

import DefaultListenFavicon from '../components/DefaultListenFavicon';
import NotFound from '../../routes/Exception/404';
import { changeTheme } from '../NewLayout/utils';

const { Content } = Layout;

@connect(({ user = {}, global = {} }) => {
  const { currentUser = {} } = user;
  const { themeConfigVO = {} } = currentUser;
  changeTheme(themeConfigVO);
  return {
    menuLoad: global.menuLoad,
    menu: global.menu,
    routerData: global.routerData,
    activeTabKey: global.activeTabKey,
    tabs: global.tabs,
    language: global.language,
    layoutLoading: global.layoutLoading,
  };
})
export default class MiniLayout extends Component {
  state = {
    isAuthorized: false,
    isException: false,
    title: '',
  };

  componentDidMount() {
    const { dispatch, history, location } = this.props;
    const token = extractAccessTokenFromHash(window.location.hash);
    const refreshToken = extractRefreshTokenFromHash(window.location.hash);
    const errorMessage = extractErrorMessageFromSearch(window.location.search);
    if (errorMessage) {
      history.push({
        pathname: '/public/error-message',
        state: {
          message: errorMessage,
        },
      });
      return;
    } else if (token) {
      setAccessToken(token, 60 * 60);
      setRefreshToken(refreshToken, 60 * 60);
      // 保留上次退出时的页面路径和search
      history.push({
        pathname: location.pathname,
        search: location.search,
      });
    }
    dispatch({
      type: 'user/fetchCurrent',
    }).then((res) => {
      if (res) {
        if (!(res instanceof Error)) {
          if (!res.failed) {
            const { tenantId, language, currentRoleId, currentRoleLevel, title, timeZone } = res;
            moment.tz.setDefault(GMT2ETCMap[timeZone] || timeZone);
            this.clearLoaderWrapper();
            this.setState({
              isAuthorized: true,
              title,
            });
            // 请求 self 接口成功
            // 设置当前语言到session
            setLanguageStorage(language);
            dispatch({
              type: 'global/miniLayoutInit',
              payload: {
                language: language, // 加载菜单国际化
                organizationId: tenantId,
                roleLevel: currentRoleLevel,
              },
            });
          } else {
            // 清除首屏loading
            this.setState({
              isException: true,
            });
            this.clearLoaderWrapper();
            history.push({
              pathname: '/public/self-error',
              state: {
                message: res.message,
              },
            });
          }
        } else {
          // 其他错误
          this.setState({
            isException: true,
          });
          this.clearLoaderWrapper();
          history.push('/exception/500');
        }
      }
    });
  }

  clearLoaderWrapper = () => {
    const loader = document.querySelector('#loader-wrapper');
    if (loader) {
      loader.parentNode.removeChild(loader);
    }
  };

  render() {
    const { location, tabs, layoutLoading, routerData, activeTabKey, menuLoad } = this.props;
    const { isAuthorized, isException, title } = this.state;
    if (isAuthorized) {
      return (
        <DocumentTitle title={title || ''}>
          <Layout style={{ height: '100%', overflow: 'hidden' }}>
          {tabs.map(pane =>
            activeTabKey === pane.key &&
            ((location && location.pathname === pane.path)) && (
              <Content key={pane.key} className="page-container">
                {(!menuLoad || layoutLoading) ? (
                  <div style={{ textAlign: 'center', paddingTop: 100 }}>
                    <Spin size="large" />
                  </div>
                ) : (
                  getTabRoutes({
                    pane,
                    routerData,
                    NotFound,
                    menu: [],
                    pathname: pane.path,
                    activeTabKey,
                  })
                )}
              </Content>
            )
          )}
          <DefaultListenFavicon />
        </Layout>
        </DocumentTitle>
      );
    }
    if (isException) {
      return <Exception type="500" />;
    }
    return null;
  }
}
