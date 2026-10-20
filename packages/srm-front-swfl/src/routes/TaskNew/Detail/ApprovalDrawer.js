/* eslint-disable no-nested-ternary */
import React, { Component } from 'react';
import classnames from 'classnames';
import { Button, TextArea, SelectBox, Form } from 'choerodon-ui/pro';
import { Modal, Tooltip, Icon, Tag } from 'choerodon-ui';
import { Bind } from 'lodash-decorators';
import { isEmpty } from 'lodash';

import UploadButton from '_components/Upload/UploadButton';
import { BKT_HWFP } from 'utils/config';
import intl from 'utils/intl';

import { approveNameRenderTemp } from '@/utils/util';
import JumpModal from './JumpModal';
import styles from './index.less';

const { Sidebar } = Modal;

export default class ApprovalDrawer extends Component {
  constructor(props) {
    super(props);
    this.uploadButtonRef = null;
    this.textAreaRef = null;
    const { formDs } = props;
    const originValue = formDs.current.get('approvalOpinion');
    const result = originValue ? originValue.match(/\n|\r/g) : [];
    this.state = {
      jumpModalVisible: false,
      replyValue: originValue || '',
      count: result ? result.length : 0,
      validateValue: true,
    };
  }

  componentDidMount() {
    const { rejectJumpConfigRebutFlag = false, formDs, approvalType } = this.props;
    // 判断是否必输
    this.handleValidateValue();
    if (approvalType === 'Jumped') {
      if (rejectJumpConfigRebutFlag) {
        const rebutAutoJumpFlag = formDs.current.get('rebutAutoJumpFlag');
        formDs.current.getField('rebutAutoJumpFlag').set('required', rejectJumpConfigRebutFlag);
        formDs.current.set('rebutAutoJumpFlag', rebutAutoJumpFlag || 0);
      }
      formDs.current.getField('jumpedName').set('required', true);
    }
    setTimeout(() => {
      const target = document.getElementById('drawer-comment-textarea');
      // 监听粘贴事件，粘贴情况下，需要提前计算出换行数来修改maxLength
      if (target) {
        target.addEventListener('paste', this.handleMaxLength);
      }
    }, 10);
  }

  componentWillUnmount() {
    const target = document.getElementById('drawer-comment-textarea');
    if (target) {
      target.removeEventListener('paste', this.handleMaxLength);
    }
  }

  @Bind()
  onUploadButtonRef(ref) {
    this.uploadButtonRef = ref;
    const { uploadModalRef } = this.props;
    if (uploadModalRef && uploadModalRef.upload && ref) {
      // 从外边获取到已上传文件列表
      const uploadedFile = uploadModalRef.upload.getFileList();
      ref.setFileList(uploadedFile);
    }
  }

  @Bind()
  handleTextAreaRef(ref) {
    this.textAreaRef = ref;
  }

  @Bind()
  async handleValidateValue() {
    const { formDs } = this.props;
    const validate = await formDs.validate();
    this.setState({ validateValue: validate });
  }

  @Bind()
  handleMaxLength(event) {
    const paste = (event.clipboardData || window.clipboardData).getData('text');
    this.handleDeleteNewLine(paste);
  }

  @Bind()
  // 粘贴文本最后一个字符为换行符时，删除
  handleDeleteNewLine = (paste) => {
    // 最后一个值为换行符时，去除换行符
    if (
      paste &&
      (paste.charAt(paste.length - 1) === '\n' || paste.charAt(paste.length - 1) === '\r')
    ) {
      const newPaste = paste.substring(0, paste.length - 1);
      this.handleDeleteNewLine(newPaste);
    } else {
      let num = 0;
      if (paste.replace(/\n|\r/g, '').length > 3500) {
        // 粘贴进审批意见的值大于3500时，只需统计3500以内的换行符
        // 出现换行的位置
        let index = paste.indexOf('\n');
        // 有换行符且除换行以外的字数在3500内时。index-1即换行符前的字符
        while (index !== -1 && index - 1 - num < 3501) {
          num++;
          index = paste.indexOf('\n', index + 1);
        }
      }
      this.setState({ count: num });
    }
  };

  @Bind()
  handleToogleJumpModal() {
    this.setState({ jumpModalVisible: !this.state.jumpModalVisible });
  }

  @Bind()
  handleSubmitJumpData(jumpData) {
    const { approvalData, changeApprovalData } = this.props;
    approvalData.Jumped = jumpData;
    this.setState({
      jumpModalVisible: false,
    });
    changeApprovalData(approvalData);
  }

  @Bind()
  handleToogleVisible() {
    const { uploadModalRef } = this.props;
    if (uploadModalRef && uploadModalRef.upload && this.uploadButtonRef) {
      const uploadedFile = this.uploadButtonRef.getFileList() || [];
      uploadModalRef.upload.setFileList(uploadedFile);
      // 加 setTimeout 是为了确保Uploadmodal.upload 更新完
      setTimeout(() => {
        uploadModalRef.setFileList(uploadedFile);
      }, 0);
    }
    this.props.handleToogleVisible();
  }

  @Bind()
  renderNextNodeApprover() {
    const {
      approvalData,
      task: { owner, nextNodeApprover = [] },
    } = this.props;
    const isAddSign =
      owner && (owner.startsWith('AddSign') || owner.startsWith('ApproveAndAddSign'));
    if (!isAddSign && !isEmpty(nextNodeApprover)) {
      return nextNodeApprover.map(
        (node) =>
          (node.check === 'Y' || node.needAppoint === 'Y' || node.rejectedNeedAppoint === 'Y') && (
            <div style={{ marginBottom: '24px' }}>
              <div className={styles['label-col']}>
                {intl
                  .get('hwfp.task.view.option.addNextApprover', {
                    nextActName: node.nextActName,
                  })
                  .d(`指派【${node.nextActName}】审批人`)}
                <Tooltip
                  placement="bottom"
                  title={intl
                    .get('hwfp.task.view.option.addNextApproverHelp')
                    .d('指定该节点的审批人')}
                >
                  <Icon
                    type="help"
                    style={{
                      color: 'rgb(170, 170, 170)',
                      fontWeight: 'normal',
                      margin: '-2px 0 0 -2px',
                    }}
                  />
                </Tooltip>
                {!isEmpty(approvalData[`nextNode-${node.nextActId}`]) && (
                  <span
                    style={{
                      color: 'rgb(170, 170, 170)',
                      marginLeft: '16px',
                      fontWeight: 'normal',
                    }}
                  >
                    {intl
                      .get('hwfp.task.view.title.haveChooseApproverSize', {
                        size: approvalData[`nextNode-${node.nextActId}`].length,
                      })
                      .d(`已选择${approvalData[`nextNode-${node.nextActId}`].length}个审批人`)}
                  </span>
                )}
              </div>
              <div style={{ marginLeft: '10px', lineHeight: '28px' }}>
                {this.renderSelcectedEmployee(`nextNode-${node.nextActId}`, node)}
              </div>
            </div>
          )
      );
    } else {
      return null;
    }
  }

  @Bind()
  renderSelcectedEmployee(type, otherParams) {
    const { approvalData = [], handleCleanEmployee, handleChooseEmployee } = this.props;
    // 将 type 转换成审批动作 actionName,
    let approveActioName = '';
    if (type === 'addCc') {
      approveActioName = 'CarbonCopy';
    } else if (type.startsWith('nextNode')) {
      approveActioName = 'specify';
    } else {
      approveActioName = `${type.slice(0, 1).toUpperCase()}${type.slice(1)}`;
    }
    return (
      <>
        {!isEmpty(approvalData[type]) &&
          approvalData[type].map((item) => (
            <Tag
              color={approveNameRenderTemp(approveActioName).actionColor}
              key={item.get('employeeId')}
              closable
              onClose={() => handleCleanEmployee(item.get('employeeId'), type)}
            >
              {item.get('name')}
            </Tag>
          ))}
        <Tag
          onClick={() => handleChooseEmployee(type, otherParams)}
          style={{
            borderStyle: 'dashed',
            backgroundColor: '#fff',
            display: type === 'delegate' && !isEmpty(approvalData[type]) ? 'none' : 'inline-block',
          }}
        >
          <Icon type="add" style={{ color: '#333', marginRight: 0, fontSize: '0.14rem' }} />
        </Tag>
      </>
    );
  }

  @Bind()
  handleValue(value) {
    const { formDs } = this.props;
    const result = value ? value.match(/\n|\r/g) : [];
    // 如遇换行符，长度会+1，因此需要计算出换行符数量，在maxLength基础上加换行符数量
    formDs.current.set('approvalOpinion', value);
    this.setState({ replyValue: value, count: result ? result.length : 0 });
    // 必填校验
    if (!value) {
      this.handleValidateValue();
    }
  }

  @Bind()
  handleValidationRender() {
    const { formDs } = this.props;
    const value = formDs.current.get('approvalOpinion');
    return value ? (
      <span>
        {intl.get('hzero.common.validation.max', {
          max: 3500,
        })}
      </span>
    ) : null;
  }

  @Bind()
  async handleSubmit() {
    this.textAreaRef.validate();
    const { approvalType, onSubmit } = this.props;
    onSubmit(approvalType);
  }

  render() {
    const {
      approveActions,
      approveCommentNotice,
      approveCommentTitle,
      approvalData,
      approvalType,
      attachmentUuid,
      handleCleanEmployee,
      handleSaveCommentDraft,
      jumpList,
      loading,
      formDs,
      rejectJumpConfigRebutFlag = false,
      rejectJumpConfigRefuseFlag = false,
    } = this.props;
    const { jumpModalVisible, replyValue, count, validateValue } = this.state;
    return (
      <Sidebar
        visible
        maskClosable={false}
        closable
        title={approveActions[approvalType]}
        width={700}
        className={classnames(styles['modal-drawer'], styles['approval-drawer'])}
        bodyStyle={{ flex: '1 1' }}
        onCancel={this.handleToogleVisible}
        footer={
          <>
            <Button color="primary" funcType="raised" onClick={this.handleSubmit} loading={loading}>
              {intl.get('hzero.common.button.ok').d('提交')}
            </Button>
            <Button funcType="raised" onClick={this.handleToogleVisible} disabled={loading}>
              {intl.get('hzero.common.button.cancel').d('提交')}
            </Button>
          </>
        }
      >
        {approvalType === 'Jumped' && (
          <div>
            <div className={styles['label-col']}>
              {intl.get('hwfp.task.view.message.chooseRejectNode').d('选择驳回节点')}
              <Tooltip
                placement="bottom"
                title={intl.get('hwfp.task.view.option.rejectNodeHelp').d('驳回指定节点,重新审批')}
              >
                <Icon
                  type="help"
                  style={{
                    color: 'rgb(170, 170, 170)',
                    fontWeight: 'normal',
                    margin: '-2px 0 0 -2px',
                  }}
                />
              </Tooltip>
            </div>
            <div style={{ marginLeft: '16px', lineHeight: '28px' }}>
              {!isEmpty(approvalData.Jumped) && (
                <Tag
                  color={approveNameRenderTemp('Jump').actionColor}
                  key={approvalData.Jumped.jumpTarget}
                  closable
                  onClose={() => handleCleanEmployee(approvalData.Jumped.jumpTarget, 'Jumped')}
                >
                  {approvalData.Jumped.jumpTargetName}
                </Tag>
              )}
              <Tag
                onClick={this.handleToogleJumpModal}
                style={{
                  borderStyle: 'dashed',
                  backgroundColor: '#fff',
                  display: !isEmpty(approvalData.Jumped) ? 'none' : 'inline-block',
                }}
              >
                <Icon type="add" style={{ color: '#333', marginRight: 0, fontSize: '0.14rem' }} />
              </Tag>
            </div>
          </div>
        )}
        {approvalType === 'Rejected' && rejectJumpConfigRefuseFlag && (
          <>
            <div className={styles['label-col']}>
              {intl
                .get('hwfp.task.view.message.select.refuseAutoJumpFlag.title')
                .d('选择发起人再次提交后的审批路径')}
            </div>
            <Form labelLayout="float" style={{ margin: '4px 0 16px 0' }}>
              <SelectBox name="refuseAutoJumpFlag" dataSet={formDs} clearButton={false} vertical>
                <SelectBox.Option value={0}>
                  {intl
                    .get('hwfp.task.view.message.selectBox.refuseAutoJumpFlag.false')
                    .d('从首个节点开始审批')}
                </SelectBox.Option>
                <SelectBox.Option value={1}>
                  {intl
                    .get('hwfp.task.view.message.selectBox.refuseAutoJumpFlag.true')
                    .d('跳过已审节点直接到我')}
                </SelectBox.Option>
              </SelectBox>
            </Form>
          </>
        )}
        {approvalType === 'Jumped' && rejectJumpConfigRebutFlag && (
          <>
            <div className={styles['label-col']} style={{ marginTop: '14px' }}>
              {intl
                .get('hwfp.task.view.message.select.rebutAutoJumpFlag.title')
                .d('选择驳回节点人员重新审批后的审批路径')}
            </div>
            <Form labelLayout="float" style={{ margin: '4px 0 16px 0' }}>
              <SelectBox name="rebutAutoJumpFlag" dataSet={formDs} clearButton={false} vertical>
                <SelectBox.Option value={0}>
                  {intl
                    .get('hwfp.task.view.message.select.rebutAutoJumpFlag.false')
                    .d('从驳回节点后重新审批')}
                </SelectBox.Option>
                <SelectBox.Option value={1}>
                  {intl
                    .get('hwfp.task.view.message.select.rebutAutoJumpFlag.true')
                    .d('跳过已审节点直接到我')}
                </SelectBox.Option>
              </SelectBox>
            </Form>
          </>
        )}
        {['delegate', 'AddSign', 'ApproveAndAddSign'].includes(approvalType) && (
          <div style={{ marginBottom: '24px' }}>
            <div className={styles['label-col']}>
              {approvalType === 'delegate'
                ? intl.get('hwfp.task.view.title.chooseDelegater').d('选择转交人')
                : intl.get('hwfp.task.view.title.chooseAddSigner').d('选择加签人')}
              <Tooltip
                placement="bottom"
                title={
                  approvalType === 'delegate'
                    ? intl.get('hwfp.task.view.option.addDelegaterHelp').d('将流程转交给其他人审批')
                    : intl
                        .get('hwfp.task.view.option.addSignerrHelp')
                        .d('选择其他人协同审批当前流程')
                }
              >
                <Icon
                  type="help"
                  style={{
                    color: 'rgb(170, 170, 170)',
                    fontWeight: 'normal',
                    margin: '-2px 0 0 -2px',
                  }}
                />
              </Tooltip>
              {!isEmpty(approvalData[approvalType]) && (
                <span
                  style={{
                    color: 'rgb(170, 170, 170)',
                    marginLeft: '16px',
                    fontWeight: 'normal',
                  }}
                >
                  {approvalType !== 'delegate' &&
                    intl
                      .get('hwfp.task.view.title.haveChoosedAddSigner', {
                        size: approvalData[approvalType].length,
                      })
                      .d(`已选择${approvalData[approvalType].length}个加签人`)}
                </span>
              )}
            </div>
            <div style={{ marginLeft: '16px', lineHeight: '28px' }}>
              {this.renderSelcectedEmployee(approvalType)}
            </div>
          </div>
        )}
        <div style={{ marginBottom: '24px' }}>
          <div className={styles['label-col']}>
            <span>{approveCommentTitle}</span>
            <span style={{ color: '#aaa', marginLeft: '16px', fontWeight: 'normal' }}>
              {approveCommentNotice}
            </span>
          </div>
          <TextArea
            id="drawer-comment-textarea"
            ref={this.handleTextAreaRef}
            required={!validateValue}
            value={replyValue}
            valueChangeAction="input"
            onChange={this.handleValue}
            rows={5}
            resize="vertical"
            maxLength={3500 + count}
            trim="none"
            style={{ marginLeft: '10px' }}
            onBlur={(event) => handleSaveCommentDraft(event.target.value)}
            validationRenderer={this.handleValidationRender}
          />
          <p style={{ margin: '0.1rem 0 0 0.1rem' }}>
            {replyValue ? replyValue.replace(/\n|\r/g, '').length : 0}/3500
          </p>
          <div className={styles['upload-button']} style={{ marginLeft: '10px' }}>
            <UploadButton
              ref={this.onUploadButtonRef}
              text={intl.get('hzero.common.button.uploadButton').d('上传附件')}
              attachmentUUID={attachmentUuid}
              bucketName={BKT_HWFP}
              bucketDirectory="hwfp01"
            />
          </div>
        </div>
        <div style={{ marginBottom: '24px' }}>
          <div className={styles['label-col']}>
            <span>{intl.get('hwfp.task.view.option.addCcUser').d('添加抄送人')}</span>
            <Tooltip
              placement="bottom"
              title={intl
                .get('hwfp.task.view.option.addCcUserHelp')
                .d('当前审批流程抄送给指定人,被抄送人可查看当前流程审批进度、审批表单及审批结果')}
            >
              <Icon
                type="help"
                style={{
                  color: 'rgb(170, 170, 170)',
                  fontWeight: 'normal',
                  margin: '-2px 0 0 -2px',
                }}
              />
            </Tooltip>
            {!isEmpty(approvalData.addCc) && (
              <span
                style={{ color: 'rgb(170, 170, 170)', marginLeft: '16px', fontWeight: 'normal' }}
              >
                {intl
                  .get('hwfp.task.view.title.haveChoosedCopyerSize', {
                    size: approvalData.addCc.length,
                  })
                  .d(`已选择${approvalData.addCc.length}个抄送人`)}
              </span>
            )}
          </div>
          <div style={{ marginLeft: '10px', lineHeight: '28px' }}>
            {this.renderSelcectedEmployee('addCc')}
          </div>
        </div>
        {/* {this.renderNextNodeApprover()} */}
        {jumpModalVisible && (
          <JumpModal
            jumpList={jumpList}
            onClose={this.handleToogleJumpModal}
            onSubmit={this.handleSubmitJumpData}
          />
        )}
      </Sidebar>
    );
  }
}
