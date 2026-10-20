/* eslint-disable global-require */
import React, { Component, createRef } from 'react';
import intl from 'utils/intl';
import { Tooltip } from 'choerodon-ui/pro';
import { Icon } from 'choerodon-ui';
import aiAvatar from '@/assets/aiAgent/sales-ai.png';
import logoAvatar from '@/assets/icons/logo.png';
import { isElementOverflowed } from '@/utils/utils';

// import { formateTime } from '../../functions/message';
import TextMessage from './TextMessage';
// import ImageMessage from './ImageMessage';
// import FileMessage from './FileMessage';
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

  handleFeedBack = type => {
    const { onFeedBack, record } = this.props;
    if (onFeedBack && typeof onFeedBack === 'function') {
      onFeedBack(record, type);
    }
  };

  render() {
    const { record, onRightClick, onEditorRecall, onClickQuote } = this.props;

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
      <div style={{ margin: '12px 0' }}>
        <div
          className={styles['smbl-message-wrap']}
          style={{ justifyContent: record.float === 'right' ? 'flex-end' : 'flex-start' }}
        >
          {record?.float === 'left' ? (
            <img src={aiAvatar} style={{ width: '20px', height: '26px' }} alt="AI" />
          ) : null}
          <>
            {/* <div>
            {record.showTime && (
              <div className={styles['smbl-message-wrap-time']}>
                {formateTime(record.creationDate)}
              </div>
            )}
            {record.float === 'left' && (
              <Tooltip
                trigger={this.checkNameToolTip() ? 'hover' : 'false'}
                title={record?.senderUserName}
                placement="topLeft"
              >
                <div ref={this.nameRef} className={styles['smbl-message-wrap-user-name']}>
                  {record?.senderUserName ?? 'AI'}
                </div>
              </Tooltip>
            )}
          </div> */}

            <div
              className={styles['smbl-message-wrap-content']}
              id={record.message_uuid}
              style={{ flexDirection: record.float === 'left' ? 'row' : 'row-reverse' }}
            >
              {record?.contextType === 'loading' ? (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    background: '#f2f3f5',
                    borderRadius: '5px',
                    padding: '8px 12px',
                  }}
                >
                  {intl.get('smbl.chat.view.message.inThinkIng').d('思考中')}{' '}
                  <img
                    src={require('../../../../../assets/messageSending.gif')}
                    alt=""
                    style={{ marginLeft: '8px', width: '20px' }}
                  />{' '}
                </div>
              ) : (
                <>
                  {(record?.msgType === MSG_TYPE.TEXT || !record?.msgType) && (
                    <TextMessage
                      onRightClick={onRightClick}
                      record={record}
                      onClickQuote={onClickQuote}
                    />
                  )}
                </>
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
          </>
          {record?.float === 'right' ? (
            <img src={logoAvatar} style={{ width: '20px', height: '26px' }} alt="AI" />
          ) : null}
        </div>
        {record.float === 'left' && ![1, 2].includes(record.sendStatus) && !record?.contextType ? (
          <div
            style={{
              display: 'flex',
              marginLeft: '48px',
            }}
          >
            {!record?.feedback || record.feedback === 'THUMB_UP' ? (
              <span
                style={{
                  marginRight: '10px',
                  padding: '2px 5px',
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  background: '#f3f4f5',
                }}
                onClick={record.feedback ? null : () => this.handleFeedBack('THUMB_UP')}
              >
                <img
                  src={require('../../../../../assets/aiAgent/robot_score_nice.png')}
                  alt=""
                  style={{ marginRight: '4px', width: '18px', height: '18px' }}
                />
                {intl.get('smbl.chat.view.message.nice').d('赞')}
              </span>
            ) : null}

            {!record?.feedback || record.feedback === 'THUMB_DOWN' ? (
              <span
                style={{
                  marginRight: '10px',
                  padding: '2px 5px',
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  background: '#f3f4f5',
                }}
                onClick={record.feedback ? null : () => this.handleFeedBack('THUMB_DOWN')}
              >
                <img
                  src={require('../../../../../assets/aiAgent/robot_score_error.png')}
                  alt=""
                  style={{ marginRight: '4px', width: '18px', height: '18px' }}
                />
                {intl.get('smbl.chat.view.message.error').d('踩')}
              </span>
            ) : null}
          </div>
        ) : null}
      </div>
    );
  }
}
