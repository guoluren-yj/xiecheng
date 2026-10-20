/* eslint-disable global-require */
import React, { Component, createRef } from 'react';
import intl from 'utils/intl';
import { Tooltip } from 'choerodon-ui/pro';
import { Icon } from 'choerodon-ui';
import { isElementOverflowed } from '@/utils/utils';
import { formateTime } from '../../functions/message';
import TextMessage from './TextMessage';
import ImageMessage from './ImageMessage';
import FileMessage from './FileMessage';
import { MSG_TYPE } from '../../common/global';
import styles from './index.less';

export default class MessageWrap extends Component {
  constructor(props) {
    super(props);
    if (typeof props.onRef === 'function') {
      props.onRef(this);
    }
  }

  nameRef = createRef(null);

  checkNameToolTip() {
    const el = this.nameRef.current;
    if (!el) return;
    return isElementOverflowed(el);
  }

  render() {
    const { record, onRightClick, onEditorRecall, roomInfo, onClickQuote } = this.props;

    if (Number(record.state) === 1) {
      const creationDate = new Date(record.creationDate?.replace(/-/g, '/')).getTime();
      const currentDate = new Date().getTime();
      const showEdit =
        record.float === 'right' &&
        currentDate - creationDate < 3 * 60 * 1000 &&
        record.msgType === MSG_TYPE.TEXT;
      return (
        <div className={styles['smbl-message-wrap']}>
          {record.float === 'left' ? (
            <div className={styles['smbl-message-recall']}>
              {intl
                .get('smbl.chat.view.message.otherRecall', { userName: record.senderUserName })
                .d(`发送人 ${record.senderUserName} 撤回了一条消息`)}
            </div>
          ) : (
            <div className={styles['smbl-message-recall']}>
              {intl.get('smbl.chat.view.message.selfRecall').d('你撤回了一条消息')}
              {showEdit && (
                <span
                  className={styles['smbl-message-recall-edit']}
                  onClick={() => onEditorRecall(record)}
                >
                  {intl.get('smbl.chat.view.button.editRecall').d('重新编辑')}
                </span>
              )}
            </div>
          )}
        </div>
      );
    }
    return (
      <div className={styles['smbl-message-wrap']}>
        {record.showTime && (
          <div className={styles['smbl-message-wrap-time']}>{formateTime(record.creationDate)}</div>
        )}
        {record.float === 'left' && (
          <Tooltip
            trigger={this.checkNameToolTip() ? 'hover' : 'false'}
            title={record.senderUserName}
            placement="topLeft"
          >
            <div ref={this.nameRef} className={styles['smbl-message-wrap-user-name']}>
              {record.senderUserName}
            </div>
          </Tooltip>
        )}
        <div
          className={styles['smbl-message-wrap-content']}
          id={record.msgId}
          style={{ flexDirection: record.float === 'left' ? 'row' : 'row-reverse' }}
        >
          {record.msgType === MSG_TYPE.TEXT && (
            <TextMessage
              onRightClick={onRightClick}
              record={record}
              roomInfo={roomInfo}
              onClickQuote={onClickQuote}
            />
          )}
          {record.msgType === MSG_TYPE.IMAGE && (
            <ImageMessage onRightClick={onRightClick} record={record} />
          )}
          {record.msgType === MSG_TYPE.FILE && (
            <FileMessage onRightClick={onRightClick} record={record} />
          )}
          <div className={styles['smbl-message-status']}>
            {record.sendStatus === 1 && (
              <img src={require('../../../../../assets/messageSending.gif')} alt="" />
            )}
            {record.sendStatus === 2 && (
              <Tooltip title={intl.get('smbl.chat.view.message.sendFail').d('发送失败')}>
                <Icon type="error" className={styles['smbl-message-status-icon']} />
              </Tooltip>
            )}
          </div>
        </div>
      </div>
    );
  }
}
