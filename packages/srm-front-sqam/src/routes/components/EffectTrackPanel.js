/**
 * BasicInfoForm - 基本信息表单
 * @date: 2018-11-23
 * @author: WH <heng.wei@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Form, Input, Row, Col, Radio } from 'hzero-ui';
import classNames from 'classnames';
import intl from 'utils/intl';
import { Bind } from 'lodash-decorators';
import UploadModal from '_components/Upload';
import { FORM_COL_2_LAYOUT, EDIT_FORM_ROW_LAYOUT } from 'utils/constants';
import { isNaN } from 'lodash';

const promptCode = 'sqam.common.model.qualityRectification';

/**
 * 基本信息Form
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Object} form - 表单对象
 */
@Form.create({ fieldNameProp: null })
export default class EffectTrackPanel extends PureComponent {
  state = {
    attachmentUUID: null,
  };

  /**
   * 保存attachmentUUID
   */
  @Bind()
  afterOpenUploadModal(attachmentUUID) {
    this.setState({
      attachmentUUID,
    });
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const { attachmentUUID } = this.state;
    const {
      // dadForm,
      code,
      customizeForm,
      form,
      dataSource = {},
      isEdit = false,
      remoteProps,
      exposeCode,
      dispatch,
    } = this.props;
    const { getFieldDecorator } = form;
    dataSource.validateAttachmentUuid = dataSource.validateAttachmentUuid || attachmentUUID;
    const uploadModalProps = {
      viewOnly: !isEdit,
      btnText: isEdit
        ? intl.get(`hzero.common.upload.text`).d('附件上传')
        : intl.get(`hzero.common.upload.view`).d('查看附件'),
      showFilesNumber: true,
      attachmentUUID: dataSource.validateAttachmentUuid,
      bucketName: window.$$env.PRIVATE_BUCKET || 'private-bucket',
      afterOpenUploadModal: this.afterOpenUploadModal,
      bucketDirectory: 'sqam-claim',
    };
    return customizeForm(
      {
        code,
        form: this.props.form,
        dataSource,
      },
      <Form>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="half-row">
          <Col {...FORM_COL_2_LAYOUT}>
            <Form.Item label={intl.get(`${promptCode}.validationResults`).d('验证结果')}>
              {getFieldDecorator('validateResultFlag', {
                initialValue:
                  dataSource.validateResultFlag !== null &&
                  !isNaN(Number(dataSource.validateResultFlag))
                    ? Number(dataSource.validateResultFlag)
                    : 1,
              })(
                <Radio.Group disabled={!isEdit}>
                  <Radio value={1}>
                    {intl.get(`${promptCode}.verificationPassed`).d('验证通过')}
                  </Radio>
                  <Radio value={0}>
                    {intl.get(`${promptCode}.verificationNoPassed`).d('验证不通过')}
                  </Radio>
                </Radio.Group>
              )}
            </Form.Item>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="half-row">
          <Col {...FORM_COL_2_LAYOUT}>
            <Form.Item label={intl.get(`${promptCode}.effectTrackUpload`).d('成效验证附件')}>
              {getFieldDecorator('validateAttachmentUuid')(
                <UploadModal
                  {...remoteProps?.process('ATTACHMENT_MODAL', uploadModalProps, {
                    form,
                    that: this,
                    dataSource,
                  })}
                />
              )}
            </Form.Item>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className={classNames('last-form-item', 'half-row')}>
          <Col {...FORM_COL_2_LAYOUT}>
            <Form.Item label={intl.get(`${promptCode}.validateRemark`).d('验证情况说明')}>
              {getFieldDecorator('validateRemark', {
                initialValue: dataSource.validateRemark,
              })(<Input.TextArea rows={3} disabled={!isEdit} />)}
            </Form.Item>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className={classNames('last-form-item', 'half-row')}>
          <Col {...FORM_COL_2_LAYOUT}>
            <Form.Item label={intl.get(`sqam.common.model.verifyCount`).d('验证次数')}>
              {getFieldDecorator('validateCount', {
                initialValue: dataSource.validateCount,
              })(<span>{dataSource.validateCount}</span>)}
            </Form.Item>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_2_LAYOUT}>
            {exposeCode &&
              remoteProps &&
              remoteProps.process(exposeCode, '', {
                dataSource,
                form,
                dispatch,
              })}
          </Col>
        </Row>
      </Form>
    );
  }
}
