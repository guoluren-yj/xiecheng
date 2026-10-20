/**
 * LoginCard - 门户登录
 * @date: 2021-07-05
 * @author: Danica <ke.wang01@gonig-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Hand
 */

/**
 * 所需cookie
 * realName: 用于登录后展示用户名
 * language: 用于获取页面多语言
 * access_token: 判断是否登录
 */

import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { Tabs, notification, Statistic } from 'choerodon-ui';
import { DataSet, Form, Password, TextField, Button, Tooltip } from 'choerodon-ui/pro';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import { isFunction } from 'lodash';

import crypto from 'crypto-js';
// @ts-ignore
import remote from 'hzero-front/lib/utils/remote';
import { getAccessToken, getResponse, getSession, setSession } from 'hzero-front/lib/utils/utils';
import Cookies from 'universal-cookie';
import request from 'hzero-front/lib/utils/request';
import moment from 'moment';
import { getEnvConfig } from 'utils/iocUtils';
import CaptchaButton from '../../CaptchaButton';
import styles from './index.less';

import { getUrlParam, LOGINLIST, LOGINTYPELIST, replacePrefix, encode, isLocalhost, logout, enterpriseRecoveryLink, defaultRegisterLink, passwordFind } from '../util';

const { API_HOST, BASE_PATH } = getEnvConfig<any>();
const { TabPane } = Tabs;
const { Countdown } = Statistic;
const { origin } = window.location;
const cookies = new Cookies();
/**
 * 缓存失效时间 1 day
 */
const captchaCacheTime = 1000 * 60 * 60 * 24;
/**
 * 未知原因导致登录卡片先卸载再挂载，所以最后渲染时无法拿到报错信息，因为已经移除了
 * 另外，报错信息是否展示不取决于msg是否有值
 * 注意，如果后面改成登录不刷新，这里需另作修改
 * 所以把msg的获取放到组件外部 */
const msg = cookies.get('srm-login-error-msg');
cookies.remove('srm-login-error-msg', { path: '/' });

interface PortalLoginProps {
  backgroundColor?: string;
  loginList?: any[];
  loginTypeList?: any[];
  registerEnabledFlag?: number;
  registerLink?: string;
  prefix?: string;
  supplierNewRegisterEnabled?: boolean,
  history?: any;
  remote?: any;
}

const loginStatus = getUrlParam('login'); // 登录状态
const LoginErrorType = getUrlParam('type'); // 登录失败类型
const needCaptcha = getUrlParam('isNeedCaptcha');
const isNeedCaptcha = needCaptcha === 'true'; // 账密-是否需要输入验证码
const isLoginFailed = loginStatus === 'failed';
const isAccount = isLoginFailed && LoginErrorType === 'account'; // 账密登录失败
const isSms = isLoginFailed && LoginErrorType === 'sms'; // 验证码登录失败
const isCaptchaError = isLoginFailed && LoginErrorType === 'captchaError'; // 账密-验证码填写错误


const LoginCard: React.FC<PortalLoginProps> = ({
  backgroundColor = 'white',
  loginList = LOGINLIST,
  loginTypeList = LOGINTYPELIST,
  registerEnabledFlag = 1,
  registerLink = defaultRegisterLink,
  prefix = '',
  supplierNewRegisterEnabled = true,
  history,
  remote,
}) => {
  const [isLogin] = useState(!!getAccessToken());
  const [codeBtnDisabled, setCodeBtnDisabled] = useState(true);
  const [codeBtnType, setCodeBtnType] = useState('action');
  const [isFirstCode, setIsFirstCode] = useState(true);
  const currentHour = useMemo(() => moment().hour(), []);
  const [realName] = useState(cookies.get('realName') || '');
  const [language] = useState(cookies.get('language') || 'zh_CN');
  const [state, setState] = useState({});
  const { hidePassword, useEffectCustomFunc, renderCustomDom, beforeLoginCustom } = useMemo(() => {
    if (remote) {
      return remote.process('SRM.PORTAL.LOGIN_CARD.CONFIG') || {};
    }
    return {};
  }, []);
  const newList = useMemo(() => {
    const newLoginList = loginList.reduce((result, data) => {
      if (data.link) {
        if (data.link.includes(passwordFind)) {
          result.push({ ...data, link: LOGINLIST[0].link });
        } else if (data.link.includes(enterpriseRecoveryLink)) {
          if (!supplierNewRegisterEnabled) {
            result.push({ ...data, link: replacePrefix(prefix, data.link) });
          }
        } else {
          result.push(data);
        }
      } else {
        result.push(data);
      }
      return result;
    }, []);

    return (
      (newLoginList &&
        newLoginList.sort((a, b) => {
          return a.position - b.position;
        })) ||
      []
    );
  }, [loginList]);
  const newLoginTypeList = useMemo(() => {
    return (
      (loginTypeList && loginTypeList.sort((a, b) => {
        return a.position - b.position;
      })) ||
      []
    );
  }, [loginTypeList]);

  const [urlMsg, setUrlMsg] = useState(() => {
    return crypto.enc.Utf16.stringify(crypto.enc.Base64.parse(msg || ''));
  });

  const [showImageCaptcha, setShowImageCaptcha] = useState(false);

  const [timestamp, setTimestamp] = useState<string | number>('');
  const [phoneCaptchaKey, setPhoneCaptchaKey] = useState('');

  const errorRef = useRef<any>(null);

  useEffect(() => {
    if (needCaptcha !== true) {
      request(`${window.location.protocol}//${window.location.host}/oauth/public/is-need-captcha`).then(res => {
        if (getResponse(res) && res) {
          setShowImageCaptcha(res.isNeedCaptcha);
        }
      });
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      clearTimeout(timer);
      if (errorRef.current) {
        const { height } = errorRef.current.getBoundingClientRect();
        if (height > 36) {
          setUrlMsg(<Tooltip title={urlMsg} theme="light">{urlMsg}</Tooltip>);
          errorRef.current.classList.add('text-line-clamp-2');
        } else {
          errorRef.current.classList.add('show');
        }
      }
    }, 0);
  }, [errorRef]);

  const oauthIntl = useMemo(() => {
    const srmOauth = window.sessionStorage.getItem(`${language}-srm.portal`);
    if (srmOauth) {
      return JSON.parse(srmOauth);
    }
    return {};
  }, [language]);

  // 账号登录
  const accountDS = useMemo(
    () =>
      new DataSet({
        fields: [
          {
            name: 'username',
            type: FieldType.string,
            label: oauthIntl['srm.oauth.login.enterAccountOrPhoneOrEmail'] || '请输入账号/手机号码/邮箱',
            required: true,
          },
          {
            name: 'password',
            type: FieldType.string,
            label: oauthIntl['srm.oauth.login.enterPassword'] || '请输入登录密码',
            required: true,
          },
          {
            name: 'captcha',
            type: FieldType.string,
            label: oauthIntl['srm.oauth.loginAction.enterVerificationCode'] || '请输入验证码',
            required: isNeedCaptcha,
          },
        ],
      }).create(),
    [oauthIntl]
  );

  // 验证码登录
  const smsDS = useMemo(
    () =>
      new DataSet({
        fields: [
          {
            name: 'phone',
            type: FieldType.string,
            label: oauthIntl['srm.oauth.login.enterPhoneNumber'] || '请输入手机号',
            pattern: '^1[3-9]\\d{9}$',
            required: true,
          },
          {
            name: 'captcha',
            type: FieldType.string,
            label: oauthIntl['srm.oauth.loginAction.enterVerificationCode'] || '请输入验证码',
            required: true,
          },
        ],
      }).create(),
    [oauthIntl]
  );

  useEffect(() => {
    const loginUser = getSession('portal-login-user');
    if (loginUser) {
      if (accountDS && isAccount) {
        accountDS.set({ username: loginUser, password: '' });
      }
      if (smsDS && isSms) {
        smsDS.set('phone', loginUser);
        setCodeBtnDisabled(false);
      }
    }
    // 自定义操作
    if(useEffectCustomFunc && isFunction(useEffectCustomFunc)){
      useEffectCustomFunc({smsDS, accountDS});
    }
  }, [accountDS, smsDS, useEffectCustomFunc]);

  /**
   *  自定义报错提示
   */
  const validationRenderer = (error) => {
    if (error.ruleName === 'valueMissing') {
      return error.injectionOptions.label;
    }
  };

  /**
   *  根据当前时间段展示提示
   */
  const getTimeTip = useMemo(() => {
    if (currentHour < 12) {
      return oauthIntl['srm.oauth.login.goodMorning'] || '早上好！';
    } else if (currentHour < 14) {
      return oauthIntl['srm.oauth.login.goodNoon'] || '中午好！';
    } else if (currentHour < 17) {
      return oauthIntl['srm.oauth.login.goodAfterNoon'] || '下午好！';
    } else {
      return oauthIntl['srm.oauth.login.goodEvening'] || '晚上好！';
    }
  }, [oauthIntl]);

  /**
   *  进入工作台
   */
  const inWorkspace = () => {
    cookies.remove('JSESSIONID');
    const referrerMeta = document.querySelector('meta[content="no-referrer-when-downgrade"]');
    if (referrerMeta) {
      referrerMeta.setAttribute('content', 'no-referrer');
    }
    // tenantId: 当前账户所属租户， isTenant: 当前域名所属租户
    // 若不一致需要 window.location.replace 重新加载，否则会有主题色问题
    if (history && history.replace && cookies.get('tenantId') === cookies.get('isTenant')) {
      history.replace(`/workplace?_r=${Math.random()}`);
    } else {
      window.location.replace(`${origin + (BASE_PATH || '/')}workplace?_r=${Math.random()}`);
    }
  };

  /**
   *  登录
   */
  const handleLogin = async (type) => {
    const res = type === 'account' ? await accountDS.validate() : await smsDS.validate();
    if (
      (type === 'account' && accountDS === undefined) ||
      (type === 'sms' && smsDS === undefined) ||
      !res
    ) {
      return false;
    } else {
      setSession('portal-login-user', type === 'account' ? accountDS.get('username') : smsDS.get('phone'));
    }
    if (type === 'account') {
      const username = accountDS.get('username');
      const password = encode(accountDS.get('password'));
      const form = document.getElementById('portal-account-form');
      if(isFunction(beforeLoginCustom)){
        beforeLoginCustom({ accountDS, type });
      }
      accountDS.set('password', password);
      if (username.match(/^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z0-9]{2,6}$/)) {
        accountDS.set('username', username.toLowerCase());
      }
      // @ts-ignore: Unreachable code error
      form && form.submit();
    } else if (type === 'sms') {
      const phone = smsDS && smsDS.get('phone');
      const form = document.getElementById('portal-sms-form');
      setPhoneCaptchaKey(window.localStorage.getItem(`${phone}-captchaKey`) || '');
      if(isFunction(beforeLoginCustom)){
        beforeLoginCustom({ smsDS, type });
      }
      // @ts-ignore: Unreachable code error
      form && form.submit();
    }
  };

  /**
   *  获取验证码
   */
  const handleCodeBtn = (params) => {
    return new Promise((resolve, reject) => {
      const phone = smsDS && smsDS.get('phone');
      setIsFirstCode(false);
      try {
        request(`${origin}/oauth/public/send-phone-captcha-security?phone=${phone}`, {
          method: 'GET',
          query: params,
        }).then((res: { success: boolean; message: string; captchaKey: string }) => {
          if (getResponse(res, params ? (r) => resolve(r) : undefined)) {
            notification.success({
              message: res.message,
              description: '',
            });
            if (!res.success) return;
            setCodeBtnType('countDown');
            let phoneList: string[] = [];
            let timestamp = new Date().getTime();
            try {
              const cacheData = JSON.parse(window.localStorage.getItem("captchaPhoneList") || `{timestamp: "${new Date().getTime()}", phoneList: []}`);
              // eslint-disable-next-line prefer-destructuring
              phoneList = cacheData.phoneList;
              // eslint-disable-next-line prefer-destructuring
              timestamp = cacheData.timestamp;
            } catch {
              phoneList = [];
            }
            if (new Date().getTime() - timestamp > captchaCacheTime) {
              phoneList.forEach(p => {
                window.localStorage.removeItem(`${p}-captchaKey`);
              });
              phoneList = [];
            } else if (!phoneList.find(p => p === phone)) phoneList.push(phone);
            // 移除历史版本失效的key数据
            window.localStorage.removeItem("phoneCaptchaKey");
            window.localStorage.setItem(`${phone}-captchaKey`, res.captchaKey);
            window.localStorage.setItem("captchaPhoneList", JSON.stringify({ timestamp: new Date().getTime(), phoneList }));
            setPhoneCaptchaKey(res.captchaKey);
            resolve();
          } else {
            resolve(res);
          }
        });
      } catch (error) {
        console.log(error);
      }
    });
  };

  /**
   *  倒计时结束
   */
  const onCountDownFinish = () => {
    setCodeBtnType('action');
  };

  /**
   *  输入手机号
   */
  const handlePhone = (value) => {
    const Regex = /^1[3-9]\d{9}$/;
    const res = new RegExp(Regex).test(value);
    setCodeBtnDisabled(!res);
  };

  const eventProps = (type) => {
    return {
      onEnterDown: () => {
        handleLogin(type);
      },
      validationRenderer,
    };
  };

  // 登录状态
  if (isLogin) {
    return (
      <div
        className={styles['portal-login-container']}
        style={{ backgroundColor, padding: '0.5rem 0.2rem' }}
      >
        <div className="login-user">
          <span>{realName}</span>
          {getTimeTip}
        </div>
        <div className="login-welcome">
          {oauthIntl['srm.oauth.login.welcomeSrmPlayform'] || '欢迎您进入甄云SRM平台！'}
        </div>
        <Button onClick={inWorkspace} className="btn-theme workspace-btn">
          {oauthIntl['srm.oauth.navbar.enterWorkbench'] || '进入工作台'}
        </Button>
        <Button onClick={logout} className="btn-theme logout-btn">
          {oauthIntl['srm.oauth.login.logOut'] || '退出登录'}
        </Button>
      </div>
    );
  } else {
    // 未登录状态
    // 通用dom
    const renderCommonDom = useCallback(
      () => {
        const dom = (
          <div className={`login-other login-other-${newList.length}`}>
            {newList.map((item) => {
              return (
                <a target={item.blankEnabled === 0 ? '' : '_blank'} href={item.link} className={item.enabled && 'theme-color'} key={item.link}>
                  {(item._tls && item._tls.title[language]) || item.title}
                </a>
              );
            })}
          </div>
        );
        if (remote && remote.render) {
          return remote.render('SRM.PORTAL.LOGIN_CARD_COMMON_BUTTON_RENDER', dom, { newList, oauthIntl, language, state, setState });
        }
        return dom;
      }, [newList]
    );
    // 验证码按钮
    const renderCodeBtn = useMemo(() => {
      if (codeBtnType === 'action') {
        return (
          <CaptchaButton
            buttonProps={{
              className: "get-code-btn",
              disabled: codeBtnDisabled,
            }}
            buttonText={isFirstCode
              ? oauthIntl['srm.oauth.login.obtainVerificationCode'] || '获取验证码'
              : oauthIntl['srm.oauth.loginAction.retrieveCaptcha'] || '重新获取验证码'}
            onClick={handleCodeBtn}
            senseCode='login'
            tenantId={cookies.get('hostTenantId') || cookies.get('tenantId')}
          />
        );
      } else if (codeBtnType === 'countDown') {
        const countDownDuration = Date.now() + 60000; // 倒计时时长
        return (
          <Button className="get-code-btn countdown-duration" disabled>
            <Countdown value={countDownDuration} format="s" onFinish={onCountDownFinish} />
            {oauthIntl['srm.oauth.restPassword.seconds'] || '秒'}
          </Button>
        );
      }
    }, [codeBtnType, codeBtnDisabled, oauthIntl, isFirstCode]);

    const registrationBtn = useMemo(
      () =>
        registerEnabledFlag && registerLink ? (
          <a
            href={replacePrefix(prefix, registerLink)}
            target="_blank"
            className="btn-theme registration-btn"
          >
            {oauthIntl['srm.oauth.login.vendorRegistration'] || '供应商注册'}
          </a>
        ) : null,
      [registerEnabledFlag, registerLink, oauthIntl]
    );

    const accountTab = useCallback((_tls) => {
      return (
        <TabPane tab={_tls && _tls.title[language] || oauthIntl['srm.oauth.login.accountLogin'] || '账号登录'} key="account">
          {isAccount || isNeedCaptcha || isCaptchaError ? <span className="portal-login-error" ref={errorRef}>{urlMsg}</span> : null}
          <Form
            labelLayout={LabelLayout.placeholder}
            action={`${isLocalhost ? API_HOST : ''}/oauth/`}
            method="post"
            target="_self"
            id="portal-account-form"
            style={{ marginBottom: '-8px' }}
          >
            <TextField
              name="username"
              {...eventProps('account')}
              record={accountDS}
              placeholder={oauthIntl['srm.oauth.login.enterAccountOrPhoneOrEmail'] || '请输入账号/手机/邮箱'}
            />
            <Password
              name="password"
              {...eventProps('account')}
              record={accountDS}
              reveal={!hidePassword}
              placeholder={oauthIntl['srm.oauth.login.enterPassword'] || '请输入登录密码'}
            />
            {(needCaptcha !== 'true' && showImageCaptcha) || isNeedCaptcha || isCaptchaError ? (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <TextField
                  record={accountDS}
                  name="captcha"
                  style={{ width: '60%' }}
                  {...eventProps('account')}
                  placeholder={
                    oauthIntl['srm.oauth.loginAction.enterVerificationCode'] || '请输入验证码'
                  }
                />
                <img
                  src={`/oauth/public/captcha?t=${timestamp}`}
                  onClick={() => {
                    setTimestamp(new Date().getTime());
                  }}
                  style={{ height: 30, pointerEvents: 'auto' }}
                />
              </div>
            ) : null}
            <button
              // type={ButtonType.submit}
              onClick={() => handleLogin('account')}
              className="btn-theme workspace-btn"
            >
              {oauthIntl['srm.oauth.navbar.logIn'] || '登录'}
            </button>
            {registrationBtn}
            <input type="hidden" name="plaintext_password" value="**********" />
            {
             isFunction(renderCustomDom) && (
              renderCustomDom(oauthIntl)
             )
            }
          </Form>
          {renderCommonDom()}
        </TabPane>
      );
    }, [accountDS, newList, oauthIntl, timestamp, registrationBtn, renderCommonDom, urlMsg, showImageCaptcha, needCaptcha]);

    const phoneTab = useCallback((_tls) => {
      return (
        <TabPane tab={_tls && _tls.title[language] || oauthIntl['srm.oauth.login.phoneLogin'] || '手机号登录'} key="phone">
          {isSms ? <span className="portal-login-error" ref={errorRef}>{urlMsg}</span> : null}
          <Form
            labelLayout={LabelLayout.placeholder}
            action={`${isLocalhost ? API_HOST : ''}/oauth/sms`}
            method="post"
            target="_self"
            id="portal-sms-form"
            style={{ marginBottom: '-8px' }}
          >
            <TextField
              name="phone"
              {...eventProps('sms')}
              onChange={handlePhone}
              record={smsDS}
              placeholder={oauthIntl['srm.oauth.login.enterPhoneNumber'] || '请输入手机号'}
              prefix="+86"
            />
            <div style={{ display: 'flex' }}>
              <TextField
                record={smsDS}
                name="captcha"
                {...eventProps('sms')}
                style={{ width: '50%' }}
                placeholder={
                  oauthIntl['srm.oauth.loginAction.enterVerificationCode'] || '请输入验证码'
                }
              />
              {renderCodeBtn}
            </div>
            <button
              // type={ButtonType.submit}
              onClick={() => handleLogin('sms')}
              className="btn-theme workspace-btn"
            >
              {oauthIntl['srm.oauth.navbar.logIn'] || '登录'}
            </button>
            {registrationBtn}
            <input type="hidden" name="captchaKey" value={phoneCaptchaKey} />
          </Form>
          {renderCommonDom()}
        </TabPane>
      );
    }, [smsDS, oauthIntl, phoneCaptchaKey, renderCodeBtn, registrationBtn, renderCommonDom, errorRef, urlMsg]);

    const content = (
      <div className={styles['portal-login-container']} style={{ backgroundColor }}>
        <Tabs className={`login-tab ${newLoginTypeList.find(item => !item.enabled) ? 'tab-left' : ''}`} defaultActiveKey={isSms ? 'phone' : isAccount ? 'acount' : newLoginTypeList[0].type}>
          {
            newLoginTypeList.map(item => {
              if (item.enabled) {
                if (item.type === 'account') {
                  return accountTab(item._tls);
                }
                if (item.type === 'phone') {
                  return phoneTab(item._tls);
                }
              }
            })
          }
        </Tabs>
      </div>
    );

    const renderContent = () => {
      if (remote && remote.process) {
        return remote.render(
          'SRM.PORTAL.LOGIN_CARD_RENDER',
          content,
          { isLogin, styles, backgroundColor, oauthIntl, state, setState, urlMsg }
        );
      }
      return content;
    };

    return renderContent();
  }
};

export default React.memo(
  remote(
    { code: 'SRM.PORTAL.LOGIN_CARD' },
    {},
  )(LoginCard)
);
