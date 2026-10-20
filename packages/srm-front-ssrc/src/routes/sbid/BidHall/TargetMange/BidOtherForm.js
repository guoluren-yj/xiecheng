/**
 * bidHall - 寻源服务/招标维护 - 其他信息表单
 * @date: 2019-06-27
 * @author: zoukang <kang.zou@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Form, Row, Col } from 'hzero-ui';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { FORM_COL_3_LAYOUT, EDIT_FORM_ITEM_LAYOUT } from 'utils/constants';
import { yesOrNoRender } from 'utils/renderer';

const FormItem = Form.Item;

@Form.create({ fieldNameProp: null })
@formatterCollections({ code: ['ssrc.bidHall'] })
export default class BidOtherForm extends Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  render() {
    const {
      header,
      customizeForm,
      form: { getFieldDecorator },
    } = this.props;
    return customizeForm(
      {
        code: 'SSRC.BID_HALL_CHECK_PRICE.OTHER_INFO',
        form: this.props.form,
        dataSource: header,
      },
      <Form>
        <Row gutter={48} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`ssrc.bidHall.model.bidHall.bidPlanName`).d('寻源计划')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('bidPlanLineName', {
                initialValue: header.bidPlanLineName,
              })(<span>{header.bidPlanLineName}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`ssrc.bidHall.model.bidHall.projectCode`).d('项目编码')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('projectNum', {
                initialValue: header.projectNum,
              })(<span>{header.projectNum}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`ssrc.bidHall.model.bidHall.projectName`).d('项目名称')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('projectName', {
                initialValue: header.projectName,
              })(<span>{header.projectName}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`ssrc.bidHall.model.bidHall.bidLocation`).d('项目地点')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('bidLocation', {
                initialValue: header.bidLocation,
              })(<span>{header.bidLocation}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`ssrc.bidHall.model.bidHall.currencyType`).d('币种')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('currencyCode', {
                initialValue: header.currencyCode,
              })(<span>{header.currencyCode}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT} style={{ display: 'none' }}>
            <FormItem
              label={intl.get(`ssrc.bidHall.model.bidHall.exchangeRate`).d('汇率')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('exchangeRate', {
                initialValue: header.exchangeRate,
              })(<span>{header.exchangeRate}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`ssrc.bidHall.model.bidHall.roundNumber`).d('轮次')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('roundNumber', {
                initialValue: header.roundNumber,
              })(<span>{header.roundNumber}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`ssrc.bidHall.model.bidHall.versionNumber`).d('版本')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('versionNumber', {
                initialValue: header.versionNumber,
              })(<span>{header.versionNumber}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`ssrc.bidHall.model.bidHall.creationDate`).d('创建时间')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('creationDate', {
                initialValue: header.creationDate,
              })(<span>{header.creationDate}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`ssrc.bidHall.model.bidHall.bidFileExpense`).d('招标文件费')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('bidFileExpense', {
                initialValue: header.bidFileExpense,
              })(<span>{header.bidFileExpense}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`ssrc.bidHall.model.bidHall.bidBond`).d('保证金')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('bidBond', {
                initialValue: header.bidBond,
              })(<span>{header.bidBond}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`ssrc.bidHall.model.bidHall.paymentType`).d('付款方式')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('paymentTypeName', {
                initialValue: header.paymentTypeName,
              })(<span>{header.paymentTypeName}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`ssrc.bidHall.model.bidHall.paymentTerm`).d('付款条款')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('paymentTerm', {
                initialValue: header.paymentTerm,
              })(<span>{header.paymentTerm}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`ssrc.bidHall.model.bidHall.bidOpenLocation`).d('开标地点')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('bidOpenLocation', {
                initialValue: header.bidOpenLocation,
              })(<span>{header.bidOpenLocation}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`ssrc.bidHall.model.bidHall.explorationFlag`).d('是否需要现场踏勘')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('explorationFlag', {
                initialValue: header.explorationFlag,
              })(<span>{yesOrNoRender(header.explorationFlag)}</span>)}
            </FormItem>
          </Col>
          {header.explorationFlag ? (
            <Col {...FORM_COL_3_LAYOUT}>
              <FormItem
                label={intl.get(`ssrc.bidHall.model.bidHall.explorationDate`).d('踏勘时间')}
                {...EDIT_FORM_ITEM_LAYOUT}
              >
                {getFieldDecorator('explorationDate', {
                  initialValue: header.explorationDate,
                })(<span>{header.explorationDate}</span>)}
              </FormItem>
            </Col>
          ) : (
            ''
          )}
        </Row>
      </Form>
    );
  }
}
