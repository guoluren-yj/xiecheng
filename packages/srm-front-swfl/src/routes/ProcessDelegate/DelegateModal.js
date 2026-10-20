import React, { Component } from 'react';
import { Modal, Form, Input, Row, Col } from 'hzero-ui';
import { Attachment } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';

import Lov from 'components/Lov';
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { PRIVATE_BUCKET } from '_utils/config.js';

import styles from './index.less';

const { TextArea } = Input;

const formLayout = {
  labelCol: {
    span: 4,
  },
  wrapperCol: {
    span: 20,
  },
};

@Form.create({ fieldNameProp: null })
export default class DelegateModal extends Component {
  @Bind()
  checkTargetEmployee(_, value, callback) {
    const { tabKey, selectedRows } = this.props;
    const isApproverTab = tabKey === 'approver';
    const sameApprover = selectedRows.find((item) =>
      isApproverTab ? item.get('assignee') === value : item.get('startUserId') === value
    );
    if (sameApprover) {
      callback(
        isApproverTab
          ? intl.get('hwfp.processDelegate.view.message.sameApprover').d('不能转交给当前处理人')
          : intl.get('hwfp.processDelegate.view.message.sameApplicant').d('不能转交给当前申请人')
      );
    } else {
      callback();
    }
  }

  @Bind()
  handleOk() {
    const { form, onSubmit } = this.props;
    form.validateFields((err, values) => {
      if (!err) {
        const { delegate, comment } = values;
        onSubmit(delegate, comment);
      }
    });
  }

  render() {
    const {
      visible,
      handleClose,
      form: { getFieldDecorator },
      buttonLoading,
      attachmentUuid,
      setAttachmentUuid,
      selectedRows,
      tabKey,
    } = this.props;
    const hasApprovingProcess = selectedRows && selectedRows.filter((r) => !r.get('processStatus'));
    const showTooltip = hasApprovingProcess.length > 0 && tabKey === 'applicant';
    return (
      <Modal
        destroyOnClose
        title={intl.get('hwfp.task.view.option.delegate', { name: '转交' }).d('转交')}
        width={500}
        visible={visible}
        onOk={this.handleOk}
        onCancel={handleClose}
        confirmLoading={buttonLoading}
      >
        <Form>
          <Form.Item
            {...formLayout}
            label={intl.get('hwfp.automaticProcess.model.automaticProcess.delegater').d('转交人')}
          >
            {getFieldDecorator('delegate', {
              rules: [
                {
                  required: true,
                  message: intl
                    .get('hzero.common.validation.notNull', {
                      name: intl
                        .get('hwfp.automaticProcess.model.automaticProcess.delegater')
                        .d('转交人'),
                    })
                    .d(
                      `${intl
                        .get('hwfp.automaticProcess.model.automaticProcess.delegater')
                        .d('转交人')}不能为空`
                    ),
                },
                {
                  validator: this.checkTargetEmployee,
                },
              ],
            })(
              <Lov
                code="HWFP.EMPLOYEE"
                queryParams={{ tenantId: getCurrentOrganizationId(), enabledFlag: 1 }}
                lovOptions={{
                  displayField: 'name',
                }}
              />
            )}
          </Form.Item>
          <Form.Item {...formLayout} label={intl.get('hwfp.common.modal.opinion').d('意见')}>
            {getFieldDecorator('comment', {
              rules: [
                {
                  required: true,
                  message: intl
                    .get('hzero.common.validation.notNull', {
                      name: intl.get('hwfp.common.modal.opinion').d('意见'),
                    })
                    .d(`${intl.get('hwfp.common.modal.opinion').d('意见')}不能为空`),
                },
              ],
            })(<TextArea />)}
          </Form.Item>
          <Row>
            <Col span={20} offset={4}>
              {attachmentUuid && (
                <Attachment
                  bucketName={PRIVATE_BUCKET}
                  value={attachmentUuid}
                  onChange={setAttachmentUuid}
                />
              )}
            </Col>
          </Row>
        </Form>
        {showTooltip && (
          <Row>
            <Col span={22} offset={2}>
              <span className={styles.tooltip}>*</span>
              {intl
                .get('hwfp.common.view.message.changeApplicantNotice')
                .d(
                  '注意：所勾选的数据中包含”审批中的流程，修改发起人可能会影响后续节点找审批人的逻辑。'
                )}
            </Col>
          </Row>
        )}
      </Modal>
    );
  }
}
