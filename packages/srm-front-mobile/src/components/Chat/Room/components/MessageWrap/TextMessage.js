/* eslint-disable react/no-danger */
import React, { PureComponent } from 'react';
import classnames from 'classnames';
import { textReplaceLink, textReplaceEmoji } from '../../functions/message';
import styles from './TextMessage.less';
import QuoteMessage from '../QuoteMessage';

export default class TextMessage extends PureComponent {
  onRightClick = (e) => {
    const { onRightClick, record } = this.props;
    if (typeof onRightClick === 'function') {
      onRightClick(e, record);
    }
  };

  render() {
    const { id, record = {}, style, roomInfo, onClickQuote } = this.props;
    const cls = classnames(styles['smbl-text-message'], {
      [styles['smbl-text-message-left']]: record.float === 'left',
      [styles['smbl-text-message-right']]: record.float === 'right',
    });
    const atText = record.receiverHide
      ? ''
      : (record.receiverNames || []).map((e) => `@${e}`).join(' ');
    const _id = id || record.msgId;
    let text = atText.length ? `${atText} ` : '';
    text += textReplaceLink(record.msgContent);
    text = textReplaceEmoji(text);
    return (
      <div id={_id} onContextMenu={this.onRightClick} className={cls} style={style}>
        {record.quoteMsg && (
          <QuoteMessage
            quoteMsg={record.quoteMsg}
            roomInfo={roomInfo}
            style={{ padding: '8px 12px' }}
            onClick={onClickQuote}
          />
        )}
        <pre dangerouslySetInnerHTML={{ __html: text }} />
      </div>
    );
  }
}
