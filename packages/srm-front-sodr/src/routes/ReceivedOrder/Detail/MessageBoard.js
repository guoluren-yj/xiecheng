/**
 * index - 我发出的订单明细页面
 * @date: 2018-7-26
 * @author: lijun <jun.li06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Badge } from 'hzero-ui';

import intl from 'utils/intl';

import { Button } from 'components/Permission';

export default class Detail extends PureComponent {
  // constructor(props) {
  //   super(props);
  // }

  render() {
    const { unreadCount, openMessageBoard } = this.props;
    return (
      <Badge count={unreadCount || 0} overflowCount={99}>
        <Button icon="message" onClick={openMessageBoard}>
          {intl.get(`sodr.common.view.button.messageBoard`).d('留言板')}
        </Button>
      </Badge>
    );
  }
}
