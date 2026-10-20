/*
 * @Description: 外部寻源-created
 * @Date: 2025-05-22 16:12:54
 * @Author: zuoxiangyu <xiangyu.zuo@gong-link.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2025, Hand
 */
import { Button, Icon } from 'choerodon-ui/pro';
import React, { useCallback } from 'react';

import intl from 'utils/intl';

const AgreementDetail = ({
  modal,
  mixObj,
  currentAgreement,
  jumpDetail,
  showWelcomeMsg = true,
}) => {
  // 关闭弹框
  const handleClose = useCallback(() => {
    modal.close(true);
  }, []);

  // 同意并进入下一页
  const handleAgreeAndNext = () => {
    // eslint-disable-next-line no-param-reassign
    mixObj.agreementFlag = true;
    jumpDetail();
  };

  // 获取弹框按钮
  const GetButtons = () => {
    const buttons = [
      <Button onClick={handleClose}>{intl.get('hzero.common.button.cancel').d('取消')} </Button>,
      <Button color="primary" onClick={() => handleAgreeAndNext()}>
        {intl.get('sslm.common.button.agreeAndNext').d('同意并进入下一页')}
      </Button>,
    ].filter(Boolean);
    return <div className="agreement-footer">{buttons}</div>;
  };

  return (
    <div className="agreement-wrap">
      <div className="agreement-header">
        <div className="agreement-header-title">
          {currentAgreement.title}
          <Icon type="close" onClick={handleClose} />
        </div>
        <div className="agreement-header-welcome">
          <div style={{ marginBottom: 8 }}>
            {intl.get('sslm.common.modal.agreement.useWelcome').d('尊敬的用户，您好：')}
          </div>
          {showWelcomeMsg && (
            <div>
              {intl
                .get('sslm.common.modal.agreement.readAgreement')
                .d('填写调查表前请阅读并同意以下说明')}
            </div>
          )}
        </div>
      </div>
      <div className="agreement-body">
        <div
          className="agreement-body-detail"
          dangerouslySetInnerHTML={{ __html: currentAgreement.text || '' }}
        />
      </div>
      <GetButtons />
    </div>
  );
};

export default AgreementDetail;
