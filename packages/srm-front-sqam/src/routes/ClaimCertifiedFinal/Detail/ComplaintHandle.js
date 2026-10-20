// 申诉处理
import React, { PureComponent } from 'react';
import { Form, Row, Col } from 'hzero-ui';
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import UploadModal from 'components/Upload/index';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import {
  EDIT_FORM_ITEM_LAYOUT,
  FORM_COL_2_LAYOUT,
  FORM_COL_3_LAYOUT,
  EDIT_FORM_ROW_LAYOUT,
} from 'utils/constants';
import { dateTimeRender } from 'utils/renderer';
// import { Bind } from 'lodash-decorators';

const prefix = `sqam.common`;
// const formLayout = {
//   wrapperCol: {
//     style: {
//       textAlign: 'center',
//     },
//   },
// };
/**
 * 基本信息Form
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Object} form - 表单对象
 */
@withCustomize({
  unitCode: ['SQAM.CLAIM_FORM_DETAIL.STATEMENT'],
})
export default class BasicInfoForm extends PureComponent {
  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      // detail,
      form = {},
      appealHandleOpinion, // 决议说明
      supplierAttachmentUuid,
      applyTimes,
      appealedDate,
      appealHandledDate,
      appealContentMeaning,
      appealOpinion,
      appealHandleActionMeaning,
      // customizeForm,
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
      // {
      //   code: 'SQAM.CLAIM_FORM_DETAIL.STATEMENT',
      //   form,
      //   dataSource: detail,
      // },
      <Form>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl.get('sqam.common.model.applyTimes').d('申诉次数')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('applyTimes')(<span>{applyTimes}</span>)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl.get('sqam.common.date.statementDate').d('申诉日期')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('appealedDate')(<span>{dateTimeRender(appealedDate)}</span>)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl.get(`${prefix}.panel.appealHandledDate`).d('申诉处理日期')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('appealHandledDate')(
                <span>{dateTimeRender(appealHandledDate)}</span>
              )}
            </Form.Item>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT}>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl.get(`${prefix}.panel.statementContent`).d('申诉内容')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('appealContentMeaning')(<span>{appealContentMeaning}</span>)}
            </Form.Item>
            {/* <DisplayFormItem
              label={intl.get(`${prefix}.panel.statementContent`).d('申诉内容')}
              value={appealContentMeaning}
            /> */}
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl.get(`${prefix}.panel.supplierAppealAttachment`).d('供应商申诉附件')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('supplierAttachmentUuid')(
                <span>{<UploadModal {...UploadModalProps} />}</span>
              )}
            </Form.Item>
            {/* <DisplayFormItem
              {...formLayout}
              label={intl.get(`${prefix}.panel.supplierAppealAttachment`).d('供应商申诉附件')}
              value={<UploadModal {...UploadModalProps} />}
            /> */}
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT}>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl.get('sqam.common.model.statementOption').d('申诉意见')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('supplierAttachmentUuid')(<span>{appealOpinion}</span>)}
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
                initialValue: appealHandleActionMeaning,
              })(<span>{appealHandleActionMeaning}</span>)}
            </Form.Item>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="half-row">
          <Col {...FORM_COL_2_LAYOUT}>
            <Form.Item label={intl.get(`${prefix}.model.statementResolution`).d('决议说明')}>
              {getFieldDecorator('appealHandleOpinion')(<span>{appealHandleOpinion}</span>)}
            </Form.Item>
            {/* <DisplayFormItem
              label={intl.get(`${prefix}.model.statementResolution`).d('决议说明')}
              value={appealHandleOpinion}
            /> */}
          </Col>
        </Row>
      </Form>
    );
  }
}
