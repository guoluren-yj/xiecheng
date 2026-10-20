import React from 'react';
import { Button, Row } from 'hzero-ui';
// import queryString from 'query-string';
import { Bind } from 'lodash-decorators';

import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { getEnvConfig } from 'utils/iocUtils';
import {
  removeAccessToken,
  removeAllCookie,
  setSession,
  getSession,
  extractAccessTokenFromHash,
  extractRefreshTokenFromHash,
  setAccessToken,
  setRefreshToken,
} from 'utils/utils';
import { ReactComponent as Unauthorized } from '../../assets/unauthorized/unauthorized_new.svg';

import styles from './index.less';

@formatterCollections({
  code: ['hzero.common'],
})
export default class TokenExpired extends React.Component {
  // componentDidMount() {
  //   const { location, history } = this.props;
  //   const token = extractAccessTokenFromHash(window.location.hash);
  //   const refreshToken = extractRefreshTokenFromHash(window.location.hash);
  //   if (token) {
  //     setAccessToken(token, 60 * 60);
  //     setRefreshToken(refreshToken, 60 * 60);
  //     // 保留上次退出时的页面路径和search
  //     if (location.pathname === '/public/unauthorized') {
  //       history.push({
  //         pathname: '/workplace',
  //       });
  //     } else {
  //       history.push({
  //         pathname: location.pathname,
  //         search: location.search,
  //       });
  //     }
  //   }
  // }

  @Bind()
  handleReLogin() {
    const { LOGIN_URL, BASE_PATH } = getEnvConfig();
    let cacheLocation = getSession('redirectUrl');
    // 为空时返回false
    if (!cacheLocation) {
      const { host } = window.location;
      cacheLocation = encodeURIComponent(`${host}${BASE_PATH || '/'}`)
    } else {
      const decodeCacheLocation = decodeURIComponent(cacheLocation);
      if (decodeCacheLocation && decodeCacheLocation.includes('/public/unauthorized')) {
        cacheLocation = encodeURIComponent(decodeCacheLocation.replace('/public/unauthorized', '/'));
      }
    }
    removeAccessToken();
    removeAllCookie();
    setSession('isErrorFlag', false);
    // 由于 LOGIN_URL 可以 配置, 所以 做一次判断
    if (LOGIN_URL.includes('?')) {
      window.location.href = `${LOGIN_URL}&redirect_uri=${cacheLocation}`; // 401 需要在登录后返回401的页面
    } else {
      window.location.href = `${LOGIN_URL}?redirect_uri=${cacheLocation}`; // 401 需要在登录后返回401的页面
    }
  }

  render() {
    return (
      <div className={styles['token-expired-content']}>
        <Row type="flex" justify="center">
          {/* <img alt="" src={unauthorized} style={{ width: 400, marginTop: 100, color: '#003266' }} /> */}
          <div className={styles['unauthorized-img']}>
            <Unauthorized />
          </div>
        </Row>
        <Row type="flex" justify="center">
          <h1 style={{ marginTop: 20, marginLeft: 32, fontSize: '18px' }}>
            {intl
              .get('hzero.common.view.message.title.unauthorized.expired')
              .d('抱歉，您未登录或身份认证已失效，请点击下方按钮重新登录！')}
          </h1>
        </Row>
        <Row type="flex" justify="center">
          <div className={styles['button-center']}>
            <Button
              onClick={this.handleReLogin}
              size="large"
              style={{
                // backgroundColor: '#003266',
                textAlign: 'center',
                marginTop: 20,
                width: 200,
                color: 'white',
                height: 38,
                fontSize: 15,
                border: 'none',
              }}
            >
              {intl.get('hzero.common.button.reLogin').d('重新登录')}
            </Button>
          </div>
        </Row>
      </div>
    );
  }
}
