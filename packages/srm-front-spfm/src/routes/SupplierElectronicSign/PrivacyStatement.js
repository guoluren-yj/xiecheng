/**
 * 甄采云隐私政策声明
 */
import React, { useState, useCallback } from 'react';
import { CheckBox, Button } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';

export default formatterCollections({
  code: ['hiam.theme', 'hiam.userInfo', 'hzero.common', 'spfm.configServer'],
})(({ handleOk, onCancel, authType, loading }) => {
  const [disabled, setDisabled] = useState(true);
  const authTypeMeaning =
    authType === 'ESIGN'
      ? intl.get('hiam.userInfo.model.user.esign').d('E签宝')
      : authType === 'QYS'
      ? intl.get('hiam.userInfo.model.user.qys').d('契约锁')
      : authType === 'FDD'
      ? intl.get('hiam.userInfo.model.user.fadada').d('法大大')
      : '';
  const onOk = () => {
    handleOk();
  };

  const onClose = () => {
    onCancel();
  };

  const onChange = useCallback((value) => {
    setDisabled(!value);
  }, []);

  return (
    <>
      <div className="protocol-title">
        {intl.get('hzero.common.privacy.statement.title').d('甄采云隐私政策声明')}
      </div>
      <div className="protocol-please">
        <p>{intl.get('hiam.theme.view.protocol.please1').d('尊敬的用户，您好：')}</p>
        <p>
          {intl
            .get('hzero.common.operating.instructions')
            .d('继续操作前请阅读以下协议，本协议具有法律效应，请务必审慎阅读并充分理解：')}
        </p>
      </div>
      <div className="protocol-content">
        <p>
          {intl
            .get(`hzero.common.ca.pushMessage.content`, {
              authTypeMeaning,
            })
            .d(
              `我们通过第三方（${authTypeMeaning}）进行企业认证，根据第三方企业认证的要求，您需要提供（姓名，证件号，联系方式等）。`
            ) +
            intl
              .get('hzero.common.ca.pushMessage.content1')
              .d(
                '我们会在收集阶段就加密您所提交的信息并发送给第三方。整个过程中我们不会存储和使用您提交用于企业认证的信息。在提交您的信息给第三方之后，我们就会销毁您提交的数据。您如果有任何疑问，请通过项目经理或运维经理联系我们。'
              ) +
            intl
              .get('hzero.common.pushMessage.content2')
              .d(
                '我司作为平台，已充分告知您数据收集和传输的细节，不承担任何因传输上述数据产生的法律责任，若与第三方产生相关法律纠纷，我司将予以协助。'
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
        <Button onClick={onOk} disabled={disabled} color="primary" loading={loading}>
          {intl.get('hzero.common.button.continue').d('继续')}
        </Button>
      </div>
    </>
  );
});
