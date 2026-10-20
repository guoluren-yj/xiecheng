import React, { useMemo } from 'react';
import { NumberField, Form, notification } from 'choerodon-ui/pro';
import fill from 'lodash/fill';
import isNil from 'lodash/isNil';
import debounce from 'lodash/debounce';
import request from 'utils/request';
import { getResponse } from 'utils/utils';
import styles from './index.less';

const captchaMap = Array(6).fill('captcha');

const CertificationForm = ({
  submitUrl = '',
  submitData = {},
  formContainer,
  setLoading,
  formSubmit = true,
  step,
  setStep,
  passwordDs,
}) => {
  // 发送验证
  const sendCheck = (form, index) => {
    try {
      const { fields, element } = form;
      const { value } = fields[index];
      if (isNil(value)) return;
      const captcha = fill(fields.map(item => item.value), value, index, index + 1).join('');
      if (element) {
        if (setLoading) {
          setLoading(true);
        }
        element.querySelector('input[name="captcha"]').value = captcha;
        if (formSubmit) {
          element.submit();
        } else {
          request(submitUrl, {
            method: 'POST',
            query: { supportType: submitData.supportType },
            body: {
              captcha,
              ...submitData,
            },
          })
            .then(res => {
              if (getResponse(res)) {
                const { success, message } = res;
                if (success && setStep) {
                  setStep(step + 1);
                } else {
                  notification.error({
                    placement: 'bottomRight',
                    message,
                  });
                }
                if (passwordDs) {
                  passwordDs.setState({ msgCaptcha: captcha });
                }
              }
              if (setLoading) {
                setLoading(false);
              }
            })
            .then(() => {
              if (setLoading) {
                setLoading(false);
              }
            });
        }
      }
    } catch (err) {
      if (setLoading) {
        setLoading(false);
      }
    }
  };

  const handleInput = (event, index) => {
    const currentValue = event.target.value;
    if (!/^\d$/.test(currentValue) && currentValue.length > 0) {
      // 截取第一个字符，确保只保留一个数字
      // eslint-disable-next-line no-param-reassign
      event.target.value = currentValue.replace(/(\d).*$/, '$1');
    }
    handleInputDebounce(index);
  };

  // 输入验证码 自定聚焦到下一个输入框
  const handleInputDebounce = debounce(index => {
    const { current: form } = formContainer;
    const { fields } = form;
    if (index === fields.length - 1) {
      fields[index].blur();
      sendCheck(form, index);
    } else {
      fields[index + 1].focus();
    }
  }, 100);

  const renderCertificationInput = useMemo(() => {
    return captchaMap.map((item, index) => (
      <NumberField
        // eslint-disable-next-line react/no-array-index-key
        key={index}
        max={9}
        min={0}
        autoFocus={index === 0}
        valueChangeAction="input"
        onInput={event => handleInput(event, index)}
      />
    ));
  }, []);

  return (
    <Form
      className={styles['certification-form']}
      columns={6}
      ref={formContainer}
      action={submitUrl}
      method="post"
      target="_self"
    >
      {renderCertificationInput}
      {Object.keys({ ...submitData }).map(item => (
        <input type="hidden" name={item} value={submitData[item]} key={item} />
      ))}
      <input type="hidden" name="captcha" />
    </Form>
  );
};

export default React.memo(CertificationForm);
