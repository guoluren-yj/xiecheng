/**
 * SheetCreation - 整单引用创建
 * @date: 2019-02-20
 * @author: guochaochao <chaochao.guo@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Form, Row, Col, Spin } from 'hzero-ui';
import intl from 'utils/intl';
import { FORM_COL_3_LAYOUT, EDIT_FORM_ROW_LAYOUT, EDIT_FORM_ITEM_LAYOUT } from 'utils/constants';
import { Bind } from 'lodash-decorators';

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
      </Form>
    );
  }

  render() {
    const { dataSource = {}, loading, customizeForm, form } = this.props;
    return (
      <Spin spinning={loading}>
        {customizeForm(
          {
            form,
            dataSource,
            code: 'SODR.ORDER_CREATE_LINE_LIST.DELIVERY_CATA',
          },
          this.renderHeaderForm()
        )}
      </Spin>
    );
  }
}
