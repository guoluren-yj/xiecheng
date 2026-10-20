/**
 * ClarifyHeaderFrom - 澄清函详情基本信息展示
 * @date: 2019-11-13
 * @author: jing.chen05@hand-china.com
 * @version: 1.0.0
 * @copyright Copyright (c) 2019, Hand
 */
import React, { PureComponent } from 'react';
import { Form, Row, Col } from 'hzero-ui';
import intl from 'utils/intl';

import {
  // EDIT_FORM_ITEM_LAYOUT,
  FORM_COL_3_LAYOUT,
  FORM_COL_2_LAYOUT,
  EDIT_FORM_ROW_LAYOUT,
} from 'utils/constants';
import Upload from 'srm-front-boot/lib/components/Upload';
import { valueMapMeaning } from 'utils/renderer';
import { PRIVATE_BUCKET } from '_utils/config';
// import styles from './index.less';

@Form.create({ fieldNameProp: null })
export default class ClarifyHeaderFrom extends PureComponent {
  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      organizationId,
      dataSource = {},
      clarifyStatusLov = [],
      customizeForm,
      form,
      unitCode,
    } = this.props;
    const {
      title,
      clarifyNum,
      companyName,
      clarifyStatus,
      submittedByUserName,
      sourceNum,
      submittedDate,
      attachmentUuid,
      visibleSuppliersMeaning,
      sourceMethod,
    } = dataSource || {};
    const { getFieldDecorator = () => {} } = form || {};

    return customizeForm(
      {
        code: unitCode,
        form: this.props.form,
        dataSource,
      },
      <Form>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="half-row">
          <Col {...FORM_COL_2_LAYOUT}>
            <Form.Item label={intl.get(`ssrc.clarify.model.clarify.title`).d('标题')}>
              {getFieldDecorator('title', {
                initialValue: title,
              })(<span>{title}</span>)}
            </Form.Item>
          </Col>
        </Row>

        <Row {...EDIT_FORM_ROW_LAYOUT}>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item label={intl.get(`ssrc.clarify.model.clarify.clarifyNum`).d('澄清单号')}>
              {getFieldDecorator('clarifyNum', {
                initialValue: clarifyNum,
              })(<span>{clarifyNum}</span>)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item label={intl.get('ssrc.common.company').d('公司')}>
              {getFieldDecorator('companyName', {
                initialValue: companyName,
              })(<span>{companyName}</span>)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item label={intl.get(`ssrc.clarify.model.clarify.clarifyStatus`).d('状态')}>
              {getFieldDecorator('clarifyStatus', {
                initialValue: clarifyStatus,
              })(<span>{valueMapMeaning(clarifyStatusLov, clarifyStatus)}</span>)}
            </Form.Item>
          </Col>
        </Row>

        <Row {...EDIT_FORM_ROW_LAYOUT}>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl.get(`ssrc.clarify.model.clarify.submittedByUserName`).d('发布人')}
            >
              {getFieldDecorator('submittedByUserName', {
                initialValue: submittedByUserName,
              })(<span>{submittedByUserName}</span>)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item label={intl.get(`ssrc.clarify.model.clarify.sourceNum`).d('寻源单号')}>
              {getFieldDecorator('sourceNum', {
                initialValue: sourceNum,
              })(<span>{sourceNum}</span>)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item label={intl.get(`ssrc.clarify.model.clarify.submittedDate`).d('发布时间')}>
              {getFieldDecorator('submittedDate', {
                initialValue: submittedDate,
              })(<span>{submittedDate}</span>)}
            </Form.Item>
          </Col>
        </Row>

        <Row {...EDIT_FORM_ROW_LAYOUT}>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl.get(`ssrc.clarify.model.clarify.clarifyAttachment`).d('澄清函附件')}
            >
              {getFieldDecorator('attachmentUuid', {
                initialValue: attachmentUuid,
              })(
                <Upload
                  filePreview
                  bucketName={PRIVATE_BUCKET}
                  bucketDirectory="ssrc-bid-header"
                  attachmentUUID={attachmentUuid}
                  tenantId={organizationId}
                  icon="download"
                  viewOnly
                />
              )}
            </Form.Item>
          </Col>
          {/* 供应商=邀请 显示可见供应商 */}
          {sourceMethod === 'INVITE' && (
            <Col {...FORM_COL_3_LAYOUT}>
              <Form.Item
                {...FORM_COL_3_LAYOUT}
                label={intl.get(`ssrc.clarify.model.clarify.visibleSupplier`).d('可见供应商')}
              >
                {getFieldDecorator('visibleSuppliersMeaning', {
                  initialValue: visibleSuppliersMeaning,
                })(<span>{visibleSuppliersMeaning}</span>)}
              </Form.Item>
            </Col>
          )}
        </Row>
      </Form>
    );
  }
}
