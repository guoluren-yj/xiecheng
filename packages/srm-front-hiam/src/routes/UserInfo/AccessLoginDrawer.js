import { TextField, Button, Password, DataSet, Spin } from 'choerodon-ui/pro';
import { Tabs } from 'choerodon-ui';
import React, { Component } from 'react';
import { getEnvConfig } from 'utils/iocUtils';
import request from 'utils/request';
import moment from 'moment';
import { getResponse, getCurrentUser, encryptPwd } from 'utils/utils';
import { getPublicKey } from 'services/api';
import intl from 'utils/intl';
import styles from './style.less';

export default class AccessLogin extends Component {
  state = {
    // loading => selectMethod => verify => verifySuccess
    status: 'loading',
    /** @type {"password" | "phone" | "email"} */
    method: 'password',
    /** @type {0 | 1 | 2 | 3 | 4 | 5} */
    verifyCodeIndex: 0,
    /** @type {string[] | number[]} */
    verifyCode: [],
    /** @type {{captchaKey: string, message: string, interval: number}} */
    cacheVerifyMessage: {},
    interval: -1,
    /** @type {{phone: string, email: string, supportTypes: string[]}} */
    verifyMethodInfo: {},
    /** @type {undefined | {message: string, success: boolean}} */
    verifyResponse: undefined,
    /** @type {"failed" | "success" | "validating" | undefined} */
    verifyStatus: undefined,
  };

  dataSet = new DataSet({
    autoCreate: true,
    fields: [
      {
        name: 'password',
      },
    ],
  });

  componentDidMount() {
    request('/oauth/login/sensitive-operation/fetch', {
      method: 'GET',
    }).then((res) => {
      if (getResponse(res)) {
        const newRes = res || {};
        let defaultMethod = 'password';
        if (this.props.disablePd) {
          newRes.supportTypes = ((newRes || {}).supportTypes || []).filter((m) => m !== 'password');
          defaultMethod = 'phone';
        }
        this.setState({
          verifyMethodInfo: newRes,
          method: ((newRes || {}).supportTypes || [])[0] || defaultMethod,
          status: 'selectMethod',
        });
      }
    });

    getPublicKey().then((res) => {
      if (res) {
        this.setState({ publicKey: res.publicKey });
      }
    });

    const lastGetCodeTime = sessionStorage.getItem('access-login-verify-code-timer');
    if (lastGetCodeTime && moment(lastGetCodeTime).isValid()) {
      let timeDiff = moment().diff(moment(lastGetCodeTime), 's');
      if (timeDiff > 60 || timeDiff < 0) timeDiff = 0;
      else timeDiff = 60 - timeDiff;
      const callback = (initValue) => {
        const newInterval = initValue === undefined ? this.state.interval - 1 : initValue - 1;
        if (newInterval >= -1) {
          this.setState({
            interval: newInterval,
          });
          setTimeout(callback, 1000);
        }
      };
      callback(timeDiff);
    }
  }

  toggleMethod = (key) => {
    this.setState({ method: key });
  };

  pasteVerifyCode = (e) => {
    const { clipboardData } = e;
    const data = (clipboardData.getData('text') || '').slice(0, 6).replace(/\s*/g, '');
    const validFlag = /^[0-9]+$/.test(data);
    this.setState({
      verifyCode: validFlag ? Array.prototype.map.call(data, (str) => Number(str)) : [],
      verifyCodeIndex: validFlag ? data.length : 0,
    });
  };

  focusInput = (e) => {
    const { dataset } = e.target;
    if (dataset.index === undefined) return;
    const eventIndex = Number(dataset.index);
    const { verifyCode } = this.state;
    let verifyCodeCurrentInput = verifyCode.length;
    if (verifyCodeCurrentInput > 5) verifyCodeCurrentInput = 5;
    const inputs = document.querySelectorAll('#login-access-verify > input');
    let input;
    let verifyCodeIndex;
    if (eventIndex > verifyCodeCurrentInput) {
      input = inputs[verifyCodeCurrentInput];
      verifyCodeIndex = verifyCodeCurrentInput;
    } else {
      input = inputs[eventIndex];
      verifyCodeIndex = eventIndex;
    }
    input.focus();
    this.setState({ verifyCodeIndex });
  };

  changeValue = (newValue, newIndex) => {
    const tempValues = [...this.state.verifyCode];
    tempValues[this.state.verifyCodeIndex] = newValue;
    // 去除verifyCode尾部空值
    const newVerifyCode = tempValues.reverse().reduce((newValues, value) => {
      if (newValues.length === 0 && (value === '' || value === undefined)) return newValues;
      newValues.unshift(value);
      return newValues;
    }, []);
    this.setState(
      {
        verifyCodeIndex: newIndex,
        verifyCode: newVerifyCode,
      },
      () => {
        const input = document.querySelectorAll('#login-access-verify > input')[newIndex];
        input.focus();
        if (newVerifyCode.length === 6) {
          this.executeVerify(newVerifyCode.join(''));
        }
      }
    );
  };

  executeVerify = () => {
    const { cacheVerifyMessage, method, verifyMethodInfo, verifyCode } = this.state;
    const { executeVerify } = this.props;
    const payload =
      method === 'password'
        ? {
            _type: 'pd',
            account: getCurrentUser().loginname,
            password: encryptPwd(this.dataSet.current.get('password'), this.state.publicKey),
          }
        : {
            _type: method,
            account: verifyMethodInfo[method],
            captchaKey: cacheVerifyMessage.captchaKey,
            captcha: verifyCode.join(''),
          };
    this.setState({
      verifyStatus: 'validating',
    });
    let promise;
    if (executeVerify) promise = executeVerify(payload);
    else promise = this.defaultVerify(payload);
    promise.then(([newState, callback]) => {
      this.setState(newState, callback);
    });
  };

  defaultVerify = (payload) => {
    const host = window.location.origin;
    return request(`${host}/oauth/login/sensitive-operation/exec/disposable-login-link`, {
      method: 'POST',
      body: payload,
    }).then((res) => {
      const newState = {
        verifyStatus: 'success',
        status: 'verifySuccess',
      };
      if (getResponse(res)) {
        newState.verifyResponse = res;
        newState.verifyStatus = res.success ? 'success' : 'failed';
      } else {
        newState.verifyStatus = 'failed';
      }
      // 验证失败且是密码验证时不切换阶段
      if (newState.verifyStatus === 'failed') delete newState.status;
      return [newState];
    });
  };

  keyDown = (e) => {
    const { keyCode, key } = e;
    let newValue;
    let offset;
    // 数字输入
    if ((keyCode >= 96 && keyCode <= 105) || (keyCode >= 48 && keyCode <= 57)) {
      newValue = Number(key);
      offset = 1;
    } else if (keyCode === 8) {
      // 删除字符
      newValue = undefined;
      offset = -1;
    } else if (keyCode === 46) {
      // 只删除字符不移动位置
      newValue = undefined;
      offset = 0;
    } else return;
    let newIndex = this.state.verifyCodeIndex + offset;
    if (newIndex >= 6) newIndex = 5;
    if (newIndex < 0) newIndex = 0;
    this.changeValue(newValue, newIndex);
  };

  getVerifyCode = () => {
    return request(
      `${getEnvConfig().HZERO_PLATFORM}/v1/desensitize/captcha?type=${this.state.method}`,
      {
        method: 'GET',
      }
    ).then((res) => {
      const result = getResponse(res);
      if (result) {
        sessionStorage.setItem(
          'access-login-verify-code-timer',
          moment().format('YYYY-MM-DD HH:mm:ss')
        );
        this.setState(
          {
            cacheVerifyMessage: result,
            status: 'verify',
            interval: result.interval || 0,
          },
          () => {
            document.querySelector('#login-access-verify > input').focus();
          }
        );
        const callback = () => {
          if (this.state.interval >= 0) {
            this.setState({
              interval: this.state.interval - 1,
            });
            setTimeout(callback, 1000);
          }
        };
        callback();
      }
    });
  };

  render() {
    const { successInfo } = this.props;
    const {
      loading,
      status,
      method,
      verifyCode,
      cacheVerifyMessage,
      interval,
      verifyResponse,
      verifyStatus,
      verifyMethodInfo,
      verifyMethodInfo: { supportTypes = [] },
    } = this.state;
    let content = null;
    let placeholder = verifyMethodInfo[method] || '';
    if (method === 'phone') placeholder = placeholder.replace(/^(\d{3})\d+(\d{2})$/, '$1******$2');
    else if (method === 'email') {
      placeholder = placeholder.replace(
        /^([a-zA-Z0-9-_]+).?[^@]+(@[a-zA-Z0-9-_]+.[a-zA-Z]+(.[a-zA-Z]+)?)$/,
        '$1******$2'
      );
    }
    switch (status) {
      case 'loading':
        content = (
          <Spin spinning={loading}>
            <div style={{ width: '100%', height: '247px' }} />
          </Spin>
        );
        break;
      case 'selectMethod':
        content = (
          <>
            <Tabs activeKey={method} onChange={this.toggleMethod}>
              {supportTypes.includes('phone') && (
                <Tabs.TabPane
                  key="phone"
                  tab={intl.get('hiam.userInfo.accessLogin.title.verifyByPhone').d('手机验证')}
                />
              )}
              {supportTypes.includes('email') && (
                <Tabs.TabPane
                  key="email"
                  tab={intl.get('hiam.userInfo.accessLogin.title.verifyByEmail').d('邮箱验证')}
                />
              )}
              {supportTypes.includes('password') && (
                <Tabs.TabPane
                  key="password"
                  tab={intl.get('hiam.userInfo.accessLogin.title.verifyByPwd').d('密码验证')}
                />
              )}
            </Tabs>
            {method === 'password' ? (
              <>
                <div style={{ color: '#9a9a9a', marginBottom: '20px', fontSize: '14px' }}>
                  {intl
                    .get('hiam.userInfo.accessLogin.tip.verifyByPwd')
                    .d('为确保您本人操作，请先通过密码完成身份验证')}
                </div>
                <Password
                  dataSet={this.dataSet}
                  name="password"
                  style={{ width: '100%', display: 'block', marginBottom: '26px' }}
                />
                <div
                  style={{
                    color: 'red',
                    marginTop: '-23px',
                    marginBottom: '3px',
                    lineHeight: '20px',
                    height: '20px',
                  }}
                >
                  {verifyStatus === 'failed'
                    ? intl.get('hiam.userInfo.accessLogin.tip.failedVerify').d('验证失败')
                    : ''}
                </div>
                <Button
                  color="primary"
                  style={{ width: '100%', maxWidth: 'unset' }}
                  onClick={this.executeVerify}
                  loading={verifyStatus === 'validating'}
                >
                  {intl.get('hzero.common.button.confirm').d('确认')}
                </Button>
                <div style={{ color: '#9a9a9a', fontSize: '12px', marginTop: '12px' }}>
                  {intl
                    .get('hiam.userInfo.accessLogin.tip.passwordHelp')
                    .d('若您忘记密码，请联系公司系统管理员，或拨打热线电话400-116-0808获取帮助')}
                </div>
              </>
            ) : (
              <>
                <div style={{ color: '#9a9a9a', marginBottom: '20px', fontSize: '14px' }}>
                  {intl
                    .get('hiam.userInfo.accessLogin.tip.verifyByPhoneOrEmail')
                    .d('为确保您本人操作，请先通过以下方式获取验证码完成验证')}
                </div>
                <TextField
                  disabled
                  value={placeholder}
                  style={{ width: '100%', display: 'block', marginBottom: '24px' }}
                />
                <Button
                  disabled={interval >= 0}
                  color={interval < 0 ? 'primary' : 'default'}
                  style={{ width: '100%', maxWidth: 'unset' }}
                  onClick={this.getVerifyCode}
                >
                  {interval < 0
                    ? intl.get('hzero.common.components.login.captcha').d('获取验证码')
                    : intl
                        .get('hiam.userInfo.accessLogin.tip.retryTime', {
                          interval,
                        })
                        .d('{interval}s后可重新获取验证码')}
                </Button>
                <div style={{ color: '#9a9a9a', fontSize: '12px', marginTop: '12px' }}>
                  {intl
                    .get('hiam.userInfo.accessLogin.tip.phoneOrEmailHelp')
                    .d(
                      '若您的手机和邮箱均无法接收验证码，请联系公司系统管理员，或拨打热线电话400-116-0808获取帮助'
                    )}
                </div>
              </>
            )}
          </>
        );
        break;
      case 'verify':
        content = (
          <div
            style={{
              paddingLeft: '32px',
              paddingRight: '32px',
              position: 'relative',
              height: '247px',
            }}
          >
            <Button
              icon="arrow_back"
              funcType="flat"
              className={styles['back-btn']}
              size="small"
              onClick={() => this.setState({ status: 'selectMethod', cacheVerifyMessage: {} })}
            />
            <div
              style={{
                marginBottom: '12px',
                lineHeight: '32px',
                fontSize: '16px',
                fontWeight: 600,
              }}
            >
              {intl.get('hiam.userInfo.accessLogin.title.inputCaptcha').d('输入验证码')}
            </div>
            <div style={{ color: '#9a9a9a', marginBottom: '18px', fontSize: '14px' }}>
              {cacheVerifyMessage.message}
            </div>
            <div
              id="login-access-verify"
              className={styles['verify-code-input']}
              onPaste={this.pasteVerifyCode}
              onFocus={this.focusInput}
              onKeyDown={this.keyDown}
              key={verifyCode.join('')}
            >
              {[0, 1, 2, 3, 4, 5].map((v) => (
                <input
                  key={v}
                  maxLength={1}
                  data-index={v}
                  value={(verifyCode[v] === 0 && '0') || verifyCode[v] || ''}
                />
              ))}
            </div>
            <div
              style={{
                color: 'red',
                marginTop: '-23px',
                marginBottom: '3px',
                lineHeight: '20px',
                height: '20px',
              }}
            >
              {verifyStatus === 'failed'
                ? intl.get('hiam.userInfo.accessLogin.tip.failedVerify').d('验证失败')
                : ''}
            </div>
            <div style={{ marginBottom: '12px' }}>
              <Button
                disabled={interval >= 0}
                style={{ width: '100%', maxWidth: 'unset' }}
                onClick={this.getVerifyCode}
              >
                {interval < 0
                  ? intl.get('hiam.userInfo.accessLogin.button.reFetch').d('重新获取')
                  : intl
                      .get('hiam.userInfo.accessLogin.tip.retryTime', {
                        interval,
                      })
                      .d('{interval}s后可重新获取验证码')}
              </Button>
            </div>
            <div>
              <Button
                color="primary"
                style={{ width: '100%', maxWidth: 'unset' }}
                onClick={this.executeVerify}
                loading={verifyStatus === 'validating'}
              >
                {intl.get('hzero.common.button.submit').d('提交')}
              </Button>
            </div>
          </div>
        );
        break;
      case 'verifySuccess':
        content = successInfo || (
          <div style={{ height: '247px' }}>
            <div style={{ marginBottom: '28px' }}>
              {intl
                .get('hiam.userInfo.accessLogin.tip.verifySuccess')
                .d('一次性登录链接已生成，链接10分钟内有效，请复制链接分享使用。')}
            </div>
            <div style={{ marginBottom: '28px', wordBreak: 'break-all' }}>
              {(verifyResponse || {}).result}
            </div>
            <div
              style={{
                textAlign: 'right',
                padding: '0 16px',
                position: 'absolute',
                width: '100%',
                left: 0,
                bottom: '16px',
              }}
            >
              <Button
                onClick={() => {
                  this.props.modal.close();
                }}
              >
                {intl.get('hzero.common.button.close').d('关闭')}
              </Button>
            </div>
          </div>
        );
        break;
      default:
    }
    return content;
  }
}
