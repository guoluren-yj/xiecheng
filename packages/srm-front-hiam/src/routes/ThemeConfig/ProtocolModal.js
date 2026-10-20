/**
 * 主题配置-用户协议
 * @author: ke.wang01 <ke.wang01@gonig-link.com>
 * @since: 2022-07-14 14:23:03
 * @description: 主题配置-用户协议
 * @copyright: Copyright (c) 2022, Hand
 */
import React, { useState, useCallback } from 'react';
import { CheckBox, Button } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';

export default formatterCollections({
  code: ['hiam.theme'],
})(({ uploadRef, modal }) => {
  const [disabled, setDisabled] = useState(true);

  const openUpload = () => {
    if (uploadRef && uploadRef.current) {
      onClose();
      uploadRef.current.element.click();
    }
  };

  const onClose = () => {
    modal.close();
  };

  const onChange = useCallback((value) => {
    setDisabled(!value);
  }, []);

  return (
    <>
      <div className="protocol-title">
        {intl.get('hiam.theme.view.protocol.title').d('字体使用用户协议')}
      </div>
      <div className="protocol-please">
        <p>{intl.get('hiam.theme.view.protocol.please1').d('尊敬的用户，您好：')}</p>
        <p>
          {intl
            .get('hiam.theme.view.protocol.please2')
            .d('上传字体包前请阅读以下协议，本协议具有法律效应，请务必审慎阅读并充分理解：')}
        </p>
      </div>
      <div className="protocol-content">
        <p>
          {intl
            .get('hiam.theme.view.protocol.content1')
            .d(
              '由于系统对于各类字体审查是否商用或者取得授权难度较大，因此您需保证上传字体非商用，或者该字体已经取得合法授权。您需据实承诺，且由此产生的一切侵权纠纷、损失赔偿均由用户承担。'
            )}
        </p>
        <p>
          {intl
            .get('hiam.theme.view.protocol.content2')
            .d(
              '若您同意本协议，请勾选“我已知晓并接受本用户协议”并点击继续，若您不同意，请点击取消退出，谢谢！'
            )}
        </p>
      </div>
      <div className="protocol-footer">
        <CheckBox defaultChecked={false} onChange={onChange}>
          {intl.get('hiam.theme.view.protocol.checkbox').d('我已知晓并接受本用户协议')}
        </CheckBox>
        <Button onClick={onClose}>{intl.get('hzero.common.button.cancel').d('取消')}</Button>
        <Button onClick={openUpload} disabled={disabled} color="primary">
          {intl.get('hzero.common.button.continue').d('继续')}
        </Button>
      </div>
    </>
  );
});
