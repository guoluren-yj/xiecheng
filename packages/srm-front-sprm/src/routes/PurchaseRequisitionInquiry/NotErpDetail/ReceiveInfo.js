import React, { Component } from 'react';
import { Form, Row, Col } from 'hzero-ui';
import classnames from 'classnames';

import {
  EDIT_FORM_ROW_LAYOUT,
  FORM_COL_2_LAYOUT,
  FORM_COL_3_LAYOUT,
  EDIT_FORM_ITEM_LAYOUT,
} from 'utils/constants';
import intl from 'utils/intl';

// import DisplayFormItem from '../../components/DisplayFormItem';
const FormItem = Form.Item;
const prefix = 'sprm.common.model.common';

@Form.create({ fieldNameProp: null })
export default class ReceiveInfo extends Component {
  render() {
    const { dataSource, form, customizeForm } = this.props;
    const {
      receiverAddressName,
      receiverContactName,
      internationalTelCode,
      receiverTelNum,
      invoiceAddressName,
      invoiceContactName,
      receiverEmailAddress,
      invoiceTelNum,
      purchaseUnitName,
    } = dataSource;
    const { getFieldDecorator } = form;
    return customizeForm(
      {
        code: 'SRPM.PURCHAE_REQUISITION_QUERY.DETAIL.DELIVERYINFO', // 单元编码，必传
        form,
      },
      <Form>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-half-row">
          <Col {...FORM_COL_2_LAYOUT}>
            <FormItem
              label={intl.get(`${prefix}.receiverAddress`).d('收货方地址')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('receiverAddressName')(<span> {receiverAddressName}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`${prefix}.receiverContactName`).d('收货联系人')}
            >
              {getFieldDecorator('receiverContactName')(<span> {receiverContactName}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${prefix}.receiverTelNum`).d('收货联系电话')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('receiverTelNum')(
                <span>
                  {receiverTelNum ? `${internationalTelCode || ''} ${receiverTelNum}` : ''}
                </span>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-half-row">
          <Col {...FORM_COL_2_LAYOUT}>
            <FormItem
              label={intl.get(`${prefix}.invoiceAddress`).d('收单方地址')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('invoiceAddressName')(<span>{invoiceAddressName}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className={classnames('read-row')}>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${prefix}.invoiceContactName`).d('收单联系人')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('invoiceContactName')(<span> {invoiceContactName}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${prefix}.invoiceTelNum`).d('收单联系电话')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('invoiceTelNum')(<span>{invoiceTelNum || ''}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${prefix}.purchaseUnitName`).d('收货方组织')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('purchaseUnitName')(<span>{purchaseUnitName}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_2_LAYOUT}>
            <FormItem
              label={intl.get(`${prefix}.receiverEmail`).d('收单邮箱')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('receiverEmailAddress')(<span>{receiverEmailAddress}</span>)}
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }
}
