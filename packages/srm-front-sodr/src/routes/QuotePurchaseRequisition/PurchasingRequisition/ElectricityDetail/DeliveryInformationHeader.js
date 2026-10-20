/**
 * SheetCreation - 整单引用创建
 * @date: 2020-11-17
 * @author: zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright 2020, Hand
 */
import React, { PureComponent } from 'react';
import { Form, Row, Col } from 'hzero-ui';

import intl from 'utils/intl';
import { FORM_COL_3_LAYOUT, EDIT_FORM_ROW_LAYOUT, EDIT_FORM_ITEM_LAYOUT } from 'utils/constants';

const FormItem = Form.Item;

/**
 * DeliveryInformationHeader - 收货/收单信息
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Object} form - 表单对象
 * @return React.element
 */
export default class DeliveryInformationHeader extends PureComponent {
  renderHeaderForm = () => {
    const { dataSource = {}, form } = this.props;
    const {
      shipToLocationAddress,
      shipToLocContName,
      shipToLocTelNum,
      billToLocationAddress,
      billToLocContName,
      billToLocTelNum,
      receiverEmailAddress,
    } = dataSource;
    const { getFieldDecorator } = form;

    return (
      <Form>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl
                .get(`sodr.quotePurchase.model.quotePurchase.shipToLocationAddress`)
                .d('收货方地址')}
            >
              {getFieldDecorator('shipToLocationAddress')(<span>{shipToLocationAddress}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl
                .get(`sodr.quotePurchase.model.quotePurchase.receiverContactName`)
                .d('收货联系人')}
            >
              {getFieldDecorator('shipToLocContName')(<span>{shipToLocContName}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl
                .get(`sodr.quotePurchase.model.quotePurchase.receiverTelNum`)
                .d('收货联系电话')}
            >
              {getFieldDecorator('shipToLocTelNum')(<span>{shipToLocTelNum}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl
                .get(`sodr.quotePurchase.model.quotePurchase.billToLocationAddress`)
                .d('收单方地址')}
            >
              {getFieldDecorator('billToLocationAddress')(<span>{billToLocationAddress}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl
                .get(`sodr.quotePurchase.model.quotePurchase.invoiceContactName`)
                .d('收单联系人')}
            >
              {getFieldDecorator('billToLocContName')(<span>{billToLocContName}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl
                .get(`sodr.quotePurchase.model.quotePurchase.invoiceTelNum`)
                .d('收单联系电话')}
            >
              {getFieldDecorator('billToLocTelNum')(<span>{billToLocTelNum}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl
                .get(`sodr.quotePurchase.model.quotePurchase.receiverEmailAddress`)
                .d('收单邮箱')}
            >
              {getFieldDecorator('receiverEmailAddress')(<span>{receiverEmailAddress}</span>)}
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  };

  render() {
    const { dataSource = {}, customizeForm, form } = this.props;
    return customizeForm(
      {
        form,
        dataSource,
        code: 'SODR.ORDER_CREATE_LINE_LIST.DELIVERY_CATA',
      },
      this.renderHeaderForm()
    );
  }
}
