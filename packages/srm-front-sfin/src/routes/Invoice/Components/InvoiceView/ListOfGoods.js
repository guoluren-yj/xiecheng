/**
 * ListOfGoods - 销货清单
 * @date: 2019-9-16
 * @author: zhutian <tian.zhu@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */

import React, { Component, Fragment } from 'react';
import { Form, Row, Col, Table } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';

import { numberRender, dateRender } from 'utils/renderer';
import { FORM_COL_3_LAYOUT, EDIT_FORM_ROW_LAYOUT } from 'utils/constants';

import DisplayFormItem from '../../Components/DisplayFormItem';
import styles from './index.less';
import { thousandBitSeparator } from '@/routes/utils';

/**
 * ListOfGoods - 采购申请头页面
 * @extends {Component} - React.Component
 * @reactProps {Object} form - 表单对象
 * @return React.element
 */
export default class ListOfGoods extends Component {
  @Bind()
  handleTotalPrice(price) {
    if (price !== null) {
      return `￥${numberRender(price, 2)}`;
    } else {
      return '';
    }
  }

  /**
   * table列表的最后两列
   * */
  @Bind()
  isMoreThenEightView(formData) {
    const { includedAmount, taxAmount } = formData;
    const { dataSource = [], netAmountSum, taxAmountSum } = this.props;
    const tableFooter = [
      {
        itemName: '',
      },
      {
        netAmount: this.handleTotalPrice(netAmountSum),
        rowNo: intl.get(`ssrc.bidHall.model.bidHall.summary`).d('小计'),
        taxAmount: this.handleTotalPrice(taxAmountSum),
      },
      {
        netAmount: this.handleTotalPrice(includedAmount),
        rowNo: intl.get(`sfin.invoiceBill.model.invoiceBill.sum`).d('合计'),
        taxAmount: this.handleTotalPrice(taxAmount),
      },
    ];
    dataSource.push(...tableFooter);
    const newDataSource = JSON.parse(JSON.stringify(dataSource));
    dataSource.splice(dataSource.length - 4, 3);
    return newDataSource;
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const { formData, totalPage, currentPage } = this.props;
    const {
      companyName,
      supplierCompanyName,
      taxInvoiceCode,
      salesName,
      taxInvoiceDateIssued,
      taxInvoiceNum,
    } = formData;
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
        title: intl.get(`sfin.common.model.common.lineNumber`).d('序号'),
        align: 'center',
        width: 60,
      },
      {
        dataIndex: 'itemName',
        title: intl.get(`sfin.invoiceCheck.view.invoiceCode`).d('货物或应税劳务名称'),
        width: 200,
        className: 'commodityName',
      },
      {
        dataIndex: 'specificationsAndModel',
        title: intl.get(`sfin.invoiceBill.model.invoiceBill.specificationModel`).d('规格型号'),
        width: 120,
      },
      {
        dataIndex: 'uomName',
        title: intl.get(`sfin.invoiceBill.model.invoiceBill.model.unit`).d('单位'),
        width: 100,
      },
      {
        dataIndex: 'quantity',
        title: intl.get(`sfin.invoiceBill.model.invoiceBill.quantity`).d('数量'),
        width: 80,
        render: (text) => thousandBitSeparator(text),
      },
      {
        dataIndex: 'netPrice',
        title: intl.get(`sfin.invoiceBill.model.invoiceBill.unitPrice`).d('单价'),
        align: 'right',
        width: 80,
      },
      {
        dataIndex: 'netAmount',
        title: intl.get(`sfin.invoiceBill.model.invoiceBill.amount`).d('金额'),
        width: 80,
        align: 'right',
      },
      {
        dataIndex: 'taxRate',
        title: intl.get(`sfin.invoiceBill.model.invoiceBill.taxRate`).d('税率'),
        width: 80,
        align: 'right',
      },
      {
        dataIndex: 'taxAmount',
        title: intl.get(`sfin.invoiceBill.model.invoiceBill.tax`).d('税额'),
        width: 80,
        align: 'right',
      },
    ];
    return (
      <Form className={styles['list-of-goods']}>
        <p className="blank-space" />
        <div className="title">
          {intl
            .get(`sfin.invoiceBill.model.invoiceBill.detailGoods`)
            .d('增值税应税货物或劳务销货清单')}
        </div>
        <Fragment>
          <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
            <Col {...FORM_COL_3_LAYOUT}>
              <DisplayFormItem
                label={intl.get(`sfin.invoiceBill.model.invoiceBill.purchaserName`).d('购买方名称')}
                value={companyName}
              />
            </Col>
          </Row>
          <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
            <Col {...FORM_COL_3_LAYOUT}>
              <DisplayFormItem
                label={intl.get(`sfin.invoiceBill.model.salesName`).d('销售方名称')}
                value={supplierCompanyName}
              />
            </Col>
          </Row>
          <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
            <Col span={10}>
              <DisplayFormItem
                label={intl
                  .get(`sfin.invoiceBill.model.invoiceBill.belongTexCode`)
                  .d('所属增值税专用发票代码')}
                value={taxInvoiceCode}
              />
            </Col>
            <Col span={8}>
              <DisplayFormItem
                label={intl.get(`sfin.invoiceCheck.model.InvoiceNumber`).d('号码')}
                value={taxInvoiceNum}
              />
            </Col>
            <Col span={6}>
              <p style={{ textAlign: 'right' }}>
                <span>{intl.get(`srm.oauth.platformNotice.total`).d('共')}</span> {totalPage}{' '}
                <span>{intl.get(`hzero.c7nUI.Pagination.page`).d('页')}</span>&nbsp;&nbsp;&nbsp;
                <span>{intl.get(`hitf.common.view.cron.certain`).d('第')}</span> {currentPage + 1}{' '}
                <span>{intl.get(`hzero.c7nUI.Pagination.page`).d('页')}</span>
              </p>
            </Col>
          </Row>
        </Fragment>

        <div className="table-with-no-border-bottom-bom">
          <Table
            bordered
            footer={() => footer}
            columns={columns}
            pagination={false}
            dataSource={this.isMoreThenEightView(formData)}
          />
        </div>
        <div className="table-below-line list-last-row">
          <div className="table-below-line-label">
            <DisplayFormItem
              label={intl.get(`sfin.invoiceBill.model.invoiceBill.saleUnit`).d('销货单位')}
              value={salesName}
            />
          </div>
          <div className="table-below-line-label">
            <DisplayFormItem
              label={intl.get(`sfin.invoiceInspection.model.fillInTheDate`).d('填开日期')}
              value={dateRender(taxInvoiceDateIssued)}
            />
          </div>
          <div className="table-below-line-label">
            {intl.get(`sfin.invoiceBill.model.invoiceBill.countryTex`).d('国家税务总局印制')}
          </div>
        </div>
      </Form>
    );
  }
}
