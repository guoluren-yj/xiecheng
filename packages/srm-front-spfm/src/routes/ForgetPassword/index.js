import React, { useState, useEffect, useMemo } from 'react';

import { Spin } from 'choerodon-ui';
import { DataSet } from 'choerodon-ui/pro';
import { isEmpty } from 'lodash';

import { getHomeDefaultLanguage } from 'srm-front-boot/lib/utils/utils';
import { Nav, Footer } from 'srm-front-boot/lib/components/PortalCard';

import { queryIntl, changePublicTheme } from '@/utils/publicUtils';
import Confirm from './Confirm';
import Reset from './Reset';
import Retrieve from './Retrieve';
import Countdown from './Countdown';
import getForgetPassword from './forgetPasswordDs';

import styles from './index.less';

const ForgetPassword = () => {
  const [step, setStep] = useState('retrieve');
  const [intl, setIntl] = useState({});
  const intlRef = useMemo(() => ({ current: null }), []);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initIntl();
    // 查询主题
    (async () => {
      try {
        await changePublicTheme(true);
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    })();
  }, [intlRef]);

  const initIntl = async () => {
    const lang = await getHomeDefaultLanguage();
    queryIntl(lang || 'zh_CN', 'srm.portal', 'srm.oauth,smbl.common,hzero.common').then(res => {
      setIntl(res);
      intlRef.current = res;
    });
  };

  const formDs = useMemo(() => new DataSet(getForgetPassword(intlRef)), [intlRef]);

  const contentProps = {
    formDs,
    onStep: setStep,
    countdown: Countdown,
    oauthIntl: intl,
  };

  const contentDom = useMemo(() => {
    return (
      <div className={styles['container-content']}>
        <div className={styles['forget-password']}>
          {/* 找回密码 */}
          {step === 'retrieve' && <Retrieve {...contentProps} />}
          {/* 确认账号 */}
          {step === 'confirm' && <Confirm {...contentProps} />}
          {/* 重置密码 */}
          {step === 'reset' && <Reset formDs={formDs} oauthIntl={intl} />}
        </div>
      </div>
    );
  }, [intl, step]);

  if (loading) {
    return <Spin spinning={loading} />;
  }

  return (
    <div className={styles.container}>
      {/* 导航条 */}
      {isEmpty(intl) ? null : <Nav auto />}
      {/* 内容区域 */}
      {contentDom}
      {/* 页脚 */}
      <Footer auto />
    </div>
  );
};

export default React.memo(ForgetPassword);
