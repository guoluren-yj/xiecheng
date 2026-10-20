/**
 * Message - 留言板
 * @date: 2020-08-12
 * @author: zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */
import React, { PureComponent } from 'react';
import { Button, Drawer, Spin, List, Avatar, Input, Icon, Tabs, Upload } from 'hzero-ui';
import { isString, isEmpty, trim } from 'lodash';
import { Throttle } from 'lodash-decorators';
import intl from 'utils/intl';
import moment from 'moment';
import { HZERO_FILE } from 'utils/config';
import notification from 'utils/notification';
import {
  getCurrentOrganizationId,
  getAccessToken,
  getAttachmentUrl,
  getResponse,
  getCurrentUserId,
} from 'utils/utils';
import {
  dateTimeRender, // 日期时间格式化
} from 'hzero-front/lib/utils/renderer';

import { BUCKET_NAME, THROTTLE_TIME, MESSAGE_DIRECTORY } from '@/routes/components/utils/constant';
import noMessageImg from 'hzero-front/lib/assets/no-message.png';
import styles from './Message.less';
import { recallMessage } from '@/services/deliveryDateReviewService';

// TextArea组件初始化
const { TextArea } = Input;
const { TabPane } = Tabs;
const { Dragger } = Upload;

const bucketName = BUCKET_NAME;
const bucketDirectory = MESSAGE_DIRECTORY;

// 设置sodr国际化前缀 - common - button
// const viewButtonPrompt = 'sodr.common.view.button';
// 设置sodr国际化前缀 - common - message
const viewMessagePrompt = 'sodr.confirmOrder.view.message';
// 设置通用国际化前缀
const commonPrompt = 'hzero.common';

function setWrapperMessageBoxListHeight() {
  const wrapperMessageBoxList = document.getElementById('wrapperMessageBoxList');
  const clientHeight =
    window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
  if (wrapperMessageBoxList) {
    wrapperMessageBoxList.style.height = `${clientHeight - 290}px`;
  }
}

/**
 * 业务组件 - 我发送的订单
 * @extends {Component} - React.Component
 * @reactProps {!Object} [processing={}] - dispatch处理过程
 * @reactProps {boolean} visible -  是否显示
 * @reactProps {function} [onCancel=(e => e)] - 取消/关闭事件
 * @reactProps {function} [fetchMessage=(e => e)] - 获取message数据
 * @reactProps {function} [sendMessage=(e => e)] - 发送message数据
 * @reactProps {!Object} [onRef=(e => e)] - 获取this对象
 * @return React.element
 */
export default class Message extends PureComponent {
  constructor(props) {
    super(props);
    // 方法注册
    [
      'handleFetchMessage',
      'handleFetchMessageByScroll',
      'cancel',
      'handleSend',
      'setFileList',
      'uploadData',
      'beforeUpload',
      'onDraggerUploadChange',
    ].forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  state = {
    listDataSource: [],
    listPagination: {},
  };

  /**
   * componentDidMount 生命周期函数
   * 暴露this.handleFetchMessage,设置scroll监听事件
   */
  componentDidMount() {
    const { onRef = (e) => e } = this.props;
    onRef(this.handleFetchMessage);
    document.addEventListener('scroll', this.handleFetchMessageByScroll, true);
    window.onresize = () => {
      setWrapperMessageBoxListHeight();
    };
  }

  /**
   * handleFetchMessageByScroll 获取数据滚动事件
   * @param {object} e - 事件对象
   */
  handleFetchMessageByScroll(e) {
    if (e.target.id === 'wrapperMessageBoxList' && e.target.scrollTop === 0) {
      const { listPagination = [] } = this.state;
      this.handleFetchMessage({ page: { ...listPagination, current: listPagination.current + 1 } });
    }
  }

  /**
   * componentDidMount 生命周期函数
   * 去除scroll监听事件
   */
  componentWillUnmount() {
    document.removeEventListener('scroll', (e) => e, true);
  }

  /**
   * handleFetchMessage 获取message事件函数
   * @param {object} params - 查询条件
   * @param {object} isScrollBottom - 是否滚动
   * @param {object} isRefresh - 是否重置message list数据
   */
  handleFetchMessage(params, isScrollBottom, isRefresh) {
    const { fetchMessage = (e) => e, visible } = this.props;
    if (visible) {
      const { listDataSource = [] } = this.state;
      fetchMessage(params, (res) => {
        if (res) {
          const { dataSource = [], pagination = {} } = res;
          this.setState(
            {
              listDataSource: isRefresh ? dataSource : dataSource.concat(listDataSource),
              listPagination: pagination,
            },
            () => {
              const wrapperMessageBoxList = document.getElementById('wrapperMessageBoxList');
              if (!wrapperMessageBoxList) return;
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
                  this.wrapperMessageBoxListScrollTop = scrollTop;
                }
              } else {
                this.wrapperMessageBoxListScrollTop = isEmpty(dataSource)
                  ? 0
                  : this.wrapperMessageBoxListScrollTop;
                wrapperMessageBoxList.scrollTop = this.wrapperMessageBoxListScrollTop;
              }
            }
          );
        }
      });
    }
  }

  /**
   * handleSend 发送message
   */
  @Throttle(THROTTLE_TIME, { trailing: false })
  handleSend() {
    const { sendMessage = (e) => e } = this.props;
    const { listPagination } = this.state;
    if (this.message) {
      const message = this.message.textAreaRef.value;
      if (!isEmpty(trim(message))) {
        sendMessage(message, (res) => {
          if (res && this.message) {
            this.message.textAreaRef.value = '';
            this.handleFetchMessage({ page: { ...listPagination, current: 1 } }, true, true);
          }
        });
      } else {
        notification.warning({
          description: intl.get(`${viewMessagePrompt}.needMessage`).d('消息不能为空'),
        });
      }
    }
  }

  /**
   * cancel 取消/关闭
   */
  cancel() {
    const { onCancel = (e) => e } = this.props;
    if (this.message) {
      this.message.textAreaRef.value = '';
    }
    this.setState({
      listDataSource: [],
      listPagination: {},
    });
    onCancel();
  }

  /**
   * 方法
   * @param {*} file - <>
   */
  uploadData(file) {
    return {
      bucketName,
      bucketDirectory: 'sodr-order',
      fileName: file.name,
    };
  }

  /**
   * 上传前的校验
   * @param {*} file - <>
   */
  beforeUpload(file) {
    // const { fileSize = 10 * 1024 * 1024 } = this.props;
    if (file.size > 100 * 1024 * 1024) {
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
  }

  /**
   * 上传change触发事件
   * @param {*} info - <>
   */
  onDraggerUploadChange(info) {
    const { status, response } = info.file;
    if (status === 'done') {
      if (isString(response)) {
        notification.success();
        this.setFileList(info.file);
      } else {
        notification.error();
      }
    } else if (status === 'error') {
      notification.error(response);
    }
  }

  /**
   * 将上传列表放到state
   * @param {*} file - <>
   */
  setFileList(file) {
    const { attchmentAendMessage } = this.props;
    const { listPagination } = this.state;
    const { name, response, uid } = file;
    attchmentAendMessage(name, response, uid, (res) => {
      if (res) {
        this.handleFetchMessage({ page: { ...listPagination, current: 1 } }, true, true);
      }
    });
  }

  onMouseEnter(message) {
    const distance = moment().diff(moment(message.creationDate), 'minutes');
    if (distance >= 3) {
      return;
    }
    const { listDataSource } = this.state;
    const currentUserId = getCurrentUserId();
    const newDataSource = listDataSource.map((item) => {
      return message.messageId === item.messageId && currentUserId === item.createdBy
        ? { ...item, recallShow: true }
        : { ...item, recallShow: false };
    });
    this.setState({ listDataSource: newDataSource });
  }

  onMouseLeave() {
    const { listDataSource } = this.state;
    const newDataSource = listDataSource.map((item) => {
      return { ...item, recallShow: false };
    });
    this.setState({ listDataSource: newDataSource });
  }

  @Throttle(THROTTLE_TIME, { trailing: false })
  messageRecall(item) {
    const { listPagination } = this.state;
    const params = {
      messageId: item.messageId,
    };
    recallMessage(params).then((result) => {
      const res = getResponse(result);
      if (res) {
        this.handleFetchMessage({ page: { ...listPagination, current: 1 } }, true, true);
      }
    });
  }

  render() {
    const { visible, processing = {} } = this.props;
    const { listDataSource = [] } = this.state;
    const organizationId = getCurrentOrganizationId();
    const accessToken = getAccessToken();
    const headers = {};
    if (accessToken) {
      headers.Authorization = `bearer ${accessToken}`;
    }
    const drawerProps = {
      title: intl.get(`${viewMessagePrompt}.message`).d('留言板'),
      visible,
      mask: true,
      maskStyle: { backgroundColor: 'rgba(0,0,0,.85)' },
      placement: 'right',
      destroyOnClose: true,
      onClose: this.cancel,
      width: 450,
      wrapClassName: styles['sodr-send-order-message'],
    };

    const draggerUploadProps = {
      name: 'file',
      multiple: true,
      showUploadList: false,
      // accept: 'image/*',
      data: this.uploadData,
      headers,
      action: `${HZERO_FILE}/v1/${organizationId}/files/multipart`,
      beforeUpload: this.beforeUpload,
      onChange: this.onDraggerUploadChange,
      // onRemove: this.onDraggerUploadRemove,
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
        left: 355,
      },
      0: {},
    };

    const titleMsg = {
      1: {
        marginRight: '4%',
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
        lineHeight: '24px',
        textAlign: 'right',
        marginRight: '15%',
      },
      0: {
        height: '24px',
        lineHeight: '24px',
      },
    };

    return (
      <Drawer {...drawerProps}>
        <Spin spinning={processing.queryMessageLoading || false}>
          <div
            id="wrapperMessageBoxList"
            className={
              !isEmpty(listDataSource)
                ? 'wrapper-message-box-list'
                : 'wrapper-message-box-list-empty'
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
                    item.message
                  ),
                }))}
                renderItem={(item) => (
                  <List.Item
                    onMouseEnter={this.onMouseEnter.bind(this, item)}
                    onMouseLeave={this.onMouseLeave.bind(this)}
                  >
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
                          {item.recallShow && (
                            <a
                              style={{ color: '#E64322', marginRight: '16px' }}
                              onClick={this.messageRecall.bind(this, item)}
                            >
                              {intl.get(`${viewMessagePrompt}.recall`).d('撤回')}
                            </a>
                          )}
                          {` ${item.createdByName} ${dateTimeRender(item?.creationDate)}`}
                        </div>
                      }
                    />
                  </List.Item>
                )}
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
          </div>
        </Spin>
        <div className="message-box-text-area">
          <Tabs
            className="wrapper-button-tab"
            // value={radioGroupValue}
            onChange={this.handleOnRadioGroupChange}
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
                ref={(node) => {
                  this.message = node;
                }}
                style={{ resize: 'none', height: 116 }}
                placeholder={intl.get(`${viewMessagePrompt}.pleaseEnterMessage`).d('请输入留言')}
                rows={4}
              />
            </TabPane>
            <TabPane
              key="upload"
              Icon="upload"
              tab={
                <span>
                  <Icon type="upload" />
                </span>
              }
            >
              <Dragger {...draggerUploadProps}>
                <p className="ant-upload-drag-icon">
                  <Icon type="inbox" />
                </p>
                <p className="ant-upload-text">
                  {intl
                    .get(`sodr.common.upload.content`)
                    .d('单击或拖动附件(100Mb以下)到此区域进行上传')}
                </p>
                {/* <p className="ant-upload-hint">
                  {intl.get(`hzero.common.upload.hint`).d('支持单个或批量上传')}
                </p> */}
              </Dragger>
            </TabPane>
          </Tabs>
        </div>
        <div className="wrapper-button-group">
          <Button onClick={this.cancel} style={{ marginRight: 8 }}>
            {intl.get(`${commonPrompt}.button.close`).d('关闭')}
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={processing.sendMessageLoading}
            onClick={this.handleSend}
          >
            {intl.get(`sodr.common.model.common.send`).d('发送')}
          </Button>
        </div>
      </Drawer>
    );
  }
}
