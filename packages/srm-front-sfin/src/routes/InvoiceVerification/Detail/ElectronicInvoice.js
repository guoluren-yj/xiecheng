/*
 * ElectronicInvoice - 电子发票
 * @date: 2019-07-24
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Form, Table, Row, Col } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
import { isNumber, sum } from 'lodash';
import { numberRender } from 'utils/renderer';
import { EDIT_FORM_ROW_LAYOUT } from 'utils/constants';
import { dateRender } from 'utils/renderer';

import DisplayFormItem from '../../components/DisplayFormItem';
import styles from './index.less';
import { thousandBitSeparator, thousandBitSeparatorDJ } from '@/routes/utils';

const commonPrompt = 'sfin.invoiceInspection.model';
const viewColumn = 'sfin.invoiceInspection.view';
/**
 * ElectronicInvoice - 采购申请头页面
 * @extends {Component} - React.Component
 * @reactProps {Object} form - 表单对象
 * @return React.element
 */
export default class ElectronicInvoice extends Component {
  constructor(props) {
    super(props);

    this.onlyOnce = () => {
      let counter = 1;
      return function next() {
        return counter++;
      };
    };
    this.counter = this.onlyOnce();
  }

  @Bind()
  isMoreThenEightView(data) {
    const { amountTax, amountTaxCn, totalAmount, invoiceList = [] } = data;
    const { isMoreThenEight } = this.props;
    // 如果少于八行数据，该数据用于撑开table的高度
    const counter = this.counter();
    if (!isMoreThenEight && counter === 8) {
      invoiceList.push({
        commodityName: '',
      });
    }
    // 数据超过八行显示 - 详见销货清单
    const nodata = [
      {
        key: '1',
        commodityName: intl.get(`sfin.invoiceBill.model.invoiceBill.checkDetail`).d('详见销货清单'),
      },
      {
        key: 'last',
        commodityName: '',
      },
    ];
    const tableFooter = [
      {
        amount: `￥${numberRender(totalAmount, 2)}`,
        commodityName: intl.get(`sfin.invoiceBill.model.invoiceBill.sum`).d('合计'),
        tax: `￥${numberRender(amountTax, 2)}`,
      },
      {
        commodityName: intl
          .get(`sfin.invoiceBill.model.invoiceBill.totalInWords`)
          .d('价税合计(大写)'),
        specificationModel: amountTaxCn,
        taxRate: `(${intl.get(`sfin.invoiceBill.view.message.lower`).d('小写')})￥${numberRender(
          amountTax,
          2
        )}`,
      },
    ];
    if (isMoreThenEight) {
      nodata.push(...tableFooter);
      // invoiceList.pop();
      // invoiceList.pop();
      return nodata;
    } else {
      const dataList = JSON.parse(JSON.stringify(invoiceList));
      dataList.push(...tableFooter);
      return dataList;
    }
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const { FormData = {} } = this.props;
    const { data = {} } = FormData || {};
    const {
      purchaserName,
      purchaserTaxNo,
      purchaserAddressPhone,
      purchaserBank,
      salesName,
      salesTaxNo,
      salesAddressPhone,
      salesBank,
      remarks,
      machineCode,
      invoiceCode,
      invoiceNumber,
      billingDate,
      checkCode,
    } = data;

    const header = (
      <div>
        <div className="footer-last-row">
          <div>{intl.get(`sfin.invoiceBill.model.invoiceBill.buyUnit`).d('购货单位')}</div>
          <div>
            <p>
              <span>{intl.get(`hocr.commonOcr.model.commonOcr.companyName`).d('名称')}:</span>
              <span>{purchaserName}</span>
            </p>
            <p>
              <span>
                {intl.get(`hocr.commonOcr.model.commonOcr.buyerId`).d('购方纳税人识别号')}:
              </span>
              <span>{purchaserTaxNo}</span>
            </p>
            <p>
              <span>
                {intl.get(`sfin.invoiceBill.model.invoiceBill.addressAndPhone`).d('地址、电话')}:
              </span>
              <span>{purchaserAddressPhone}</span>
            </p>
            <p>
              <span>
                {intl.get(`hocr.commonOcr.model.commonOcr.buyerBank`).d('购方开户行及账号')}:
              </span>
              <span>{purchaserBank}</span>
            </p>
          </div>
          <div>{intl.get(`hocr.commonOcr.model.commonOcr.encryptionBlock`).d('密码区')}</div>
          <div>
            <p />
          </div>
        </div>
      </div>
    );

    const footer = (
      <div>
        <div className="footer-last-row border-bottom">
          <div>{intl.get(`sfin.invoiceBill.model.invoiceBill.saleUnit`).d('销货单位')}</div>
          <div>
            <p>
              <span>{intl.get(`hocr.commonOcr.model.commonOcr.companyName`).d('名称')}:</span>
              <span>{salesName}</span>
            </p>
            <p>
              <span>
                {intl.get(`hocr.commonOcr.model.commonOcr.sellerId`).d('销售方纳税人识别号')}:
              </span>
              <span>{salesTaxNo}</span>
            </p>
            <p>
              <span>
                {intl.get(`sfin.invoiceBill.model.invoiceBill.addressAndPhone`).d('地址、电话')}:
              </span>
              <span>{salesAddressPhone}</span>
            </p>
            <p>
              <span>
                {intl.get(`hocr.commonOcr.model.commonOcr.sellerBank`).d('销售方开户行及账号')}:
              </span>
              <span>{salesBank}</span>
            </p>
          </div>
          <div>{intl.get(`hzero.common.remark`).d('备注')}</div>
          <div>
            <p>{remarks}</p>
          </div>
        </div>
      </div>
    );
    const columns = [
      {
        dataIndex: 'commodityName',
        title: intl.get(`${viewColumn}.invoiceCode`).d('货物或应税劳务名称'),
        width: 200,
        className: 'commodityName',
      },
      {
        dataIndex: 'specificationModel',
        title: intl.get(`${viewColumn}.specificationModel`).d('规格型号'),
        width: 120,
      },
      {
        dataIndex: 'unit',
        title: intl.get(`${viewColumn}.unit`).d('单位'),
        width: 100,
      },
      {
        dataIndex: 'quantity',
        title: intl.get(`${viewColumn}.quantity`).d('数量'),
        width: 100,
        render: (text) => thousandBitSeparator(text),
      },
      {
        dataIndex: 'unitPrice',
        title: intl.get(`${viewColumn}.unitPrice`).d('单价'),
        align: 'right',
        width: 100,
        render: (text, record) => thousandBitSeparatorDJ(text, record.pricePrecision),
      },
      {
        dataIndex: 'amount',
        title: intl.get(`${viewColumn}.amount`).d('金额'),
        width: 80,
        align: 'right',
        render: (text, record) => thousandBitSeparator(text, record.amountPrecision),
      },
      {
        dataIndex: 'taxRate',
        title: intl.get(`${viewColumn}.taxRate`).d('税率'),
        width: 100,
        align: 'right',
      },
      {
        dataIndex: 'tax',
        title: intl.get(`${viewColumn}.tax`).d('税额'),
        width: 100,
        align: 'right',
        render: (text, record) => thousandBitSeparator(text, record.amountPrecision),
      },
    ];
    const scrollX = sum(columns.map((n) => (isNumber(n.width) ? n.width : 0)));
    return (
      <Form className={styles['electronic-invoice']}>
        <div className="header-information-row">
          <div>
            <img className={styles['qr-code']} src="" alt="" />
            <DisplayFormItem
              label={intl.get(`${commonPrompt}.machineCode`).d('机器编号')}
              value={machineCode}
            />
          </div>
          <div>{/* <p>天津市增值税电子普通发票</p> */}</div>
          <div>
            <DisplayFormItem
              label={intl.get(`${commonPrompt}.invoiceCode`).d('发票代码')}
              value={invoiceCode}
            />
            <DisplayFormItem
              label={intl.get(`${commonPrompt}.invoiceNumber`).d('发票号码')}
              value={invoiceNumber}
            />
            <DisplayFormItem
              label={intl.get(`${commonPrompt}.billingDate`).d('开票日期')}
              value={dateRender(billingDate)}
            />
            <DisplayFormItem
              label={intl.get(`${commonPrompt}.validateCode`).d('校验码')}
              value={checkCode}
            />
          </div>
        </div>
        <div>
          {header}
          <div className={styles['table-with-no-border-bottom']}>
            <Table
              bordered
              pagination={false}
              // title={() => header}
              // footer={() => footer}
              columns={columns}
              dataSource={this.isMoreThenEightView(data)}
              scroll={{ x: scrollX }}
            />
          </div>
          {footer}
        </div>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="table-below-line-first">
          <Col span={6}>
            <DisplayFormItem label={intl.get(`${commonPrompt}.payee`).d('收款人')} value="" />
          </Col>
          <Col span={6}>
            <DisplayFormItem label={intl.get(`${commonPrompt}.toReview`).d('复核')} value="" />
          </Col>
          <Col span={6}>
            <DisplayFormItem label={intl.get(`${commonPrompt}.drawer`).d('开票人')} value="" />
          </Col>
          <Col span={6}>
            <DisplayFormItem
              label={intl.get(`${commonPrompt}.supplierName`).d('销售方')}
              value={salesName}
            />
          </Col>
        </Row>
      </Form>
    );
  }
}
