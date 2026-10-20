import type { ReactNode } from 'react';
import type { ButtonProps } from 'choerodon-ui/pro/lib/button/Button';
import type { ModalProps } from 'choerodon-ui/pro/lib/modal/Modal';
import React, { useMemo, useRef, useState } from 'react';
import classnames from 'classnames';
import { Button, Modal, DataSet, TextField } from 'choerodon-ui/pro';
import { ButtonColor } from 'choerodon-ui/pro/lib/button/enum';
import intl from 'hzero-front/lib/utils/intl';
import request from 'hzero-front/lib/utils/request';
import { getCurrentOrganizationId, filterNullValueObject } from 'hzero-front/lib/utils/utils';
import { FieldType } from 'choerodon-ui/dataset/data-set/enum';
import styles from './index.less';

interface IProps extends ButtonProps{
  senseCode: string;
  tenantId?: string;
  buttonText?: string | ReactNode;
  onClick: (params?: any) => any;
  buttonProps?: ButtonProps;
  modalProps?: ModalProps;
}

export default function CaptchaButton(props: IProps) {
  const { senseCode, tenantId, buttonText, onClick, buttonProps, modalProps } = props;

  const handleClick = async () => {
    const res = await beforeCaptchaVerify();
    if (res && res.verifyFlag) {
      checkCaptcha(res);
    } else {
      onClick();
    }
  };

  const beforeCaptchaVerify = () => {
    return request(`/oauth/public/captcha-with-verify`,
      { method: 'GET', responseType: 'blob', query: filterNullValueObject({ senseCode, tenantId }) },
      { beforeCheckResponse },
    );
  };

  const beforeCheckResponse = async (response) => {
    if (response.status === 200) {
      const verifyFlag = response.headers.get('s-captcha-verify') === 'true';
      if (verifyFlag) {
        const verifyKey = response.headers.get('s-captcha-verify-key');
        const blob = await response.blob();
        const imgUrl = URL.createObjectURL(blob);
        return { verifyFlag, verifyKey, imgUrl };
      }
      return { verifyFlag };
    }
  };

  const checkCaptcha = ({ imgUrl, verifyKey }) => {
    const formDs = new DataSet({
      fields: [
        { name: 'verifyValue', type: FieldType.string, required: true },
        { name: 'verifyKey', type: FieldType.string },
      ],
    });
    const formDsRecord = formDs.create({ verifyKey });
    Modal.open({
      key: 'captcha-modal',
      title: intl.get('hzero.common.components.login.captcha.placeholder').d('请输入验证码'),
      ...(modalProps || {}),
      className: styles['captcha-modal'],
      children: (
        <CaptchaModal
          record={formDsRecord}
          refreshImage={beforeCaptchaVerify}
          imgUrl={imgUrl}
          onClick={onClick}
          senseCode={senseCode}
        />
      ),
      footer: null,
    });
  };

  return (
    <Button {...(buttonProps || {})} onClick={handleClick}>
      {buttonText || intl.get('hzero.common.components.login.captcha').d('获取验证码')}
    </Button>
  );
}

function CaptchaModal(props) {
  const { record, refreshImage, imgUrl, onClick, senseCode, modal } = props;
  const [imgSrc, setImgSrc] = useState(imgUrl);
  const [errorMsg, setErrorMsg] = useState(undefined);
  const inputRef = useRef<any>();

  const handleClickImg = async() => {
    const res = await refreshImage();
    if (res) {
      setImgSrc(res.imgUrl);
      record.set('verifyKey', res.verifyKey);
    }
  };

  const handleSubmit = async() => {
    setErrorMsg(undefined);
    const flag = await record.validate();
    if (!flag) {
      return false;
    }
    const verifyValue = record.get('verifyValue');
    const verifyKey = record.get('verifyKey');
    const res = await onClick({ 's_captcha_verify_key': verifyKey, 's_captcha_scene': senseCode, 's_captcha_verify_value': verifyValue });
    if (res && res.failed) {
      setErrorMsg(res.message);
      handleClickImg();
      if (inputRef.current) {
        inputRef.current.focus();
      }
      return false;
    } else {
      handleClose();
      return true;
    }
  };

  const handleClose = () => {
    if (modal) {
      modal.close();
    }
  };

  return (
    <>
      <div style={{ display: 'flex', padding: '15px 24px' }}>
        <div style={{ marginRight: '16px' }}>
          <TextField
            record={record}
            ref={inputRef}
            className={classnames(styles['captcha-input'], {
              [styles['captcha-input-error']]: errorMsg,
            })}
            name='verifyValue'
            placeholder={intl.get('hzero.common.components.login.captcha.input').d('输入图片中的字符')}
            onChange={() => setErrorMsg(undefined)}
          />
          {errorMsg && (<div className={styles['captcha-error']}>{errorMsg}</div>)}
        </div>
        <div>
          <img src={imgSrc} onClick={handleClickImg} style={{ height: '30px' }} />
          <div onClick={handleClickImg} className={styles['captcha-change']}>
            {intl.get('hzero.common.components.login.captcha.changeImg').d('看不清？换一张')}
          </div>
        </div>
      </div>
      <div className={styles['captcha-footer']}>
        <Button onClick={handleClose}>{intl.get(`hzero.common.button.cancel`).d('取消')}</Button>
        <Button color={ButtonColor.primary} onClick={handleSubmit}>{intl.get('hzero.common.button.ok').d('确定')}</Button>
      </div>
    </>
  );
}