import React from 'react';
import ReactDOM from 'react-dom';
import classnames from 'classnames';
import { Bind } from 'lodash-decorators';
import { Modal, Icon, Tooltip } from 'hzero-ui';

import intl from 'utils/intl';
import { getCurrentUserId } from 'utils/utils';
import request from 'utils/request';
import { SRM_PLATFORM } from '_utils/config';
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';

import robotImg from '../../assets/help_robot.svg';
import './index.less';

const helpRobotImgSize = 38;
@formatterCollections({code: ['srm.helpRobot', 'hzero.common']})
export default class HelpRobot extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false,
      helpRobotUrl: process.env.HELP_ROBOTR_URL,
      helpRobotType: null, // 机器人类型
      defaultShow: true, // 默认展示
      controlFlag: true, // 控制显示隐藏
      firstShow: true, // 首次打开
      noticeShow: false, // 控制提示展示
      custmoizePosition: null,
      isDestroyModal: true,
    }
  }

  // 监听智能客服api接口消息
  componentWillMount() {
    window.addEventListener('message', this.onFrameMsg.bind(this), false);
  }
  // 卸载智能客服api接口消息
  componentWillUnmount() {
    window.removeEventListener('message', this.onFrameMsg.bind(this), false);
  }

  componentDidMount() {
    this.showRobot();
    this.checkHelpRobotType().then(res => {
      this.setState({
        helpRobotType: res? 'zc': 'default',
      });
    });
  }

  @Bind()
  showRobot() {
    setTimeout(() => {
      this.setState({ defaultShow: false });
    }, 5000);
  }

  @Bind()
  checkHelpRobotType() {
    return request(`${SRM_PLATFORM}/v1/cust-service-configs/${getCurrentUserId()}`);
  }

  @Bind()
  handleOpenModal() {
    const { helpRobotType, controlFlag } = this.state;
    if (helpRobotType !== 'zc') {
      this.handleModalVisible(true);
    } else {
      this.setState({
        controlFlag: !controlFlag,
      });
    }
  }

  @Bind()
  handleModalVisible(flag = false, destroyFlag = true) {
    const { helpRobotUrl } = this.state;
    if(helpRobotUrl) {
      this.setState({
        modalVisible: flag,
        isDestroyModal: destroyFlag,
      })
    } else {
      notification.error({
        message: intl.get('srm.helpRobot.view.message.error').d('智能客服失去连接...'),
      });
    }
  }

  @Bind()
  renderZCRobot() {
    const element = document.getElementById('zhichiScript');
    // 防止重复运行
    if (!element) {
      (function (w, d, e, x) {
        w[e] = function () {
          w.cbk = w.cbk || [];
          w.cbk.push(arguments);
        }
        x = d.createElement('script');
        x.async = true;
        x.id = 'zhichiScript';
        x.className= 'help-robot-img';
        x.src = 'https://goinglink.sobot.com/chat/frame/v2/entrance.js?sysnum=4048160904314c57affa35f46daf9d4d';
        d.body.appendChild(x);
      })(window, document, 'zc');
      zc("config",{
        custom:true, //设置自定义生效 第二步
      })
    }
  }

  onFrameMsg(e){
    // 只关闭不重新加载
    if (e.data.type === 'MIN_CHAT') {
      // 隐藏iframe...
    }
    // 关闭并刷新frame
    else if (e.data.type === 'END_CHAT') {
      // 清空iframe的src地址以重新加载
      this.setState({
        url: ''
      }, () => {
        this.closeRobot();
      })
    }
  }

  @Bind()
  renderActionButton() {
    return (
      <div className='help-robot-action-button'>
        <Icon type="minus" onClick={() => {this.handleModalVisible(false, false)}} />
        <Icon type="close" onClick={() => {this.handleModalVisible(false)}} />
      </div>
    )
  }

  @Bind()
  handleDragEnd(event) {
    let custmoizePosition = event.clientY;
    const root = document.getElementById('root');
    const { top, bottom } = root.getBoundingClientRect();
    if( custmoizePosition < top) {
      // 离顶部预留点距离
      custmoizePosition = top + 5;
    } else if (custmoizePosition > bottom - helpRobotImgSize) {
      // 防拖出
      custmoizePosition = bottom - helpRobotImgSize;
    } else {
      // 中线
      custmoizePosition -= helpRobotImgSize/2;
    }
    this.setState({ custmoizePosition });
  }

  @Bind()
  handleMouseOver() {
    this.setState({ defaultShow: false, firstShow: false, noticeShow: true });
  }

  @Bind()
  handleMouseOut() {
    this.setState({ noticeShow: false });
  }

  render() {
    const {
      modalVisible,
      helpRobotUrl,
      helpRobotType,
      defaultShow,
      controlFlag,
      noticeShow,
      firstShow,
      custmoizePosition,
      isDestroyModal
    } = this.state;
    const root = document.getElementById('root');
    return ReactDOM.createPortal(
      (<React.Fragment>
        <div
          className={classnames(
            'help-robot',
            { 'help-robot-control': controlFlag }, // 可控制显示隐藏
            { 'help-robot-init': defaultShow },  // 首次显示
            { 'help-robot-unControl': !controlFlag  }, // 不可控制显示隐藏
          )}
          style={ custmoizePosition? { top: custmoizePosition } : { bottom: '100px' } }
          draggable
          onDragEnd={this.handleDragEnd}
        >
          <Tooltip
            placement='top'
            title={
              helpRobotType === 'zc' ?
                intl.get('srm.helpRobot.view.title.onlineRobot').d('在线客服')
              :
                intl.get('srm.helpRobot.view.title.smartRobot').d('智能客服')
            }
            visible={noticeShow || (firstShow && defaultShow)}
          >
            <img
              draggable="false"
              className='help-robot-img'
              src={robotImg}
              onMouseOver={this.handleMouseOver}
              onMouseOut={this.handleMouseOut}
              alt="help-robot-img"
              width={helpRobotImgSize}
              height={helpRobotImgSize}
              onClick={this.handleOpenModal}
            />
            {helpRobotType === 'zc' && this.renderZCRobot()}
          </Tooltip>
        </div>
        <Modal
          visible={ modalVisible }
          footer={null}
          width={600}
          mask={false}
          bodyStyle={{ overflowY: 'hidden' }}
          onCancel={() => {this.handleModalVisible(false)}}
          wrapClassName={classnames("ant-modal-sidebar-right", "help-robot-modal")}
          transitionName="move-right"
          destroyOnClose={isDestroyModal}
          closable={false}
        >
          {this.renderActionButton()}
          <Tooltip placement='bottom' title={intl.get('hzero.common.button.up').d('收起')}>
            <Icon type="menu-unfold" className='close-modal-icon' onClick={() => {this.handleModalVisible(false, false)}} />
          </Tooltip>
          <iframe
            src={helpRobotUrl}
            id="iframe"
            name="iframe" frameBorder="none" width="100%" height="100%" style={{ border: 'none' }}
          />
        </Modal>
      </React.Fragment>),
      root
    )
  }
}

