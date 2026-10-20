/* eslint-disable global-require */
import React, { Fragment, Component } from 'react';
import { Button } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { isElementOverflowed } from '@/utils/utils';
import styles from './index.less';

export default class ChatRoomHeader extends Component {
  ref = React.createRef(null);

  titleWithTooltip = false;

  componentDidUpdate() {
    const _titleWithTooltip = isElementOverflowed(this.ref.current);
    if (_titleWithTooltip !== this.titleWithTooltip) {
      this.titleWithTooltip = _titleWithTooltip;
      this.forceUpdate();
    }
  }

  // 点击关闭
  close = () => {
    const { onClose } = this.props;
    if (typeof onClose === 'function') {
      onClose();
    }
  };

  render() {
    const { showClose = true, pageTitle } = this.props;

    return (
      <Fragment>
        <div className={styles['smbl-chat-room-header']}>
          <div className={styles['smbl-chat-room-header-title']} ref={this.ref}>
            {pageTitle || intl.get('smbl.chat.view.message.aiAssistant').d('AI 助理')}
          </div>
          {showClose && (
            <Button
              funcType="flat"
              icon="close"
              className={styles['smbl-chat-room-header-close-btn']}
              onClick={this.close}
            />
          )}
        </div>
      </Fragment>
    );
  }
}
