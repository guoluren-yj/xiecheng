// 申诉处理
import React, { PureComponent } from 'react';
import { Form, Row, Col } from 'hzero-ui';
// import withCustomize from 'srm-front-cuz/lib/h0Customize';
import intl from 'utils/intl';
import {
  EDIT_FORM_ITEM_LAYOUT,
  FORM_COL_2_LAYOUT,
  EDIT_FORM_ROW_LAYOUT,
  FORM_COL_3_LAYOUT,
} from 'utils/constants';
import UploadModal from 'components/Upload/index';
import { dateTimeRender } from 'utils/renderer';
import { getCurrentOrganizationId } from 'utils/utils';

const prefix = `sqam.common`;

/**
 * 基本信息Form
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Object} form - 表单对象
 */
// @withCustomize({
//   unitCode: ['SQAM.CLAIM_CONFIRMATION_DETAIL.STATEMENT'],
// })
export default class BasicInfoForm extends PureComponent {
  /**
   * render
   * @returns React.element
   */
  render() {
    const { form = {}, dataSource, applyTimes, customizeForm } = this.props;
    const { getFieldDecorator } = form;

    const UploadModalProps = {
      viewOnly: true,
      attachmentUUID: dataSource.supplierAttachmentUuid,
      icon: 'download',
      tenantId: getCurrentOrganizationId(),
      bucketName: window.$$env.PRIVATE_BUCKET || 'private-bucket',
      bucketDirectory: 'sqam-claim',
    };

    return customizeForm(
      {
        code: 'SQAM.CLAIM_CONFIRMATION_DETAIL.STATEMENT',
        form,
        dataSource,
      },
      <Form>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item label={intl.get('sqam.common.model.applyTimes').d('申诉次数')}>
              {getFieldDecorator('applyTimes')(<span>{applyTimes}</span>)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item label={intl.get('sqam.common.date.statementDate').d('申诉日期')}>
              {getFieldDecorator('appealedDate')(
                <span>{dateTimeRender(dataSource.appealedDate)}</span>
              )}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item label={intl.get(`${prefix}.appealHandledDate`).d('申诉处理日期')}>
              {getFieldDecorator('appealHandledDate')(
                <span>{dateTimeRender(dataSource.appealHandledDate)}</span>
              )}
            </Form.Item>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item label={intl.get(`${prefix}.panel.statementContent`).d('申诉内容')}>
              {getFieldDecorator('appealContentMeaning')(
                <span>{dataSource.appealContentMeaning}</span>
              )}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl.get(`${prefix}.panel.supplierAppealAttachment`).d('供应商申诉附件')}
            >
              {getFieldDecorator('supplierAttachmentUuid')(
                <span>{<UploadModal {...UploadModalProps} />}</span>
              )}
            </Form.Item>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item label={intl.get('sqam.common.model.statementOption').d('申诉意见')}>
              {getFieldDecorator('appealOpinion')(<span>{dataSource.appealOpinion}</span>)}
            </Form.Item>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="half-row">
          <Col {...FORM_COL_2_LAYOUT}>
            <Form.Item
              label={intl.get(`${prefix}.model.dealAction`).d('处理动作')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('appealHandleActionCode', {
                initialValue: dataSource.appealHandleActionMeaning,
              })(<span>{dataSource.appealHandleActionMeaning}</span>)}
            </Form.Item>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="half-row">
          <Col {...FORM_COL_2_LAYOUT}>
            <Form.Item label={intl.get(`${prefix}.model.statementResolution`).d('决议说明')}>
              {getFieldDecorator('appealHandleOpinion')(
                <span>{dataSource.appealHandleOpinion}</span>
              )}
            </Form.Item>
          </Col>
        </Row>
      </Form>
    );
  }
}
