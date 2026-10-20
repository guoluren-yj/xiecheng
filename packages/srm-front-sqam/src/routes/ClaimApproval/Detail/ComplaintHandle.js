// 申诉处理
import React, { PureComponent } from 'react';
import { Form, Row, Col } from 'hzero-ui';
import intl from 'utils/intl';
import { FORM_COL_2_LAYOUT, EDIT_FORM_ROW_LAYOUT, FORM_COL_3_LAYOUT } from 'utils/constants';
import UploadModal from 'components/Upload/index';
import { getCurrentOrganizationId } from 'utils/utils';
import { dateRender } from 'utils/renderer';

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
@Form.create({ fieldNameProp: null })
export default class BasicInfoForm extends PureComponent {
  // 计算申诉次数
  getApplyTimes(appealedSum = 0, appealedCount = 0) {
    return [false, null, undefined, '', 0, NaN].includes(appealedCount)
      ? appealedSum
      : `${appealedSum}/${appealedCount}`;
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const {form, customizeForm,dataSource = {}, form:{getFieldDecorator} } = this.props;
    const {
      // cancelFlag,
      appealedSum,
      appealedCount,
      appealHandleActionMeaning,
    } = dataSource;
    // const newActionCodes = cancelFlag
    //   ? [appealHandleActionCode, 'CANCEL_CLAIM']
    //   : appealHandleActionCode;
    // console.log(newActionCodes, appealHandleActionCode, cancelFlag);

    const UploadModalProps = {
      viewOnly: true,
      attachmentUUID: dataSource.supplierAttachmentUuid,
      icon: 'download',
      tenantId: getCurrentOrganizationId(),
      bucketName: window.$$env.PRIVATE_BUCKET || 'private-bucket',
      bucketDirectory: 'sqam-claim',
    };

    return customizeForm({
      code:"SQAM.CLAIM_APPROVAL_DETAIL.STATEMENT",
      form,
      dataSource,
    },
      <Form>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item label={intl.get('sqam.common.model.applyTimes').d('申诉次数')}>
              {getFieldDecorator("appealedSum")(<span>{this.getApplyTimes(appealedSum, appealedCount)}</span>)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item label={intl.get('sqam.common.date.statementDate').d('申诉日期')}>
              {getFieldDecorator("appealedDate")(<span>{dateRender(dataSource.appealedDate)}</span>)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item label={intl.get(`${prefix}.appealHandledDate`).d('申诉处理日期')}>
              {getFieldDecorator("appealHandledDate")(<span>{dateRender(dataSource.appealHandledDate)}</span>)}
            </Form.Item>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item label={intl.get(`${prefix}.panel.statementContent`).d('申诉内容')}>
              {getFieldDecorator("appealContent")(<span>{dataSource.appealContentMeaning}</span>)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item {...formLayout} label={intl.get(`${prefix}.panel.supplierAppealAttachment`).d('供应商申诉附件')}>
              {getFieldDecorator("supplierAttachmentUuid")(<UploadModal {...UploadModalProps} />)}
            </Form.Item>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item {...formLayout} label={intl.get(`${prefix}.model.statementOption`).d('申诉意见')}>
              {getFieldDecorator("appealOpinion")(<span>{dataSource.appealOpinion}</span>)}
            </Form.Item>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="half-row">
          <Col {...FORM_COL_2_LAYOUT}>
            <Form.Item label={intl.get(`${prefix}.model.dealAction`).d('处理动作')}>
              {getFieldDecorator("appealHandleActionCode")(<span>{appealHandleActionMeaning}</span>)}
            </Form.Item>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="half-row">
          <Col {...FORM_COL_2_LAYOUT}>
            <Form.Item label={intl.get(`${prefix}.model.statementResolution`).d('决议说明')}>
              {getFieldDecorator("appealHandleOpinion")(<span>{dataSource.appealHandleOpinion}</span>)}
            </Form.Item>
          </Col>
        </Row>
      </Form>
    );
  }
}
