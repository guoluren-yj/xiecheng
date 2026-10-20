/**
 * 检查用户是否没有修改过密码, 绑定过手机号 邮箱
 * 如果不满足 则 在第一次登录 提示用户去个人中心修改
 */
import React from 'react';
import { Modal, Button } from 'hzero-ui';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
// import { getAsset } from '@hzero-front-ui/cfg';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
import { getSession, setSession, getResponse } from 'utils/utils';

import { queryStaticText } from '../../../services/api';
import { ReactComponent as ToastImg } from '../../../assets/illustrate-toast-new.svg';

import styles from './index.less';

class DefaultCheckUserSafe extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // needShowModal: false,
    };
  }

  componentDidMount() {
    const {
      dispatch,
      currentUser,
      currentUser: { changePasswordFlag },
    } = this.props;
    const infoCheckFlag = getSession('infoCheckFlag');
    if ((!infoCheckFlag && currentUser) || changePasswordFlag === 1) {
      const {
        emailCheckFlag,
        phoneCheckFlag,
        passwordResetFlag,
        popoutReminderFlag = 1,
      } = currentUser;
      if (
        (emailCheckFlag === 0 ||
          phoneCheckFlag === 0 ||
          passwordResetFlag === 0 ||
          changePasswordFlag === 1) &&
        !infoCheckFlag
      ) {
        const nextState = {
          // needShowModal: true,
          passwordResetFlag,
          emailCheckFlag,
          phoneCheckFlag,
        };
        this.handleModalVisibie(true);
        if (!popoutReminderFlag) {
          this.handleUpdateSelfModal();
        }
        queryStaticText('USER_PROMPT')
          .then((res) => {
            const staticRes = getResponse(res);
            // info 如果 没有模版， 那么不需要弹出提示
            if (staticRes && staticRes.text) {
              nextState.selfModalDangerouslySetInnerHTML = {
                __html: staticRes.text,
              };
            }
          })
          .finally(() => {
            this.setState(nextState);
            setSession('infoCheckFlag', true);
          });
        return;
      }
    }
    this.handleUpdateSelfModal();
  }

  @Bind()
  handleUpdateSelfModal() {
    this.props.dispatch({
      type: 'user/updateState',
      payload: {
        noSelfModal: true,
      },
    });
  }

  @Bind()
  handleCancle() {
    this.handleModalVisibie(null);
  }

  @Bind()
  handleModalVisibie(visible) {
    this.props.dispatch({
      type: 'user/updateState',
      payload: {
        selfModalVisible: visible,
      },
    });
  }

  renderCheckModal() {
    const {
      selfModalDangerouslySetInnerHTML,
      phoneCheckFlag,
      emailCheckFlag,
      passwordResetFlag,
    } = this.state;
    const {
      gotoTab,
      user,
      selfModalVisible,
      currentUser: { popoutReminderFlag = 1, changePasswordFlag },
    } = this.props;
    return (
      <Modal
        visible={popoutReminderFlag && selfModalVisible}
        wrapClassName={styles['self-modal']}
        footer={null}
        width={468}
        onCancel={this.handleCancle}
      >
        <div className="self-modal-header">
          <ToastImg />
        </div>
        <div className="self-modal-content">
          {changePasswordFlag ? (
            <div>
              <p>{intl.get('hzero.common.basicLayout.greetMessage').d('尊敬的用户您好')}，</p>
              <p>
                {intl
                  .get('hzero.common.basicLayout.passwordExpireMsg')
                  .d(
                    '您的密码即将到期，为保证消息的正常接收及您的账户安全，和后续的正常使用，请前往'
                  )}
                <span className="user-info">
                  &nbsp;
                  {intl.get('hzero.common.basicLayout.userInfo').d('个人中心')}
                  &nbsp;
                </span>
                {intl.get('hzero.common.basicLayout.safeMessage2').d('进行修改。')}
              </p>
            </div>
          ) : selfModalDangerouslySetInnerHTML ? (
            // eslint-disable-next-line react/no-danger
            <div dangerouslySetInnerHTML={selfModalDangerouslySetInnerHTML} />
          ) : (
            <div>
              <p>{intl.get('hzero.common.basicLayout.greetMessage').d('尊敬的用户您好')}，</p>
              <p>
                {intl.get('hzero.common.basicLayout.accountNoBind').d('系统检测到您的账号尚未绑定')}
                {!phoneCheckFlag || !emailCheckFlag ? " " : ""}
                {[
                  phoneCheckFlag === 0 && intl.get('hzero.common.basicLayout.accountNoBind.phone').d('手机'),
                  emailCheckFlag === 0 && intl.get('hzero.common.basicLayout.accountNoBind.email').d('邮箱')
                ].filter(Boolean).join("/")}
                {passwordResetFlag === 0 &&
                  intl.get('hzero.common.basicLayout.passwordReset').d('、系统密码为初始密码，')}
                {intl
                  .get('hzero.common.basicLayout.safeMessage1')
                  .d('为保证消息的正常接收及您的账户安全，请前往')}
                <span className="user-info">
                  &nbsp;
                  {intl.get('hzero.common.basicLayout.userInfo').d('个人中心')}
                  &nbsp;
                </span>
                {intl.get('hzero.common.basicLayout.safeMessage2').d('进行修改。')}
              </p>
            </div>
          )}
        </div>
        <div className="self-modal-footer">
          <Button
            type="primary"
            className="go-info"
            onClick={() => {
              gotoTab({ pathname: '/hiam/user/info' });
              this.handleModalVisibie(null);
            }}
          >
            {intl.get('hzero.common.basicLayout.userInfo').d('个人中心')}
          </Button>
        </div>
      </Modal>
    );
  }

  render() {
    // const { needShowModal } = this.state;
    // if (needShowModal) {
    return this.renderCheckModal();
    // } else {
    // return null;
    // }
  }
}

export default connect(
  ({ user = {} }) => ({
    selfModalVisible: user.selfModalVisible,
    currentUser: user.currentUser,
  }),
  (dispatch) => ({
    dispatch,
    gotoTab: (location, state) => dispatch(routerRedux.push(location, state)),
  })
)(DefaultCheckUserSafe);
