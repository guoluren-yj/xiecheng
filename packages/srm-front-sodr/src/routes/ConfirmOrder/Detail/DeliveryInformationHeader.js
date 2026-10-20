/**
 * SheetCreation - 整单引用创建
 * @date: 2019-02-20
 * @author: guochaochao <chaochao.guo@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Form, Row, Col } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
import { FORM_COL_3_LAYOUT, EDIT_FORM_ROW_LAYOUT, EDIT_FORM_ITEM_LAYOUT } from 'utils/constants';

const modelPrompt = 'sodr.confirmOrder.model.common';

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
    const { getFieldDecorator = (e) => e } = form;
    const {
      // poSourcePlatform,
      shipToLocationAddress,
      shipToLocContName,
      shipToLocTelNum,
      billToLocationAddress,
      // billToLocContName,
      // billToLocTelNum,
      // receiverEmailAddress,
    } = dataSource;
    return (
      <Form>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`${modelPrompt}.shipToLocationAddress`).d('收货方地址')}
            >
              {getFieldDecorator('shipToLocationAddress')(<span>{shipToLocationAddress}</span>)}
            </Form.Item>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`${modelPrompt}.receiverContactName`).d('收货联系人')}
            >
              {getFieldDecorator('shipToLocContName')(<span>{shipToLocContName}</span>)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`${modelPrompt}.receiverTelNum`).d('收货联系电话')}
            >
              {getFieldDecorator('shipToLocTelNum')(<span>{shipToLocTelNum}</span>)}
            </Form.Item>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`${modelPrompt}.billToLocationAddress`).d('收单方地址')}
            >
              {getFieldDecorator('billToLocationAddress')(<span>{billToLocationAddress}</span>)}
            </Form.Item>
          </Col>
        </Row>
        {/* {poSourcePlatform === 'E-COMMERCE' && (
          <Row {...EDIT_FORM_ROW_LAYOUT} className={classnames('read-row', 'last-form-item')}>
            <Col {...FORM_COL_3_LAYOUT}>
              <DisplayFormItem
                label={intl.get(`${modelPrompt}.invoiceContactName`).d('收单联系人')}
                value={billToLocContName}
              />
            </Col>
            <Col {...FORM_COL_3_LAYOUT}>
              <DisplayFormItem
                label={intl.get(`${modelPrompt}.invoiceTelNum`).d('收单联系电话')}
                value={billToLocTelNum}
              />
            </Col>
            <Col {...FORM_COL_3_LAYOUT}>
              <DisplayFormItem
                label={intl.get(`${modelPrompt}.receiverEmailAddress`).d('收单邮箱')}
                value={receiverEmailAddress}
              />
            </Col>
          </Row>
        )} */}
      </Form>
    );
  }

  render() {
    const { dataSource = {}, customizeForm, form } = this.props;
    return customizeForm(
      {
        form,
        dataSource,
        code: 'SODR.CONFIRM_ORDER_DETAIL.DELIVERY_CATA',
      },
      this.renderHeaderForm()
    );
  }
}
