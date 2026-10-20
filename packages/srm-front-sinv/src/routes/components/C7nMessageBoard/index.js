/* eslint-disable func-names */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { List, Avatar, Tabs, Upload, Icon, Spin, Input, Button } from 'choerodon-ui';
import { isString, isEmpty, trim, debounce } from 'lodash';
import intl from 'utils/intl';
import { HZERO_FILE } from 'utils/config';
import notification from 'utils/notification';
import {
  getCurrentOrganizationId,
  getAccessToken,
  getAttachmentUrl,
  createPagination,
} from 'utils/utils';
// import noMessageImg from 'hzero-front/lib/assets/no-message.png';
import { queryMessage, sendMessage } from '@/services/supplierDeliveryService';
import ImageList from '@/routes/components/ImageList';

import styles from './index.less';

const viewMessagePrompt = 'sinv.supplierDelivery.view.message';
const commonPrompt = 'hzero.common';
// TextArea组件初始化
const { TextArea } = Input;
const { TabPane } = Tabs;
const { Dragger } = Upload;
const bucketName = 'private-bucket';
const bucketDirectory = 'sinv-delivery';

const C7nMessageBoard = (props) => {
  const {
    asnHeaderId,
    modal: { close },
  } = props;
  const [processing, setProcessing] = useState({
    sendMessageLoading: false,
    queryMessageLoading: false,
  });
  const inputRef = useRef(null);
  const [listDataSource, setListDataSource] = useState([]);
  const [listPagination, setListPagination] = useState({ current: 0, total: 0, pageSize: 10 });
  const pageRef = useRef(1);
  const dataRef = useRef([]);

  useEffect(() => {
    handleFetchMessage(
      { page: { ...listPagination, current: listPagination.current + 1 } },
      false,
      true
    );
    setWrapperMessageBoxListHeight();
    window.onresize = () => {
      setWrapperMessageBoxListHeight();
    };
  }, []);

  useEffect(() => {
    setProcessing({ queryMessageLoading: true });
    document.addEventListener('scroll', debounce(handleFetchMessageByScroll, 800), true);
    return () => {
      document.removeEventListener('scroll', (e) => e, true);
    };
  }, [handleFetchMessageByScroll, listPagination.total]);

  const handleFetchMessageByScroll = useCallback(
    (e) => {
      if (
        e.target.id === 'wrapperMessageBoxLabelList' &&
        e.target.scrollTop === 0 &&
        Math.ceil(listPagination.total / listPagination.pageSize) > pageRef.current
      ) {
        pageRef.current += 1;
        handleFetchMessage({ page: { ...listPagination, current: pageRef.current } }, true, false);
      }
    },
    [listPagination.current, listPagination.total]
  );

  const handleFetchMessage = (params, isScrollBottom, isRefresh) => {
    queryMessage({ asnHeaderId, ...params }).then((res) => {
      if (res) {
        const { content = [] } = res;
        dataRef.current = [...content, ...dataRef.current];
        setListDataSource(isRefresh ? [...content] : [...dataRef.current]);
        setListPagination(createPagination(res));
        setProcessing({ queryMessageLoading: false });
        const wrapperMessageBoxList = document.getElementById('wrapperMessageBoxLabelList');
        if (isScrollBottom) {
          setWrapperMessageBoxListHeight();
          const containerHeight = wrapperMessageBoxList.clientHeight;
          const messageBoxList =
            wrapperMessageBoxList.children[0].id === 'meesageBoxList'
              ? wrapperMessageBoxList.children[0]
              : null;
          if (messageBoxList && containerHeight <= messageBoxList.clientHeight) {
            const scrollTop = messageBoxList.clientHeight - containerHeight;
            wrapperMessageBoxList.scrollTop = scrollTop;
          }
        } else {
          const wrapperMessageBoxListScrollTop = isEmpty(content)
            ? 0
            : wrapperMessageBoxListScrollTop;
          wrapperMessageBoxList.scrollTop = wrapperMessageBoxListScrollTop;
        }
      }
    });
  };

  /**
   * handleSend 发送message
   */
  const handleSend = () => {
    setProcessing({ sendMessageLoading: true });
    const message = inputRef.current;
    if (!isEmpty(trim(message.textAreaRef.value))) {
      sendMessage({ asnHeaderId, message: message.textAreaRef.value }).then((res) => {
        if (res) {
          message.textAreaRef.value = '';
          setListPagination({ ...listPagination, current: 1 });
          pageRef.current = 1;
          dataRef.current = [];
          handleFetchMessage({ page: { ...listPagination, current: 1 } }, true, true);
          setProcessing({ sendMessageLoading: false });
        }
      });
    } else {
      notification.warning({
        description: intl.get(`${viewMessagePrompt}.needMessage`).d('消息不能为空'),
      });
      setProcessing({ sendMessageLoading: false });
    }
  };

  const setWrapperMessageBoxListHeight = () => {
    const wrapperMessageBoxList = document.getElementById('wrapperMessageBoxLabelList');
    const clientHeight =
      window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
    if (wrapperMessageBoxList) {
      wrapperMessageBoxList.style.height = `${clientHeight - 290}px`;
      wrapperMessageBoxList.style.overflowY = `scroll`;
    }
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

  const uploadData = (file) => {
    return {
      bucketName: 'private-bucket',
      bucketDirectory: 'sinv-delivery',
      fileName: file.name,
    };
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

  /**
   * 将上传列表放到state
   * @param {*} file - <>
   */
  const setFileList = (file) => {
    const { name, response, uid } = file;
    const data = {
      message: name,
      asnHeaderId,
      attachmentName: name,
      attachmentUrl: response,
      attachmentUuid: uid,
    };
    sendMessage(data).then((res) => {
      if (res) {
        setListPagination({ ...listPagination, current: 1 });
        pageRef.current = 1;
        dataRef.current = [];
        handleFetchMessage({ page: { ...listPagination, current: 1 } }, true, true);
      }
    });
  };

  const headers = {};
  const accessToken = getAccessToken();
  const organizationId = getCurrentOrganizationId();
  if (accessToken) {
    headers.Authorization = `bearer ${accessToken}`;
  }
  const draggerUploadProps = {
    name: 'file',
    multiple: true,
    showUploadList: false,
    data: uploadData,
    headers,
    action: `${HZERO_FILE}/v1/${organizationId}/files/multipart`,
    beforeUpload,
    onChange: onDraggerUploadChange,
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
    1: {
      width: '20',
      hegiht: '20',
      position: 'absolute',
      left: 285,
    },
    0: {},
  };

  const titleMsg = {
    1: {
      marginRight: '15%',
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
    0: {
      wordWrap: 'break-word',
      wordBreak: 'break-all',
    },
  };

  const description = {
    1: {
      width: '20',
      hegiht: 'auto',
      textAlign: 'right',
      marginRight: '15%',
    },
    0: {},
  };

  return (
    <div className={styles['message-all']}>
      <div id="wrapperMessageBoxLabelList" className="message-text">
        <Spin spinning={processing.queryMessageLoading || false}>
          <List
            id="meesageBoxList"
            itemLayout="horizontal"
            dataSource={listDataSource.map((item) => ({
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
                          alt={item.createdByName}
                          src={item.userImageUrl}
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
                  description={
                    <div style={description[item.senderFlag]}>
                      {`${item.createdByName} ${item.creationDate}`}
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
          <TabPane tab={<Icon type="comment" />} key="text">
            <TextArea
              ref={inputRef}
              rows={4}
              placeholder={intl
                .get(`${commonPrompt}.model.receipt.placeholderMessage`)
                .d('请输入留言')}
              style={{ resize: 'none', height: 116, width: '100%' }}
            />
          </TabPane>
          <TabPane tab={<Icon type="file_upload" />} key="upload">
            <Dragger {...draggerUploadProps}>
              <p className="c7n-upload-drag-icon">
                <Icon type="inbox" />
              </p>
              <p className="c7n-upload-text">
                {intl
                  .get(`${commonPrompt}.model.receipt.FileSizeLimit`)
                  .d('单击或拖动附件（10MB以下）到此区域进行上传')}
              </p>
            </Dragger>
            ,
          </TabPane>
        </Tabs>
      </div>
      <div className="message-btn">
        <Button
          loading={processing.sendMessageLoading}
          color="primary"
          className="message-btn-send"
          onClick={() => handleSend()}
        >
          {intl.get(`hzero.common.button.send`).d('发送')}
        </Button>
        <Button
          loading={processing.sendMessageLoading}
          className="message-btn-off"
          onClick={() => close()}
        >
          {intl.get(`hzero.common.view.message.close`).d('关闭')}
        </Button>
      </div>
      {/* <Spin spinning={processing.queryMessageLoading || false}>
        <div
          id="wrapperMessageBoxLabelList"
          className={
            !isEmpty(listDataSource) ? 'wrapper-message-box-list' : 'wrapper-message-box-list-empty'
          }
        >
          {!isEmpty(listDataSource) ? (
            <List
              id="meesageBoxList"
              itemLayout="horizontal"
              dataSource={listDataSource.map((item) => ({
                ...item,
                // message: <pre>{item.message}</pre>,
                message: item.attachmentUrl ? (
                  <a
                    href={getAttachmentUrl(
                      item.attachmentUrl,
                      bucketName,
                      // tenantId,
                      bucketDirectory
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {item.attachmentName}
                  </a>
                ) : (
                  <pre>{item.message}</pre>
                ),
              }))}
              renderItem={(item) => (
                <List.Item>
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
                          <div style={titleMsgList[item.senderFlag]}>{item.message}</div>
                        </div>
                      </div>
                    }
                    description={
                      <div style={description[item.senderFlag]}>
                        {`${item.createdByName} ${item.creationDate}`}
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          ) : (
            <div className={styles['wrapper-no-message-img']}>
              <img
                src={noMessageImg}
                alt={intl.get(`${viewMessagePrompt}.title.noMessage`).d('暂无留言')}
              />
              <span>{intl.get(`${viewMessagePrompt}.title.noMessage`).d('暂无留言')}</span>
            </div>
          )}
        </div>
      </Spin>
      <div className="message-box-text-area">
        <Tabs
          className="wrapper-button-tab"
          // value={radioGroupValue}
          animated={false}
        >
          <TabPane
            key="basic"
            Icon="message"
            tab={
              <span>
                <Icon type="message" />
              </span>
            }
          >
            <TextArea
              ref={inputRef}
              style={{ resize: 'none', height: 116 }}
              placeholder={intl.get(`${viewMessagePrompt}.pleaseEnterMessage`).d('请输入留言')}
              rows={4}
            />
          </TabPane>
          <TabPane tab={<Icon type="file_upload" />} key="upload">
            <Dragger {...draggerUploadProps}>
              <p className="c7n-upload-drag-icon">
                <Icon type="inbox" />
              </p>
              <p className="c7n-upload-text">
                {intl
                  .get(`sinv.supplierDelivery.model.receipt.FileSizeLimit`)
                  .d('单击或拖动附件（10MB以下）到此区域进行上传')}
              </p>
            </Dragger>
          </TabPane>
        </Tabs>
      </div>
      <div className="wrapper-button-group">
        <Button onClick={close} style={{ marginRight: 8 }}>
          {intl.get(`${commonPrompt}.button.close`).d('关闭')}
        </Button>
        <Button
          type="primary"
          htmlType="submit"
          loading={processing.sendMessageLoading}
          onClick={handleSend}
        >
          {intl.get(`sinv.common.model.common.send`).d('发送')}
        </Button>
      </div> */}
    </div>
  );
};

export default C7nMessageBoard;
