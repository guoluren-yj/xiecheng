import React, { Component } from 'react';
import { Button, Badge } from 'hzero-ui';

import intl from 'utils/intl';

// import {AdaptorBtnGroup} from 'components/AdaptorBtnGroup';
export default class OperateBtn extends Component {
  render() {
    const { openMessageBoard = () => {}, unreadCount, viewButtonPrompt, children } = this.props;
    return (
      <Badge count={unreadCount || 0} overflowCount={99}>
        <Button icon="message" onClick={openMessageBoard} style={{ marginLeft: '8px' }}>
          {children || intl.get(`${viewButtonPrompt}.messageBoard`).d('留言板')}
        </Button>
      </Badge>
    );
  }
}
