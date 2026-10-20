/**
 * HeaderInfo - 详情头信息展示组件
 * @date: 2020-04-01
 * @author: Goku<xu.pan01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */
import React, { Component } from 'react';
import { Form, Row, Col } from 'hzero-ui';
import withCustomize from 'srm-front-cuz/lib/h0Customize';

import intl from 'utils/intl';
import { FORM_COL_3_LAYOUT, EDIT_FORM_ROW_LAYOUT, EDIT_FORM_ITEM_LAYOUT } from 'utils/constants';
import { numberSeparatorRender } from '@/utils/renderer';

const promptCode = 'ssrc.depositManage';
const FormItem = Form.Item;
// const DisplayFormItem = (props) => {
//   const { label, value } = props;
//   return (
//     <FormItem label={label} {...EDIT_FORM_ITEM_LAYOUT}>
//       {value}
//     </FormItem>
//   );
// };

/**
 * HeaderInfo - 展示组件 - 询价单头信息
 * @extends {Component} - React.Component
 * @reactProps {!Object} [headerInfo={}] - 数据源
 * @return React.element
 */

@withCustomize({
  unitCode: [
    'SSRC.EXPENSE_MANAGEMENT.BASE_INFO', // 基础信息
  ],
})
@Form.create({ fieldNameProp: null })
export default class HeaderInfo extends Component {
  render() {
    const {
      headerInfo,
      // headerInfo: { sourceNum, sourceTitle, companyName, bidBond, bidFileExpense } = {},
      customizeForm = () => {},
      form: { getFieldDecorator },
    } = this.props;
    return customizeForm(
      {
        code: 'SSRC.EXPENSE_MANAGEMENT.BASE_INFO',
        form: this.props.form,
        dataSource: headerInfo,
      },
      <Form>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${promptCode}.model.depositManage.sourceNum`).d('寻源单号')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('sourceNum', {
                initialValue: headerInfo.sourceNum,
              })(<span>{headerInfo.sourceNum}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${promptCode}.model.depositManage.sourceTitle`).d('寻源标题')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('sourceTitle', {
                initialValue: headerInfo.sourceTitle,
              })(<span>{headerInfo.sourceTitle}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${promptCode}.model.depositManage.companyName`).d('公司')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('companyName', {
                initialValue: headerInfo.companyName,
              })(<span>{headerInfo.companyName}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl
                .get(`${promptCode}.model.depositManage.bidFileExpense`)
                .d('招标文件费(元)')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('bidFileExpense', {
                initialValue: headerInfo.bidFileExpense,
              })(<span>{numberSeparatorRender(headerInfo.bidFileExpense)}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${promptCode}.model.depositManage.bidBond`).d('保证金(元)')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('bidBond', {
                initialValue: headerInfo.bidBond,
              })(<span>{numberSeparatorRender(headerInfo.bidBond)}</span>)}
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }
}
