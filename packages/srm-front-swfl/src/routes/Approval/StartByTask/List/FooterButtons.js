/*
 * @Descripttion:
 * @Date: 2021-06-04 15:44:00
 * @Author: xshen <xia.shen@going-link.com>
 * @version:
 * @copyright: Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import classnames from 'classnames';
import {
  CheckBox,
  Button,
  TextField,
  TextArea,
  Modal as ModalPro,
  Pagination,
} from 'choerodon-ui/pro';
import { Icon, Tooltip } from 'choerodon-ui';
import { Bind } from 'lodash-decorators';

// import { Button as ButtonPermission } from 'components/Permission';
import intl from 'utils/intl';

import ApproveSvg from '@/assets/approve.svg';

import styles from './index.less';

const editModalKey = ModalPro.key();
const confirmModalKey = ModalPro.key();
const completeModalKey = ModalPro.key();

export default class FooterButtons extends Component {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.textAreaRef = null;
    this.state = {
      checked: false,
      checkedSize: 0,
      opeartionFlag: false,
    };
  }

  @Bind()
  openEditModal() {
    const { operatorDs } = this.props;
    const { approvalOpinion } = operatorDs.current.toData();
    ModalPro.open({
      key: editModalKey,
      movable: false,
      maskClosable: true,
      className: styles['opionion-edit-modal'],
      title: intl.get('hwfp.task.view.message.comment').d('审批意见'),
      children: (
        <TextArea
          ref={(ref) => {
            this.textAreaRef = ref;
          }}
          defaultValue={approvalOpinion}
          rows={20}
          maxLength={600}
        />
      ),
      onOk: () => {
        const opinion = this.textAreaRef.value;
        operatorDs.current.set('approvalOpinion', opinion);
        return true;
      },
    });
  }

  @Bind()
  async handleSubmit() {
    const { operatorDs } = this.props;
    const flag = await operatorDs.validate();
    if (!flag) {
      return;
    }
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
  }

  @Bind()
  handleConfirm() {
    const { onSubmit } = this.props;
    if (onSubmit) {
      onSubmit();
      ModalPro.open({
        key: completeModalKey,
        movable: false,
        closable: true,
        // maskClosable: true,
        className: styles['loading-modal'],
        title: intl.get('hwfp.common.view.message.approvaling').d('审批中'),
        children: (
          <div className={styles['loading-modal-content']}>
            <div className={styles['loading-animate']} />
            <img src={ApproveSvg} alt="" className={styles['loading-pic']} />
            <div className={styles['loading-modal-tip']}>
              <div>{intl.get('hwfp.task.view.message.tip1').d('批量审批中……')}</div>
              <div>
                {intl
                  .get('hwfp.task.view.message.tip2')
                  .d(
                    '单据后台处理中，您可以离开当前页面，审批失败的单据，将通过系统消息展示失败原因，并重新展示在待办列表中。'
                  )}
              </div>
            </div>
          </div>
        ),
        footer: (okBtn) => okBtn,
        okText: intl.get('hzero.common.button.ok').d('确定'),
        onOk: () => this.handleCloseModal(),
        onClose: () => this.handleCloseModal(),
      });
    }
  }

  @Bind()
  handleCloseModal() {
    const { afterSubmit } = this.props;
    if (afterSubmit) {
      afterSubmit();
    }
  }

  @Bind()
  handleOpeartionType() {
    const { operatorDs } = this.props;
    const record = operatorDs.current;
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
    });
    if (onBatchOperation) {
      onBatchOperation(newOpeartionFlag);
    }
  }

  render() {
    const { checked, checkedSize } = this.state;
    const { tableDs, operatorDs } = this.props;
    return (
      <>
        <div className={styles['footer-buttons']}>
          <div className={styles['footer-buttons-left']}>
            {!checked ? (
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
                  style={{ marginRight: '10px' }}
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
                  </>
                )}
                <TextField
                  dataSet={operatorDs}
                  name="approvalOpinion"
                  placeholder={intl.get('hwfp.task.view.message.comment').d('审批意见')}
                  clearButton
                  style={{ width: '284px', maxWidth: 'calc(100% - 390px)', marginRight: '10px' }}
                  suffix={
                    <span
                      style={{ cursor: 'pointer', marginLeft: '4px' }}
                      onClick={this.openEditModal}
                    >
                      <Tooltip title={intl.get('hwfp.task.button.fullScrennEdit').d('全屏编辑')}>
                        <Icon type="zoom_out_map" />
                      </Tooltip>
                    </span>
                  }
                />
                <span>
                  <Button
                    type="submit"
                    style={{ backgroundColor: '#47B881', color: '#fff', border: 'none' }}
                    onClick={this.handleSubmit}
                  >
                    {intl.get('hwfp.task.button.approvalAdopt').d('审批通过')}
                  </Button>
                </span>
                <span>
                  <Button
                    type="submit"
                    style={{
                      backgroundColor: '#F56349',
                      color: '#fff',
                      border: 'none',
                      marginLeft: '10px',
                    }}
                    onClick={this.handleSubmit}
                  >
                    {intl.get('hzero.common.view.message.title.reject').d('审批拒绝')}
                  </Button>
                </span>
              </>
            )}
          </div>
          <div className={styles['footer-buttons-right']} />
        </div>
      </>
    );
  }
}
