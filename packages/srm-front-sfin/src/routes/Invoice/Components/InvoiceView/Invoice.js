/**
 * ElectronicInvoice - 电子发票
 * @date: 2019-9-16
 * @author: zhutian <tian.zhu@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */

import React, { Component } from 'react';
import { Form, Table, Row, Col } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isNumber, sum } from 'lodash';

import { numberRender, dateRender } from 'utils/renderer';
import intl from 'utils/intl';
import { EDIT_FORM_ROW_LAYOUT, FORM_COL_3_LAYOUT } from 'utils/constants';

import DisplayFormItem from '../../Components/DisplayFormItem';
import styles from './index.less';
import { thousandBitSeparator } from '@/routes/utils';

@Form.create({ fieldNameProp: null })
export default class Invoice extends Component {
  @Bind()
  handleTotalPrice(price) {
    if (price !== null) {
      return `￥${numberRender(price, 2)}`;
    } else {
      return '';
    }
  }

  @Bind()
  getDataSource(FormData) {
    const {
      includedAmount,
      taxIncludedAmountCh,
      taxIncludedAmount,
      taxAmount,
      invoiceLines = [],
    } = FormData;
    const { hasGoodsList } = this.props;
    const nodata = [
      {
        key: '1',
        itemName: intl.get(`sfin.invoiceBill.model.invoiceBill.checkDetail`).d('详见销货清单'),
      },
      {
        key: 'last',
        itemName: '',
      },
    ];
    const tableFooter = [
      {
        itemName: intl.get(`sfin.invoiceBill.model.invoiceBill.sum`).d('合计'),
        netAmount: this.handleTotalPrice(includedAmount),
        taxAmount: this.handleTotalPrice(taxAmount),
      },
      {
        itemName: intl.get(`sfin.invoiceBill.model.invoiceBill.totalInWords`).d('价税合计(大写)'),
        specificationsAndModel: taxIncludedAmountCh,
        taxRate: this.handleTotalPrice(taxIncludedAmount),
      },
    ];
    if (hasGoodsList) {
      nodata.push(...tableFooter);
      return nodata;
    } else {
      invoiceLines.push({
        itemName: '',
      });
      const dataList = JSON.parse(JSON.stringify(invoiceLines));
      dataList.push(...tableFooter);
      invoiceLines.pop();
      return dataList;
    }
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const { FormData, isPreview } = this.props;
    const {
      invoiceLimit,
      companyName,
      supplierCompanyName,
      purchaserTaxNo,
      purchaserAddressPhone,
      purchaserBank,
      salesName,
      salesTaxNo,
      salesAddressPhone,
      salesBank,
      remark,
      drawer,
      checker,
      payee,
      invoiceQrCode,
      taxInvoiceCode,
      taxInvoiceNum,
      taxInvoiceDateIssued,
      taxInvoiceCheckCode,
      invoiceControlCode,
    } = FormData;
    const header = (
      <div className="first-last-row">
        <div>{intl.get(`sfin.invoiceBill.model.invoiceBill.buyUnit`).d('购货单位')}</div>
        <div>
          <p>
            <span>{intl.get(`hocr.commonOcr.model.commonOcr.companyName`).d('名称')}:</span>
            <span>{companyName}</span>
          </p>
          <p>
            <span>{intl.get(`hocr.commonOcr.model.commonOcr.buyerId`).d('购方纳税人识别号')}:</span>
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
          <p>{invoiceControlCode}</p>
        </div>
      </div>
    );

    const footer = (
      <div className="first-last-row last-row">
        <div>{intl.get(`sfin.invoiceBill.model.invoiceBill.saleUnit`).d('销货单位')}</div>
        <div>
          <p>
            <span>{intl.get(`hocr.commonOcr.model.commonOcr.companyName`).d('名称')}:</span>
            <span>{supplierCompanyName}</span>
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
          <p>{remark}</p>
        </div>
      </div>
    );
    const columns = [
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
        width: 100,
        render: (text) => thousandBitSeparator(text),
      },
      {
        dataIndex: 'netPrice',
        title: intl.get(`sfin.invoiceBill.model.invoiceBill.unitPrice`).d('单价'),
        align: 'right',
        width: 100,
      },
      {
        dataIndex: 'netAmount',
        title: intl.get(`sfin.invoiceBill.model.invoiceBill.amount`).d('金额'),
        width: 90,
        align: 'right',
        render: (val) => {
          if (typeof val === 'number') {
            return numberRender(val, 2);
          } else {
            return val;
          }
        },
      },
      {
        dataIndex: 'taxRate',
        title: intl.get(`sfin.invoiceBill.model.invoiceBill.taxRate`).d('税率'),
        width: 90,
        align: 'right',
      },
      {
        dataIndex: 'taxAmount',
        title: intl.get(`sfin.invoiceBill.model.invoiceBill.tax`).d('税额'),
        width: 100,
        align: 'right',
        render: (val) => {
          if (typeof val === 'number') {
            return numberRender(val, 2);
          } else {
            return val;
          }
        },
      },
    ];
    const scrollX = sum(columns.map((n) => (isNumber(n.width) ? n.width : 0)));
    return (
      <Form className={styles['electronic-invoice']}>
        {isPreview ? (
          <div className="invoice-amount-row">
            <Row>
              <Col {...FORM_COL_3_LAYOUT}>
                <DisplayFormItem
                  label={intl.get(`sfin.invoiceBill.verify.nowTimeInvoiceLimit`).d('当前发票限额')}
                  value={invoiceLimit}
                />
              </Col>
            </Row>
          </div>
        ) : null}
        <div className="header-information-row">
          <div>
            <img
              className="qr-code"
              src={invoiceQrCode ? `data:image/png;base64,${invoiceQrCode}` : null}
              alt=""
            />
          </div>
          <div>
            <p>{intl.get(`hocr.commonOcr.model.commonOcr.model.vat`).d('增值税发票')}</p>
          </div>
          <div>
            <DisplayFormItem
              label={intl.get(`hocr.commonOcr.model.commonOcr.invoiceCode`).d('发票代码')}
              value={taxInvoiceCode}
            />
            <DisplayFormItem
              label={intl.get(`hocr.commonOcr.model.commonOcr.number`).d('发票号码')}
              value={taxInvoiceNum}
            />
            <DisplayFormItem
              label={intl.get(`hocr.commonOcr.model.commonOcr.issueDate`).d('开票日期')}
              value={dateRender(taxInvoiceDateIssued)}
            />
            <DisplayFormItem
              label={intl.get(`hocr.commonOcr.model.commonOcr.checkCode`).d('校验码')}
              value={taxInvoiceCheckCode}
            />
          </div>
        </div>
        <div className="middle-information-table">
          {header}
          <div className="table-with-no-border-bottom">
            <Table
              bordered
              pagination={false}
              columns={columns}
              dataSource={this.getDataSource(FormData)}
              scroll={{ x: scrollX }}
            />
          </div>
          {footer}
        </div>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="table-below-line">
          <Col span={6}>
            <DisplayFormItem
              label={intl.get(`hocr.commonOcr.model.commonOcr.receiver`).d('收款人')}
              value={payee}
            />
          </Col>
          <Col span={6}>
            <DisplayFormItem
              label={intl.get(`hocr.commonOcr.model.commonOcr.reviewer`).d('复核')}
              value={checker}
            />
          </Col>
          <Col span={6}>
            <DisplayFormItem
              label={intl.get(`hocr.commonOcr.model.commonOcr.issuer`).d('开票人')}
              value={drawer}
            />
          </Col>
          <Col span={6}>
            <DisplayFormItem
              label={intl.get(`hocr.commonOcr.model.commonOcr.sellerName`).d('销售方名称')}
              value={salesName}
            />
          </Col>
        </Row>
      </Form>
    );
  }
}
