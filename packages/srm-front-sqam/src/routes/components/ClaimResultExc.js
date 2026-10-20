/*
 * @Description:索赔结果执行
 * @Date: 2020-05-12 15:40:54
 * @author: zhangyongxuan <yongxuan.zhang@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2020, Hand
 */
import React, { PureComponent } from 'react';
import { Form, Row, Col, Input } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import classNames from 'classnames';

import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import Upload from 'srm-front-boot/lib/components/Upload';
import { FORM_COL_2_LAYOUT, EDIT_FORM_ROW_LAYOUT, FORM_COL_3_LAYOUT } from 'utils/constants';

import DisplayFormItem from './DisplayFormItem';

const formItemLayout = {
  labelCol: { span: 9, style: { textAlign: 'left' } },
  wrapperCol: { span: 15, style: { textAlign: 'left' } },
};

@Form.create({ fieldNameProp: null })
export default class ClaimResultExc extends PureComponent {
  constructor(props) {
    super(props);
    const { getResultNode = () => ({}) } = props;
    getResultNode(this);
    this.state = {};
  }

  componentWillUnmount() {
    this.setState({
      resultAttachmentUuid: null,
    });
  }

  @Bind()
  getNodevalue(callback) {
    const { form, resultAttachmentUuid } = this.props;
    form.validateFields((err, values) => {
      if (err) {
        callback(err, {});
      } else {
        callback(err, {
          resultAttachmentUuid: resultAttachmentUuid || this.state.resultAttachmentUuid,
          ...values,
        });
      }
    });
  }

  @Bind()
  afterOpenUploadModal(resultAttachmentUuid) {
    this.setState({
      resultAttachmentUuid,
    });
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const { form, editFlag = true, customizeForm, detail } = this.props;
    const { resultAttachmentUuid, resultRemark = '' } = detail;
    const { getFieldDecorator } = form;
    return customizeForm ? (
      customizeForm(
        {
          code: 'SQAM.CLAIM_CERTIFIED_DETAIL.RESULT',
          form,
          dataSource: detail,
        },

        <Form>
          <Row {...EDIT_FORM_ROW_LAYOUT} className="writable-row">
            <Col {...FORM_COL_3_LAYOUT}>
              <Form.Item
                label={intl.get(`sqam.common.model.resultExcuteFile`).d('索赔结果执行附件')}
                {...formItemLayout}
              >
                {getFieldDecorator('resultAttachmentUuid', {
                  initialValue: resultAttachmentUuid,
                })(
                  <Upload
                    bucketName={window.$$env.PRIVATE_BUCKET || 'private-bucket'}
                    bucketDirectory="sqam-claim"
                    attachmentUUID={resultAttachmentUuid}
                    tenantId={getCurrentOrganizationId()}
                    afterOpenUploadModal={this.afterOpenUploadModal}
                    viewOnly={!editFlag}
                  />
                )}
              </Form.Item>
            </Col>
          </Row>
          {editFlag && (
            <Row {...EDIT_FORM_ROW_LAYOUT} className={classNames('last-form-item', 'half-row')}>
              <Col {...FORM_COL_2_LAYOUT}>
                <Form.Item label={intl.get(`sqam.common.model.resultRemark`).d('执行结果说明')}>
                  {getFieldDecorator('resultRemark', {
                    initialValue: resultRemark,
                  })(<Input.TextArea rows={2} />)}
                </Form.Item>
              </Col>
            </Row>
          )}
          {!editFlag && (
            <Row
              {...EDIT_FORM_ROW_LAYOUT}
              className={classNames('last-form-item', 'read-half-row')}
            >
              <Col {...FORM_COL_2_LAYOUT}>
                <DisplayFormItem
                  label={intl.get(`sqam.common.model.resultRemark`).d('执行结果说明')}
                  value={resultRemark}
                />
              </Col>
            </Row>
          )}
        </Form>
      )
    ) : (
      <Form>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="writable-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl.get(`sqam.common.model.resultExcuteFile`).d('索赔结果执行附件')}
              {...formItemLayout}
            >
              {getFieldDecorator('resultAttachmentUuid', {
                initialValue: resultAttachmentUuid,
              })(
                <Upload
                  bucketName={window.$$env.PRIVATE_BUCKET || 'private-bucket'}
                  bucketDirectory="sqam-claim"
                  attachmentUUID={resultAttachmentUuid}
                  tenantId={getCurrentOrganizationId()}
                  afterOpenUploadModal={this.afterOpenUploadModal}
                  viewOnly={!editFlag}
                />
              )}
            </Form.Item>
          </Col>
        </Row>
        {editFlag && (
          <Row {...EDIT_FORM_ROW_LAYOUT} className={classNames('last-form-item', 'half-row')}>
            <Col {...FORM_COL_2_LAYOUT}>
              <Form.Item label={intl.get(`sqam.common.model.resultRemark`).d('执行结果说明')}>
                {getFieldDecorator('resultRemark', {
                  initialValue: resultRemark,
                })(<Input.TextArea rows={2} />)}
              </Form.Item>
            </Col>
          </Row>
        )}
        {!editFlag && (
          <Row {...EDIT_FORM_ROW_LAYOUT} className={classNames('last-form-item', 'read-half-row')}>
            <Col {...FORM_COL_2_LAYOUT}>
              <DisplayFormItem
                label={intl.get(`sqam.common.model.resultRemark`).d('执行结果说明')}
                value={resultRemark}
              />
            </Col>
          </Row>
        )}
      </Form>
    );
    // );
  }
}
