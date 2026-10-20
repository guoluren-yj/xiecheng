import React, { useState, useEffect, useMemo } from 'react';
import { Spin } from 'choerodon-ui';
import { DataSet } from 'choerodon-ui/pro';
import { isEmpty } from 'lodash';
import crypto from 'crypto-js';
// import { Nav, Footer } from 'srm-front-boot/lib/components/PortalCard';
import { Nav } from 'srm-front-boot/lib/components/PortalCard';
import { setSecureCookie } from 'srm-front-boot/lib/utils/utils';
import Cookies from 'universal-cookie';
import { queryIntl, changePublicTheme } from '@/utils/publicUtils';
import SendCode from './SendCode';
import VeriCode from './VeriCode';
import Countdown from './Countdown';
import getMailSingleSignOnDs from './mailSingleSignOnDs';
import styles from './index.less';

const cookies = new Cookies();

const queryToObj = str => {
  if (!str) {
    return {};
  }
  const result = {};
  const strToArray = str.split('&');
  strToArray.map(item => {
    // 由于是base64加密之后会出现=，只替换第一个=为@@，并通过@@切割
    const [key, value] = item.replace('=', '@@').split('@@');
    result[key] = value;
    return item;
  });
  return result;
};

// cookies中没有language时要set一个默认值
const getDefaultSetCookie = () => {
  if (cookies.get('language')) {
    return cookies.get('language');
  } else {
    setSecureCookie('language', 'en_US', { path: '/' });
    return 'en_US';
  }
};

const MailSingleSignOn = (props = {}) => {
  const {
    location: { search = '' },
  } = props;
  const { one_step_mail: oneStepMail, email = '', redirectUri = '' } = queryToObj(search.substr(1));
  const [step, setStep] = useState('sendCode');
  const [intl, setIntl] = useState({});
  const [language] = useState(getDefaultSetCookie());
  const [loading, setLoading] = useState(true);
  const formDs = useMemo(() => new DataSet(getMailSingleSignOnDs()), []);

  useEffect(() => {
    queryIntl(language, 'srm.portal', 'srm.oauth,smbl.common,hzero.common').then(res => {
      setIntl(res);
    });

    // 查询主题
    (async () => {
      try {
        await changePublicTheme(true);
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    })();
  }, []);

  const contentProps = {
    language,
    formDs,
    onStep: setStep,
    countdown: Countdown,
    oauthIntl: intl,
    emailCode: crypto.enc.Utf16.stringify(crypto.enc.Base64.parse(email)),
    oneStepMail,
    redirectUri,
  };

  const contentDom = useMemo(() => {
    return (
      <div className={styles['container-content']}>
        <div className={styles['mail-signOn']}>
          {/* 发送邮箱验证码 */}
          {step === 'sendCode' && <SendCode {...contentProps} />}
          {/* 验证邮箱验证吗 */}
          {step === 'veriCode' && <VeriCode {...contentProps} />}
        </div>
      </div>
    );
  }, [intl, step]);

  if (loading) {
    return <Spin spinning={loading} />;
  }

  // 路特斯暂时不要nav和footer，nav使用样式覆盖，footer暂时隐藏
  return (
    <div className={styles.container}>
      {!isEmpty(intl) && (
        <div className={styles['nav-logo-rewrite']}>
          <Nav auto />
        </div>
      )}
      {contentDom}
      {/* <Footer auto /> */}
    </div>
  );
};

export default React.memo(MailSingleSignOn);
