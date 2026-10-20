/**
 * DeliveryInformationHeader - 收货/收单信息
 * @date: 2018-10-26
 * @author: lijun <jun.li06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Row, Col, Form } from 'hzero-ui';
import { FORM_COL_3_LAYOUT, EDIT_FORM_ROW_LAYOUT, EDIT_FORM_ITEM_LAYOUT } from 'utils/constants';
import intl from 'utils/intl';
import { Bind } from 'lodash-decorators';

const commonPrompt = 'sodr.common.model.common';

/**
 * DeliveryInformationHeader - 收货/收单信息
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Object} form - 表单对象
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
export default class DeliveryInformationHeader extends PureComponent {
  @Bind()
  renderHeaderForm() {
    const { dataSource = {}, form } = this.props;
    const {
      shipToLocationAddress,
      shipToLocContName,
      shipToLocTelNum,
      billToLocationAddress,
    } = dataSource;
    const { getFieldDecorator } = form;
    return (
      <Form>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`${commonPrompt}.shipToLocationAddress`).d('收货方地址')}
            >
              {getFieldDecorator('shipToLocationAddress')(<span>{shipToLocationAddress}</span>)}
            </Form.Item>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`${commonPrompt}.receiverContactName`).d('收货联系人')}
            >
              {getFieldDecorator('shipToLocContName')(<span>{shipToLocContName}</span>)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`${commonPrompt}.receiverTelNum`).d('收货联系电话')}
            >
              {getFieldDecorator('shipToLocTelNum')(<span>{shipToLocTelNum}</span>)}
            </Form.Item>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`${commonPrompt}.billToLocationAddress`).d('收单方地址')}
            >
              {getFieldDecorator('billToLocationAddress')(<span>{billToLocationAddress}</span>)}
            </Form.Item>
          </Col>
        </Row>
      </Form>
    );
  }

  render() {
    const { dataSource = {}, form, customizeForm } = this.props;
    return customizeForm(
      {
        form,
        dataSource,
        code: 'SODR.RECEIVED_ORDER_DETAIL.DELIVERY_CATA',
      },
      this.renderHeaderForm()
    );
  }
}
