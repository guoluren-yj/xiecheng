/**
 * 我收到的邀约上面的部分
 * @date: 2018-8-4
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React from 'react';
import { Button, Modal, Input, Tag, Icon, Form } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isEmpty } from 'lodash';

import intl from 'utils/intl';
// import picture from '@/assets/illustrate-cooperation.png';
import PrivacyPolicy from './PrivacyPolicy';
import styles from '../index.less';

const { TextArea } = Input;
/**
 * 我收到的邀约上面的部分
 * @extends {Component} - React.Component
 * @reactProps {String} companyName公司名
 * @reactProps {Boolean} isSupplier true-我是客户
 * @reactProps {Date} invitingTime邀请时间
 * @reactProps {String} inviteRemark邀请备注
 * @reactProps {String} status send 我发出 received 我收到
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
export default class ReceivedTop extends React.Component {
  constructor(props) {
    super(props);
    props.onPolicyRef(this);
    this.state = {
      rejectModalVisible: false,
      remark: '',
    };
  }

  /**
   * 同意邀约
   */
  @Bind()
  handleAgree() {
    this.props.onAgree();
  }

  /**
   * 打开公司信息侧滑
   */
  @Bind()
  showModal() {
    this.props.onShowDrawer();
  }

  /**
   * 打开拒绝modal
   */
  @Bind()
  showRefuseModal() {
    this.props.onShowRefuseModal();
  }

  /**
   * 打开同意合作modal
   */
  @Bind()
  showSuppleModal() {
    this.props.onShowSuppleModal();
  }

  // 显示拒绝弹窗
  @Bind()
  displayRejectModal() {
    this.setState({
      rejectModalVisible: true,
    });
  }

  // 同意
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

  render() {
    const {
      form,
      isSupplier,
      invitingInfo = {},
      loading,
      agree,
      reject,
      refuseLoading,
      approvalLoading,
      privacyPolicyClickVisible,
      privacyPolicyText = [],
      onHandlePolicyModal = () => {},
    } = this.props;
    const privacyPolicyProps = {
      form,
      privacyPolicyText,
      onHandlePolicyModal,
    };

    return (
      <div className={styles['agree-top']}>
        <div className={styles['agree-word']}>
          {/* 判断是供应商还是客户 */}
          {isSupplier ? (
            <p style={{ fontSize: 16 }}>
              <span style={{ paddingRight: 5 }}>{invitingInfo.companyName}</span>
              {intl
                .get(`spfm.disposeInvite.view.message.agreeTopTitle.supplie`)
                .d('向您发出了合作邀约，邀请您成为它的【客户】')}
            </p>
          ) : (
            <p style={{ fontSize: 16 }}>
              <span style={{ paddingRight: 5 }} onClick={this.showModal} className={styles.company}>
                {invitingInfo.companyName}
              </span>
              {intl
                .get(`spfm.disposeInvite.view.message.agreeTopTitle.link`)
                .d(
                  '通过供应链管理平台－甄采云（going-link）邀请贵司进行在线注册，实现进一步的在线合作交流。'
                )}
            </p>
          )}
          {isSupplier ? (
            <p style={{ color: '#999', marginBottom: 20 }}>
              <span style={{ paddingRight: 15 }}>
                {intl
                  .get(`spfm.disposeInvite.model.purchaserCooperation.processDate`)
                  .d('邀请时间')}
                ：{invitingInfo.creationDate}
              </span>
              <span style={{ paddingRight: 15 }}>
                {intl
                  .get(`spfm.disposeInvite.model.purchaserCooperation.inviteRemark`)
                  .d('邀请备注')}
                ：
                {invitingInfo.inviteRemark ||
                  intl.get(`spfm.disposeInvite.view.message.noRemark`).d('暂无备注')}
              </span>
              {intl
                .get(`spfm.disposeInvite.model.purchaserCooperation.levelTypeFlag`)
                .d('邀请类型')}
              ：
              {invitingInfo.levelTypeFlag === 0
                ? intl.get(`spfm.disposeInvite.model.purchaserCooperation.levelTypeOrg`).d('集团级')
                : intl
                    .get(`spfm.disposeInvite.model.purchaserCooperation..levelTypeCom`)
                    .d('公司级')}
            </p>
          ) : (
            ''
          )}
          {isEmpty(invitingInfo) ? null : isSupplier ? (
            invitingInfo.processStatus === 'APPROVED' ||
            invitingInfo.processStatus === 'REJECT' ||
            invitingInfo.processStatus === 'INVESTIGATE' ? (
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
              </React.Fragment>
            ) : (
              // invitingInfo.processStatus === 'INVESTIGATE' && (
              //   <span className={styles['agree-info']}>
              //     {intl.get(`spfm.disposeInvite.view.message.tag.investigate`).d('调查表填写中')}
              //   </span>)
              <div>
                {invitingInfo.processStatus === 'SUBMIT' ||
                invitingInfo.processStatus === 'INVESTIGATE_APPROVING' ? (
                  <React.Fragment>
                    <Button
                      type="primary"
                      onClick={() => this.handleApprovalAgree()}
                      loading={agree}
                    >
                      {intl.get(`spfm.disposeInvite.view.message.sendQuestionnaire`).d('审批')}
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
                  <React.Fragment>
                    <Button type="primary" onClick={this.showSuppleModal}>
                      {intl.get(`spfm.disposeInvite.view.message.agree`).d('同意合作')}
                    </Button>
                    <Button
                      style={{ marginLeft: 8 }}
                      loading={refuseLoading || loading}
                      onClick={this.showRefuseModal}
                    >
                      {intl.get(`spfm.disposeInvite.view.option.refuse`).d('拒绝')}
                    </Button>
                  </React.Fragment>
                )}
              </div>
            )
          ) : invitingInfo.processStatus === 'CERTIFICATED' ? (
            <React.Fragment>
              {invitingInfo.processStatus === 'CERTIFICATED' && (
                <Tag color="green">
                  <Icon type="check-circle" theme="filled" className={styles.tag} />
                  {intl.get(`spfm.disposeInvite.view.message.tag.certificated`).d('已完成企业认证')}
                </Tag>
              )}
            </React.Fragment>
          ) : (
            <div>
              {privacyPolicyClickVisible && <PrivacyPolicy {...privacyPolicyProps} />}
              <Button
                type="primary"
                loading={approvalLoading || loading}
                onClick={this.handleAgree}
              >
                {intl.get(`spfm.disposeInvite.view.option.agree`).d('同意合作')}
              </Button>
              <Button
                style={{ marginLeft: 8 }}
                loading={refuseLoading || loading}
                onClick={this.showRefuseModal}
              >
                {intl.get(`spfm.disposeInvite.view.option.refuse`).d('拒绝')}
              </Button>
            </div>
          )}
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
