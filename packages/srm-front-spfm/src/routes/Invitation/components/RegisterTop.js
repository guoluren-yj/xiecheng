/**
 * 我发出的邀约上面的部分
 * @date: 2018-8-4
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React from 'react';
import intl from 'utils/intl';
import { Button, Modal, Input, Tag, Icon, Tooltip } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

// import picture from '@/assets/illustrate-cooperation.png';
import styles from '../index.less';

const { TextArea } = Input;
/**
 * 我发出的邀约上面的部分
 * @extends {Component} - React.Component
 * @reactProps {String} companyName公司名
 * @reactProps {Boolean} isSupplier true-我是供应商
 * @reactProps {Date} invitingTime邀请时间
 * @reactProps {String} inviteRemark邀请备注
 * @reactProps {String} status send 我发出 received 我收到
 * @return React.element
 */
export default class SendTop extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      rejectModalVisible: false,
      remark: '',
    };
  }

  /**
   * 打开侧边模态框
   */
  @Bind()
  showModal() {
    this.props.onShowDrawer();
  }

  // 显示拒绝弹窗
  @Bind()
  displayRejectModal() {
    this.setState({
      rejectModalVisible: true,
    });
  }

  // 隐藏拒绝弹窗
  @Bind()
  hideRejectModal() {
    this.setState({ rejectModalVisible: false });
  }

  // 审批同意
  @Bind()
  handleApprovalAgree() {
    this.props.onHandleApprovalAgree();
  }

  // 改变拒绝说明
  @Bind()
  handleChangeRemark(e) {
    this.setState({
      remark: e.target.value,
    });
  }

  // 审批拒绝
  @Bind()
  handleApprovalReject() {
    this.hideRejectModal();
    this.props.onHandleApprovalReject(this.state.remark);
  }

  render() {
    const { isSupplier, invitingInfo = {}, inviteReg = {}, agree, reject } = this.props;
    return (
      <div className={styles['agree-top']}>
        <div className={styles['agree-word']}>
          {/* 判断是供应商还是客户 */}
          {isSupplier ? (
            <p style={{ fontSize: 16 }}>
              {intl.get(`spfm.disposeInvite.view.message.turnTo`).d('我向')}
              <span onClick={this.showModal} style={{ paddingLeft: 5 }} className={styles.company}>
                {invitingInfo.companyShortName}
              </span>
              {intl
                .get(`spfm.disposeInvite.view.message.regiserTopOne`)
                .d('发出注册邀约，邀请它成为我的【客户】')}
            </p>
          ) : (
            <p style={{ fontSize: 16 }}>
              {intl.get(`spfm.disposeInvite.view.message.turnTo`).d('我向')}
              <Tooltip
                title={intl
                  .get('spfm.disposeInvite.view.message.noRegiserTooltip')
                  .d('该企业未注册，无法查看企业信息')}
              >
                <span style={{ padding: '0 5px' }} className={styles.company}>
                  {inviteReg.supplierName}
                </span>
              </Tooltip>
              ,{intl.get(`spfm.disposeInvite.view.message.registerTopTwo`).d('发出注册邀约')}
            </p>
          )}
          {/* <p style={{ color: '#999', marginBottom: 20 }}>
            <span style={{ paddingRight: 15 }}>
              {intl.get(`spfm.disposeInvite.model.purchaserCooperation.processDate`).d('邀请时间')}
              ：{invitingInfo.creationDate}
            </span>
            <span style={{ paddingRight: 15 }}>
              {intl
                .get(`spfm.disposeInvite.model.purchaserCooperation.inviteRegisterRemark`)
                .d('邀请说明')}
              ：
              {inviteReg.inviteRegisterRemark ||
                intl.get(`spfm.disposeInvite.view.message.noInviteRegisterRemark`).d('暂无说明')}
            </span>
          </p> */}
          <React.Fragment>
            {invitingInfo.processStatus === 'APPROVED' && (
              <Tag color="green">
                <Icon type="check-circle" theme="filled" className={styles.tag} />
                {intl.get(`spfm.disposeInvite.view.message.tag.approved`).d('该邀约已同意')}
              </Tag>
            )}
            {invitingInfo.processStatus === 'REJECT' && (
              <Tag color="red">
                <Icon type="close-circle" theme="filled" className={styles.tag} />
                {intl.get(`spfm.disposeInvite.view.message.tag.reject`).d('该邀约已拒绝')}
              </Tag>
            )}
            {invitingInfo.processStatus === 'INVESTIGATE' && (
              <Tag color="blue">
                <Icon type="minus-circle" theme="filled" className={styles.tag} />
                {intl.get(`spfm.disposeInvite.view.message.tag.processing`).d('正在处理')}
              </Tag>
            )}
            {(invitingInfo.processStatus === 'SUBMIT' ||
              invitingInfo.processStatus === 'INVESTIGATE_APPROVING') &&
              (!isSupplier ? (
                <React.Fragment>
                  <Button type="primary" onClick={() => this.handleApprovalAgree()} loading={agree}>
                    {intl.get(`spfm.disposeInvite.view.option.approve`).d('审批')}
                  </Button>
                  <Button
                    style={{ marginLeft: 8 }}
                    onClick={() => this.displayRejectModal()}
                    loading={reject}
                  >
                    {intl.get(`spfm.disposeInvite.view.option.refuse`).d('拒绝')}
                  </Button>
                </React.Fragment>
              ) : (
                <Tag color="blue">
                  <Icon type="minus-circle" theme="filled" className={styles.tag} />
                  {intl.get(`spfm.disposeInvite.view.message.tag.processing`).d('正在处理')}
                </Tag>
              ))}
          </React.Fragment>
        </div>
        {/* <div>
          <img src={picture} alt="" />
        </div> */}
        <Modal
          title={intl.get(`spfm.disposeInvite.view.modal.reject.title`).d('拒绝原因')}
          visible={this.state.rejectModalVisible}
          onCancel={this.hideRejectModal}
          onOk={this.handleApprovalReject}
          okText={intl.get(`spfm.disposeInvite.view.button.reject`).d('拒绝')}
        >
          <TextArea
            autosize={{ minRows: 6, maxRows: 12 }}
            value={this.state.remark}
            onChange={this.handleChangeRemark}
          />
        </Modal>
      </div>
    );
  }
}
