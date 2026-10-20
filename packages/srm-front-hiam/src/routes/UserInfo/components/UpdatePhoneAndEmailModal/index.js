import React, { useState } from 'react';
import { Form, TextField, Button, Password } from 'choerodon-ui/pro';
import { connect } from 'dva';
import { isNil } from 'lodash';

import notification from 'utils/notification';
import { getResponse, getSession, encryptPwd } from 'utils/utils';
import CountDown from 'components/CountDown';
import intl from 'utils/intl';

import styles from './index.less';

const BUSINNESS_TYPE = {
  validateOldPhone: 'validateOldPhone',
  validateNewPhone: 'validateNewPhone',
  validatePassword: 'validatePassword',
  validateUnCheckedPhone: 'validateUnCheckedPhone',
  validateOldEmail: 'validateOldEmail',
  validateNewEmail: 'validateNewEmail',
  validateUnCheckedEmail: 'validateUnCheckedEmail',
};

const UpdatePhoneAndEmailModal = (props) => {
  const { modal, dispatch, userInfo, formRecord, step, editType, onRefresh } = props;
  const {
    userInfo: {
      phoneCheckFlag,
      phone,
      emailCheckFlag,
      email,
      internationalTelCode,
      internationalTelMeaning,
    },
    modalProps,
    publicKey,
  } = userInfo;
  const { validCodeLimitTimeEnd, validCodeSendLimitFlag, lastCheckKey, captchaKey } = modalProps;
  const [businessType, setBusinessType] = useState(step);

  const closeModal = () => {
    if (modal && modal.close) {
      modal.close();
    }
  };

  const handleGainValidCodeBtnClick = ({
    type = 'oldPhone',
    value,
    businessScope = 'self',
    ...params
  }) => {
    dispatch({
      type: 'userInfo/postCaptcha',
      payload: { type, value, modalProps, businessScope, ...params },
    });
  };

  const handleValidCodeLimitEnd = () => {
    dispatch({
      type: 'userInfo/captchaLimitEnd',
      payload: { modalProps },
    });
  };

  const renderValidateOldPhoneForm = () => {
    if (phoneCheckFlag !== 1) {
      // 手机号 没有经过 校验, 则只能通过密码校验
      return renderValidatePasswordForm();
    }
    return (
      <>
        <div className={styles['modal-main']}>
          <Form labelLayout="float" columns={20} record={formRecord}>
            <TextField
              name="oldPhone"
              disabled
              colSpan={20}
              addonBefore={internationalTelMeaning}
            />
            <TextField
              name="captcha"
              label={intl.get('hiam.userInfo.model.user.phoneCaptcha').d('短信验证码')}
              colSpan={12}
            />
            <Button
              colSpan={8}
              disabled={validCodeSendLimitFlag || isNil(phone) || internationalTelCode !== '+86'}
              onClick={async () => {
                const flag = await formRecord.getField('oldPhone').checkValidity(formRecord);
                if (flag) {
                  handleGainValidCodeBtnClick({ type: 'oldPhone', value: phone });
                }
              }}
            >
              {validCodeSendLimitFlag ? (
                <CountDown target={validCodeLimitTimeEnd} onEnd={handleValidCodeLimitEnd} />
              ) : (
                intl.get('hiam.userInfo.view.option.gainCaptcha').d('获取验证码')
              )}
            </Button>
            <div colSpan={20} style={{ textAlign: 'right' }}>
              <a
                onClick={() => {
                  formRecord.set('captcha', undefined);
                  setBusinessType(BUSINNESS_TYPE.validatePassword);
                }}
              >
                {intl
                  .get('hiam.userInfo.view.message.cantReceivePhoneCaptcha')
                  .d('手机无法接收验证码')}
                ？
              </a>
            </div>
          </Form>
        </div>
        <div className={styles['modal-footer']}>
          <Button
            color="primary"
            onClick={async () => {
              const flag = await formRecord.getField('oldPhone').checkValidity(formRecord);
              const flag1 = await formRecord.getField('captcha').checkValidity(formRecord);
              if (!flag || !flag1) {
                return;
              }
              const captcha = formRecord.get('captcha');
              if (!getSession('user-info-oldPhone')) {
                notification.warning({
                  message: intl.get('hiam.userInfo.view.option.noGetCaptcha').d('请先获取验证码'),
                });
                return;
              }
              const res = await dispatch({
                type: 'userInfo/validatePreValidate',
                payload: {
                  captcha,
                  type: 'oldPhone',
                  modalProps: { ...modalProps, validCodeSendLimitFlag: false },
                  businessScope: 'self',
                },
              });
              if (getResponse(res)) {
                formRecord.init('captcha', undefined);
                setBusinessType(
                  editType === 'email'
                    ? BUSINNESS_TYPE.validateNewEmail
                    : BUSINNESS_TYPE.validateNewPhone
                );
              }
            }}
          >
            {intl.get('hzero.common.button.next').d('下一步')}
          </Button>
          <Button onClick={closeModal}>{intl.get('hzero.common.button.cancel').d('取消')}</Button>
        </div>
      </>
    );
  };

  const renderValidateNewPhoneForm = () => {
    return (
      <>
        <div className={styles['modal-main']}>
          <Form labelLayout="float" columns={20} record={formRecord}>
            <TextField
              name="newPhone"
              colSpan={20}
              addonBefore={intl.get('hiam.userInfo.common.chinesePhone').d('中国大陆 +86')}
            />
            <TextField
              name="captcha"
              label={intl.get('hiam.userInfo.model.user.phoneCaptcha').d('短信验证码')}
              colSpan={12}
            />
            <Button
              colSpan={8}
              disabled={validCodeSendLimitFlag}
              onClick={async () => {
                const flag = await formRecord.getField('newPhone').checkValidity(formRecord);
                if (!flag) {
                  return;
                }
                if (!lastCheckKey) {
                  notification.warning({
                    message: intl
                      .get('hiam.userInfo.view.message.missingRequireParams')
                      .d('缺少必要参数，请返回上一步重新获取验证码'),
                  });
                  return;
                }
                handleGainValidCodeBtnClick({
                  type: 'newPhone',
                  lastCheckKey,
                  value: formRecord.get('newPhone'),
                });
              }}
            >
              {validCodeSendLimitFlag ? (
                <CountDown target={validCodeLimitTimeEnd} onEnd={handleValidCodeLimitEnd} />
              ) : (
                intl.get('hiam.userInfo.view.option.gainCaptcha').d('获取验证码')
              )}
            </Button>
          </Form>
        </div>
        <div className={styles['modal-footer']}>
          <Button
            color="primary"
            onClick={async () => {
              const flag = await formRecord.getField('newPhone').checkValidity(formRecord);
              const flag1 = await formRecord.getField('captcha').checkValidity(formRecord);
              if (!flag || !flag1) {
                return;
              }
              const { captcha, newPhone } = formRecord.get(['captcha', 'newPhone']);
              // 新的邮箱的 验证 key
              const res = await dispatch({
                type: 'userInfo/validateNewPhone',
                payload: {
                  phone: newPhone,
                  captcha,
                  captchaKey,
                  lastCheckKey,
                  userInfo,
                  businessScope: 'self',
                },
              });
              if (res) {
                closeModal();
                onRefresh();
              }
            }}
          >
            {intl.get('hzero.common.button.ok').d('确定')}
          </Button>
          <Button onClick={closeModal}>{intl.get('hzero.common.button.cancel').d('取消')}</Button>
        </div>
      </>
    );
  };

  const renderValidatePasswordForm = () => {
    return (
      <>
        <div className={styles['modal-main']}>
          <Form labelLayout="float" columns={20} record={formRecord}>
            <Password name="password" colSpan={20} autoComplete="new-password" />
          </Form>
        </div>
        <div className={styles['modal-footer']}>
          <Button
            color="primary"
            onClick={async () => {
              const flag = await formRecord.getField('password').checkValidity(formRecord);
              if (!flag) {
                return;
              }
              const password = formRecord.get('password');
              const res = await dispatch({
                type: 'userInfo/validatePrePassword',
                payload: {
                  password: encryptPwd(password, publicKey),
                  modalProps: { ...modalProps, validCodeSendLimitFlag: false },
                  businessScope: 'self',
                },
              });
              if (getResponse(res)) {
                setBusinessType(
                  editType === 'email'
                    ? BUSINNESS_TYPE.validateNewEmail
                    : BUSINNESS_TYPE.validateNewPhone
                );
              }
            }}
          >
            {intl.get('hzero.common.button.next').d('下一步')}
          </Button>
          <Button onClick={closeModal}>{intl.get('hzero.common.button.cancel').d('取消')}</Button>
        </div>
      </>
    );
  };

  const renderValidateUnCheckedPhoneForm = () => {
    return (
      <>
        <div className={styles['modal-main']}>
          <Form labelLayout="float" columns={20} record={formRecord}>
            <TextField
              name="oldPhone"
              disabled
              colSpan={20}
              addonBefore={internationalTelMeaning}
            />
            <TextField
              name="captcha"
              label={intl.get('hiam.userInfo.model.user.phoneCaptcha').d('短信验证码')}
              colSpan={12}
            />
            <Button
              colSpan={8}
              disabled={validCodeSendLimitFlag || isNil(phone) || internationalTelCode !== '+86'}
              onClick={async () => {
                const flag = await formRecord.getField('oldPhone').checkValidity(formRecord);
                if (flag) {
                  handleGainValidCodeBtnClick({
                    type: 'oldPhone',
                    value: formRecord.get('oldPhone'),
                  });
                }
              }}
            >
              {validCodeSendLimitFlag ? (
                <CountDown target={validCodeLimitTimeEnd} onEnd={handleValidCodeLimitEnd} />
              ) : (
                intl.get('hiam.userInfo.view.option.gainCaptcha').d('获取验证码')
              )}
            </Button>
            {internationalTelCode !== '+86' && (
              <div colSpan={20} style={{ textAlign: 'right', color: 'red' }}>
                {intl.get('hiam.userInfo.view.message.notSengSMS').d('不支持短信发送')}
              </div>
            )}
          </Form>
        </div>
        <div className={styles['modal-footer']}>
          <Button
            color="primary"
            onClick={async () => {
              const flag = await formRecord.getField('oldPhone').checkValidity(formRecord);
              const flag1 = await formRecord.getField('captcha').checkValidity(formRecord);
              if (!flag || !flag1) {
                return;
              }
              const captcha = formRecord.get('captcha');
              if (!captchaKey) {
                notification.warning({
                  message: intl.get('hiam.userInfo.view.option.noGetCaptcha').d('请先获取验证码'),
                });
                return;
              }
              const res = await dispatch({
                type: 'userInfo/validateUnCheckedPhone',
                payload: {
                  captcha,
                  captchaKey,
                  userInfo,
                  businessScope: 'self',
                },
              });
              if (res) {
                closeModal();
                onRefresh();
              }
            }}
          >
            {intl.get('hzero.common.button.ok').d('确定')}
          </Button>
          <Button onClick={closeModal}>{intl.get('hzero.common.button.cancel').d('取消')}</Button>
        </div>
      </>
    );
  };

  const renderValidateOldEmailForm = () => {
    return (
      <>
        <div className={styles['modal-main']}>
          <Form labelLayout="float" columns={20} record={formRecord}>
            <TextField name="oldEmail" colSpan={20} disabled />
            <TextField
              name="captcha"
              label={intl.get('hiam.userInfo.model.user.emailCaptcha').d('邮箱验证码')}
              colSpan={12}
            />
            <Button
              colSpan={8}
              disabled={validCodeSendLimitFlag}
              onClick={async () => {
                const flag = await formRecord.getField('oldEmail').checkValidity(formRecord);
                if (flag) {
                  handleGainValidCodeBtnClick({ type: 'oldEmail', value: email });
                }
              }}
            >
              {validCodeSendLimitFlag ? (
                <CountDown target={validCodeLimitTimeEnd} onEnd={handleValidCodeLimitEnd} />
              ) : (
                intl.get('hiam.userInfo.view.option.gainCaptcha').d('获取验证码')
              )}
            </Button>
          </Form>
        </div>
        <div className={styles['modal-footer']}>
          <Button
            color="primary"
            onClick={async () => {
              const flag = await formRecord.getField('oldEmail').checkValidity(formRecord);
              const flag1 = await formRecord.getField('captcha').checkValidity(formRecord);
              if (!flag || !flag1) {
                return;
              }
              const captcha = formRecord.get('captcha');
              if (!getSession('user-info-oldEmail')) {
                notification.warning({
                  message: intl.get('hiam.userInfo.view.option.noGetCaptcha').d('请先获取验证码'),
                });
                return;
              }
              const res = await dispatch({
                type: 'userInfo/validatePreValidate',
                payload: {
                  captcha,
                  type: 'oldEmail',
                  modalProps: { ...modalProps, validCodeSendLimitFlag: false },
                  businessScope: 'self',
                },
              });
              if (res) {
                formRecord.init('captcha', undefined);
                setBusinessType(BUSINNESS_TYPE.validateNewEmail);
              }
            }}
          >
            {intl.get('hzero.common.button.next').d('下一步')}
          </Button>
          <Button onClick={closeModal}>{intl.get('hzero.common.button.cancel').d('取消')}</Button>
        </div>
      </>
    );
  };

  const renderValidateNewEmailForm = () => {
    return (
      <>
        <div className={styles['modal-main']}>
          <Form labelLayout="float" columns={20} record={formRecord}>
            <TextField name="newEmail" colSpan={20} />
            <TextField
              name="captcha"
              label={intl.get('hiam.userInfo.model.user.emailCaptcha').d('邮箱验证码')}
              colSpan={12}
            />
            <Button
              colSpan={8}
              disabled={validCodeSendLimitFlag}
              onClick={async () => {
                const flag = await formRecord.getField('newEmail').checkValidity(formRecord);
                if (!flag) {
                  return;
                }
                if (!lastCheckKey) {
                  notification.warning({
                    message: intl
                      .get('hiam.userInfo.view.message.missingRequireParams')
                      .d('缺少必要参数，请返回上一步重新获取验证码'),
                  });
                  return;
                }
                handleGainValidCodeBtnClick({
                  type: 'newEmail',
                  lastCheckKey,
                  value: formRecord.get('newEmail'),
                });
              }}
            >
              {validCodeSendLimitFlag ? (
                <CountDown target={validCodeLimitTimeEnd} onEnd={handleValidCodeLimitEnd} />
              ) : (
                intl.get('hiam.userInfo.view.option.gainCaptcha').d('获取验证码')
              )}
            </Button>
          </Form>
        </div>
        <div className={styles['modal-footer']}>
          <Button
            color="primary"
            onClick={async () => {
              const flag = await formRecord.getField('newEmail').checkValidity(formRecord);
              const flag1 = await formRecord.getField('captcha').checkValidity(formRecord);
              if (!flag || !flag1) {
                return;
              }
              const { captcha, newEmail } = formRecord.get(['captcha', 'newEmail']);
              const res = await dispatch({
                type: 'userInfo/validateNewEmail',
                payload: {
                  email: newEmail,
                  captcha,
                  captchaKey,
                  lastCheckKey,
                  userInfo,
                  businessScope: 'self',
                },
              });
              if (res) {
                closeModal();
                onRefresh();
              }
            }}
          >
            {intl.get('hzero.common.button.ok').d('确定')}
          </Button>
          <Button onClick={closeModal}>{intl.get('hzero.common.button.cancel').d('取消')}</Button>
        </div>
      </>
    );
  };

  const renderValidateUnCheckedEmailForm = () => {
    if (emailCheckFlag !== 1 && !email) {
      return renderValidateOldPhoneForm();
    }
    return (
      <>
        <div className={styles['modal-main']}>
          <Form labelLayout="float" columns={20} record={formRecord}>
            <TextField name="oldEmail" colSpan={20} disabled />
            <TextField
              name="captcha"
              label={intl.get('hiam.userInfo.model.user.emailCaptcha').d('邮箱验证码')}
              colSpan={12}
            />
            <Button
              colSpan={8}
              disabled={validCodeSendLimitFlag}
              onClick={async () => {
                const flag = await formRecord.getField('oldEmail').checkValidity(formRecord);
                if (flag) {
                  handleGainValidCodeBtnClick({
                    type: 'oldEmail',
                    value: formRecord.get('oldEmail'),
                  });
                }
              }}
            >
              {validCodeSendLimitFlag ? (
                <CountDown target={validCodeLimitTimeEnd} onEnd={handleValidCodeLimitEnd} />
              ) : (
                intl.get('hiam.userInfo.view.option.gainCaptcha').d('获取验证码')
              )}
            </Button>
          </Form>
        </div>
        <div className={styles['modal-footer']}>
          <Button
            color="primary"
            onClick={async () => {
              const flag = await formRecord.getField('oldEmail').checkValidity(formRecord);
              const flag1 = await formRecord.getField('captcha').checkValidity(formRecord);
              if (!flag || !flag1) {
                return;
              }
              const captcha = formRecord.get('captcha');
              if (!captchaKey) {
                notification.warning({
                  message: intl.get('hiam.userInfo.view.option.noGetCaptcha').d('请先获取验证码'),
                });
                return;
              }
              const res = await dispatch({
                type: 'userInfo/validateUnCheckedEmail',
                payload: {
                  captcha,
                  captchaKey,
                  userInfo,
                  businessScope: 'self',
                },
              });
              if (res) {
                closeModal();
                onRefresh();
              }
            }}
          >
            {intl.get('hzero.common.button.ok').d('确定')}
          </Button>
          <Button onClick={closeModal}>{intl.get('hzero.common.button.cancel').d('取消')}</Button>
        </div>
      </>
    );
  };

  const renderContent = () => {
    switch (businessType) {
      case BUSINNESS_TYPE.validateOldPhone:
        return renderValidateOldPhoneForm();
      case BUSINNESS_TYPE.validateNewPhone:
        return renderValidateNewPhoneForm();
      case BUSINNESS_TYPE.validatePassword:
        return renderValidatePasswordForm();
      case BUSINNESS_TYPE.validateUnCheckedPhone:
        return renderValidateUnCheckedPhoneForm();
      case BUSINNESS_TYPE.validateOldEmail:
        return renderValidateOldEmailForm();
      case BUSINNESS_TYPE.validateNewEmail:
        return renderValidateNewEmailForm();
      case BUSINNESS_TYPE.validateUnCheckedEmail:
        return renderValidateUnCheckedEmailForm();
      default:
        return null;
    }
  };

  return <div className={styles['modal-content']}>{renderContent()}</div>;
};

export default connect(({ userInfo }) => ({
  userInfo,
}))(UpdatePhoneAndEmailModal);
