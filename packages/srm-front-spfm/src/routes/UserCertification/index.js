import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { Statistic } from 'choerodon-ui';
import { Button, Icon, Spin, notification, DataSet } from 'choerodon-ui/pro';
import classNames from 'classnames';
import isEmpty from 'lodash/isEmpty';
import request from 'utils/request';
import { getResponse } from 'utils/utils';
import { getUrlParam, getOrigin } from '@/utils/utils';
import { queryIntl, changePublicTheme } from '@/utils/publicUtils';
import { Nav } from 'srm-front-boot/lib/components/PortalCard';
import { getHomeDefaultLanguage } from 'srm-front-boot/lib/utils/utils';
import ResetPassword from '../ForgetPassword/Reset';
import getForgetPasswordDs from '../ForgetPassword/forgetPasswordDs';
import CertificationForm from './CertificationForm';
import styles from './index.less';

const { Countdown } = Statistic;
const errorCheckType = getUrlParam().secCheckType || '';

const UserCertification = props => {
  const [intl, setIntl] = useState({});
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState(['', -1]);
  const [userInfo, setUserInfo] = useState({
    secCheckType: errorCheckType,
    captchaKey: localStorage.getItem('oauth-sec-checkCaptchaKey'),
  });
  const [isCertification] = useState(props.match.path === '/public/user-certification');
  const queryUrl = useMemo(() => {
    const origin = getOrigin();
    if (isCertification) {
      return {
        infoUrl: `${origin}/oauth/public/secondary-check/info`,
        sendCaptchaUrl: `${origin}/oauth/public/sec-check/send-captcha`,
        submitUrl: `${origin}/oauth/login/secCheck`,
      };
    }
    return {
      infoUrl: `${origin}/oauth/v2/password/modify-info`,
      sendCaptchaUrl: `${origin}/oauth/v2/password/modify/send-captcha`,
      submitUrl: `${origin}/oauth/v2/password/modify/check-captcha`,
    };
  }, []);
  const passwordDs = useMemo(
    () => (isCertification ? null : new DataSet(getForgetPasswordDs())),
    []
  );
  const formContainer = useRef({});
  const {
    realTypes = [],
    secCheckType = '',
    btnDisable = false,
    duration = 0,
    captchaKey,
  } = userInfo;

  useEffect(() => {
    (async () => {
      try {
        // 查询主题
        await changePublicTheme(true);
        const lang = await getHomeDefaultLanguage();
        // 获取多语言
        const intlResult = await queryIntl(lang || 'zh_CN', 'srm.portal', 'srm.oauth,hzero.common');
        if (getResponse(intlResult)) {
          setIntl(intlResult);
        }

        await getUserInfo(intlResult);
      } catch (error) {
        goBack();
      }
    })();
  }, []);

  const getUserInfo = async intlResult => {
    const res = await request(queryUrl.infoUrl);
    setLoading(false);
    if (getResponse(res)) {
      const { supportTypes = [], loginErrorMsg, modifyType } = res;
      setUserInfo(preState => {
        const type = supportTypes
          ? preState.secCheckType || supportTypes.find(item => !!res[item])
          : 'password';
        if (!isCertification) {
          passwordDs.setState({
            passwordInfo: { ...res },
            supportTypes: type,
          });
          if (type === 'password') {
            passwordDs.addField('originalPassword');
          }
        }
        return {
          ...preState,
          ...res,
          secCheckType: type,
          realTypes: supportTypes ? supportTypes.filter(item => !!res[item]) : [],
        };
      });
      let tempStep = 1;
      if (loginErrorMsg) {
        setMsg([loginErrorMsg, 0]);
        if (!modifyType && (errorCheckType === 'phone' || errorCheckType === 'email')) {
          tempStep = 2;
        }
      }
      if (!step) {
        setStep(tempStep);
      }
      if (isCertification && [null, undefined].includes(modifyType)) {
        setMsg([
          intlResult['srm.oauth.view.certification.second.verify'] ||
            '您的账号已开启登录二次验证，请完成登录验证',
          1,
        ]);
      }
      if (modifyType === 1) {
        setMsg([
          intlResult['srm.oauth.view.certification.first.login'] ||
            '您为首次登录，为了您的账户安全，请修改您的密码',
          1,
        ]);
      }
      if (modifyType === 2) {
        setMsg([
          intlResult['srm.oauth.view.certification.expired'] ||
            '您密码已过期，请验证后更改登录系统',
          1,
        ]);
      }
    } else {
      setStep(1);
      setUserInfo(preState => ({
        ...preState,
        btnDisable: true,
      }));
    }
  };

  // 切换tab
  const onChange = key => {
    setUserInfo(preState => ({
      ...preState,
      secCheckType: key,
    }));
    if (!isCertification) {
      passwordDs.setState('secCheckType', key);
    }
  };

  // 发送验证码
  const sendCaptcha = () => {
    setLoading(true);
    request(queryUrl.sendCaptchaUrl, {
      query: isCertification
        ? {
            secCheckType,
            businessScope: 'LOGIN',
          }
        : {
            supportType: secCheckType,
          },
    })
      .then(res => {
        if (getResponse(res)) {
          const { data, message: errorMsg, success } = res;
          const notificationContent = {
            placement: 'bottomRight',
            message: errorMsg,
          };
          if (success) {
            setUserInfo(preState => ({
              ...preState,
              duration: Date.now() + 60000,
              captchaKey: data,
              btnDisable: true,
            }));
            setStep(2);
            notification.success(notificationContent);
            localStorage.setItem('oauth-sec-checkCaptchaKey', data);

            if (formContainer.current) {
              formContainer.current.fields[0].focus();
            }
          } else {
            notification.error(notificationContent);
          }
        }
        setLoading(false);
      })
      .then(() => {
        setLoading(false);
      });
  };

  // 倒计时结束
  const onCountDownFinish = useCallback(() => {
    setUserInfo(preState => ({
      ...preState,
      btnDisable: false,
    }));
  }, []);

  // 倒计时渲染器
  const countdownFormatter = useCallback(
    value =>
      (intl['srm.oauth.view.certification.countdown'] || '{count}s后可重新获取验证码').replace(
        '{count}',
        value
      ),
    [intl]
  );

  // 返回上一级
  const goBack = () => {
    if (step === 2) {
      setStep(1);
      if (errorCheckType) {
        window.location.hash = '';
      }
    } else {
      window.location.pathname = '';
    }
  };

  const renderTabPane = useMemo(() => {
    return realTypes.map(item => {
      const className = classNames({
        'certification-tab-pane': true,
        'active-pane': secCheckType === item,
      });
      return (
        <div className={className} onClick={() => onChange(item)} key={item}>
          {item === 'phone'
            ? intl['srm.oauth.view.certification.phone'] || '手机验证'
            : intl['srm.oauth.view.certification.email'] || '邮箱验证'}
        </div>
      );
    });
  }, [realTypes, intl, secCheckType]);

  const renderCountdown = useMemo(
    () => (
      <Countdown
        value={duration}
        format="s"
        onFinish={onCountDownFinish}
        formatter={countdownFormatter}
      />
    ),
    [intl, duration]
  );

  const renderCodeBtn = useMemo(() => {
    if (btnDisable && realTypes.length) {
      return (
        <Button color="primary" disabled>
          {renderCountdown}
        </Button>
      );
    }

    return (
      <Button color="primary" disabled={btnDisable} onClick={sendCaptcha}>
        {intl['srm.oauth.enterprise.recovery.get'] || '获取验证码'}
      </Button>
    );
  }, [intl, btnDisable, realTypes, secCheckType, queryUrl, duration, passwordDs]);

  const formProps = useMemo(() => {
    const submitData = isCertification
      ? {
          secCheckType,
          businessScope: 'LOGIN',
          captchaKey,
        }
      : {
          supportType: secCheckType,
          captchaKey,
        };
    return {
      submitUrl: queryUrl.submitUrl,
      submitData,
      formContainer,
      setLoading,
      formSubmit: !!isCertification,
      step,
      setStep,
      passwordDs,
    };
  }, [secCheckType, queryUrl, step, passwordDs, captchaKey]);

  const clearMsg = useCallback(() => {
    setMsg(['', -1]);
  }, [setMsg]);
  const msgNode = msg && msg[0] && (
    <div className="msg-container">
      <Icon type={msg[1] === 0 ? 'error' : 'warning'} />
      <span className="msg-body">{(msg && msg[0]) || ''}</span>
      <span className="close-msg" onClick={clearMsg}>
        x
      </span>
    </div>
  );
  return (
    <div className={styles['certification-container']}>
      {isEmpty(intl) ? <div /> : <Nav auto />}
      <Spin spinning={loading}>
        {step === 1 && realTypes.length ? (
          <div className={styles['certification-card']}>
            {msgNode}
            <Icon type="arrow_back" onClick={goBack} />
            <div className="certification-tabs">{renderTabPane}</div>
            <p className="certification-tip">
              {intl['srm.oauth.view.certification.self.tip'] ||
                '为确保您本人操作，请先通过以下方式获取验证码完成验证'}
            </p>
            <div style={{ display: 'flex' }}>
              {secCheckType === 'phone' && (
                <span
                  style={{
                    height: '0.46rem',
                    background: '#F2F3F5',
                    border: '0.01rem solid #e0e0e0',
                    borderRight: 'none',
                    fontSize: '0.16rem',
                    borderRadius: '2px 0 0 2px',
                    display: 'block',
                    color: '#C9CDD4',
                    lineHeight: '0.46rem',
                    padding: '0 10px',
                  }}
                >
                  {intl['srm.oauth.common.chinesePhone'] ||'中国大陆 +86'}
                </span>
              )}
              <input
                value={userInfo[secCheckType]}
                className="certification-info"
                disabled
                style={{ flex: 1, borderRadius: secCheckType === 'phone' ? '0 2px 2px 0' : '2px' }}
              />
            </div>
            {renderCodeBtn}
            <p className="certification-tip">
              {intl['srm.oauth.view.certification.contact.tip'] ||
                '若您的手机和邮箱均无法接收验证码，请联系公司系统管理员，或拨打热线电话：400-116-0808 获取帮助'}
            </p>
          </div>
        ) : null}
        {step === 2 && realTypes.length ? (
          <div className={styles['certification-card']}>
            {msgNode}
            <Icon type="arrow_back" onClick={goBack} />
            <div className="certification-tabs">
              <div className="certification-tab-pane active-pane">
                {intl['srm.oauth.view.certification.enter.captcha'] || '输入验证码'}
              </div>
              <p className="certification-tip">
                {intl['srm.oauth.forgetPassword.has'] || '已向'}
                <span>{userInfo[secCheckType]}</span>
                {intl['srm.oauth.forgetPassword.send.message.info'] ||
                  '发送验证码，请查收并输入验证码。'}
              </p>
              <CertificationForm {...formProps} />
              <p className="certification-tip">
                {btnDisable && duration > 0 ? (
                  renderCountdown
                ) : (
                  <span className="repeat-get-captcha" onClick={sendCaptcha}>
                    {intl['srm.oauth.loginAction.retrieveCaptcha'] || '重新获取验证码'}
                  </span>
                )}
              </p>
            </div>
          </div>
        ) : null}
        {/* 修改密码-使用原始密码修改密码 */}
        {(step === 1 && !realTypes.length && passwordDs && passwordDs.getState('passwordInfo')) ||
        step === 3 ? (
          <div
            className={styles['certification-card']}
            style={{ padding: '1rem 0', textAlign: 'left' }}
          >
            {msgNode}
            <ResetPassword
              formDs={passwordDs}
              oauthIntl={intl}
              isForget={false}
              supportType={secCheckType}
            />
          </div>
        ) : null}
        {/* 二次认证-没有用户信息时候的提示 */}
        {step === 1 && !realTypes.length && isCertification ? (
          <div className={styles['certification-card']} style={{ minHeight: 'auto' }}>
            {msgNode}
            <Icon type="arrow_back" onClick={goBack} />
            <p className="certification-empty-tip">
              {intl['srm.oauth.view.certification.info.empty'] ||
                '手机/邮箱信息为空，请联系公司管理员或拨打 400-116-0808 电话维护。'}
            </p>
          </div>
        ) : null}
      </Spin>
      <div className={styles['certification-copy-right']}>
        {intl['srm.oauth.view.copyRight'] ||
          'CopyRight©2023 上海甄云信息科技有限公司 | 沪ICP备18039109号-4'}
      </div>
    </div>
  );
};

export default React.memo(UserCertification);
