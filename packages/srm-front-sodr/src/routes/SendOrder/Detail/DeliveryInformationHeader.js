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

const commonPrompt = 'sprm.common.model.common';
const FormItem = Form.Item;
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
    const { getFieldDecorator } = form;
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
    return (
      <Form>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`${commonPrompt}.shipToLocationAddress`).d('收货方地址')}
            >
              {getFieldDecorator('shipToLocationAddress')(<span>{shipToLocationAddress}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`${commonPrompt}.receiverContactName`).d('收货联系人')}
            >
              {getFieldDecorator('shipToLocContName')(<span>{shipToLocContName}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`${commonPrompt}.receiverTelNum`).d('收货联系电话')}
            >
              {getFieldDecorator('shipToLocTelNum')(<span>{shipToLocTelNum}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`${commonPrompt}.billToLocationAddress`).d('收单方地址')}
            >
              {getFieldDecorator('billToLocationAddress')(<span>{billToLocationAddress}</span>)}
            </FormItem>
          </Col>
        </Row>
        {poSourcePlatform === 'E-COMMERCE' && (
          <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
            <Col {...FORM_COL_3_LAYOUT}>
              <FormItem
                {...EDIT_FORM_ITEM_LAYOUT}
                label={intl.get(`${commonPrompt}.invoiceContactName`).d('收单联系人')}
              >
                {getFieldDecorator('billToLocContName')(<span>{billToLocContName}</span>)}
              </FormItem>
            </Col>
            <Col {...FORM_COL_3_LAYOUT}>
              <FormItem
                {...EDIT_FORM_ITEM_LAYOUT}
                label={intl.get(`${commonPrompt}.invoiceTelNum`).d('收单联系电话')}
              >
                {getFieldDecorator('billToLocTelNum')(<span>{billToLocTelNum}</span>)}
              </FormItem>
            </Col>
            <Col {...FORM_COL_3_LAYOUT}>
              <FormItem
                {...EDIT_FORM_ITEM_LAYOUT}
                label={intl.get(`${commonPrompt}.receiverEmail`).d('收单邮箱')}
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
    const { dataSource = {}, customizeForm, form, sourceFromCancel } = this.props;
    return customizeForm(
      {
        form,
        dataSource,
        code: sourceFromCancel
          ? 'SODR.ORDER_PROCESS_CONTROL_DETAIL.DELIVERY_CATA'
          : 'SODR.SEND_ORDER_DETAIL.DELIVERY_CATA',
      },
      this.renderHeaderForm()
    );
  }
}
