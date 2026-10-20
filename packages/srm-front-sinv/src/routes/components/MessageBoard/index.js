import React, { Fragment, useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Button, TextArea } from 'choerodon-ui/pro';
import { Modal, List, Avatar, Tabs, Upload, Icon, Spin } from 'choerodon-ui';

import formatterCollections from 'utils/intl/formatterCollections';
import { compose, isString, isEmpty, trim, isNil } from 'lodash';
import { HZERO_FILE } from 'utils/config';
import { getCurrentOrganizationId, getAccessToken, getAttachmentUrl } from 'utils/utils';
import notification from 'utils/notification';
import { ReactComponent as EmptySvg } from '@/assets/emptyMessage.svg';

import { PRIVATE_BUCKET } from '_utils/config';
import ImageList from '@/routes/components/ImageList';
import intl from 'utils/intl';

import { messageBoardQuiryList, messageBoardPutList } from '@/services/messageBoarsdService';
import styles from './index.less';

const bucketName = PRIVATE_BUCKET;

const bucketDirectory = 'sinv-delivery';

const { Sidebar } = Modal;

const { TabPane } = Tabs;

const { Dragger } = Upload;

const organizationId = getCurrentOrganizationId();

const headers = {};
const accessToken = getAccessToken();
if (accessToken) {
  headers.Authorization = `bearer ${accessToken}`;
}

const Index = (props) => {
  const { rcvTrxHeaderId, messageVisible, offMessage = (e) => e } = props;
  const [modalVisible, useVisible] = useState(false);
  const [loading, useLoading] = useState(false); // loading
  const inputRef = useRef(null); // 输入的数据
  const [messageList, useMessageList] = useState([]); // 拿到查询后的数据

  useEffect(() => {
    useVisible(messageVisible);
    onQueryList(rcvTrxHeaderId);
    document.addEventListener('scroll', handleFetchMessageByScroll, true); // 向上滑动刷新留言板数据
  }, []);

  useEffect(() => {
    window.onresize = () => {
      setmessageBoardIdHeight();
    };
  }, []);

  const setmessageBoardIdHeight = () => {
    const messageBoardId = document.getElementById('messageBoardId');
    const clientHeight =
      window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
    if (messageBoardId) {
      messageBoardId.style.height = `${clientHeight - 290}px`;
    }
  };

  // 向上滑动刷新留言板
  const handleFetchMessageByScroll = useCallback((e) => {
    if (e.target.id === 'messageBoardId' && e.target.scrollTop === 0) {
      onQueryList(rcvTrxHeaderId, true);
    }
  }, []);

  // 查询数据
  const onQueryList = (params, scrollFlag) => {
    useLoading(true);
    messageBoardQuiryList(params).then((res) => {
      useLoading(false);
      if (res) {
        if (!scrollFlag) {
          useMessageList(res);
          const messageBoardId = document.getElementById('messageBoardId');
          if (messageBoardId) {
            messageBoardId.scrollTop = messageBoardId.scrollHeight;
          }
        } else {
          useMessageList(res);
        }
      }
    });
  };

  /**
   * handleSend 发送message
   */
  const handleSend = () => {
    useLoading(true);
    const valueText = inputRef?.current?.value;
    const params = {
      message: valueText,
      rcvTrxHeaderId,
    };
    if (!isNil(valueText)) {
      if (!isEmpty(trim(valueText))) {
        messageBoardPutList(params).then((res) => {
          if (res) {
            inputRef.current.value = '';
            onQueryList(rcvTrxHeaderId);
          }
        });
      } else {
        useLoading(false);
        notification.warning({
          description: intl
            .get(`sinv.receiptWorkbench.model.receipt.needMessage`)
            .d('消息不能为空'),
        });
      }
    } else {
      useLoading(false);
      notification.warning({
        description: intl.get(`sinv.receiptWorkbench.model.receipt.needMessage`).d('消息不能为空'),
      });
    }
  };

  /**
   * 关闭留言板
   */
  const offMessageChange = () => {
    offMessage(false);
    useVisible(false);
  };

  /**
   * 方法
   * @param {*} file - <>
   */
  const uploadData = (file) => {
    return {
      bucketName,
      bucketDirectory,
      fileName: file.name,
    };
  };

  /**
   * 上传前的校验
   * @param {*} file - <>
   */
  const beforeUpload = (file) => {
    if (file.size > 10 * 1024 * 1024) {
      file.status = 'error'; // eslint-disable-line
      const res = {
        message: intl
          .get(`hzero.common.upload.error.size`, {
            fileSize: (10 * 1024 * 1024) / (1024 * 1024),
          })
          .d(`上传文件大小不能超过: ${(10 * 1024 * 1024) / (1024 * 1024)} MB`),
      };
      file.response = res; // eslint-disable-line
      return false;
    }
    return true;
  };

  const setFileList = (file) => {
    const { name, response, uid } = file;
    const params = {
      message: name,
      attachmentName: name,
      attachmentUrl: response,
      attachmentUuid: uid,
      rcvTrxHeaderId,
    };
    messageBoardPutList(params).then((res) => {
      if (res) {
        onQueryList(rcvTrxHeaderId);
      }
    });
  };

  /**
   * 上传change触发事件
   * @param {*} info - <>
   */
  const onDraggerUploadChange = (info) => {
    const { status, response } = info.file;
    if (status === 'done') {
      if (isString(response)) {
        notification.success();
        setFileList(info.file);
      } else {
        notification.error();
      }
    } else if (status === 'error') {
      notification.error(response);
    }
  };

  const upLoadProps = {
    name: 'file',
    multiple: true,
    headers,
    data: (file) => uploadData(file),
    showUploadList: false,
    action: `${HZERO_FILE}/v1/${organizationId}/files/multipart`,
    beforeUpload: (file) => beforeUpload(file),
    onChange: (file) => onDraggerUploadChange(file),
  };
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
    true: {
      width: '20',
      hegiht: '20',
      position: 'absolute',
      left: 305,
    },
    false: {},
  };

  const titleMsg = {
    true: {
      marginRight: '15%',
      textAlign: 'right',
    },
    false: {},
  };
  const titleMsgList = {
    true: {
      width: '100%',
      height: 'auto',
      wordWrap: 'break-word',
      wordBreak: 'break-all',
    },
    false: {},
  };
  const description = {
    true: {
      width: '20',
      hegiht: 'auto',
      textAlign: 'right',
      marginRight: '15%',
    },
    false: {},
  };

  const Empty = useMemo(
    () => (
      <div className={styles['modal-content-empty']}>
        <EmptySvg />
        <p>{intl.get('sinv.receiptWorkbench.view.title.detail.noMessage').d('暂无留言')}</p>
      </div>
    ),
    []
  );

  return (
    <Fragment>
      <Sidebar
        // mask
        closable // 是否显示右上角的关闭按钮
        width={380}
        title={intl.get(`sinv.receiptWorkbench.view.title.detail.message`).d('留言板')}
        visible={modalVisible}
        footer={null}
        onCancel={() => offMessageChange()}
        wrapClassName={styles['message-all']}
        mask={false}
      >
        <div
          id="messageBoardId"
          className={messageList.length === 0 ? 'message-nodata' : 'message-text'}
        >
          <Spin spinning={loading}>
            <List
              id="meesageBoxList"
              itemLayout="horizontal"
              empty={Empty}
              dataSource={messageList.map((item) => ({
                ...item,
                message:
                  item.attachmentUrl &&
                  /.(gif|jpg|jpeg|png|gif|jpg|png)$/.test(item.attachmentUrl) ? (
                    // eslint-disable-next-line react/jsx-indent
                    <>
                      <ImageList imageDTO={[item]} isTag={false} />
                    </>
                  ) : item.attachmentUrl ? (
                    <a
                      href={getAttachmentUrl(item.attachmentUrl, bucketName, bucketDirectory)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {item.attachmentName}
                    </a>
                  ) : (
                    <span>{item.message}</span>
                  ),
              }))}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <div className="message-text-meta">
                        <div style={avatars[item.senderFlag]}>
                          <Avatar
                            style={avatarStyleMap[item.userCampCode]}
                            alt={item.createUserName}
                            src={item.userImageUrl}
                          >
                            {isString(item.createUserName) ? (
                              item.createUserName[0].toLocaleUpperCase()
                            ) : (
                              <Icon type="user" />
                            )}
                          </Avatar>
                        </div>
                      </div>
                    }
                    description={
                      <div style={description[item.senderFlag]}>
                        {`${item.createUserName} ${item.creationDate}`}
                      </div>
                    }
                    title={
                      <div>
                        <div style={titleMsg[item.senderFlag]}>
                          <div style={titleMsgList[item.senderFlag]}>{item.message}</div>
                        </div>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Spin>
        </div>
        <div className="message-tab">
          <Tabs defaultActiveKey="text">
            <TabPane tab={<Icon className="message-tab-icon" type="comment" />} key="text">
              <TextArea
                ref={inputRef}
                rows={4}
                placeholder={intl
                  .get(`sinv.receiptWorkbench.model.receipt.placeholderMessage`)
                  .d('请输入留言')}
                style={{ resize: 'none', height: 116, width: '100%' }}
                // onEnterDown={() => handleSend()}
              />
            </TabPane>
            <TabPane tab={<Icon className="message-tab-icon" type="file_upload" />} key="upload">
              <Dragger {...upLoadProps}>
                <p className="c7n-upload-drag-icon">
                  <Icon type="inbox" />
                </p>
                <p className="c7n-upload-text">
                  {intl
                    .get(`sinv.receiptWorkbench.model.receipt.FileSizeLimit`)
                    .d('单击或拖动附件（10MB以下）到此区域进行上传')}
                </p>
              </Dragger>
              ,
            </TabPane>
          </Tabs>
        </div>
        <div className="message-btn">
          <Button
            loading={loading}
            color="primary"
            className="message-btn-send"
            onClick={() => handleSend()}
          >
            {intl.get(`hzero.common.button.send`).d('发送')}
          </Button>
          <Button loading={loading} className="message-btn-off" onClick={() => offMessageChange()}>
            {intl.get(`hzero.common.view.message.close`).d('关闭')}
          </Button>
        </div>
      </Sidebar>
    </Fragment>
  );
};
export default compose(
  formatterCollections({
    code: ['hzero.common', 'sinv.receiptWorkbench', 'sinv.common'],
  })
)(Index);
