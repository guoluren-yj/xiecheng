/*
 * @author: biao.zhu@going-link.com
 * @Date: 2024-09-26 14:24:26
 * @LastEditTime: 2024-12-03 16:45:32
 * @Description: 验证码
 * @copyright: Copyright (c) 2020, Hand
 */
import React, { useEffect, useMemo, useState } from 'react';
import { throttle } from 'lodash';
import { DataSet, Form, TextField } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import request from 'utils/request';
// import notification from 'utils/notification';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';

import styles from './index.less';

/**
 * 获取验证码图片
 * @async
 * @param {object} params - 分配参数
 */
export async function getCaptcha() {
  return request(`/ssrc/v1/${getCurrentOrganizationId()}/share/common/public/create-captcha`, {
    method: 'GET',
    responseType: 'blob',
  });
}

/**
 * 获取验证码图片
 * @async
 * @param {object} params - 分配参数
 */
export async function checkCaptcha(data) {
  return request(`/ssrc/v1/${getCurrentOrganizationId()}/share/common/public/check-captcha`, {
    method: 'GET',
    query: data
  });
}

const Captcha = props => {
  const { modal, langIntl, resolve, reject, language } = props;
  const [imgUrl, setUrl] = useState(null);
  const getLabel = () => {
    if (langIntl) {
      return langIntl['srm.oauth.login.verificationCode'] || '验证码';
    } else if (intl) {
      return intl.get('srm.oauth.login.verificationCode').d('验证码');
    }
  };
  const basicFormDs = useMemo(
    () =>
      new DataSet({
        autoCreate: true,
        autoQuery: false,
        forceValidate: true,
        fields: [
          {
            name: 'captcha',
            label: getLabel(),
            required: true,
          },
        ],
      }),
    []
  );

  const handleCancel = () => {
    // basicFormDs.loadData([{}]);
    resolve(false);
  };

  const handleOk = async () => {
    if (!basicFormDs?.current) return false;
    const validorFlag = await basicFormDs.validate();
    // console.log('validorFlag', validorFlag);
    if (!validorFlag) return false;
    const captcha = basicFormDs?.current?.get('captcha');
    const res = await checkCaptcha({captcha, lang: language});
    // console.log('res', res);
    if(getResponse(res)) {
      window.localStorage.setItem('pub-captcha', captcha);
      modal.close();
      resolve(true);
    } else {
      window.localStorage.removeItem('pub-captcha', captcha);
      return false;
    };
    // if (callback) {
    //   const arr = await callback(captcha);
    //   console.log('resList', arr);
    //   const captchaFlag = (arr || []).every(i => i && getResponse(i) && !i.failed);
    //   console.log('captchaFlag', captchaFlag);
    //   if (arr?.length && captchaFlag) {
    //     resolve(true);
    //     window.localStorage.setItem('pub-captcha', captcha);
    //   }else {
    //     window.localStorage.removeItem('pub-captcha', captcha);
    //     return false;
    //   }
    // }
  };

  const fetchCaptcha = throttle(async () => {
    const response = await getCaptcha();
    // let data;
    // // 尝试解析 JSON
    // try {
    //     data = await response.json();
    // } catch (error) {
    //     console.log('Failed to parse JSON:', error);
    //     return; // 处理解析错误
    // }
    // console.log('json', data);
    // // 检查是否有错误信息
    // if (data && data.failed) {
    //     return getResponse(data);
    // };
    if (response && response instanceof Blob) {
      const img = URL.createObjectURL(response);
      setUrl(img);
    }
  }, 1500);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleOk();
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  },[]);

  useEffect(() => {
    fetchCaptcha();
  }, []);


  useEffect(() => {
    if (modal && modal.update) {
      modal.update({
        movable: false,
        onOk: handleOk,
        onClose: handleCancel,
        onCancel: handleCancel
      });
    }
  }, [modal, modal?.update]);

  return (
    <div className={styles['captcha-wrapper']}>
      <Form
        dataSet={basicFormDs}
        columns={1}
        labelLayout="float"
      >
        <TextField
          name="captcha"
          clearButton
        />
      </Form>
      <div className='img-wrapper' onClick={fetchCaptcha}>
        { imgUrl && <img src={imgUrl} alt="" /> }
      </div>
    </div>
  );
};

export default Captcha;
