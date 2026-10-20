import React from 'react';
import { Tooltip, Button } from 'choerodon-ui/pro';

import intl from 'utils/intl';

const imgUrl = require('@/assets/bargain.svg');

const BargainOnline = (props) => {
  return props.disabled ? (
    <Tooltip
      title={intl
        .get('ssrc.inquiryHall.view.message.bargainButtonDisabledTips')
        .d('当前正在进行多轮报价，不可进行议价')}
      placement="left"
    >
      <Button {...props}>
        {' '}
        <img src={imgUrl} alt="" /> {intl.get('ssrc.bidHall.view.button.negotiatedPrice').d('议价')}
      </Button>
    </Tooltip>
  ) : (
    <Button {...props}>
      <img src={imgUrl} alt="" /> {intl.get('ssrc.bidHall.view.button.negotiatedPrice').d('议价')}
    </Button>
  );
};

export default BargainOnline;
