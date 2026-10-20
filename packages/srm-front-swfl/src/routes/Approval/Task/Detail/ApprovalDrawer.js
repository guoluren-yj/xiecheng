/* eslint-disable no-nested-ternary */
import React, { Component } from 'react';
import { Attachment, Lov, TextField, Form, SelectBox } from 'choerodon-ui/pro';
import { Icon } from 'choerodon-ui';
import { Bind } from 'lodash-decorators';
import { isEmpty } from 'lodash';
import { toJS } from 'mobx';

import intl from 'utils/intl';
import notification from 'utils/notification';
import { PRIVATE_BUCKET } from '_utils/config.js';
import ContactLov from 'srm-front-boot/lib/components/ContactLov';

import QuickReply from '@/components/QuickReply';
import search from '@/assets/search.svg';
import JumpModal from './JumpModal';
import styles from './index.less';

export default class ApprovalDrawer extends Component {
  constructor(props) {
    super(props);
    this.employeeName = {
      AddSign: 'addSign', // 加签
      ApproveAndAddSign: 'addSign', // 同意并加签
      delegate: 'delegate', // 转交
      addCc: 'addCc', // 抄送
      Jumped: 'jumped', // 驳回
      approvalOpinion: 'approvalOpinion',
    };
    this.uploadButtonRef = null;
    this.newRecord = this.props.formDs.current.get(this.employeeName[this.props.approvalType]);
    this.newApprovalData = this.props.approvalData;
    this.lovType = '';
    this.state = {
      jumpModalVisible: false,
      addCcDisabled: [],
      otherTypeDisabled: [],
      attachments: props.attachments,
    };
  }

  componentDidMount() {
    const {
      formDs,
      rejectJumpConfigRebutFlag = false,
      rejectJumpConfigRefuseFlag = false,
      approvalType,
      processRemote,
      stepRebut,
      jumpList,
      task,
      rejectAgainSubmitPathDefault, // 审批拒绝后发起人再次提交后的审批路径默认值
      rebutAgainSubmitPathDefault, // 审批驳回后发起人再次提交后的审批路径默认值
    } = this.props;
    // 定义人员选择组件的name
    for (const i in this.newApprovalData) {
      if (!isEmpty(this.newApprovalData[i])) {
        const fieldName = i.startsWith('nextNode') ? 'approval' : this.employeeName[i];
        const lovValueField = formDs.getField(fieldName).get('valueField', formDs.current);
        formDs.current.set(fieldName, this.newApprovalData[i]);
        this.handleDisabledKeys(i, lovValueField);
      }
    }
    if (approvalType === 'Jumped') {
      if (stepRebut) {
        formDs.current.set('rebutAutoJumpFlag', 0);
        if (jumpList && jumpList[0]) {
          this.handleSubmitJumpData(jumpList[0]);
        }
      }
      if (rejectJumpConfigRebutFlag) {
        const rebutAutoJumpFlag = formDs.current.get('rebutAutoJumpFlag');
        formDs.current.getField('rebutAutoJumpFlag').set('required', rejectJumpConfigRebutFlag);
        formDs.current.set('rebutAutoJumpFlag', stepRebut ? rebutAgainSubmitPathDefault : (rebutAutoJumpFlag === undefined ? rebutAgainSubmitPathDefault : rebutAutoJumpFlag));
      }
      formDs.current.getField('jumpedName').set('required', true);
    } else if (approvalType === 'AddSign' || approvalType === 'ApproveAndAddSign') {
      formDs.current.getField('addSign').set('required', true);
    } else if (approvalType === 'delegate') {
      formDs.current.getField('delegate').set('required', true);
    } else if (approvalType === 'Rejected') {
      if(rejectJumpConfigRefuseFlag) {
        const refuseAutoJumpFlag = formDs.current.get('refuseAutoJumpFlag');
        formDs.current.set('refuseAutoJumpFlag', refuseAutoJumpFlag === undefined ? rejectAgainSubmitPathDefault : refuseAutoJumpFlag);
      }
    }
    if (processRemote) {
      processRemote.process(
        'SWFL_APPROVAL_WORKBENCH_FOOTER_BUTTONS_APPROVAL_DRAWER_MOUNT',
        undefined,
        {
          handleSubmitJumpData: this.handleSubmitJumpData,
          jumpList: this.props.jumpList,
          formRecord: formDs.current,
          task,
        }
      );
    }
  }

  componentWillReceiveProps(nextProps) {
    const field = this.lovType.startsWith('nextNode')
      ? 'approval'
      : this.employeeName[this.lovType];
    if (this.newRecord !== nextProps.formDs.current.get(field)) {
      // 人员单选的情况直接push进数组
      const newValue = toJS(nextProps.formDs.current.get(field));
      const value = newValue;
      this.newApprovalData = { ...this.newApprovalData, [this.lovType]: value };
      const nextField = nextProps.approvalType.startsWith('nextNode')
        ? 'approval'
        : this.employeeName[nextProps.approvalType];
      this.newRecord = nextProps.formDs.current.get(nextField);
    }
  }

  @Bind()
  handleToogleJumpModal() {
    const { stepRebut, formDs } = this.props;
    if (stepRebut) {
      return;
    }
    const jumpedName = this.newApprovalData.Jumped
      ? this.newApprovalData.Jumped.jumpTargetName
      : '';
    const jumpedEmpName = this.newApprovalData.Jumped
      ? this.newApprovalData.Jumped.approverName
      : '';
    formDs.current.set('jumpedName', jumpedName);
    formDs.current.set('jumpedEmpName', jumpedEmpName);
    this.setState({ jumpModalVisible: !this.state.jumpModalVisible });
  }

  @Bind()
  handleSubmitJumpData(jumpData) {
    if (jumpData) {
      // eslint-disable-next-line no-param-reassign
      jumpData.jumpTarget = jumpData.jumpTarget || jumpData.actId;
      // eslint-disable-next-line no-param-reassign
      jumpData.jumpTargetName = jumpData.jumpTargetName || jumpData.actName;
      // eslint-disable-next-line no-param-reassign
      jumpData.assignee = jumpData.assignee || jumpData.approver;
    }
    const { changeApprovalData, formDs } = this.props;
    this.newApprovalData.Jumped = jumpData;
    formDs.current.set('jumpedName', jumpData.jumpTargetName);
    formDs.current.set('jumpedEmpName', jumpData.approverName);
    this.setState({
      jumpModalVisible: false,
    });
    changeApprovalData(this.newApprovalData);
  }

  @Bind()
  handleToogleVisible() {
    const { uploadModalRef } = this.props;
    if (uploadModalRef && this.uploadButtonRef) {
      const uploadedFile = this.uploadButtonRef.getFileList() || [];
      uploadModalRef.setFileList(uploadedFile);
    }
    this.props.handleToogleVisible();
  }

  @Bind()
  renderNextNodeApprover() {
    const {
      task: { owner, nextNodeApprover = [] },
    } = this.props;
    const isAddSign =
      owner && (owner.startsWith('AddSign') || owner.startsWith('ApproveAndAddSign'));
    if (!isAddSign && !isEmpty(nextNodeApprover)) {
      return nextNodeApprover.map(
        (node) =>
          (node.check === 'Y' || node.needAppoint === 'Y' || node.rejectedNeedAppoint === 'Y') && (
            <div style={{ marginBottom: '24px' }}>
              <div className={styles['contact-lov']}>
                {this.renderNextNodeEmployee(
                  `nextNode-${node.nextActId}`,
                  node,
                  intl
                    .get('hwfp.task.view.option.addNextApprover', {
                      nextActName: node.nextActName,
                    })
                    .d(`指派【${node.nextActName}】审批人`)
                )}
              </div>
            </div>
          )
      );
    } else {
      return null;
    }
  }

  setType = (type) => {
    this.lovType = type;
  };

  // 取接口返回值的情况
  @Bind()
  handleData(otherParams, dataSet) {
    if (otherParams && otherParams.check === 'Y' && !isEmpty(otherParams.candidates)) {
      otherParams.candidates.map((item) => {
        const newItem = item;
        newItem.employeeNum = newItem.employeeNum || newItem.employeeCode;
        return newItem;
      });
      dataSet.loadData(otherParams.candidates || []);
      return false;
    }
    return true;
  }

  handleDisabledKeys = (type, lovValueField) => {
    const { formDs } = this.props;
    const addCcData = toJS(formDs.current.get('addCc')) || [];
    const addSignData = toJS(formDs.current.get('addSign')) || [];
    const delegateData = toJS(formDs.current.get('delegate')) || [];
    const otherTypeData =
      addSignData && addSignData.length > 0
        ? addSignData
        : delegateData && delegateData.length > 0
        ? delegateData
        : [];
    // 数据不可选
    // 转交、加签不能选择已添加抄送的员工,反之一样
    if (type === 'addCc') {
      const addCcCodeNew = [];
      addCcData.forEach((item) => {
        if (item && item[lovValueField]) {
          addCcCodeNew.push(item[lovValueField]);
        }
      });
      this.setState({ addCcDisabled: addCcCodeNew });
    } else if (['AddSign', 'ApproveAndAddSign', 'delegate'].includes(type)) {
      const otherTypeCodeNew = [];
      otherTypeData.forEach((item) => {
        if (item && item[lovValueField]) {
          otherTypeCodeNew.push(item[lovValueField]);
        }
      });
      this.setState({ otherTypeDisabled: otherTypeCodeNew });
    }
  };

  @Bind()
  renderNextNodeEmployee(type, otherParams, labelValue) {
    const { assignApproveDs } = this.props;
    const key = `nextNode-${otherParams.nextActId}`;
    let currentRecord;
    const existRecord = assignApproveDs.records.find((n) => n.get('key') === key);
    if (!existRecord) {
      assignApproveDs.create({ key });
      currentRecord = assignApproveDs.current;
    } else {
      currentRecord = existRecord;
    }
    return (
      <Form record={currentRecord} labelLayout="float">
        <Lov
          ref={(ref) => {
            this[`${type}Ref`] = ref;
            if (ref && ref.options) {
              ref.options.addEventListener('query', ({ dataSet }) =>
                this.handleData(otherParams, dataSet)
              );
            }
          }}
          // dataSet={formDs}
          labelLayout="float"
          label={labelValue}
          name="approval"
          viewMode="drawer"
          modalProps={{
            style: { width: 900, maxWidth: 900 },
            onClose: () => {
              if (this[`${type}Ref`] && this[`${type}Ref`].options) {
                this[`${type}Ref`].options.removeEventListener('query', this.handleData);
              }
            },
            onCancel: () => {
              if (this[`${type}Ref`] && this[`${type}Ref`].options) {
                this[`${type}Ref`].options.removeEventListener('query', this.handleData);
              }
            },
          }}
          onClick={() => this.setType(type)}
        >
          {intl.get('hzero.common.button.add').d('新增')}
        </Lov>
      </Form>
    );
  }

  // 驳回节点
  @Bind()
  handleJumpedClose(key, type) {
    const { handleCleanEmployee, formDs } = this.props;
    // 清除驳回值
    formDs.current.set('jumpedName', '');
    formDs.current.set('jumpedEmpName', '');
    handleCleanEmployee(key, type);
    const domElement = document.getElementById('jump-input');
    if (
      domElement &&
      domElement.getElementsByTagName('span')[0] &&
      !formDs.current.get('jumpedName')
    ) {
      domElement.getElementsByTagName('span')[0].classList.add('c7n-pro-input-empty');
    }
  }

  @Bind()
  renderJumpedSelected(type) {
    const { formDs, stepRebut } = this.props;
    const domElement = document.getElementById('jump-input');
    const elements = domElement && domElement.getElementsByClassName('c7n-pro-input-wrapper');
    if (elements && elements.length) {
      if (formDs.current.get('jumpedName')) {
        Array.from(elements).forEach((el) => el.classList.remove('c7n-pro-input-empty'));
      } else {
        Array.from(elements).forEach((el) => el.classList.add('c7n-pro-input-empty'));
      }
    }
    return (
      <div className={styles['jump-input']} id="jump-input">
        <TextField
          multiple
          disabled={stepRebut}
          dataSet={formDs}
          name="jumpedName"
          labelLayout="float"
          label={intl.get('hwfp.task.view.message.chooseRejectNode').d('选择驳回节点')}
          style={{ width: '100%' }}
          clearButton
          className={
            formDs.current.get('jumpedName') ? 'c7n-pro-input-focused' : 'c7n-pro-input-empty'
          }
          suffix={<img src={search} alt="" onClick={this.handleToogleJumpModal} />}
          onChange={() =>
            this.handleJumpedClose(
              this.newApprovalData[type] ? this.newApprovalData[type].jumpTarget : '',
              'Jumped'
            )
          }
        />
        <TextField
          disabled
          multiple
          dataSet={formDs}
          name="jumpedEmpName"
          label={intl.get('hwfp.task.view.message.chooseRejectNodeEmp').d('驳回节点审批人')}
          labelLayout="float"
          style={{ width: '100%', marginTop: '16px' }}
          className={
            formDs.current.get('jumpedName') ? 'c7n-pro-input-focused' : 'c7n-pro-input-empty'
          }
          newLine
        />
      </div>
    );
  }

  @Bind()
  renderSelectedEmployee(type, labelValue) {
    const { formDs } = this.props;
    const { addCcDisabled, otherTypeDisabled } = this.state;
    // 将 type 转换成审批动作 actionName,
    const fieldName = type.startsWith('nextNode') ? 'approval' : this.employeeName[type];
    const lovValueField = formDs.getField(fieldName).get('valueField', formDs.current);
    return (
      <>
        <div className={styles['contact-lov']}>
          <ContactLov
            className={styles['contact-lov-select-multiple']}
            dataSet={formDs}
            labelLayout="float"
            label={labelValue}
            name={fieldName}
            modalProps={{
              style: { width: 900, maxWidth: 900 },
              afterClose: () => this.handleDisabledKeys(type, lovValueField),
            }}
            onClick={() => this.setType(type)}
            disabledKeys={
              ['AddSign', 'ApproveAndAddSign', 'delegate'].includes(type)
                ? addCcDisabled
                : type === 'addCc'
                ? otherTypeDisabled
                : []
            }
            multiple={!(type === 'Jumped' || type === 'delegate')}
            selectionProps={{
              placeholder: intl.get('hzero.common.select.people').d('请从左侧选择人员'),
            }}
          />
        </div>
      </>
    );
  }

  openNotification = () => {
    notification.warning({
      message: intl.get('hzero.common.upload.attachmentUuid').d('未获取到文件批次号，请稍后重试'),
    });
  };

  handleAttachmentsChange = (value) => {
    this.setState({
      attachments: value,
    });
    this.props.setAttachments(value);
  };

  renderApprovalForm = () => {
    const {
      approvalType,
      formDs,
      rejectJumpConfigRebutFlag = false,
      rejectJumpConfigRefuseFlag = false,
      processRemote,
      stepRebut,
    } = this.props;
    const jumpNodeShow = processRemote
      ? processRemote.process(
          'SWFL_APPROVAL_WORKBENCH_FOOTER_BUTTONS_JUMPED_NODE_SHOW',
          true,
          this.props
        )
      : true;
    return (
      <>
        {['delegate', 'AddSign', 'ApproveAndAddSign', 'Jumped'].includes(approvalType) && (
          <div style={{ marginBottom: '16px' }}>
            {approvalType === 'Jumped'
              ? this.renderJumpedSelected('Jumped')
              : this.renderSelectedEmployee(
                  approvalType,
                  approvalType === 'delegate'
                    ? intl.get('hwfp.task.view.title.chooseDelegater').d('选择转交人')
                    : approvalType === 'Jumped'
                    ? intl.get('hwfp.task.view.message.chooseRejectNode').d('选择驳回节点')
                    : intl.get('hwfp.task.view.title.chooseAddSigner').d('选择加签人')
                )}
          </div>
        )}
        {approvalType === 'Rejected' && rejectJumpConfigRefuseFlag && (
          <Form labelLayout="float" style={{ marginBottom: '16px', marginTop: '16px' }}>
            <SelectBox name="refuseAutoJumpFlag" dataSet={formDs} clearButton={false} vertical>
              <SelectBox.Option value={0}>
                {intl
                  .get('hwfp.task.view.message.selectBox.refuseAutoJumpFlag.false')
                  .d('从首个节点开始审批')}
              </SelectBox.Option>
              <SelectBox.Option value={1} required>
                {intl
                  .get('hwfp.task.view.message.selectBox.refuseAutoJumpFlag.true')
                  .d('跳过已审节点直接到我')}
              </SelectBox.Option>
            </SelectBox>
          </Form>
        )}
        {approvalType === 'Jumped' && rejectJumpConfigRebutFlag && jumpNodeShow && !stepRebut && (
          <Form labelLayout="float" style={{ marginBottom: '16px', marginTop: '30px' }}>
            <SelectBox name="rebutAutoJumpFlag" dataSet={formDs} clearButton={false} vertical>
              <SelectBox.Option value={0}>
                {intl
                  .get('hwfp.task.view.message.select.rebutAutoJumpFlag.false')
                  .d('从驳回节点后重新审批')}
              </SelectBox.Option>
              <SelectBox.Option value={1} required>
                {intl
                  .get('hwfp.task.view.message.select.rebutAutoJumpFlag.true')
                  .d('跳过已审节点直接到我')}
              </SelectBox.Option>
            </SelectBox>
          </Form>
        )}
      </>
    );
  };

  render() {
    const {
      attachmentUuid,
      formDs,
      handleSaveCommentDraft,
      jumpList,
      setAttachmentUuid,
    } = this.props;
    const { jumpModalVisible, attachments } = this.state;
    const attachmentProps = {
      labelLayout: 'float',
    };
    return (
      <div>
        {this.renderApprovalForm()}
        <div style={{ marginBottom: '16px' }}>
          {this.renderSelectedEmployee(
            'addCc',
            intl.get('hwfp.task.view.option.addCcUser').d('添加抄送人')
          )}
        </div>
        {/* {this.renderNextNodeApprover()} */}
        {jumpModalVisible && (
          <JumpModal
            jumpList={jumpList}
            onClose={this.handleToogleJumpModal}
            onSubmit={this.handleSubmitJumpData}
            selected={this.newApprovalData ? this.newApprovalData.Jumped : ''}
          />
        )}
        <div style={{ marginBottom: '24px' }}>
          <QuickReply
            width="100%"
            margin="0"
            dataSetValue={formDs}
            dataSetName="approvalOpinion"
            isShowAllScreenIcon={false}
            handleSaveCommentDraft={handleSaveCommentDraft}
            inDrawer
          />
          <div className={styles['upload-button']} style={{ marginLeft: '10px' }}>
            {!attachmentUuid && (
              <p
                onClick={this.openNotification}
                style={{
                  color: '#29bece',
                  height: '24px',
                  lineHeight: '24px',
                  width: '80px',
                  cursor: 'pointer',
                }}
              >
                <Icon type="file_upload" style={{ fontSize: '14px', margin: '-3px 4px 0 0' }} />
                {intl.get('hzero.common.button.uploadButton').d('上传附件')}
              </p>
            )}
            {attachmentUuid && (
              <Attachment
                {...attachmentProps}
                bucketName={PRIVATE_BUCKET}
                value={attachmentUuid}
                onChange={setAttachmentUuid}
                attachments={attachments}
                onAttachmentsChange={this.handleAttachmentsChange}
              />
            )}
          </div>
        </div>
      </div>
    );
  }
}
