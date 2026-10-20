import React from 'react';
import { Button, Modal } from 'choerodon-ui/pro';

import { observer } from 'mobx-react-lite';
import intl from 'srm-front-boot/lib/utils/intl/index.js';
import ResCmp from './Component';

/**
 * 响应供应商弹框按钮
 */
const ResButton = props => {
  const { btnText = '', extSourceReqId } = props;

  const handleClick = () => {
    Modal.open({
      header: null,
      drawer: true,
      key: Modal.key(),
      style: { width: '1090px' },
      bodyStyle: { padding: 0 },
      children: <ResCmp extSourceReqId={extSourceReqId} />,
      okText: intl.get('hzero.common.button.close').d('关闭'),
      footer: okBtn => okBtn,
    });
  };

  return (
    <Button funcType="link" onClick={handleClick}>
      {btnText}
    </Button>
  );
};

export default observer(ResButton);
