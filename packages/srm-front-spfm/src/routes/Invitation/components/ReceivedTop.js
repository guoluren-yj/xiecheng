/**
 * 我收到的邀约上面的部分
 * @date: 2018-8-4
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React from 'react';
import { Modal, Input, Tag, Icon, Form, Col, Row } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isUndefined, isEmpty } from 'lodash';
import { Button } from 'components/Permission';
import intl from 'utils/intl';
// import picture from '@/assets/illustrate-cooperation.png';
import PrivacyPolicy from './PrivacyPolicy';
import styles from '../index.less';
import MultiSelectModal from './MultiSelectModal';

const { TextArea } = Input;

const FormItem = Form.Item;

@Form.create({ fieldNameProp: null })
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
export default class ReceivedTop extends React.Component {
  constructor(props) {
    super(props);
    props.onPolicyRef(this);
    this.state = {
      rejectModalVisible: false,
      remark: '',
      supplierCategoryModal: false,
      selectedChildRows: [],
      initialSelect: [], // 确认后模态框的值
      changedFlag: false, // 是否未确认多选模态框
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
   * 打开合并单据公司信息侧滑
   */
  @Bind()
  showMergeModal(id) {
    this.props.onShowMergeDrawer(id);
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
    const {
      form: { validateFields = (e) => e },
      invitingInfo = {},
    } = this.props;
    const {
      multiSupplierCategoryId = '',
      multiSupplierCategoryDesc = '',
      multiSupplierCategoryDTOS = [],
    } = invitingInfo;
    const newSupplierCategoryIdList =
      (multiSupplierCategoryId && multiSupplierCategoryId.split(',')) || [];
    const newSupplierCategoryCode =
      (multiSupplierCategoryDesc && multiSupplierCategoryDesc.split(',')) || [];
    const newSelectedChildRows = multiSupplierCategoryDTOS || [];
    const newInitialSelect = multiSupplierCategoryDTOS || [];

    validateFields((err) => {
      if (!err) {
        // const { supplierCategoryIdList = [] } = values;
        this.props.onShowSuppleModal(
          newSupplierCategoryIdList,
          newSupplierCategoryCode,
          newSelectedChildRows,
          newInitialSelect
        );
      }
    });
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

  searchButton() {
    if (this.state.loading) {
      return <Icon key="search" type="loading" />;
    } else {
      return (
        <Icon
          key="search"
          type="search"
          onClick={() => this.fetchSupplierDate()}
          style={{ cursor: 'pointer', color: '#666' }}
        />
      );
    }
  }

  @Bind()
  fetchSupplierDate(page = {}) {
    const { onQuerySupplierCategoryDate } = this.props;
    const fieldValues = isUndefined(this.form) ? {} : this.form.getFieldsValue();
    onQuerySupplierCategoryDate({
      page,
      ...fieldValues,
    });
    this.setState({ supplierCategoryModal: true });
  }

  @Bind()
  handleFecthRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  /**
   * 更新modal项目采购负责人列表数据
   * @param {Array} record 弹窗中选择的多条采购负责人数据
   */
  @Bind()
  saveRecordRows() {
    const { form } = this.props;
    const { selectedChildRows = [] } = this.state;
    const supplierCategoryCode = selectedChildRows.map((o) => o.supplierCategoryDescription);
    const supplierCategoryIdList = selectedChildRows.map((o) => o.supplierCategoryId);
    if (supplierCategoryCode) {
      form.registerField('supplierCategoryCode');
      form.setFieldsValue({
        supplierCategoryCode,
        multiSupplierCategoryId: String(supplierCategoryIdList),
      });
    }
    if (supplierCategoryIdList) {
      form.registerField('supplierCategoryIdList');
      form.setFieldsValue({ supplierCategoryIdList });
    }
    this.setState({
      tags: supplierCategoryIdList,
      initialSelect: selectedChildRows,
      supplierCategoryIdList,
      supplierCategoryCode,
      supplierCategoryModal: false,
    });
  }

  // 多选框
  @Bind()
  handleRowSelect(selectedRowKeys, selectedChild, rowSelect) {
    if (rowSelect) {
      const includeFlag = selectedRowKeys.indexOf(rowSelect.supplierCategoryId);
      if (includeFlag >= 0) {
        selectedRowKeys.splice(includeFlag, 1);
        selectedChild.splice(includeFlag, 1);
      } else {
        selectedRowKeys.push(rowSelect.supplierCategoryId);
        selectedChild.push(rowSelect);
      }
    }
    const rowIds = selectedChild.map((ele) => ele.supplierCategoryId);
    const { selectedChildRows = [] } = this.state;
    const newRows = selectedChildRows.filter(
      (obj) => selectedRowKeys.findIndex((ele) => obj.supplierCategoryId === ele) !== -1
    );
    const dataSource = newRows.filter((ele) => !rowIds.includes(ele.supplierCategoryId));
    this.setState({
      changedFlag: true,
      selectedRowKeys,
      selectedChildRows: [...dataSource, ...selectedChild],
    });
  }

  @Bind()
  handleCancelModal() {
    this.setState({ supplierCategoryModal: false, changedFlag: false });
  }

  @Bind()
  handleClear() {
    const { form } = this.props;
    form.setFieldsValue({
      supplierCategoryIdList: [],
      supplierCategoryCode: [],
      multiSupplierCategoryId: '',
    });
    this.setState({
      tags: [],
      supplierCategoryIdList: [],
      supplierCategoryCode: [],
      selectedChildRows: [],
      selectedRowKeys: [],
      initialSelect: [],
    });
  }

  render() {
    const {
      isSupplier,
      invitingInfo = {},
      loading,
      agree,
      reject,
      refuseLoading,
      approvalLoading,
      privacyPolicyClickVisible,
      supplierCategoryDate,
      investigateStatus,
      finalFlag,
      headerInfo,
      onHandleInvestigateModal,
      CusForm,
      status,
      pStatus,
      privacyPolicyText = [],
      platformPolicyText = [],
      detail,
      visableSubmitButtons = false,
      yesOrNoFlag,
      onRef,
      customizeForm = (e) => e,
      form,
      onHandlePolicyModal = () => {},
      purchaserDisabled = false,
    } = this.props;
    const {
      supplierCategoryModal,
      selectedRowKeys,
      selectedChildRows,
      initialSelect,
      changedFlag,
      rejectModalVisible,
    } = this.state;
    const lovClassNames = ['lov-input'];
    lovClassNames.push('lov-suffix');
    const purAgentModel = {
      selectedChildRows: changedFlag ? selectedChildRows : initialSelect,
      supplierCategoryModal,
      supplierCategoryDate,
      onRef: this.handleFecthRef,
      // onChange: this.handleShowPurAgent,
      handleCancelModal: this.handleCancelModal,
      onSaveRecord: this.saveRecordRows,
      fetchSupplierDate: this.fetchSupplierDate,
      handleRowSelect: this.handleRowSelect,
      selectedRowKeys: changedFlag
        ? selectedRowKeys
        : initialSelect.map((ele) => ele.supplierCategoryId),
    };
    const privacyPolicyProps = {
      form,
      privacyPolicyText,
      platformPolicyText,
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
              {invitingInfo && invitingInfo.mergerInvitationFlag === 1 ? (
                invitingInfo.vicePartnerInviteSearchDTO &&
                invitingInfo.vicePartnerInviteSearchDTO.map((item, index) => {
                  return (
                    <span>
                      <span
                        style={{ paddingRight: 5 }}
                        onClick={() => this.showMergeModal(item.sourceKey)}
                        className={styles.company}
                      >
                        {item.companyName}
                      </span>
                      {index + 1 < invitingInfo.vicePartnerInviteSearchDTO.length && (
                        <span>，</span>
                      )}
                    </span>
                  );
                })
              ) : (
                <span
                  style={{ paddingRight: 5 }}
                  onClick={this.showModal}
                  className={styles.company}
                >
                  {invitingInfo.companyName}
                </span>
              )}
              {intl
                .get(`spfm.disposeInvite.view.message.agreeTopTitle.purchaser`)
                .d('向您发出了合作邀约，邀请您成为它的【供应商】')}
            </p>
          )}
          <CusForm
            dataSource={invitingInfo}
            yesOrNoFlag={yesOrNoFlag}
            status={status}
            pStatus={pStatus}
            onRef={onRef}
            purchaserDisabled={purchaserDisabled}
          />
          {invitingInfo.privateFlag ? (
            <p style={{ marginBottom: 20 }}>
              {intl
                .get(`spfm.disposeInvite.model.purchaserCooperation.privateFlagMetion`)
                .d('邀请您为私有化供应商默认您不被其他企业在[发现供应商]功能中发现')}
            </p>
          ) : null}
          {isEmpty(invitingInfo) ||
          purchaserDisabled ||
          invitingInfo.processStatus === 'DISABLED' ? null : isSupplier ? (
            // 邀请成为客户
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
              <div>
                {invitingInfo.processStatus === 'SUBMIT' ||
                invitingInfo.processStatus === 'INVESTIGATE_APPROVING' ? (
                  detail.processStatus === 'APPROVING' ? (
                    <Tag color="blue">
                      <Icon type="minus-circle" theme="filled" className={styles.tag} />
                      {intl.get(`spfm.disposeInvite.view.message.tag.processing`).d('正在处理')}
                    </Tag>
                  ) : (
                    visableSubmitButtons && (
                      <React.Fragment>
                        <Button
                          type="primary"
                          onClick={() => this.handleApprovalAgree()}
                          loading={agree}
                          permissionList={[
                            {
                              code: `srm.partner.my-partner.invitation-list.ps.button.agree`,
                              type: 'button',
                              meaning: '企业合作邀约-按钮组',
                            },
                          ]}
                        >
                          {intl.get(`hzero.common.button.agree`).d('同意')}
                        </Button>
                        <Button
                          style={{ marginLeft: 8 }}
                          onClick={() => this.displayRejectModal()}
                          loading={reject}
                          permissionList={[
                            {
                              code: `srm.partner.my-partner.invitation-list.ps.button.agree`,
                              type: 'button',
                              meaning: '企业合作邀约-按钮组',
                            },
                          ]}
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
                  <React.Fragment>
                    <Button
                      type="primary"
                      onClick={this.showSuppleModal}
                      permissionList={[
                        {
                          code: `srm.partner.my-partner.invitation-list.ps.button.agree`,
                          type: 'button',
                          meaning: '企业合作邀约-按钮组',
                        },
                      ]}
                    >
                      {intl.get(`spfm.disposeInvite.view.message.agree`).d('同意合作')}
                    </Button>
                    <Button
                      style={{ marginLeft: 8 }}
                      loading={refuseLoading || loading}
                      onClick={this.showRefuseModal}
                      permissionList={[
                        {
                          code: `srm.partner.my-partner.invitation-list.ps.button.agree`,
                          type: 'button',
                          meaning: '企业合作邀约-按钮组',
                        },
                      ]}
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
                )}
              </div>
            )
          ) : // 邀请成为供应商
          invitingInfo.processStatus === 'APPROVED' ||
            invitingInfo.processStatus === 'REJECT' ||
            invitingInfo.processStatus === 'SUBMIT' ||
            invitingInfo.processStatus === 'INVESTIGATE' ||
            invitingInfo.processStatus === 'INVESTIGATE_APPROVING' ? (
              <React.Fragment>
                {invitingInfo.processStatus === 'APPROVED' && (
                <Tag color="green">
                  <Icon type="check-circle" theme="filled" className={styles.tag} />
                  {intl.get(`spfm.disposeInvite.view.message.tag.approved`).d('该邀约已同意')}
                </Tag>
              )}
                {invitingInfo.processStatus === 'REJECT' && (
                <React.Fragment>
                  <Tag color="red">
                    <Icon type="close-circle" theme="filled" className={styles.tag} />
                    {intl.get(`spfm.disposeInvite.view.message.tag.reject`).d('该邀约已拒绝')}
                  </Tag>
                  {investigateStatus === 'REJECT' && finalFlag && (
                    <div
                      title={headerInfo.rejectRemark}
                      style={{
                        marginTop: 8,
                        fontWeight: 500,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {intl.get('spfm.disposeInvite.view.message.refuseReason').d('拒绝原因')}：
                      {headerInfo.rejectRemark}
                    </div>
                  )}
                </React.Fragment>
              )}
                {(invitingInfo.processStatus === 'SUBMIT' ||
                invitingInfo.processStatus === 'INVESTIGATE_APPROVING') && (
                <Tag color="blue">
                  <Icon type="minus-circle" theme="filled" className={styles.tag} />
                  {intl.get(`spfm.disposeInvite.view.message.tag.processing`).d('正在处理')}
                </Tag>
              )}
                {invitingInfo.processStatus === 'INVESTIGATE' && privacyPolicyClickVisible && (
                <PrivacyPolicy {...privacyPolicyProps} />
              )}
              </React.Fragment>
          ) : (
            <React.Fragment>
              {privacyPolicyClickVisible && <PrivacyPolicy {...privacyPolicyProps} />}
              <Button
                type="primary"
                loading={approvalLoading || loading}
                onClick={this.handleAgree}
                permissionList={[
                  {
                    code: `srm.partner.my-partner.invitation-list.ps.button.agree`,
                    type: 'button',
                    meaning: '企业合作邀约-按钮组',
                  },
                ]}
              >
                {intl.get(`spfm.disposeInvite.view.option.agree`).d('同意合作')}
              </Button>
              <Button
                style={{ marginLeft: 8 }}
                loading={refuseLoading || loading}
                onClick={this.showRefuseModal}
                permissionList={[
                  {
                    code: `srm.partner.my-partner.invitation-list.ps.button.agree`,
                    type: 'button',
                    meaning: '企业合作邀约-按钮组',
                  },
                ]}
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
                  {intl.get(`spfm.disposeInvite.view.button.investigateReject`).d('调查表拒绝')}
                </Button>
              ) : null}
            </React.Fragment>
          )}
        </div>
        {/* <div>
          <img src={picture} alt="" />
        </div> */}
        {supplierCategoryModal && <MultiSelectModal {...purAgentModel} Key="new" />}
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
                code: 'SPFM.PARTNER_INVITE.APPROVAL_REJECT', // 必传，和unitCode一一对应
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
                          // autosize={{ minRows: 6, maxRows: 12 }}
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
