/**
 * 监听 websocket
 */

import React from 'react';
import { isEmpty, isArray } from 'lodash';
import { connect } from 'dva';
import Icons from 'components/Icons';
import { Bind } from 'lodash-decorators';
import { Button } from 'hzero-ui';
import { Modal } from 'choerodon-ui';
import { Button as C7NButton } from 'choerodon-ui/pro';
import uuid from 'uuid/v4';
import ReactMarkdown from 'react-markdown/with-html';

import webSocketManager from 'utils/webSoket';
import { KICK_OUT_MSG_KEY } from 'utils/constants';
import notification from 'utils/notification';
import { getCurrentOrganizationId, getCurrentUser, getAccessToken } from 'utils/utils';
import { openTab } from 'utils/menuTab';
import intl from '../../../utils/intl';
import styles from './index.less';

@connect()
class DefaultListenWebSocket extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false,
    };
  }

  componentDidMount() {
    webSocketManager.initWebSocket();
    const { webReminderFlag } = getCurrentUser();
    if (webReminderFlag === 0) {
      return;
    }
    webSocketManager.addListener('hzero-web', this.handleHzeroWebMsg);
    // 监听多端登陆
    webSocketManager.addListener(KICK_OUT_MSG_KEY, this.handleKickOutMsg);
  }

  @Bind()
  handleHzeroWebMsg(messageData) {
    const { saveNotices, count } = this.props;
    const { message } = messageData;
    const messageJson = isEmpty(message) ? undefined : JSON.parse(message);
    const currentTenantId = getCurrentOrganizationId();
    if (!isEmpty(messageJson)) {
      const { tenantId, number, content, subject, fixed = false, templateEditType, webNotificationCheck } = messageJson;
      if (webNotificationCheck
        && isArray(webNotificationCheck.allowTenantIds)
        && webNotificationCheck.allowTenantIds.length > 0
        && !webNotificationCheck.allowTenantIds.includes(currentTenantId)
      ) {
        return;
      }
      let newCount = count;
      if (tenantId === 0) {
        newCount = Number(count) + Number(number);
      } else if (tenantId === currentTenantId) {
        newCount = Number(count) + Number(number);
      }
      saveNotices({ count: newCount > 0 ? newCount : 0 });
      if (Number(number) > 0) {
        const key = uuid();
        if (subject && content) {
          const reg = /(<a)([\s]+|[\s]+[^<>]+[\s]+)(href=)("(inner:\/\/)([^<>"']*)"|'(inner:\/\/)([^<>"']*)')([^<>]*>)/g;
          const displayContent = content?.replace(reg, (...args) => {
            const url = args[6] || args[8];
            return `${args[1]}${args[2]} onclick="window.top.dvaApp._history.push('${
              !url?.startsWith('/') ? '/' : ''
            }${url}')"${args[9]}`;
          });
          notification.info({
            key,
            icon: <></>,
            message: (
              <span>
                {templateEditType !== 'MD' ? (
                  <div dangerouslySetInnerHTML={{ __html: subject }} />
                ) : (
                  <ReactMarkdown source={subject} escapeHtml={false} />
                )}
              </span>
            ),
            description: (
              <div>
                {templateEditType !== 'MD' ? (
                  <div dangerouslySetInnerHTML={{ __html: displayContent }} />
                ) : (
                  <ReactMarkdown source={displayContent} escapeHtml={false} />
                )}
                {fixed && (
                  <div className="footer-right">
                    <Button
                      onClick={() => {
                        this.handleClose(key);
                      }}
                    >
                      {intl.get('hzero.common.button.close').d('关闭')}
                    </Button>
                  </div>
                )}
              </div>
            ),
            className: 'request html',
            duration: fixed ? null : 5,
          });
        } else {
          notification.info({
            key,
            icon: <></>,
            message: (
              <>
                <Icons
                  type="bell"
                  width={30}
                  height={30}
                  size={30}
                  color="red"
                  style={{ position: 'relative', top: 4, right: 15 }}
                />
                {intl.get('hzero.common.basicLayout.newMessage').d('您有新的消息')}
              </>
            ),
            description: (
              <a
                onClick={() => {
                  this.handleClick(key);
                }}
                style={{ paddingLeft: 35 }}
              >
                {intl.get('hzero.common.basicLayout.watchMessage').d('查看消息')}
              </a>
            ),
            className: 'request info',
          });
        }
      }
    }
  }

  @Bind()
  handleKickOutMsg(data) {
    if (data && data.message) {
      const { message } = data;
      if (typeof message === 'string') {
        try {
          const accessToken = getAccessToken();
          const { KICK_OUT } = JSON.parse(message);
          if (
            KICK_OUT &&
            isArray(KICK_OUT) &&
            KICK_OUT.length > 0 &&
            KICK_OUT.includes(accessToken)
          ) {
            this.setState({ modalVisible: true });
          }
          // eslint-disable-next-line no-empty
        } catch {}
      }
    }
  }

  @Bind()
  handleClick(key) {
    openTab({
      key: '/hmsg/user-message',
      path: '/hmsg/user-message/list',
      title: 'hzero.common.title.userMessage',
      icon: undefined,
      closable: true,
      search: '',
    });
    this.handleClose(key);
  }

  @Bind()
  handleClose(key) {
    notification.close(key);
  }

  componentWillUnmount() {
    webSocketManager.removeListener('hzero-web', this.handleHzeroWebMsg);
    webSocketManager.removeListener(KICK_OUT_MSG_KEY, this.handleKickOutMsg);
  }

  @Bind()
  handleSingleLoginOk() {
    this.props.dispatch({
      type: 'login/logout',
    });
    this.setState({ modalVisible: false });
  }

  render() {
    const { modalVisible } = this.state;
    if (!modalVisible) {
      return null;
    }
    return (
      <Modal
        visible
        zIndex={1300000}
        wrapClassName={styles['self-modal']}
        closable={false}
        maskClosable={false}
        title={intl.get('hzero.common.view.title.abnormalLoginReminder').d('多处登录提醒')}
        footer={
          <C7NButton funcType="raised" color="primary" onClick={this.handleSingleLoginOk}>
            {intl.get('hzero.common.view.button.backToLogin').d('返回登录页')}
          </C7NButton>
        }
      >
        <div style={{ padding: '0.16rem 0 0.32rem' }}>
          {intl
            .get('hzero.common.view.message.abnormalLoginReminder')
            .d('抱歉，您的账号已在其他地点登录，您已被迫下线。您可尝试返回登录页重新登录')}
        </div>
      </Modal>
    );
  }
}

export default connect(
  ({ global = {} }) => ({
    count: global.count,
  }),
  (dispatch) => ({
    saveNotices: (payload) =>
      dispatch({
        type: 'global/saveNotices',
        payload,
      }),
  })
)(DefaultListenWebSocket);
