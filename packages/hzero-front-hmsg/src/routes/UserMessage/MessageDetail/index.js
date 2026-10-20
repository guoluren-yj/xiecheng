/**
 * 当详情页展示的公告信息时, userMessageId 时 noticeId
 * userMessage 站内消息详情
 * @date: 2018-8-4
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Spin, Divider } from 'hzero-ui';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import { isNil } from 'lodash';
import ReactMarkdown from 'react-markdown/with-html';
import notification from 'utils/notification';

import { Content, Header } from 'components/Page';
import UploadModal from 'srm-front-boot/lib/components/Upload/index';
import { PUBLIC_BUCKET } from 'srm-front-boot/lib/utils/config';

import formatterCollections from 'utils/intl/formatterCollections';
import { getCurrentOrganizationId, getCurrentUser } from 'utils/utils';
import { dateTimeRender } from 'utils/renderer';
import intl from 'utils/intl';

import styles from '../index.less';

@connect(({ userMessage, loading }) => ({
  userMessage,
  organizationId: getCurrentOrganizationId(),
  queryDetailLoading: loading.effects['userMessage/queryDetail'],
}))
@formatterCollections({ code: ['hmsg.userMessage', 'hmsg.common'] })
export default class BadgeIcon extends PureComponent {
  state = { file: [] };

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'userMessage/updateState',
      payload: {
        messageDetail: {},
      },
    });
    this.getMessageDetail();
  }

  componentDidUpdate(prevProps) {
    const {
      match: {
        params: { type: prevType = 'message', userMessageId: prevUserMessageId },
      },
    } = prevProps;
    const {
      match: {
        params: { type = 'message', userMessageId },
      },
    } = this.props;
    if (type !== prevType || userMessageId !== prevUserMessageId) {
      // 需要更新详情
      this.getMessageDetail();
    }
  }

  /**
   * 获取消息详情
   */
  @Bind()
  getMessageDetail() {
    const { dispatch, match, organizationId } = this.props;
    const {
      params: { userMessageId, type = 'message' },
    } = match;
    dispatch({
      type: 'userMessage/queryDetail',
      payload: { userMessageId, organizationId, type },
    }).then(res => {
      if (res) {
        if (['platformNotice', 'companyNotice'].includes(type)) {
          // 将公告设为已读
          dispatch({
            type: 'userMessage/changeRead',
            payload: {
              userMessageIdList: [userMessageId],
              organizationId,
              type,
            },
          });
        }

        if (res.attachmentUuid) {
          dispatch({
            type: 'userMessage/queryFileList',
            payload: {
              attachmentUUID: res.attachmentUuid,
              bucketName: PUBLIC_BUCKET,
              // directory: 'hmsg01',
            },
          }).then(response => {
            if (response) {
              this.setState({ file: response });
            }
          });
        }
      }
    });
  }

  @Bind()
  handleSaveMessageId() {
    const {
      dispatch,
      match: {
        params: { userMessageId },
      },
    } = this.props;
    dispatch({
      type: 'userMessage/updateState',
      payload: { userMessageId },
    });
  }

  @Bind()
  transformMessageContent(message) {
    if (isNil(message)) {
      return '';
    }
    const {
      match: {
        params: { type = 'message' },
      },
    } = this.props;
    const { additionInfo } = getCurrentUser() || {};
    const { organizationName } = additionInfo || {};
    const { content, noticeBody, noticeContent, availableOpenLink, fromTenantName, availableTenantName } = message;
    let messageContent =
      type === 'message' ? content : noticeContent ? noticeContent.noticeBody : null;
    //  type === 'announce' ? message.noticeBody : message.content;
    if (isNil(messageContent)) {
      return '';
    }
    if (!window.notification) {
      window.notification = notification;
    }
    const tenantName = fromTenantName;
    let newContent = '';
    if (messageContent.includes('<a ') && availableOpenLink === false) {
      // 检查是否有a标签
      messageContent.split('<a ').forEach((item, index) => {
        let contentPart = item;
        if (item.includes('</a>')) {
          const linkContent = item.split('</a>')[0];
          if (
            linkContent.includes('href=') ||
            linkContent.includes('onclick=') ||
            linkContent.includes('onClick=')
          ) {
            contentPart =
              `<a onclick="{notification.error({
                message: '${availableTenantName}',
    });}"${linkContent.substr(linkContent.lastIndexOf('>'))}</a>` +
              item
                .split('</a>')
                .slice(1)
                .join(',');
          }
        } else if (index > 0) {
          contentPart = `<a ${item}`;
        }
        newContent += contentPart;
      });
    } else {
      newContent = messageContent;
    }
    return newContent;
  }
  render() {
    const {
      userMessage: { messageDetail = {} },
      queryDetailLoading = false,
      match: {
        params: { type = 'message' },
      },
    } = this.props;
    const { file } = this.state;
    const title = messageDetail.title;
    const datetime = dateTimeRender(
      type !== 'message' ? messageDetail.publishedDate : messageDetail.creationDate
    );
    const content = this.transformMessageContent(messageDetail);

    const { templateEditType = 'RT' } = messageDetail;
    return (
      <>
        <Header
          title={
            type === 'message'
              ? intl.get('hmsg.userMessage.view.message.title.detail').d('消息详情')
              : intl.get('hmsg.userMessage.view.message.title.noticeDetail').d('公告详情')
          }
          backPath="/hmsg/user-message/list"
        />
        <Content>
          <Spin spinning={queryDetailLoading}>
            <div style={{ borderBottom: 'solid 1px #e8e8e8' }}>
              <p
                style={{
                  margin: 0,
                  fontWeight: 'bold',
                  fontSize: 20,
                }}
                dangerouslySetInnerHTML={{ __html: title }}
              />
              <p>{datetime}</p>
            </div>
            {templateEditType !== 'MD' ? (
              <div
                className={styles.content}
                onClick={this.handleSaveMessageId}
                dangerouslySetInnerHTML={{ __html: content }}
              />
            ) : (
              <ReactMarkdown source={content} escapeHtml={false} />
            )}
            {file.length > 0 && (
              <div className={styles.upload}>
                <Divider dashed style={{ margin: '10px 0' }} />
                <UploadModal
                  attachmentUUID={messageDetail.attachmentUuid}
                  bucketName={PUBLIC_BUCKET}
                  // bucketDirectory="hmsg01"
                  viewOnly
                />
              </div>
            )}
          </Spin>
        </Content>
      </>
    );
  }
}
