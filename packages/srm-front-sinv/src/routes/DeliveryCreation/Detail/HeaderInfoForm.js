/**
 * HeaderInfoForm - 送货单创建明细页面 - 明细信息Form
 * @date: 2018-10-26
 * @author: lijun <jun.li06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { Form, Row, Col } from 'hzero-ui';
// import { isNumber } from 'lodash';
// import moment from 'moment';
import intl from 'utils/intl';
// import classnames from 'classnames';
// import ValueList from 'components/ValueList';
// import Lov from 'components/Lov';
// import { getCurrentOrganizationId } from 'utils/utils';
import { EDIT_FORM_ROW_LAYOUT, FORM_COL_3_LAYOUT, EDIT_FORM_ITEM_LAYOUT } from 'utils/constants';

// FormItem组件初始化
// const FormItem = Form.Item;
// TextArea组件初始化
// const { TextArea } = Input;
const FormItem = Form.Item;

/**
 * HeaderInfoForm - 送货单创建明细页面 - 明细信息Form
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Object} form - 表单对象
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
export default class HeaderInfoForm extends Component {
  /**
   * render
   * @returns React.element
   */
  render() {
    const { form = {}, dataSource = {}, customizeForm, dataSourceLoading } = this.props;
    const { getFieldDecorator = (e) => e } = form;
    const {
      companyName,
      organizationName,
      contactInfo,
      shipToLocationAddress,
      actualReceiverName,
      // carriersName,
      // carriersCode,
      // processingPlantAddress,
    } = dataSource;
    return customizeForm(
      {
        dataSourceLoading,
        form,
        dataSource,
        code: 'SINV.DELIVERY_CREATION_DETAIL.HEADERSHIP',
      },
      <Form>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem {...EDIT_FORM_ITEM_LAYOUT} label={intl.get(`entity.customer.tag`).d('客户')}>
              {getFieldDecorator('companyName', {
                initialValue: companyName,
              })(<span>{companyName}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`sinv.common.model.common.organizationName`).d('收货组织')}
            >
              {getFieldDecorator('organizationName', {
                initialValue: organizationName,
              })(<span>{organizationName}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`sinv.common.model.common.shipToLocationAddress`).d('收货地点')}
            >
              {getFieldDecorator('shipToLocationAddress', {
                initialValue: shipToLocationAddress,
              })(<span>{shipToLocationAddress}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`sinv.common.model.common.actualReceiverName`).d('送达方')}
            >
              {getFieldDecorator('actualReceiverName', {
                initialValue: actualReceiverName,
              })(<span>{actualReceiverName}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`sinv.common.model.common.contactor`).d('联系人')}
            >
              {getFieldDecorator('contactInfo', { initiaValue: contactInfo })(
                <span>{contactInfo}</span>
              )}
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }
}
