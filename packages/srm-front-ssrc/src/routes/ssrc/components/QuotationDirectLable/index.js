/**
 * Constants 常量
 * @date: 2020-2-7
 * @author: chenjuan <juan.chen01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */
import React from 'react';
import { Tooltip } from 'hzero-ui';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';

/* 报价方向悬浮解释 */
@formatterCollections({ code: ['ssrc.common'] })
export default class QuotationDirectLable extends React.Component {
  render() {
    return (
      <Tooltip
        title={intl
          .get('ssrc.common.view.message.auctionDirection')
          .d(
            '用于控制供应商的报价方向。荷兰式表示报价必须越来越低；英式表示报价必须越来越高；无要求表示对报价方向无控制。'
          )}
        placement="right"
      >
        {intl.get('ssrc.common.auctionDirection').d('报价方向')}
      </Tooltip>
    );
  }
}
