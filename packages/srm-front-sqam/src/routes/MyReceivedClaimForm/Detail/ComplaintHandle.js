// 申诉处理
import React, { PureComponent } from 'react';
import { Form, Row, Col } from 'hzero-ui';
import { getCurrentOrganizationId } from 'utils/utils';
import UploadModal from 'components/Upload/index';
import intl from 'utils/intl';
import {
  EDIT_FORM_ITEM_LAYOUT,
  FORM_COL_2_LAYOUT,
  FORM_COL_3_LAYOUT,
  EDIT_FORM_ROW_LAYOUT,
} from 'utils/constants';
import { dateTimeRender } from 'utils/renderer';
// import { Bind } from 'lodash-decorators';

import DisplayFormItem from '../../components/DisplayFormItem';

const prefix = `sqam.common`;

const formLayout = {
  wrapperCol: {
    style: {
      textAlign: 'center',
    },
  },
};
/**
 * 基本信息Form
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Object} form - 表单对象
 */
export default class BasicInfoForm extends PureComponent {
  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      form = {},
      appealHandleActionMeaning,
      appealHandleOpinion, // 决议说明
      // appealedSum,
      appealedDate,
      appealHandledDate,
      appealContentMeaning,
      appealOpinion,
      applyTimes,
      supplierAttachmentUuid,
      // cancelFlag,
    } = this.props;
    const { getFieldDecorator } = form;

    const UploadModalProps = {
      viewOnly: true,
      attachmentUUID: supplierAttachmentUuid,
      icon: 'download',
      tenantId: getCurrentOrganizationId(),
      bucketName: window.$$env.PRIVATE_BUCKET || 'private-bucket',
      bucketDirectory: 'sqam-claim',
    };

    return (
      <Form>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <DisplayFormItem
              label={intl.get('sqam.common.model.applyTimes').d('申诉次数')}
              value={applyTimes}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <DisplayFormItem
              label={intl.get('sqam.common.date.statementDate').d('申诉日期')}
              value={dateTimeRender(appealedDate)}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <DisplayFormItem
              label={intl.get(`${prefix}.panel.appealHandledDate`).d('申诉处理日期')}
              value={dateTimeRender(appealHandledDate)}
            />
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <DisplayFormItem
              label={intl.get(`${prefix}.panel.statementContent`).d('申诉内容')}
              value={appealContentMeaning}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <DisplayFormItem
              {...formLayout}
              label={intl.get(`${prefix}.panel.supplierAppealAttachment`).d('供应商申诉附件')}
              value={<UploadModal {...UploadModalProps} />}
            />
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <DisplayFormItem
              label={intl.get('sqam.common.model.statementOption').d('申诉意见')}
              value={appealOpinion}
            />
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="half-row">
          <Col {...FORM_COL_2_LAYOUT}>
            <Form.Item
              label={intl.get(`${prefix}.model.dealAction`).d('处理动作')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('appealHandleActionCode', {
                initialValue: appealHandleActionMeaning,
              })(<span>{appealHandleActionMeaning}</span>)}
            </Form.Item>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="half-row">
          <Col {...FORM_COL_2_LAYOUT}>
            <DisplayFormItem
              label={intl.get(`${prefix}.model.statementResolution`).d('决议说明')}
              value={appealHandleOpinion}
            />
          </Col>
        </Row>
      </Form>
    );
  }
}
