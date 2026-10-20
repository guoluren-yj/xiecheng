import React, { Component } from 'react';
import { Icon } from 'choerodon-ui';
import intl from 'utils/intl';
import { MSG_TYPE } from '../../common/global';
import styles from './index.less';

export default class QuoteMessage extends Component {
  onClick = () => {
    const { onClick, quoteMsg } = this.props;
    if (typeof onClick === 'function') {
      onClick(quoteMsg);
    }
  };

  render() {
    const { style, showClose = false, onClose, quoteMsg } = this.props;
    // const userName =
    //   quoteMsg.senderRoomMemberId === userId
    //     ? intl.get('smbl.chat.view.message.selfName').d('我')
    //     : quoteMsg.senderUserName;
    let messageContent = '-';
    if (Number(quoteMsg.state) === 1) {
      messageContent = intl.get('smbl.chat.view.message.recallContent').d('已撤回');
    } else if (quoteMsg.msgType === MSG_TYPE.TEXT) {
      messageContent = quoteMsg.msgContent;
    } else if (quoteMsg.msgType === MSG_TYPE.IMAGE) {
      messageContent = intl.get('smbl.chat.view.message.imageContent').d('[图片]');
    } else if (quoteMsg.msgType === MSG_TYPE.FILE) {
      messageContent =
        intl.get('smbl.chat.view.message.fileContent').d('[文件]') + quoteMsg.fileName;
    }
    return (
      <div className={styles['smbl-quote-message']} style={style}>
        <div className={styles['smbl-quote-message-icon']} />
        <div
          className={styles['smbl-quote-message-content']}
          onClick={() => this.onClick(quoteMsg)}
        >
          {/* <div className={styles['smbl-quote-message-name']}>{userName}</div> */}
          <div className={styles['smbl-quote-message-text']}>{messageContent}</div>
        </div>
        {showClose && (
          <Icon type="close" className={styles['smbl-quote-message-close']} onClick={onClose} />
        )}
      </div>
    );
  }
}
