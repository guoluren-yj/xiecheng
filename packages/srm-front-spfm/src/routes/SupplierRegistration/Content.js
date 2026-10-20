import React, { useMemo, useEffect, useState } from 'react';
import {
  DataSet,
  Form,
  TextField,
  Password,
  Button,
  Select,
  CheckBox,
  Output,
  Modal,
  notification,
} from 'choerodon-ui/pro';

import { Content } from 'components/Page';
import { observer } from 'mobx-react-lite';
import { compose } from 'lodash';
import { encode } from '@/utils/utils';
import { getResponse } from 'utils/utils';
import {
  handleSupplierRegistration,
  getPasswordPolicies,
} from '@/services/supplierRegistrationService';
import { HZERO_IAM } from 'utils/config';
import RegisterModal from './RegisterModal';
import { registerFormDs } from './stores/indexDs';
import { getOptions } from './utils';

import PhoneCaptcha from './components/PhoneCaptcha';

import styles from './index.less';

const RegisterContent = observer(
  ({
    intl = {},
    history,
    cookies,
    internationalTelCodes,
    queryParams: { code } = {},
    portalConfig,
    language,
    verifyConfig = {},
    passwordDefaultFlag,
  }) => {
    const { tenantId: currentTenantId } = portalConfig || {};
    const purchaseTenantId = cookies.get('hostTenantId') || currentTenantId;

    const { verifyMethods: newVerifyMethods, defaultVerifyMethod } = verifyConfig;
    const [passwordPolicies, setPasswordPolicies] = useState({});
    const [loading, setLoading] = useState(false);
    const [orCheckErr, setOrCheckErr] = useState(0);

    const [disabledCaptcha, setDisabledCaptcha] = useState(true);

    const registerDs = useMemo(
      () =>
        new DataSet(
          registerFormDs({ intl, passwordPolicies, defaultVerifyMethod, passwordDefaultFlag })
        ),
      [intl, passwordPolicies, defaultVerifyMethod, passwordDefaultFlag]
    );

    const options = useMemo(() => getOptions(intl, newVerifyMethods), [intl, newVerifyMethods]);

    /**
     * @description: 点击注册
     * @return {*}
     */
    const handleRegistration = async () => {
      const { hostname } = window.location;
      // 注册 校验数据
      const flag = (await registerDs?.current?.validate()) || true;

      if (flag) {
        const params = registerDs?.current?.toData();
        const registerCaptchaKey = cookies.get('registerCaptchaKey') || null;
        const payload = {
          ...params,
          password: passwordDefaultFlag
            ? null
            : params.password
            ? encode(params.password)
            : params.password,
          anotherPassword: passwordDefaultFlag
            ? null
            : params.anotherPassword
            ? encode(params.anotherPassword)
            : params.anotherPassword,
          captchaKey: registerDs?.getState('captchaKey') || registerCaptchaKey,
          purchaseTenantId,
          registerWebUrl: hostname,
          ...(code ? { invitationCode: code } : {}),
          language,
        };

        if (!params.orcheck) {
          setOrCheckErr(!params.orcheck);
        } else {
          // 调用注册api
          setLoading(true);
          await handleSupplierRegistration(payload)
            .then((res) => {
              const result = getResponse(res);
              if (result) {
                const {
                  registerStatus,
                  purchaseTenantFlag,
                  companyName,
                  oneStepKey,
                  oneStepKeyUser,
                } = result;
                if (registerStatus === 'AUTHENTICATION') {
                  notification.success({
                    placement: 'bottomRight',
                    message: intl['hzero.common.notification.success'] || '操作成功',
                  });
                  const redirectUri = '/app/sslm/enterprise-certification';
                  window.location.replace(
                    `${window.location.origin}/oauth/login/one-step?one_step_key=${oneStepKey}&redirectUri=${redirectUri}`
                  );
                } else {
                  // 打开弹窗，根据code展示不同类型弹窗
                  handleOpenModal({
                    registerStatus,
                    purchaseTenantFlag,
                    companyName,
                    params: { ...payload, oneStepKey, oneStepKeyUser },
                  });
                }
              }
            })
            .finally(() => {
              setLoading(false);
            });
        }
      }
    };

    /**
     * @description: 注册弹窗提示框
     * @param {*} registerStatus
     * @param {*} purchaseTenantFlag
     * @return {*}
     */
    const handleOpenModal = ({ registerStatus, purchaseTenantFlag, companyName, params }) => {
      const modal = Modal.open({
        key: Modal.key(),
        // title: intl['srm.oauth.register.modalTip'] || '提示',
        style: { width: 560 },
        className: styles.registerModal,
        closable: false,
        footer: null,
        children: (
          <RegisterModal
            registerStatus={registerStatus}
            purchaseTenantFlag={purchaseTenantFlag}
            companyName={companyName}
            onClose={() => modal.close()}
            history={history}
            cookies={cookies}
            params={params}
            intl={intl}
          />
        ),
      });
    };

    /**
     * @description: 验证方式改变操作
     * @param {*} newValue
     * @return {*}
     */
    const handleVerifyMethodsChange = (newValue) => {
      if (newValue === 'PHONE') {
        registerDs.current.set({ email: undefined, internationalTelCode: '+86' });
      }
      if (newValue === 'EMAIL') {
        registerDs.current.set({ internationalTelCode: undefined, phone: undefined });
      }
    };

    // 获取验证方式
    const verifyMethods = registerDs?.current?.get('verifyMethods');
    const { internationalTelCode, phone, email } = registerDs?.current?.get([
      'internationalTelCode',
      'phone',
      'email',
    ]);

    // 获取验证码前置回调
    const handleBeforeClick = () => {
      let flag = true;
      if (!verifyMethods) {
        notification.warning({
          placement: 'bottomRight',
          message: intl['srm.oauth.view.register.verifyMethodsTip'] || '请输入验证方式',
        });
        flag = false;
      }
      if (verifyMethods === 'PHONE' && !phone) {
        notification.warning({
          placement: 'bottomRight',
          message: intl['srm.oauth.notification.warning.phoneNull'] || '手机号未填写',
        });
        flag = false;
      }
      if (verifyMethods === 'EMAIL' && !email) {
        notification.warning({
          placement: 'bottomRight',
          message: intl['srm.oauth.notification.warning.emailNull'] || '邮箱未填写',
        });
        flag = false;
      }
      return flag;
    };

    // 获取验证码后续处理
    const handleAfterClick = ({ captchaKey }) => {
      // eslint-disable-next-line no-unused-expressions
      registerDs?.setState('captchaKey', captchaKey);
      cookies.set('registerCaptchaKey', captchaKey);
    };

    useEffect(() => {
      const { hostname } = window.location;

      // 页面初始化查询密码策略
      getPasswordPolicies({ domainName: hostname }).then((res) => {
        if (getResponse(res)) {
          setPasswordPolicies(res);
        }
      });
    }, []);

    /**
     *  输入手机号、邮箱更换
     */
    const handleFieldChange = (value) => {
      setDisabledCaptcha(!value);
    };

    // 渲染获取验证码按钮
    const renderCaptchaCom = (comProps = {}) => <PhoneCaptcha {...comProps} />;

    return (
      <Content>
        <div className={styles.contentTitle}>{intl['srm.oauth.navbar.register'] || '注册'}</div>
        <Form
          dataSet={registerDs}
          className={styles['addon-before-style']}
          labelLayout="placeholder"
        >
          <TextField
            name="realName"
            placeholder={intl['srm.oauth.register.enterYourUsername'] || '注册'}
          />
          <Password name="password" />
          <Password name="anotherPassword" />
          <Select name="verifyMethods" onChange={handleVerifyMethodsChange}>
            {options.map((i) => {
              return <Select.Option value={i.value}>{i.meaning}</Select.Option>;
            })}
          </Select>
          {verifyMethods === 'PHONE' && (
            <TextField
              addonBefore={
                <Select name="internationalTelCode" clearButton={false} disabled>
                  {internationalTelCodes.map((i) => {
                    return <Select.Option value={i.value}>{i.meaning}</Select.Option>;
                  })}
                </Select>
              }
              name="phone"
              restrict="0-9,-"
              onChange={handleFieldChange}
            />
          )}
          {verifyMethods === 'EMAIL' && <TextField name="email" onChange={handleFieldChange} />}
          <TextField
            name="authCode"
            addonAfterStyle={{
              padding: 0,
              marginLeft: 10,
              backgroundColor: '#fff',
              border: 0,
            }}
            addonAfter={renderCaptchaCom({
              btnDesc:
                verifyMethods === 'PHONE'
                  ? intl['srm.oauth.register.obtainMessageVerificationCode'] || '获取短信验证码'
                  : intl['srm.oauth.register.obtainEmailVerificationCode'] || '获取邮箱验证码',
              apiConfig: {
                url:
                  verifyMethods === 'PHONE'
                    ? `${HZERO_IAM}/hzero/v1/users/new-register-phone/send-captcha`
                    : `${HZERO_IAM}/hzero/v1/users/register-email/send-captcha`,
                query:
                  verifyMethods === 'PHONE'
                    ? {
                        internationalTelCode,
                        phone,
                        language,
                        tenantId: purchaseTenantId,
                      }
                    : { email, language },
              },
              beforeClick: handleBeforeClick,
              afterClick: handleAfterClick,
              purchaseTenantId,
              disabledCaptcha,
            })}
          />
          <Output
            className={styles['addon-before-style-agreement']}
            renderer={() => {
              return (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <CheckBox
                    style={{
                      padding: 0,
                      marginRight: 6,
                    }}
                    onChange={(newChecked) => {
                      // eslint-disable-next-line no-unused-expressions
                      // registerDs?.current?.set({
                      //   orCheckErr: newChecked,
                      // });
                      setOrCheckErr(!newChecked);
                    }}
                    name="orcheck"
                  />
                  <span>
                    {intl['srm.oauth.register.readAndAgreed'] || '我已阅读并同意'}《
                    <a target="_blank" href="/oauth/public/default/terms.html">
                      {intl['srm.oauth.register.srmAgreement'] || 'SRM用户协议'}
                    </a>
                    》{intl['srm.oauth.and'] || '和'}《
                    <a target="_blank" href="/oauth/public/default/terms_two.html">
                      {intl['srm.oauth.privacyPolicyStatement'] || '隐私政策声明'}
                    </a>
                    》
                  </span>
                </div>
              );
            }}
          />
        </Form>
        {!!orCheckErr && (
          <span style={{ color: '#F56349', position: 'relative', top: '-12px' }}>
            {intl['srm.oauth.register.tickAgreement'] || '请勾选同意协议'}
          </span>
        )}
        <Button
          loading={loading}
          onClick={handleRegistration}
          color="primary"
          style={{ maxWidth: 'inherit' }}
          block
          disabled={orCheckErr}
        >
          {intl['srm.oauth.navbar.register'] || '注册'}
        </Button>
      </Content>
    );
  }
);

export default compose()(RegisterContent);
