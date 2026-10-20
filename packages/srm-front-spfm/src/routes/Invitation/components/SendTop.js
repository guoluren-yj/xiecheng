/**
 * 我发出的邀约上面的部分
 * @date: 2018-8-4
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React from 'react';
import intl from 'utils/intl';
import { Modal, Input, Tag, Icon, Form, Col, Row } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { Button } from 'components/Permission';

import styles from '../index.less';

const { TextArea } = Input;

const FormItem = Form.Item;

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
@Form.create({ fieldNameProp: null })
export default class SendTop extends React.Component {
  constructor(props) {
    super(props);
    props.onPolicyRef(this);
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
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.hideRejectModal();
        const { refuseReason } = values;
        this.props.onHandleApprovalReject(this.state.remark || refuseReason);
      }
    });
  }

  render() {
    const {
      onRef = () => {},
      isSupplier,
      invitingInfo = {},
      agree,
      reject,
      onHandleInvestigateModal,
      CusForm,
      status,
      pStatus,
      detail,
      visableSubmitButtons = false,
      customizeForm = (e) => e,
      form,
    } = this.props;
    const { rejectModalVisible } = this.state;
    return (
      <div className={styles['agree-top']}>
        <div className={styles['agree-word']}>
          {/* 判断是供应商还是客户 */}
          {isSupplier ? (
            <p style={{ fontSize: 16 }}>
              {intl.get(`spfm.disposeInvite.view.message.turnTo`).d('我向')}
              <span onClick={this.showModal} style={{ paddingLeft: 5 }} className={styles.company}>
                {invitingInfo.inviteCompanyName}
              </span>
              {intl
                .get(`spfm.disposeInvite.view.message.sendTopOne`)
                .d('发出合作邀约，邀请它成为我的【客户】')}
            </p>
          ) : (
            <p style={{ fontSize: 16 }}>
              {intl.get(`spfm.disposeInvite.view.message.turnTo`).d('我向')}
              <span style={{ padding: '0 5px' }}>{invitingInfo.inviteCompanyName}</span>
              {intl
                .get(`spfm.disposeInvite.view.message.sendTopTwo`)
                .d('发出合作邀约，邀请它成为我的【供应商】')}
            </p>
          )}
          <CusForm dataSource={invitingInfo} status={status} pStatus={pStatus} onRef={onRef} />
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
            {invitingInfo.processStatus === 'WITHDRAWN' && (
              <Tag color="rgba(0,0,0,.45)">
                <Icon type="rollback" theme="filled" className={styles.tag} />
                {intl.get(`spfm.disposeInvite.view.message.tag.withdraw`).d('该邀约已撤回')}
              </Tag>
            )}
            {(invitingInfo.processStatus === 'SUBMIT' ||
              invitingInfo.processStatus === 'INVESTIGATE_APPROVING') &&
              (!isSupplier ? (
                detail.processStatus === 'APPROVING' ? (
                  <Tag color="blue">
                    <Icon type="minus-circle" theme="filled" className={styles.tag} />
                    {intl.get(`spfm.disposeInvite.view.message.tag.processing`).d('正在处理')}
                  </Tag>
                ) : (
                  visableSubmitButtons && (
                    <React.Fragment>
                      <Button
                        permissionList={[
                          {
                            code: `srm.partner.my-partner.invitation-list.ps.button.agree`,
                            type: 'button',
                            meaning: '企业合作邀约-按钮组',
                          },
                        ]}
                        type="primary"
                        onClick={() => this.handleApprovalAgree()}
                        loading={agree}
                      >
                        {intl.get(`hzero.common.button.agree`).d('同意')}
                      </Button>
                      <Button
                        permissionList={[
                          {
                            code: `srm.partner.my-partner.invitation-list.ps.button.agree`,
                            type: 'button',
                            meaning: '企业合作邀约-按钮组',
                          },
                        ]}
                        style={{ marginLeft: 8 }}
                        onClick={() => this.displayRejectModal()}
                        loading={reject}
                      >
                        {intl.get(`spfm.disposeInvite.view.option.inviteRefuse`).d('邀约拒绝')}
                      </Button>
                      {invitingInfo.investigateTemplateId ? (
                        <Button
                          style={{ marginLeft: 8 }}
                          onClick={onHandleInvestigateModal}
                          permissionList={[
                            {
                              code: `srm.partner.my-partner.invitation-list.ps.button.agree`,
                              type: 'button',
                              meaning: '企业合作邀约-按钮组',
                            },
                          ]}
                        >
                          {intl
                            .get(`spfm.disposeInvite.view.button.investigateReject`)
                            .d('调查表拒绝')}
                        </Button>
                      ) : null}
                    </React.Fragment>
                  )
                )
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
        {rejectModalVisible && (
          <Modal
            title={intl.get(`spfm.disposeInvite.view.modal.reject.title`).d('拒绝原因')}
            visible={rejectModalVisible}
            onCancel={this.hideRejectModal}
            onOk={this.handleApprovalReject}
            okText={intl.get(`spfm.disposeInvite.view.button.reject`).d('拒绝')}
            width={640}
          >
            {customizeForm(
              {
                code: 'SPFM.PARTNER_INVITE.INVITE_REFUSE', // 必传，和unitCode一一对应
                form,
              },
              <Form layout="horizontal">
                <Row>
                  <Col md={24} span={24}>
                    <FormItem
                      // label={intl.get(`spfm.disposeInvite.view.message.refuseReason`).d('拒绝原因')}
                      labelCol={{ span: 0 }}
                      wrapperCol={{ span: 24 }}
                    >
                      {form.getFieldDecorator(
                        'refuseReason',
                        {}
                      )(
                        <TextArea
                          style={{ width: '100%' }}
                          rows={16}
                          value={this.state.remark}
                          onChange={this.handleChangeRemark}
                        />
                      )}
                    </FormItem>
                  </Col>
                </Row>
              </Form>
            )}
          </Modal>
        )}
      </div>
    );
  }
}
