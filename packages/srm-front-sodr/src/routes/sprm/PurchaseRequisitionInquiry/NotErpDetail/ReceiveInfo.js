import React, { Component } from 'react';
import { Form, Row, Col } from 'hzero-ui';
import classnames from 'classnames';

import { EDIT_FORM_ROW_LAYOUT, FORM_COL_2_LAYOUT, FORM_COL_3_LAYOUT } from 'utils/constants';
import intl from 'utils/intl';

import DisplayFormItem from '../../components/DisplayFormItem';

const commonPrompt = 'sprm.common.model.common';

export default class ReceiveInfo extends Component {
  render() {
    const { dataSource } = this.props;
    const {
      receiverAddressName,
      receiverContactName,
      receiverTelNum,
      invoiceAddressName,
      invoiceContactName,
      receiverEmailAddress,
      invoiceTelNum,
    } = dataSource;
    return (
      <Form>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-half-row">
          <Col {...FORM_COL_2_LAYOUT}>
            <DisplayFormItem
              label={intl.get(`${commonPrompt}.receiverAddress`).d('收货方地址')}
              value={receiverAddressName}
            />
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <DisplayFormItem
              label={intl.get(`${commonPrompt}.receiverContactName`).d('收货联系人')}
              value={receiverContactName}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <DisplayFormItem
              label={intl.get(`${commonPrompt}.receiverTelNum`).d('收货联系电话')}
              value={receiverTelNum}
            />
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-half-row">
          <Col {...FORM_COL_2_LAYOUT}>
            <DisplayFormItem
              label={intl.get(`${commonPrompt}.invoiceAddress`).d('收单方地址')}
              value={invoiceAddressName}
            />
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className={classnames('read-row', 'last-form-item')}>
          <Col {...FORM_COL_3_LAYOUT}>
            <DisplayFormItem
              label={intl.get(`${commonPrompt}.invoiceContactName`).d('收单联系人')}
              value={invoiceContactName}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <DisplayFormItem
              label={intl.get(`${commonPrompt}.invoiceTelNum`).d('收单联系电话')}
              value={invoiceTelNum}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <DisplayFormItem
              label={intl.get(`${commonPrompt}.receiverEmail`).d('收单邮箱')}
              value={receiverEmailAddress}
            />
          </Col>
        </Row>
      </Form>
    );
  }
}
