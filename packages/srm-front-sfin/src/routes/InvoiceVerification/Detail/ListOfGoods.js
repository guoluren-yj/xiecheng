/*
 * ListOfGoods - 货物清单
 * @date: 2019-07-24
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Bind } from 'lodash-decorators';
import { Form, Row, Col, Table } from 'hzero-ui';

import intl from 'utils/intl';
import { numberRender } from 'utils/renderer';
import { FORM_COL_3_LAYOUT, EDIT_FORM_ROW_LAYOUT } from 'utils/constants';
import { dateRender } from 'utils/renderer';

import styles from './index.less';
import DisplayFormItem from '../../components/DisplayFormItem';
import { thousandBitSeparator, thousandBitSeparatorDJ } from '@/routes/utils';

const viewColumn = 'sfin.invoiceInspection.view';
const commonPrompt = 'sfin.invoiceInspection.model';

/**
 * ListOfGoods - 采购申请头页面
 * @extends {Component} - React.Component
 * @reactProps {Object} form - 表单对象
 * @return React.element
 */
export default class ListOfGoods extends Component {
  /**
   * table列表的最后两列
   * */
  @Bind()
  isMoreThenEightView(data) {
    const { totalAmount } = data;
    const { dataList = [], sum = 0 } = this.props;
    const tableFooter = [
      {
        commodityName: '',
      },
      {
        amount: `￥${numberRender(sum, 2)}`,
        rowNo: intl.get(`ssrc.bidHall.model.bidHall.summary`).d('小计'),
        tax: `￥${numberRender(sum, 2)}`,
      },
      {
        amount: `￥${numberRender(totalAmount, 2)}`,
        rowNo: intl.get(`sfin.invoiceBill.model.invoiceBill.sum`).d('合计'),
        tax: `￥${numberRender(totalAmount, 2)}`,
      },
    ];
    dataList.push(...tableFooter);
    return dataList;
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const { FormData } = this.props;
    const { data = {} } = FormData;
    const { purchaserName, invoiceCode, salesName, billingDate, invoiceNumber } = data;
    const footer = (
      <div className="list-of-good-footer-line">
        <div className="list-of-goods-footer-row">
          <div className="one">
            <span>{intl.get(`hzero.common.remark`).d('备注')}</span>
          </div>
          <div className="two" />
        </div>
      </div>
    );
    const columns = [
      {
        dataIndex: 'rowNo',
        title: intl.get(`${viewColumn}.rowNo`).d('序号'),
        align: 'center',
        width: 60,
      },
      {
        dataIndex: 'commodityName',
        title: intl.get(`${viewColumn}.commodityName`).d('货物或应税劳务名称'),
        width: 200,
        className: 'commodityName',
        // render: val => (
        //   <Tooltip title={intl.get(`.urgent`).d(`${val}`)} arrowPointAtCenter placement="top">
        //     {val}
        //   </Tooltip>
        // ),
      },
      {
        dataIndex: 'specificationModel',
        title: intl.get(`${viewColumn}.specificationsAndModel`).d('规格型号'),
        width: 120,
      },
      {
        dataIndex: 'unit',
        title: intl.get(`${viewColumn}.uomName`).d('单位'),
        width: 100,
      },
      {
        dataIndex: 'quantity',
        title: intl.get(`${viewColumn}.quantity`).d('数量'),
        width: 80,
        render: (text) => thousandBitSeparator(text),
      },
      {
        dataIndex: 'unitPrice',
        title: intl.get(`${viewColumn}.unitPrice`).d('单价'),
        align: 'right',
        width: 80,
        render: (text, record) => thousandBitSeparatorDJ(text, record.pricePrecision),
      },
      {
        dataIndex: 'amount',
        title: intl.get(`${viewColumn}.amount`).d('金额'),
        width: 80,
        align: 'right',
      },
      {
        dataIndex: 'taxRate',
        title: intl.get(`${viewColumn}.taxRate`).d('税率'),
        width: 80,
        align: 'right',
      },
      {
        dataIndex: 'tax',
        title: intl.get(`${viewColumn}.tax`).d('税额'),
        width: 80,
        align: 'right',
      },
    ];
    // const scrollX = sum(columns.map(n => (isNumber(n.width) ? n.width : 0)));
    return (
      <Form className={styles['list-of-goods']}>
        <p style={{ height: '20px', background: '#fafafa' }} />
        <div className="title">
          <p>
            {intl
              .get(`sfin.invoiceBill.model.invoiceBill.detailGoods`)
              .d('增值税应税货物或劳务销货清单')}
          </p>
        </div>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <DisplayFormItem
              label={intl.get(`${commonPrompt}.purchaserName`).d('购买方名称')}
              value={purchaserName}
            />
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <DisplayFormItem
              label={intl.get(`${commonPrompt}.salesName`).d('销售方名称')}
              value={salesName}
            />
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <DisplayFormItem
              label={intl.get(`${commonPrompt}.InvoiceCode`).d('所属增值税专用发票代码')}
              value={invoiceCode}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <DisplayFormItem
              label={intl.get(`${commonPrompt}.InvoiceNumber`).d('号码')}
              value={invoiceNumber}
            />
          </Col>
        </Row>
        <div className={styles['table-with-no-border-bottom-bom']}>
          <Table
            bordered
            footer={() => footer}
            columns={columns}
            pagination={false}
            dataSource={this.isMoreThenEightView(data)}
          />
          {/* {footer} */}
        </div>
        <div className="table-below-line list-last-row">
          <div className="table-below-line-label">
            <DisplayFormItem
              label={intl.get(`${commonPrompt}.supplierName`).d('销售方')}
              value={salesName}
            />
          </div>
          <div className="table-below-line-label">
            <DisplayFormItem
              label={intl.get(`${commonPrompt}.fillInTheDate`).d('填开日期')}
              value={dateRender(billingDate)}
            />
          </div>
        </div>
      </Form>
    );
  }
}
