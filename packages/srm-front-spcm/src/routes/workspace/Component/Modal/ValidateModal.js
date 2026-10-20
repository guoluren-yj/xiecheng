import React, { useEffect, useState, useMemo } from 'react';
import { Modal, TextField, Form, DataSet, Button } from 'choerodon-ui/pro';
import { getResponse } from 'utils/utils';
import { getVerifyCode, confirmMobileChapter } from '@/services/workspaceService';

import intl from 'utils/intl';

const { ItemGroup } = Form;
const modelPrompt = 'spcm.contractChapter.model.common';
const messagePrompt = 'spcm.contractChapter.view.message';
const buttonPrompt = 'spcm.contractChapter.view.button';

const validateDS = () => ({
  fields: [
    {
      name: 'mobile',
      type: 'string',
      label: intl.get(`${modelPrompt}.mobile`).d('手机号码'),
      required: true,
      pattern: /^134[0-8]\d{7}$|^13[^4]\d{8}$|^14[5-9]\d{8}$|^15[^4]\d{8}$|^16[2,5,6,7]\d{8}$|^17[0-8]\d{8}$|^18\d{9}$|^19[^4]\d{8}$/,
    },
    {
      name: 'verifiCode',
      type: 'string',
      label: intl.get(`${modelPrompt}.verificationCode`).d('验证码'),
      required: true,
    },
  ],
});

const ValidateModal = (props) => {
  const {
    certificateResId,
    pcHeaderId,
    companyId,
    sealPictureUrl,
    sealId,
    verifyPhoneNum,
    signatureId,
    sealType,
    modal,
    handleMobileRefresh,
    onCloseModal,
  } = props;
  const { update } = modal;
  const [remainingTime, setRemainingTime] = useState(60);
  const [verifyCodeFlag, setVerifyCodeFlag] = useState(false);
  const validateDs = useMemo(() => new DataSet(validateDS()), []);

  useEffect(() => {
    validateDs.create({ mobile: verifyPhoneNum });
    update({ onOk: () => handleOk(validateDs) });
  }, [verifyPhoneNum]);

  /**
   * 确认手机验证并签章
   */
  const handleOk = async (validatesDs) => {
    const flag = await validatesDs.validate();
    if (flag) {
      update({ okProps: { loading: true } });
      const values = validatesDs.current.toJSONData();
      const res = await confirmMobileChapter({
        pcHeaderId,
        companyId,
        sealPictureUrl,
        sealId,
        signatureId,
        authType: sealType,
        certificateResId,
        ...values,
      });
      update({ okProps: { loading: false } });
      if (getResponse(res)) {
        onCloseModal();
        handleMobileRefresh(getResponse(res));
        return true;
      }
    }
    return false;
  };

  /**
   * handleCancel - 点击获取验证码按钮
   */
  const handleClickCode = () => {
    let time = 60;
    const mobile = validateDs.current.get('mobile');
    if (mobile) {
      setVerifyCodeFlag(true);
      const verifyInterval = setInterval(() => {
        time--;
        setRemainingTime(time);
        if (time < 0) {
          clearInterval(verifyInterval);
          setRemainingTime(60);
          setVerifyCodeFlag(false);
        }
      }, 1000);
      getVerifyCode({
        companyId,
        mobile,
        certificateResId,
        pcHeaderId,
      }).then((res) => {
        getResponse(res);
      });
    }
  };

  return (
    <Form dataSet={validateDs} labelWidth={80}>
      <ItemGroup name="mobile">
        <TextField
          name="mobile"
          style={{ width: '68%' }}
          disabled={verifyCodeFlag || !!verifyPhoneNum}
        />
        {!verifyCodeFlag ? (
          <Button style={{ width: 92, marginLeft: 15 }} color="primary" onClick={handleClickCode}>
            {intl.get(`${buttonPrompt}.getVerificationCode`).d('获取验证码')}
          </Button>
        ) : (
          <Button style={{ width: 92, marginLeft: 15 }} onClick={handleClickCode} disabled>
            {intl.get(`${buttonPrompt}.remainingTime`).d('剩余时间')}
            {remainingTime}s
          </Button>
        )}
      </ItemGroup>
      <TextField name="verifiCode" style={{ width: '68%' }} />
    </Form>
  );
};

const useValidateModal = (props, modalProps) => {
  const modal = Modal.open({
    closable: true,
    key: Modal.key(),
    title: intl.get(`${messagePrompt}.title.noteVerification`).d('短信验证'),
    children: <ValidateModal modal {...props} />,
    ...modalProps,
  });
  return modal;
};

export { useValidateModal, ValidateModal };
