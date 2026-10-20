/*
 * NonDeliveryInformationHeader - 非ERP采购申请
 * @date: 2019-02-22
 * @author: guochaochao <chaochao.guo@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { Row, Col, Form } from 'hzero-ui';
import classnames from 'classnames';

import { FORM_COL_3_LAYOUT, EDIT_FORM_ROW_LAYOUT, EDIT_FORM_ITEM_LAYOUT } from 'utils/constants';

import intl from 'utils/intl';

// import DisplayFormItem from '../../components/DisplayFormItem';

const FormItem = Form.Item;
const commonPrompt = 'sprm.common.model.common';

@Form.create({ fieldNameProp: null })
export default class NonDeliveryInformationHeader extends Component {
  render() {
    const {
      headerInfo = {},
      form: { getFieldDecorator },
      customizeForm,
    } = this.props;
    const {
      receiverAddressName,
      receiverContactName,
      internationalTelCode,
      receiverTelNum,
      invoiceAddressName,
      invoiceContactName,
      invoiceTelNum,
      receiverEmailAddress,
      purchaseUnitName,
    } = headerInfo;
    return customizeForm(
      {
        code: 'SPRM.PURCHASE_REQUISITION_CANCEL.DETAIL.DELIVERYINFO',
        dataSource: headerInfo,
        form: this.props.form,
      },
      <Form>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${commonPrompt}.receiverAddress`).d('收货方地址')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('receiverAddressName')(<span> {receiverAddressName}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`${commonPrompt}.receiverContactName`).d('收货联系人')}
            >
              {getFieldDecorator('receiverContactName')(<span> {receiverContactName}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${commonPrompt}.receiverTelNum`).d('收货联系电话')}
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
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${commonPrompt}.invoiceAddress`).d('收单方地址')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('invoiceAddressName')(<span>{invoiceAddressName}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${commonPrompt}.invoiceContactName`).d('收单联系人')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('invoiceContactName')(<span> {invoiceContactName}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${commonPrompt}.invoiceTelNum`).d('收单联系电话')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('invoiceTelNum')(<span>{invoiceTelNum || ''}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className={classnames('read-row')}>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${commonPrompt}.purchaseUnitName`).d('收货方组织')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('purchaseUnitName')(<span>{purchaseUnitName}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${commonPrompt}.receiverEmail`).d('收单邮箱')}
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
