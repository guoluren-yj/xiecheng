import React, { useState, useMemo, useEffect } from 'react';
import { connect } from 'dva';
import { debounce } from "lodash";
import { Spin } from 'hzero-ui';

import { getEnvConfig } from 'utils/iocUtils';
import { getAccessToken, getCurrentTenant, getCurrentUser } from 'utils/utils';
import { Modal } from "choerodon-ui/pro";
import EmbedPage from "../../components/EmbedPage";
import { processMessageData, parseUrlParams } from './util';

import styles from './index.less';
import { getActiveTabKey, openTab } from '../../utils/menuTab';

/**
 * 校验 postMessage 的来源是否在白名单内
 * @param {string} origin - msg.origin，形如 `https://youshu.com`（带协议、无路径、默认端口省略）
 * @param {string[]} whiteList - 白名单，可能存完整 origin，也可能只存 host
 * @returns {boolean}
 */
function isTrustedOrigin(origin, whiteList = []) {
  if (!origin) return false;
  let host = '';
  try {
    host = new URL(origin).host;
  } catch (e) {
    // origin 为 "null"（file://、沙箱 iframe、srcdoc）或非法
    return false;
  }
  return whiteList.some((item) => item === origin || item === host);
}

function Link(props) {
  const { match: { params: { link = '' } = {} } = {}, global: { menuLeafNode = [], linkLinkDomainWhiteList = [] } = {}, location: { pathname } = {}, dispatch } = props;
  const [initLoading, setInitLoading] = useState(true);
  const [accessToken] = useState(getAccessToken());
  const API_HOST = useMemo(() => getEnvConfig().API_HOST, []);
  useEffect(() => {
    const listener = debounce((msg) => {
      if (
        msg &&
        msg.data &&
        msg.data.type === "customAction" &&
        isTrustedOrigin(msg.origin, linkLinkDomainWhiteList)
      ) {
        const data = processMessageData(msg);
        if (getActiveTabKey() !== pathname) return;
        const { url, processUrl: processUrlStr, modalProperties, target, modalPageData } = data;
        let realUrl = null;
        let modalPropertiesObj = {};
        let modalPageDataObj = {};
        try {
          if (processUrlStr) {
            const processFunction = new Function('url', `var processUrl = ${processUrlStr}; return processUrl(url);`);
            realUrl = processFunction(url);
          } else {
            realUrl = url;
          }
          if (modalProperties) modalPropertiesObj = JSON.parse(modalProperties);
          if (modalPageData) modalPageDataObj = JSON.parse(modalPageData);
        } catch (e) {
          console.log(e)
        }
        if (realUrl) {
          const [pathname = '', search = ''] = (realUrl || "").split("?");
          switch(target) {
            case 'TAB':
              dispatch(window.routerRedux.push({
                pathname,
                search,
              }));
              break;
            case 'DRAWER-EXTERNAL':
            case 'DRAWER':
              let children;
              if (target === "DRAWER-EXTERNAL") {
                children = (
                  <iframe
                    title={realUrl}
                    src={realUrl}
                    style={{ width: '100%', height: '100%', verticalAlign: 'top' }}
                    frameBorder="0-1"
                  />
                )
              } else {
                const coverPagePropsHook = (route) => {
                  const params = parseUrlParams(route.path, route.pathRegexp, realUrl);
                  return {
                    history: { ...props.history, location: { ...props.history.location, pathname, search } },
                    match: { ...props.match, params, path: realUrl },
                    location: { ...props.location, pathname, search },
                  }
                };
                children = (
                  <EmbedPage
                    href={realUrl}
                    coverPagePropsHook={coverPagePropsHook}
                    pageData={modalPageDataObj}
                  />
                )
              }
              Modal.open({
                style: { width: 1200 },
                footer: null,
                closable: true,
                ...modalPropertiesObj,
                children,
                drawer: true,
              })
              break;
            default:;
          }
        }
      }
    }, 300);
    window.addEventListener("message", listener);
    return () => window.removeEventListener("message", listener);
  }, [linkLinkDomainWhiteList]);
  const menu = menuLeafNode.find((item) => item.id.toString() === link) || {};
  const type = menu.type || '';
  let url = '';
  if (type === 'link') {
    url = menu.path.startsWith('http') ? menu.path : `http://${menu.path}`;
  } else if (type === 'inner-link') {
    if (menu.path.startsWith('http')) {
      url = menu.path;
    } else {
      url = `${API_HOST}${menu.path}`;
    }
  }

  if (type === 'inner-link') {
    url = `${url}${url.includes('?') ? '&' : '?'}access_token=${accessToken}&from=hzero`;
  }
  if (type === 'link' || type === 'inner-link') {
    const { timeZone, language, additionInfo: { timeZoneOffset } } = getCurrentUser();
    url = url
      .replace(/\${domain}/g, window.location.host)
      .replace(/\${tenantNum}/g, getCurrentTenant().tenantNum)
      .replace(/\${timeZone}/g, encodeURIComponent(timeZone))
      .replace(/\${language}/g, language)
      .replace(/\${timeZoneOffset}/g, encodeURIComponent(timeZoneOffset));
    const funReg = /\#{(\S)+}/g;
    if (url.match(funReg) && url.match(funReg).length > 0) {
      const funcString = url.match(funReg)[0];
      const funcResult = eval(funcString.substring(2, funcString.length - 1));
      url = url.replace(funReg, funcResult);
    }
  }
  return (
    (type === 'link' || type === 'inner-link') && (
      <Spin spinning={initLoading} wrapperClassName={styles['iframe-loading']}>
        <iframe
          onLoad={() => setInitLoading(false)}
          title={link}
          src={url}
          style={{ width: '100%', height: '100%', verticalAlign: 'top' }}
          frameBorder="0"
        />
      </Spin>
    )
  );
}

export default connect(({ global }) => ({ global }))(Link);
