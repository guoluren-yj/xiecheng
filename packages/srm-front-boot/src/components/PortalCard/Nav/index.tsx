/**
 * PortalNav - 门户导航
 * @date: 2021-07-05
 * @author: Danica <ke.wang01@gonig-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Hand
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Select, Icon, Modal, Tooltip } from 'choerodon-ui/pro';
import ReactDOM from 'react-dom';
// import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
// import { FieldProps } from 'choerodon-ui/pro/lib/data-set/Field.d';
import Cookies from 'universal-cookie';
// import moment from 'moment';
import { isNil } from 'lodash';
import { getAccessToken, getResponse } from 'hzero-front/lib/utils/utils';
import request from 'utils/request';
import { getEnvConfig } from 'utils/iocUtils';
import { SRM_PLATFORM } from '@/utils/config';
import { setSecureCookie } from '@/utils/utils';
import { HZERO_PLATFORM } from 'utils/config';
import customerServiceImg from '@/assets/customer-service-line.png';
import { replacePrefix, logout, defaultRegisterLink, getUrlParam, setUrlParam } from '../util';
import styles from './index.less';

const { AUTH_HOST, BASE_PATH, PORTAL_CUSTOMER_SERVICE_BUTTON } = getEnvConfig() as any;
const DEFAULTLOGO = `${AUTH_HOST}/static/default/img/login/logo_normal.svg`;
const { Option } = Select;
const cookies = new Cookies();

interface PortalNavProps {
  logo?: any;
  navList?: Array<{
    link: string;
    name: string;
    blankEnabled: number;
    position: number;
    _tls: any;
  }>;
  languageList?: Array<any>;
  auto?: boolean;
  h?: number;
  prefix?: string;
  registerEnabledFlag?: number;
}
const getLayoutNavConfig = () => {
  return request(`${SRM_PLATFORM}/v1/portal-layouts/layout-nav`, {
    method: 'GET',
  });
};
const NavContent: React.FC<PortalNavProps> = ({
  logo = {},
  navList = [],
  languageList = [],
  auto = false,
  h = 1,
  prefix = '',
  registerEnabledFlag = 1,
  // positionMap,
}) => {
  const accessToken = useMemo(() => getAccessToken(), []);
  const [isLogin] = useState(!!accessToken); // 是否登录
  const newList = useMemo(() => {
    const newNavList = navList.map((item) => {
      if (item.link) {
        return { ...item, link: replacePrefix(prefix, item.link) };
      }
      return item;
    });
    return (
      (newNavList &&
        newNavList.sort((a, b) => {
          return a.position - b.position;
        })) ||
      []
    );
  }, [navList]);
  const [language] = useState(cookies.get('language') || 'zh_CN');
  const oauthIntl = useMemo(() => {
    const srmOauth = window.sessionStorage.getItem(`${language}-srm.portal`);
    if (srmOauth) {
      return JSON.parse(srmOauth);
    }
    return {};
  }, [language]);
  const computeStyle = useMemo(() => {
    if (auto) {
      return {
        // h和height的换算与一级门户统一
        height: 37 + (h - 1) * 51,
        marginBottom: 15,
        zIndex: 1,
      };
    }
    return {};
  }, [h]);

  const root = document.getElementById('root');

  /**
   *  切换多语言
   */
  const handleLanguage = useCallback((value) => {
    if (value === language) return;
    const expires = new Date();
    expires.setTime(new Date().getTime() + 365*24*60*60*1000);
    setSecureCookie('language', value, { path: '/', expires });
    if (getUrlParam('language') === language) {
      window.location.href = setUrlParam('language', language, value);
    } else {
      window.location.reload();
    }
  }, []);

  const handleOpenCustomerServiceModal = useCallback(() => {
    Modal.open({
      drawer: true,
      key: 'customerServiceModal',
      mask: false,
      className: 'customer-service-modal',
      children: <iframe
       src="https://botpress.apps.yqcloud.com/s/755746292642648064"
        id="customerService"
        name="customerService"
        title="customerService"
        width="100%"
        height="100%"
        frameBorder="none"
        style={{ border: 'none' }}
       />,
      footer: (okBtn, cancelBtn) => <>{cancelBtn}</>,
      cancelText: oauthIntl['srm.oauth.navbar.button.up'] || '收起',
      cancelProps: {
        color: 'primary',
      },
      destroyOnClose: true,
    })
  }, []);

  const renderCustomerService = () => {
    if (!root) return null;
    return ReactDOM.createPortal(
      <div className="customer-service-img" onClick={handleOpenCustomerServiceModal}>
        <Tooltip title={oauthIntl['srm.oauth.navbar.customerTooltip'] || '客服'} arrowPointAtCenter>
      <img src={customerServiceImg} alt="" />
    </Tooltip>
    </div>, root);
  };

  return (
    <div className={styles['portal-nav']} style={computeStyle}>
      {!isLogin && PORTAL_CUSTOMER_SERVICE_BUTTON === 'true' && renderCustomerService()}
      <div className='portal-nav-container'>
        <div className="portal-logo">
          <img src={auto ? logo.url : (logo.url || DEFAULTLOGO)} className="portal-logo-img" alt="" />
        </div>

        {/* 菜单 */}
        <ul className="portal-menu">
          <li className="nav-link-wrapper">
            {newList.map((item) => {
              let isBuy = false;
              if (item.link) {
                isBuy = item.link.includes('going-buy.com') || item.link.includes('-buy') || item.link.includes('mall');
              }
              return (
                <a
                  className="nav-link-slide"
                  href={isBuy ? `${item.link}#access_token=${accessToken}` : item.link}
                  target={item.blankEnabled === 0 ? '' : '_blank'}
                >
                  {(item._tls && item._tls.name[language]) || item.name}
                </a>
              );
            })}
          </li>
          {/* 切换语言 */}
          {
            languageList && languageList.length ? (
              <li className="nav-language">
                <Icon type="language" style={{ color: 'rgba(0,0,0, 0.8)', fontSize: '0.16rem' }} />
                <Select onChange={handleLanguage} defaultValue={language}>
                  {languageList.map((item) => (
                    <Option value={item.code}>{item.name}</Option>
                  ))}
                </Select>
              </li>
            ) : null
          }
          {/* 登录注册 */}
          {isLogin ? (
            <>
              <li className="nav-login">
                <a
                  href={`${BASE_PATH || '/'}hiam/user/info#access_token=${accessToken}`}
                >
                  {oauthIntl['srm.oauth.navbar.personalCenter'] || '个人中心'}
                </a>
              </li>
              <li className="nav-login" onClick={logout}>
                <a>{oauthIntl['srm.oauth.navbar.exit'] || '退出'}</a>
              </li>
            </>
          ) : registerEnabledFlag === 1 ? (
            <li className="nav-login">
              <a href={defaultRegisterLink}>
                {oauthIntl['srm.oauth.navbar.register'] || '注册'}
              </a>
            </li>
          ) : null}
          {
            auto ? (
              <li className="nav-login">
                <a href="/">
                  {oauthIntl['srm.oauth.navbar.logIn'] || '登录'}
                </a>
              </li>
            ) : null
          }
        </ul>
      </div>
    </div>
  );
};

const PortalNav: React.FC<PortalNavProps> = (props) => {
  const [data, setData] = useState(props);
  const tenantId = useMemo(() => cookies.get('tenantId'), []);

  useEffect(() => {
    if (props.auto) {
      getLayoutNavConfig().then(async (res) => {
        if (res && res.cardCategory === 'Nav') {
          const { cardContent, h, favicon, pageTitle } = res;
          const newData = {
            ...props,
            logo: cardContent.logo || {
              url: DEFAULTLOGO,
            },
            navList: cardContent.navList,
            languageList: cardContent.languageList,
            prefix: cardContent.prefix,
            registerEnabledFlag: cardContent.registerEnabledFlag,
            h,
          };
          if (!isNil(tenantId)) {
            const response = await fetchLanguagesList(tenantId);
            if (getResponse(response)) {
              newData.languageList = response;
            }
          }
          setData(newData);
          if (pageTitle) {
            const { dvaApp } = window as any;
            const { user } = dvaApp._store.getState();
            if (!user || !user.currentUser || !user.currentUser.title) {
              dvaApp._store.dispatch({
                type: "user/updateState",
                payload: {
                  ...user,
                  currentUser: {
                    ...(user.currentUser || {}),
                    title: pageTitle,
                  },
                },
              });
            }
          }

          const link: HTMLLinkElement | null = document.querySelector("link[rel='shortcut icon']");
          if (link && favicon) link.href = favicon;
        } else {
          const url = isNil(tenantId) ? `${HZERO_PLATFORM}/v1/languages/list` : `${HZERO_PLATFORM}/v1/tenant-languages/list?tenantId=${tenantId}`;
          request(url, {
            method: 'GET',
          }).then(res => {
            if (getResponse(res)) {
              setData({
                logo: {
                  url: DEFAULTLOGO,
                },
                ...props,
                languageList: res || [],
              });
            }
          });
        }
      });
    } else if (!isNil(tenantId)) {
      fetchLanguagesList(tenantId).then(response => {
        if (getResponse(response)) {
          setData({
            ...props,
            languageList: response,
          });
        }
      });
    }
  }, [props.auto]);

  const fetchLanguagesList = async (tenantId) => {
    return request(`${HZERO_PLATFORM}/v1/tenant-languages/list?tenantId=${tenantId}`, {
      method: 'GET',
    });
  };

  return <NavContent {...data} />;
};

export default React.memo(PortalNav);
