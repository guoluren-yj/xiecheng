// 申诉内容
import React, { PureComponent } from 'react';
import { Form, Row, Col } from 'hzero-ui';
import intl from 'utils/intl';
// import uuidv4 from 'uuid/v4';
import { getCurrentOrganizationId } from 'utils/utils';
import { FORM_COL_3_LAYOUT, FORM_COL_2_LAYOUT, EDIT_FORM_ROW_LAYOUT } from 'utils/constants';

import UploadModal from '_components/Upload/index';
import DisplayFormItem from '../../components/DisplayFormItem';

const prefix = `sqam.common`;

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
      appealContentMeaning, // 申诉内容
      appealOpinion, // 申诉意见
      supplierAttachmentUuid,
    } = this.props;

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
        <Row {...EDIT_FORM_ROW_LAYOUT} className="writable-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <DisplayFormItem
              label={intl.get(`${prefix}.panel.statementContent`).d('申诉内容')}
              value={<pre>{appealContentMeaning}</pre>}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <UploadModal {...UploadModalProps} />
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="half-row">
          <Col {...FORM_COL_2_LAYOUT}>
            <DisplayFormItem
              label={intl.get(`${prefix}.model.statementOption`).d('申诉意见')}
              value={<pre>{appealOpinion}</pre>}
            />
          </Col>
        </Row>
      </Form>
    );
  }
}
