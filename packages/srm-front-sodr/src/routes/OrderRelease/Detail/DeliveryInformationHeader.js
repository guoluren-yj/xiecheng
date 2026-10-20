/**
 * SheetCreation - 整单引用创建
 * @date: 2019-02-20
 * @author: guochaochao <chaochao.guo@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { Form, Row, Col } from 'hzero-ui';
import classnames from 'classnames';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
import { FORM_COL_3_LAYOUT, EDIT_FORM_ROW_LAYOUT, EDIT_FORM_ITEM_LAYOUT } from 'utils/constants';

const FormItem = Form.Item;
const modelPrompt = 'sodr.orderRelease.model.common';

/**
 * DeliveryInformationHeader - 收货/收单信息
 * @extends {Component} - React.Component
 * @reactProps {Object} form - 表单对象
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
export default class DeliveryInformationHeader extends Component {
  @Bind()
  renderHeaderForm() {
    const { dataSource = {}, form } = this.props;
    const {
      poSourcePlatform,
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
              label={intl.get(`${modelPrompt}.shipToLocationAddress`).d('收货方地址')}
            >
              {getFieldDecorator('shipToLocationAddress')(<span>{shipToLocationAddress}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`${modelPrompt}.receiverContactName`).d('收货联系人')}
            >
              {getFieldDecorator('shipToLocContName')(<span>{shipToLocContName}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`${modelPrompt}.receiverTelNum`).d('收货联系电话')}
            >
              {getFieldDecorator('shipToLocTelNum')(<span>{shipToLocTelNum}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`${modelPrompt}.billToLocationAddress`).d('收单方地址')}
            >
              {getFieldDecorator('billToLocationAddress')(<span>{billToLocationAddress}</span>)}
            </FormItem>
          </Col>
        </Row>
        {poSourcePlatform === 'E-COMMERCE' && (
          <Row {...EDIT_FORM_ROW_LAYOUT} className={classnames('read-row', 'last-form-item')}>
            <Col {...FORM_COL_3_LAYOUT}>
              <FormItem
                {...EDIT_FORM_ITEM_LAYOUT}
                label={intl.get(`${modelPrompt}.invoiceContactName`).d('收单联系人')}
              >
                {getFieldDecorator('billToLocContName')(<span>{billToLocContName}</span>)}
              </FormItem>
            </Col>
            <Col {...FORM_COL_3_LAYOUT}>
              <FormItem
                {...EDIT_FORM_ITEM_LAYOUT}
                label={intl.get(`${modelPrompt}.invoiceTelNum`).d('收单联系电话')}
              >
                {getFieldDecorator('billToLocTelNum')(<span>{billToLocTelNum}</span>)}
              </FormItem>
            </Col>
            <Col {...FORM_COL_3_LAYOUT}>
              <FormItem
                {...EDIT_FORM_ITEM_LAYOUT}
                label={intl.get(`${modelPrompt}.receiverEmailAddress`).d('收单邮箱')}
              >
                {getFieldDecorator('receiverEmailAddress')(<span>{receiverEmailAddress}</span>)}
              </FormItem>
            </Col>
          </Row>
        )}
      </Form>
    );
  }

  render() {
    const { dataSource = {}, form, customizeForm } = this.props;
    return customizeForm(
      {
        form,
        dataSource,
        code: 'SODR.ORDER_PUBLISH_LINE_LIST.DELIVERY_CATA',
      },
      this.renderHeaderForm()
    );
  }
}
