/**
 * @date 2019-03-04
 * @author WY yang.wang06@hand-china.com
 * @copyright ® HAND 2019
 */
import React from 'react';
import { withRouter, Route } from 'dva/router';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import moment from 'moment';
import 'moment-timezone';

import Exception from 'components/Exception';
import { getEnvConfig } from 'utils/iocUtils';
import {
  extractAccessTokenFromHash,
  extractRefreshTokenFromHash,
  extractErrorMessageFromSearch,
  setAccessToken,
  setRefreshToken,
  getCurrentOrganizationId,
  setSession,
  getCurrentUser,
  setLanguageStorage,
} from 'utils/utils';
import { CURRENT_TENANT_ROLE_LANGUAGE_TIMEZONE, YQCLOUD_TABMAP, YQCLOUD_COUNT, GMT2ETCMap } from 'utils/constants';

@withRouter
@connect()
export default class AuthorizedRoute extends React.Component {
  state = {
    isAuthorized: false,
    isException: false,
  };

  componentDidMount() {
    const { dispatch, history, location, isPub } = this.props;
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
    window.addEventListener('storage', this.handleStorageChange);
    dispatch({
      type: 'user/fetchCurrent',
    }).then((res) => {
      if (res) {
        if (!(res instanceof Error)) {
          if (!res.failed) {
            const { tenantId, tenantNum, language, currentRoleId, currentRoleLevel, timeZone } = res;
            // 进入工作台读取业务规则中的日历开关
            dispatch({ type: 'global/queryGlobalCalendarEnable' });
            // 进入工作台查询配置表
            dispatch({ type: 'global/queryAmount10CalTax', payload: { tenantId, tenantNum } });
            moment.tz.setDefault(GMT2ETCMap[timeZone] || timeZone);
            // 请求 self 接口成功
            // 设置当前语言到session
            setLanguageStorage(language);
            // 登陆成功后记录当前登陆租户、角色和语言
            localStorage.setItem(
              CURRENT_TENANT_ROLE_LANGUAGE_TIMEZONE,
              `${tenantId}-${currentRoleId}-${language}-${timeZone}`
            );
            dispatch({
              type: 'global/pubInit',
              payload: {
                language: language, // 加载菜单国际化
                organizationId: getCurrentOrganizationId(),
                isPubLayout: isPub,
                roleLevel: currentRoleLevel,
              },
            }).then(() => {
              this.setState({
                isAuthorized: true,
              });
            });
          } else {
            // 清除首屏loading
            const loader = document.querySelector('#loader-wrapper');
            this.setState({
              isException: true,
            });
            if (loader) {
              loader.parentNode.removeChild(loader);
            }
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
          // 清除首屏loading
          const loader = document.querySelector('#loader-wrapper');
          if (loader) {
            document.body.removeChild(loader);
          }
          history.push('/exception/500');
        }
      }
      // else {
      //   // self 接口 请求 401
      // }
    });

    // request(AUTH_SELF_URL).then(user => {
    //   if (user && !isNil(user.id)) {
    //     this.setState({
    //       isAuthorized: true,
    //     });
    //   }
    // })
    // .catch(() => {
    //   removeAccessToken();
    //   window.location.href = AUTH_URL;
    // });
  }

  componentWillUnmount() {
    window.removeEventListener('storage', this.handleStorageChange);
  }

  @Bind()
  handleStorageChange(data) {
    if (!data) {
      return;
    }
    if (data.key === CURRENT_TENANT_ROLE_LANGUAGE_TIMEZONE) {
      const { tenantId, currentRoleId, language, timeZone } = getCurrentUser();
      const currentLoginUser = `${tenantId}-${currentRoleId}-${language}-${timeZone}`;
      // 切换租户、角色或退出登陆时刷新所有tab
      if (data.newValue !== currentLoginUser) {
        const { BASE_PATH } = getEnvConfig();
        localStorage.removeItem(YQCLOUD_TABMAP);
        localStorage.removeItem(YQCLOUD_COUNT);
        window.location.href = BASE_PATH || '/';
      }
    }
  }

  render() {
    const { render, ...rest } = this.props;
    const { isAuthorized, isException } = this.state;
    // eslint-disable-next-line no-nested-ternary
    return isAuthorized === true ? (
      <Route {...rest} render={(props) => render(props)} />
    ) : isException === true ? (
      <Exception type="500" />
    ) : null;
  }
}
