import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Avatar, Icon, List, Tabs, Upload } from 'choerodon-ui';
import { Spin, TextArea, useDataSet } from 'choerodon-ui/pro';
import { isString, trim, throttle } from 'lodash';
import moment from 'moment';
import intl from 'utils/intl';
import { HZERO_FILE } from 'utils/config';
import notification from 'utils/notification';
import { getAccessToken, getAttachmentUrl, getResponse, getCurrentUserId } from 'utils/utils';
import noMessageImg from 'hzero-front/lib/assets/no-message.png';
import { MESSAGE_DIRECTORY as bucketName, THROTTLE_TIME } from '@/routes/components/utils/constant';
import { sendMessage, recallMessage } from '@/services/sendOrderService';
import MessageDs from './stores/MessageDs';
import styles from './Message.less';

const { TabPane } = Tabs;
const { Dragger } = Upload;
const bucketDirectory = 'sodr-order';

// 设置sodr国际化前缀 - common - message
const viewMessagePrompt = 'sodr.confirmOrder.view.message';
const avatarStyleMap = {
  PURCHASER: {
    backgroundColor: '#d2f2e7',
    color: '#1cbc86',
  },
  SUPPLIER: {
    backgroundColor: '#dfe5fa',
    color: '#5867dd',
  },
};

const avatars = {
  1: {
    width: '20',
    hegiht: '20',
    position: 'absolute',
    left: 355,
  },
  0: {},
};

const titleMsg = {
  1: {
    marginRight: '8%',
    textAlign: 'right',
  },
  0: {},
};

const titleMsgList = {
  1: {
    width: '100%',
    height: 'auto',
    wordWrap: 'break-word',
    wordBreak: 'break-all',
  },
  0: {},
};

const description = {
  1: {
    width: '20',
    height: '24px',
    lineHeight: '26px',
    textAlign: 'right',
    marginRight: '15%',
  },
  0: {
    height: '24px',
    lineHeight: '26px',
  },
};

// const limit = 100;

const Message = function Message(props) {
  const { modal, organizationId, poHeaderId } = props;
  const messageDs = useDataSet(() => MessageDs({ organizationId, poHeaderId }), [
    organizationId,
    poHeaderId,
  ]);
  const [message, setMessage] = useState('');
  const scrollContainerRef = useRef();
  const handleFetchMessage = useCallback(async () => {
    await messageDs.query(1);
    const { current } = scrollContainerRef;
    if (current) {
      current.scrollTop = current.scrollHeight - current.clientHeight;
    }
  }, [messageDs]);
  const doSendMessage = useCallback(
    (data) => {
      sendMessage(data).then((result) => {
        const res = getResponse(result);
        if (res) {
          handleFetchMessage();
        }
      });
    },
    [handleFetchMessage]
  );
  const handleSend = useCallback(
    throttle(
      () => {
        if (trim(message)) {
          doSendMessage({
            poHeaderId,
            message,
            userCampCode: 'PURCHASE',
          });
        }
        return false;
      },
      THROTTLE_TIME,
      { trailing: false }
    ),
    [doSendMessage, poHeaderId, message]
  );
  const handleScroll = useCallback(
    (e) => {
      if (e.currentTarget.scrollTop === 0) {
        messageDs.queryMore(messageDs.currentPage + 1);
      }
    },
    [messageDs]
  );
  const draggerUploadProps = useMemo(() => {
    const accessToken = getAccessToken();
    const headers = {};
    if (accessToken) {
      headers.Authorization = `bearer ${accessToken}`;
    }
    return {
      name: 'file',
      multiple: true,
      showUploadList: false,
      // accept: 'image/*',
      data(file) {
        return {
          bucketName,
          bucketDirectory,
          fileName: file.name,
        };
      },
      headers,
      action: `${HZERO_FILE}/v1/${organizationId}/files/multipart`,
      // beforeUpload(file) {
      //   // const { fileSize = 10 * 1024 * 1024 } = this.props;
      //   if (file.size > limit * 1024 * 1024) {
      //     file.status = 'error'; // eslint-disable-line
      //     const res = {
      //       message: intl
      //         .get(`hzero.common.upload.error.size`, {
      //           fileSize: limit,
      //         })
      //         .d(`上传文件大小不能超过: ${limit} MB`),
      //     };
      //     file.response = res; // eslint-disable-line
      //     return false;
      //   }
      //   return true;
      // },
      onChange(info) {
        const { status, response } = info.file;
        if (status === 'done') {
          if (isString(response)) {
            notification.success();
            const { name, uid } = info.file;
            doSendMessage({
              message: name,
              poHeaderId,
              attachmentName: name,
              attachmentUrl: response,
              attachmentUuid: uid,
            });
          } else {
            notification.error();
          }
        } else if (status === 'error') {
          notification.error(response);
        }
      },
    };
  }, [organizationId, doSendMessage]);
  useEffect(() => {
    modal.handleOk(handleSend);
  }, [modal, handleSend]);

  useEffect(() => {
    handleFetchMessage();
  }, []);

  const onMouseEnter = useCallback(
    (data) => {
      const distance = moment().diff(moment(data.creationDate), 'minutes');
      if (distance >= 3) {
        return;
      }
      const currentUserId = getCurrentUserId();
      messageDs.forEach((item) => {
        item.set({
          recallShow:
            item.get('messageId') === data.messageId && currentUserId === item.get('createdBy'),
        });
      });
    },
    [messageDs]
  );

  const onMouseLeave = useCallback(() => {
    messageDs.forEach((item) => {
      item.set({
        recallShow: false,
      });
    });
  }, [messageDs]);

  const messageRecall = useCallback((item) => {
    return throttle(
      () => {
        const params = {
          messageId: item.messageId,
        };
        recallMessage(params).then((result) => {
          const res = getResponse(result);
          if (res) {
            handleFetchMessage();
          }
        });
      },
      THROTTLE_TIME,
      { trailing: false }
    );
  }, []);

  return (
    <div className={styles['sodr-send-order-new-message']}>
      <div
        className={messageDs.length ? 'wrapper-message-box-list' : 'wrapper-message-box-list-empty'}
        onScroll={handleScroll}
        ref={scrollContainerRef}
      >
        <Spin dataSet={messageDs}>
          {messageDs.length ? (
            <List
              itemLayout="horizontal"
              dataSource={messageDs.map((item) => ({
                ...item.get([
                  'senderFlag',
                  'userCampCode',
                  'createdByName',
                  'creationDate',
                  'attachmentUrl',
                  'attachmentName',
                  'message',
                  'messageId',
                  'recallShow',
                ]),
              }))}
              renderItem={(item) => {
                return (
                  <List.Item onMouseEnter={() => onMouseEnter(item)} onMouseLeave={onMouseLeave}>
                    <List.Item.Meta
                      avatar={
                        <div className="wrapper-no-message-meta">
                          <div style={avatars[item.senderFlag]}>
                            <Avatar
                              style={avatarStyleMap[item.userCampCode]}
                              alt={item.createdByName}
                            >
                              {isString(item.createdByName) ? (
                                item.createdByName[0].toLocaleUpperCase()
                              ) : (
                                <Icon type="user" />
                              )}
                            </Avatar>
                          </div>
                        </div>
                      }
                      title={
                        <div>
                          <div style={titleMsg[item.senderFlag]}>
                            <div style={titleMsgList[item.senderFlag]}>
                              {item.attachmentUrl ? (
                                <a
                                  href={getAttachmentUrl(
                                    item.attachmentUrl,
                                    bucketName,
                                    bucketDirectory
                                  )}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  {item.attachmentName}
                                </a>
                              ) : (
                                <pre>{item.message}</pre>
                              )}
                            </div>
                          </div>
                        </div>
                      }
                      description={
                        <div style={description[item.senderFlag]}>
                          {item.recallShow && (
                            <a
                              style={{ color: '#E64322', marginRight: '16px' }}
                              onClick={messageRecall(item)}
                            >
                              {intl.get(`${viewMessagePrompt}.recall`).d('撤回')}
                            </a>
                          )}
                          {`${item.createdByName} ${item.creationDate}`}
                        </div>
                      }
                    />
                  </List.Item>
                );
              }}
            />
          ) : (
            <div className="wrapper-no-message-img">
              <img
                src={noMessageImg}
                alt={intl.get(`${viewMessagePrompt}.title.noMessage`).d('暂无留言')}
              />
              <span>{intl.get(`${viewMessagePrompt}.title.noMessage`).d('暂无留言')}</span>
            </div>
          )}
        </Spin>
      </div>
      <div className="message-box-text-area">
        <Tabs className="wrapper-button-tab" animated={false}>
          <TabPane key="basic" Icon="message" tab={<Icon type="message_notification" />}>
            <TextArea
              style={{ resize: 'none', height: 116 }}
              placeholder={intl.get(`${viewMessagePrompt}.pleaseEnterMessage`).d('请输入留言')}
              rows={4}
              value={message}
              onChange={setMessage}
            />
          </TabPane>
          <TabPane key="upload" Icon="upload" tab={<Icon type="file_upload" />}>
            <Dragger {...draggerUploadProps}>
              <p className="ant-upload-drag-icon">
                <Icon type="inbox" />
              </p>
              <p className="ant-upload-text">
                {intl
                  .get(`sodr.common.upload.content`)
                  .d('单击或拖动附件(100Mb以下)到此区域进行上传')}
              </p>
            </Dragger>
          </TabPane>
        </Tabs>
      </div>
    </div>
  );
};

export default observer(Message);
