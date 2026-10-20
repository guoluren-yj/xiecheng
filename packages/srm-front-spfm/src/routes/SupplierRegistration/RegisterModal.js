/**
 * @Author: 杨一昊 yihao.yang@going-link.com
 * @Date: 2022-07-03 17:37:24
 * @FilePath: /srm-front-spfm/src/routes/SupplierRegistration/RegisterModal.js
 * @Copyright (c) 2022 by ZhenYun, All Rights Reserved.
 */
import React, { useState, useEffect } from 'react';
import { Button } from 'choerodon-ui/pro';
import { Certification, ChangeCompany } from '@/services/supplierRegistrationService';
import { getResponse } from 'utils/utils';
import styles from './index.less';

/**
 * @description:
 * @param {*} param
 * @return {*}
 */
const RegisterModal = ({
  registerStatus,
  purchaseTenantFlag,
  companyName,
  onClose,
  params,
  intl,
}) => {
  const [modalMessage, setModalMessage] = useState('');
  const [messageTips, setMessageTips] = useState('');
  /**
   * @description: 直接跳转登陆页面
   * @return {*}
   */
  const handleLogin = () => {
    window.location.replace(`${window.location.origin}/oauth/`);
  };

  /**
   * @description: 直接认证 --- 调用不解绑api
   * @return {*}
   */
  const handleCertification = () => {
    Certification({ ...params }).then((res) => {
      const result = getResponse(res);
      if (result) {
        const { oneStepKey } = result;
        const redirectUri = '/app/sslm/enterprise-certification';
        window.location.replace(
          `${window.location.origin}/oauth/login/one-step?one_step_key=${oneStepKey}&redirectUri=${redirectUri}`
        );
      }
    });
  };

  /**
   * @description: 更换公司 --- 调用解绑api
   * @return {*}
   */
  const handleChangeCompany = () => {
    ChangeCompany({ ...params }).then((res) => {
      const result = getResponse(res);
      if (result) {
        const { oneStepKey } = result;
        const redirectUri = '/app/sslm/enterprise-certification';
        window.location.replace(
          `${window.location.origin}/oauth/login/one-step?one_step_key=${oneStepKey}&redirectUri=${redirectUri}`
        );
      }
    });
  };

  useEffect(() => {
    switch (registerStatus) {
      case 'PENDING':
        if (purchaseTenantFlag) {
          setModalMessage(
            (intl['srm.oauth.register.modal.pending1'] &&
              // eslint-disable-next-line no-template-curly-in-string
              intl['srm.oauth.register.modal.pending1'].replace('${companyName}', companyName)) ||
              `手机号/邮箱已关联【${companyName}】请确认是否继续以该公司员工身份登录，如您已不是该公司员工，请选择更换公司。`
          );
        } else {
          setModalMessage(
            (intl['srm.oauth.register.modal.pending2'] &&
              // eslint-disable-next-line no-template-curly-in-string
              intl['srm.oauth.register.modal.pending2'].replace('${companyName}', companyName)) ||
              `手机号/邮箱已关联【${companyName}】请确认是否继续以该公司员工身份进行认证，如您已不是该公司员工，请选择更换公司。`
          );
        }
        setMessageTips(
          intl['srm.oauth.register.modal.updateCompanyTips'] ||
            '注意：更换公司后，原公司下的账号将被冻结不能使用；如仍需使用原账号，请更换注册的手机号/邮箱'
        );
        break;
      case 'LOGIN':
        setModalMessage(
          intl['srm.oauth.register.modal.login'] ||
            '手机号/邮箱已在当前域名注册，是否直接登录继续完成认证。'
        );
        break;

      default:
        break;
    }
  }, [registerStatus, purchaseTenantFlag, companyName]);

  return (
    <div className={styles.registerModalContent}>
      <div className={styles.registerTitle}>{intl['srm.oauth.register.modalTip'] || '提示'}</div>
      <div className={styles.registerMessage}>{modalMessage}</div>
      <div className={styles.registerMessage}>{messageTips}</div>
      <div className={styles.registerFooter}>
        {(registerStatus === 'LOGIN' ||
          (registerStatus === 'PENDING' && purchaseTenantFlag === 1)) && (
          <Button color="primary" onClick={handleLogin}>
            {intl['srm.oauth.register.modal.landingDirectly'] || '直接登陆'}
          </Button>
        )}
        {registerStatus === 'PENDING' && purchaseTenantFlag === 0 && (
          <Button color="primary" onClick={handleCertification}>
            {intl['srm.oauth.register.modal.directlyCertification'] || '直接认证'}
          </Button>
        )}
        {registerStatus === 'PENDING' && (
          <Button onClick={handleChangeCompany}>
            {intl['srm.oauth.register.modal.changeCompany'] || '更换公司'}
          </Button>
        )}
        <Button onClick={onClose}>{intl['hzero.common.button.cancel'] || '取消'}</Button>
      </div>
    </div>
  );
};
export default RegisterModal;
