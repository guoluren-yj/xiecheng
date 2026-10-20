/* eslint-disable no-param-reassign */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Icon, Spin } from 'choerodon-ui/pro';
import { Nav } from 'srm-front-boot/lib/components/PortalCard';
import Cookies from 'universal-cookie';
import request from 'hzero-front/lib/utils/request';
import { getEnvConfig } from 'hzero-front/lib/utils/iocUtils';
import { getResponse, setSession } from 'hzero-front/lib/utils/utils';
import { ButtonColor } from 'choerodon-ui/pro/lib/button/enum';
import styles from './index.less';

const cookie = new Cookies();
export default function SingleLoginError() {
  const langInfoRef = useMemo(() => ({ current: {} }), []);
  const [langInfoLoaded, setLangInfoLoaded] = useState(false);
  const [error, setError] = useState('undefiend');
  const [backUrl, setBackUrl] = useState<string>('');
  const [init, setInit] = useState(false);
  useEffect(() => {
    queryIntl().then(() => {
      setInit(true);
      setLangInfoLoaded(true);
    });
    let host = window.location.origin;
    const { API_HOST } = getEnvConfig() as any;
    if (/http(s)?:\/\/(localhost|127.0.0.1)/.test(host)) {
      host = API_HOST;
    }
    const searchArr = window.location.search.slice(1).split('&');
    let errormessage;
    searchArr.forEach((str) => {
      const matches = str.match(/errormessage=([\S]+)/);
      if (matches) {
        [, errormessage] = matches;
      }
    });
    request(`${host}/oauth/public/sso/server`, {
      method: 'GET',
    }).then((res) => {
      if (getResponse(res)) {
        setBackUrl(res.ssoServerRedirectUrl);
      }
    });
    setError(decodeURIComponent(errormessage || cookie.get('srm-login-error-msg') || 'undefined'));
  }, []);
  const queryIntl = useCallback(() => {
    const { HZERO_PLATFORM } = getEnvConfig() as any;
    const lang = cookie.get('language') || 'zh_CN';
    return request(`${HZERO_PLATFORM}/v1/prompt/${lang}`, {
      method: 'GET',
      query: {
        promptKey: 'spfm.portalSubPage,hzero.common,srm.common,srm.oauth',
      },
    }).then((res) => {
      if (getResponse(res)) {
        langInfoRef.current = res;
        setSession(`${lang}-srm.portal`, res);
        setLangInfoLoaded(true);
      }
    });
  }, []);
  const goBackUrl = useCallback(() => {
    window.location.href = backUrl;
  }, [backUrl]);
  return (
    <Spin spinning={!langInfoLoaded}>
      <div className={styles['single-login-error']}>
        {init && <Nav auto />}
        <div className="center-tip">
          <header>
            <Icon type="cancel" style={{ color: 'red' }} />
            {langInfoRef.current['spfm.portalSubPage.singleLoginError.errorTip'] || '错误提示'}
          </header>
          <section>{error}</section>
          <footer>
            <Button color={ButtonColor.primary} onClick={goBackUrl}>
              {langInfoRef.current['spfm.portalSubPage.singleLoginError.returnLoginPage'] ||
                '返回登录页面'}
            </Button>
          </footer>
        </div>
      </div>
    </Spin>
  );
}
