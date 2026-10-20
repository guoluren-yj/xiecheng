import React, { Component } from 'react';
import classnames from 'classnames';
import {
  CheckBox,
  Select,
  Button,
  TextArea,
  Modal as ModalPro,
  Pagination,
} from 'choerodon-ui/pro';
import { Icon, Tooltip, notification } from 'choerodon-ui';
import { Bind } from 'lodash-decorators';

import { Button as ButtonPermission } from 'components/Permission';
import intl from 'utils/intl';
import { toJS } from 'mobx';
import { isEmpty } from 'lodash';

import EmployeeModalNew from '../Detail/EmployeeModalNew';
import Reply from './Reply';

import styles from './index.less';

const editModalKey = ModalPro.key();
const confirmModalKey = ModalPro.key();

export default class FooterButtons extends Component {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.textAreaRef = null;
    this.state = {
      checked: false,
      checkedSize: 0,
      opeartionFlag: false,
      opinionValue: '',
      count: 0,
      opeartionType: 'Approved',
      approvalData: {},
    };
  }

  @Bind()
  openEditModal() {
    const { operatorDs } = this.props;
    const { approvalOpinion } = operatorDs.current.toData();
    ModalPro.open({
      key: editModalKey,
      movable: true,
      maskClosable: true,
      className: styles['opionion-edit-modal'],
      title: intl.get('hwfp.task.view.message.comment').d('审批意见'),
      children: (
        <Reply
          onRef={(ref) => {
            this.textAreaRef = ref;
          }}
          originValue={approvalOpinion}
        />
      ),
      onOk: () => {
        const opinion = this.textAreaRef.state.replyValue;
        operatorDs.current.set('approvalOpinion', opinion);
        return true;
      },
    });
  }

  @Bind()
  async handleSubmit() {
    const { opeartionType } = this.state;
    const { operatorDs } = this.props;
    const comment = operatorDs.current.get('approvalOpinion');
    if (opeartionType === 'Rejected' && !comment) {
      operatorDs.current.set(
        'approvalOpinion',
        intl.get('hzero.common.button.approvalRefuse').d('审批拒绝')
      );
    }
    const flag = await operatorDs.validate();
    if (!flag) {
      return;
    }
    // 判断有无转交人
    const delegateValue = toJS(operatorDs.current.get('batchDelegate'));
    if (isEmpty(delegateValue) && opeartionType === 'delegate') {
      ModalPro.warning({
        center: true,
        children: intl.get('hwfp.task.view.message.pleaseChooseDelegater').d('请选择转交人'),
      });
      return;
    }
    if (opeartionType === 'Rejected') {
      ModalPro.open({
        key: confirmModalKey,
        movable: false,
        // maskClosable: true,
        className: styles['common-modal'],
        title: intl.get('hzero.common.message.confirm.callback').d('是否确认提交?'),
        onOk: this.handleConfirm,
        okProps: {
          funcType: 'flat',
        },
        cancelProps: {
          funcType: 'flat',
        },
      });
    } else {
      this.handleConfirm();
    }
  }

  @Bind()
  handleConfirm() {
    const { onSubmit } = this.props;
    if (onSubmit) {
      onSubmit();
      const key = `open${Date.now()}`;
      notification.open({
        key,
        duration: 3,
        placement: 'bottomRight',
        className: styles['loading-notification'],
        message: (
          <span className={styles['loading-notification-title']}>
            <Icon type="approval-o" />
            <span>{intl.get('hwfp.common.view.message.approvaling').d('审批中')}</span>
          </span>
        ),
        description: (
          <div className={styles['loading-notification-content']}>
            <div>{intl.get('hwfp.task.view.message.tip1').d('批量审批中……')}</div>
            <div>
              {intl
                .get('hwfp.task.view.message.tip2')
                .d(
                  '单据后台处理中，您可以离开当前页面，审批失败的单据，将通过系统消息展示失败原因，并重新展示在待办列表中。'
                )}
            </div>
          </div>
        ),
        // btn: (
        //   <Button
        //     className={styles['loading-notification-btn']}
        //     onClick={() => this.handleCloseModal(key)}
        //   >
        //     {intl.get('hwfp.common.view.button.know').d('知道了')}
        //   </Button>
        // ),
      });
    }
  }

  // @Bind()
  // handleCloseModal(key) {
  //   const { afterSubmit } = this.props;
  //   notification.close(key);
  //   if (afterSubmit) {
  //     afterSubmit();
  //   }
  // }

  @Bind()
  handleOpeartionType(value) {
    const { operatorDs } = this.props;
    const record = operatorDs.current;
    this.setState({ opeartionType: value });
    record.set('approvalOpinion', '');
    record.getField('approvalOpinion').reset();
  }

  @Bind()
  handleCheckedAll(checked) {
    const { onCheck } = this.props;
    this.setState({
      checked,
    });
    if (onCheck) {
      onCheck(checked);
    }
  }

  @Bind()
  handleBatchOperation() {
    const { opeartionFlag } = this.state;
    const { operatorDs, onBatchOperation } = this.props;
    const newOpeartionFlag = !opeartionFlag;
    if (!newOpeartionFlag) {
      operatorDs.reset();
    }
    this.setState({
      opeartionFlag: newOpeartionFlag,
      approvalData: {},
      opeartionType: 'Approved',
    });
    operatorDs.current.set('batchDelegate', null);
    if (onBatchOperation) {
      onBatchOperation(newOpeartionFlag);
    }
  }

  @Bind()
  setOpinionValue() {
    const { operatorDs } = this.props;
    this.setState({ opinionValue: operatorDs.current.get('approvalOpinion') });
  }

  @Bind()
  handleMaxLength(value) {
    const result = value ? value.match(/\n|\r/g) : [];
    this.setState({ count: result ? result.length : 0 });
  }

  @Bind()
  checkOpinionValue() {
    const { operatorDs } = this.props;
    const { opinionValue = '' } = this.state;
    if (operatorDs.current.get('approvalOpinion') === opinionValue?.replace(/\n|\r/g, '')) {
      operatorDs.current.set('approvalOpinion', opinionValue);
    }
  }

  // 选择人
  @Bind()
  handleChooseEmployee() {
    this.setState({
      employeeModalVisible: true,
    });
  }

  @Bind()
  handleEmployeeModal() {
    this.setState({
      employeeModalVisible: false,
    });
  }

  @Bind()
  handlSelectedEmployee(records) {
    const { operatorDs } = this.props;
    this.setState({
      employeeModalVisible: false,
      approvalData: {
        delegate: records,
      },
    });
    operatorDs.current.set('batchDelegate', records);
  }

  render() {
    const {
      opeartionFlag,
      checked,
      checkedSize,
      count,
      opeartionType,
      employeeModalVisible,
      approvalData,
    } = this.state;
    const { tableDs, operatorDs, match } = this.props;
    const delegateLength =
      isEmpty(approvalData) || isEmpty(approvalData.delegate) ? 0 : approvalData.delegate.length;
    return (
      <>
        <div className={styles['footer-buttons']}>
          <div className={styles['footer-buttons-left']}>
            {!opeartionFlag ? (
              <Pagination dataSet={tableDs} pageSizeOptions={['10', '20', '50']} />
            ) : (
              <>
                <CheckBox dataSet={operatorDs} name="checkedAll" onChange={this.handleCheckedAll} />
                <span
                  className={classnames(
                    styles['label-title'],
                    styles['label-title-noAfter'],
                    styles['label-title-separated']
                  )}
                >
                  {intl.get('hzero.common.button.selectAll').d('全选')}
                </span>
                {checked && (
                  <>
                    <span className={styles['operation-tip']}>
                      {intl
                        .get('hwfp.task.view.tip.batchOperationSize', { size: checkedSize })
                        .d(`批量处理本页${checkedSize}个事项`)}
                    </span>
                    <span
                      className={classnames(styles['label-title'], styles['label-title-separated'])}
                    >
                      {intl.get('hwfp.task.button.batchOpeartion').d('批量操作')}
                    </span>
                    <Select
                      dataSet={operatorDs}
                      clearButton={false}
                      name="batchOperation"
                      placeholder={intl.get('hwfp.task.button.batchOpeartion').d('批量操作')}
                      style={{ maxWidth: 120 }}
                      onChange={this.handleOpeartionType}
                    >
                      <Select.Option value="Approved">
                        {intl.get('hwfp.task.button.approvalAdopt').d('审批通过')}
                      </Select.Option>
                      <Select.Option value="Rejected">
                        {intl.get('hzero.common.view.message.title.reject').d('审批拒绝')}
                      </Select.Option>
                      <Select.Option value="delegate">
                        {intl.get('hzero.common.view.message.title.bulk.forwarding').d('转交')}
                      </Select.Option>
                    </Select>
                    {opeartionType === 'delegate' && (
                      <Button
                        type="submit"
                        style={{
                          color: '#333',
                          marginLeft: '10px',
                        }}
                        onClick={this.handleChooseEmployee}
                      >
                        {intl.get('hzero.common.view.message.title.bulk.forwarding').d('转交')}
                        {delegateLength}/1
                      </Button>
                    )}
                    <span
                      className={classnames(styles['label-title'], styles['label-title-separated'])}
                    >
                      {intl.get('hwfp.task.view.message.comment').d('审批意见')}
                    </span>
                    <TextArea
                      dataSet={operatorDs}
                      name="approvalOpinion"
                      placeholder={intl.get('hwfp.task.view.message.comment').d('审批意见')}
                      clearButton
                      style={{ width: '150px', height: '32px' }}
                      maxLength={3500 + count}
                      rows={1}
                      trim="none"
                      showValidation="tooltip"
                      onClick={this.setOpinionValue}
                      onBlur={this.checkOpinionValue}
                      onChange={this.handleMaxLength}
                    />
                    <span
                      style={{ cursor: 'pointer', marginLeft: '4px' }}
                      onClick={this.openEditModal}
                    >
                      <Tooltip title={intl.get('hwfp.task.button.fullScrennEdit').d('全屏编辑')}>
                        <Icon type="zoom_out_map" />
                      </Tooltip>
                    </span>
                  </>
                )}
                {checked && (
                  <span style={{ marginLeft: '10px' }}>
                    <Button funcType="raised" color="primary" onClick={this.handleSubmit}>
                      {intl.get('hzero.common.button.submit').d('提交')}
                    </Button>
                  </span>
                )}
              </>
            )}
          </div>
          <div className={styles['footer-buttons-right']}>
            <span>
              <ButtonPermission
                type="c7n-pro"
                permissionList={[
                  {
                    code: `${match.path}.button.approveTrue`,
                    type: 'button',
                    meaning: '我的待办事项-审批通过',
                  },
                ]}
                funcType="raised"
                color={!opeartionFlag ? 'primary' : 'default'}
                icon="settings"
                onClick={this.handleBatchOperation}
              >
                {!opeartionFlag
                  ? intl.get('hwfp.task.button.batchOpeartion').d('批量操作')
                  : intl.get('hwfp.task.button.cancleOpeartion').d('取消操作')}
              </ButtonPermission>
            </span>
          </div>
          {employeeModalVisible && (
            <EmployeeModalNew
              type="delegate"
              data={approvalData}
              onClose={this.handleEmployeeModal}
              onAfterSubmit={this.handlSelectedEmployee}
            />
          )}
        </div>
      </>
    );
  }
}
