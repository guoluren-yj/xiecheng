/**
 * OrderDetail - 应付发票申请-订单明细
 * @date: 2019-2-19
 * @author: chenjing <jing.chen05@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { connect } from 'dva';
import { Table, Row, Col, Collapse, Icon, Spin } from 'hzero-ui';
import classnames from 'classnames';
import { Bind } from 'lodash-decorators';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import formatterCollections from 'utils/intl/formatterCollections';

import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import { dateRender } from 'utils/renderer';
import { thousandsRender } from '@/utils/utils';
import styles from '../../index.less';
// import { thousandBitSeparator, thousandBitSeparatorDJ } from '@/routes/utils';

const promptCode = 'sfin.payableInvoice';

/**
 * 应付发票申请-订单明细
 * @extends {Component} - Component
 * @reactProps {Object} payableInvoice - 应付发票申请-订单明细对象
 * @return React.element
 */
@withCustomize({
  unitCode: ['SFIN.ORDER_DETAIL.LINE'],
})
@connect(({ payableInvoice, loading }) => ({
  payableInvoice,
  loading: loading.effects['payableInvoice/fetchOrdDetailHeader'],
}))
@formatterCollections({
  code: ['entity.item', 'sfin.payableInvoice', 'entity.company'],
})
export default class OrderDetail extends Component {
  constructor(props) {
    super(props);
    const {
      match: {
        params: { ecPoSubHeaderId },
      },
    } = props;
    this.state = {
      ecPoSubHeaderId,
      collapseKeys: {},
    };
  }

  /**
   * 挂载后执行方法
   */
  componentDidMount() {
    const { dispatch } = this.props;
    const { ecPoSubHeaderId } = this.state;
    dispatch({
      type: 'payableInvoice/fetchOrdDetailHeader',
      payload: {
        ecPoSubHeaderId,
      },
    });
    this.handleSearch();
  }

  @Bind()
  handleSearch(page = {}) {
    const { dispatch, match } = this.props;
    const { ecPoSubHeaderId } = match.params;
    dispatch({
      type: 'payableInvoice/fetchOrdDetaillLine',
      payload: {
        ecPoSubHeaderId,
        page,
        customizeUnitCode: 'SFIN.ORDER_DETAIL.LINE',
      },
    });
  }

  /**
   * 计算table列宽度
   * @param {Array} columns 列
   * @param {Number} fixWidth 固定列宽度
   */
  @Bind()
  scrollWidth(columns, fixWidth) {
    const total = columns.reduce((prev, current) => prev + (current.width ? current.width : 0), 0);
    return total + fixWidth + 1;
  }

  /**
   * onCollapseChange - 折叠面板onChange
   * @param {Array<string>} collapseKeys - Panels key
   */
  @Bind()
  onCollapseChange(arr, key) {
    const { collapseKeys } = this.state;
    this.setState({
      collapseKeys: {
        ...collapseKeys,
        [key]: arr,
      },
    });
  }

  renderForm(headerInfo) {
    return (
      <Row className={styles['information-container']}>
        <Row className={styles['information-item']} gutter={48}>
          <Col span={8}>
            <Row>
              <Col span={9} className={styles['information-item-label']}>
                {intl.get(`${promptCode}.model.payableInvoice.ecPoSubNum`).d('子订单号')}
              </Col>
              <Col span={15} className={styles['information-item-children']}>
                {headerInfo.ecPoSubNum}
              </Col>
            </Row>
          </Col>
          <Col span={8}>
            <Row>
              <Col span={9} className={styles['information-item-label']}>
                {intl.get(`${promptCode}.model.invoiceBill.supplierName`).d('供应商')}
              </Col>
              <Col span={15} className={styles['information-item-children']}>
                {headerInfo.supplyCompanyName}
              </Col>
            </Row>
          </Col>
          <Col span={8}>
            <Row>
              <Col span={9} className={styles['information-item-label']}>
                {intl.get('entity.company.tag').d('公司')}
              </Col>
              <Col span={15} className={styles['information-item-children']}>
                {headerInfo.companyName}
              </Col>
            </Row>
          </Col>
        </Row>
        <Row className={styles['information-item']} gutter={48}>
          <Col span={8}>
            <Row>
              <Col span={9} className={styles['information-item-label']}>
                {intl.get(`${promptCode}.model.payableInvoice.currency`).d('币种')}
              </Col>
              <Col span={15} className={styles['information-item-children']}>
                {headerInfo.currencyCode}
              </Col>
            </Row>
          </Col>
          <Col span={8}>
            <Row>
              <Col span={9} className={styles['information-item-label']}>
                {intl.get(`${promptCode}.model.payableInvoice.invoiceState`).d('开票方式')}
              </Col>
              <Col span={15} className={styles['information-item-children']}>
                {headerInfo.invoiceStateMeaning}
              </Col>
            </Row>
          </Col>
          <Col span={8}>
            <Row>
              <Col span={9} className={styles['information-item-label']}>
                {intl.get(`${promptCode}.model.payableInvoice.srmPoNum`).d('SRM订单号')}
              </Col>
              <Col span={15} className={styles['information-item-children']}>
                {headerInfo.displayPoNum}
              </Col>
            </Row>
          </Col>
        </Row>
        <Row className={styles['information-item']} gutter={48}>
          <Col span={8}>
            <Row>
              <Col span={9} className={styles['information-item-label']}>
                {intl.get(`${promptCode}.model.payableInvoice.freight`).d('运费')}
              </Col>
              <Col span={15} className={styles['information-item-children']}>
                {headerInfo.freight}
              </Col>
            </Row>
          </Col>
          <Col span={8}>
            <Row>
              <Col span={9} className={styles['information-item-label']}>
                {intl.get(`${promptCode}.model.payableInvoice.ecPoNum`).d('父订单号')}
              </Col>
              <Col span={15} className={styles['information-item-children']}>
                {headerInfo.ecPoNum}
              </Col>
            </Row>
          </Col>
          <Col span={8} />
        </Row>
      </Row>
    );
  }

  render() {
    const {
      loading,
      customizeTable,
      payableInvoice: { headerInfo = {}, dataSource = [], pagination = {} },
    } = this.props;
    const { collapseKeys } = this.state;

    const columns = [
      {
        title: intl.get(`${promptCode}.model.payableInvoice.billNum`).d('开票申请单号'),
        dataIndex: 'billNum',
        width: 170,
      },
      {
        title: intl.get(`${promptCode}.model.payableInvoice.ecPoSubNum`).d('子订单号'),
        dataIndex: 'ecPoSubNum',
        width: 150,
      },
      {
        title: intl.get(`${promptCode}.model.payableInvoice.ecProductNum`).d('商品编码'),
        dataIndex: 'ecProductNum',
        width: 150,
      },
      {
        title: intl.get(`${promptCode}.model.payableInvoice.ecProductDescribe`).d('商品描述'),
        dataIndex: 'ecProductName',
        width: 150,
      },
      {
        title: intl.get(`${promptCode}.model.payableInvoice.suppliesCode`).d('物料编码'),
        dataIndex: 'itemCode',
        width: 120,
      },
      {
        title: intl.get(`${promptCode}.model.payableInvoice.suppliesDesc`).d('物料描述'),
        dataIndex: 'itemName',
        width: 120,
      },
      {
        title: intl.get(`${promptCode}.model.specificationsAndModel`).d('规格型号'),
        dataIndex: 'specificationsAndModel',
        width: 120,
      },
      {
        title: intl.get(`${promptCode}.model.payableInvoice.unit`).d('单位'),
        dataIndex: 'uom',
        width: 150,
      },
      {
        title: intl.get(`${promptCode}.model.payableInvoice.quantity`).d('本次开票数量'),
        dataIndex: 'quantity',
        width: 150,
        render: thousandsRender,
        // render: (text) => thousandBitSeparator(Number(text)),
      },
      {
        title: intl.get(`${promptCode}.model.payableInvoice.includePrice`).d('不含税单价'),
        dataIndex: 'actualPrice',
        align: 'right',
        render: thousandsRender,
        // render: (text, record) => thousandBitSeparatorDJ(Number(text), record.pricePrecision),
      },
      {
        title: intl.get(`${promptCode}.model.payableInvoice.netAmount`).d('不含税金额'),
        dataIndex: 'netAmount',
        align: 'right',
        render: thousandsRender,
        // render: (text, record) => thousandBitSeparator(Number(text), record.amountPrecision),
      },
      {
        title: intl.get(`${promptCode}.model.payableInvoice.taxRate`).d('税率'),
        dataIndex: 'taxRate',
        align: 'right',
        width: 150,
      },
      {
        title: intl.get(`${promptCode}.model.payableInvoice.taxAmount`).d('税额'),
        dataIndex: 'taxAmount',
        align: 'right',
        render: thousandsRender,
        // render: (text, record) => thousandBitSeparator(text, record.amountPrecision),
      },
      {
        title: intl.get(`${promptCode}.model.payableInvoice.actualPrice`).d('商品单价'),
        dataIndex: 'taxIncludedPrice',
        align: 'right',
        render: thousandsRender,
        // render: (text, record) => thousandBitSeparatorDJ(Number(text), record.pricePrecision),
      },
      {
        title: intl.get(`${promptCode}.model.payableInvoice.taxIncludedAmount`).d('含税金额'),
        dataIndex: 'taxIncludedAmount',
        align: 'right',
        render: thousandsRender,
        // render: (text, record) => thousandBitSeparator(text, record.amountPrecision),
      },
      {
        title: intl.get(`${promptCode}.model.payableInvoice.ecPoNum`).d('父订单号'),
        dataIndex: 'ecPoNum',
        width: 150,
      },
      {
        title: intl.get(`${promptCode}.model.payableInvoice.deliverTime`).d('妥投时间'),
        dataIndex: 'deliverTime',
        width: 150,
        render: dateRender,
      },
    ];

    return (
      <React.Fragment>
        <Header
          backPath="/sfin/payable-invoice-apply/list"
          title={intl.get(`${promptCode}.view.title.orderDetail`).d('订单明细')}
        />
        <Content>
          <Spin spinning={loading} wrapperClassName={styles['payable-invoice']}>
            <Collapse
              className="form-collapse"
              defaultActiveKey={['orderForm']}
              onChange={(arr) => this.onCollapseChange(arr, 'orderForm')}
            >
              <Collapse.Panel
                forceRender
                showArrow={false}
                key="orderForm"
                header={
                  <React.Fragment>
                    <h3>{intl.get(`${promptCode}.title.orderHeaderInfo`).d('订单头信息')}</h3>
                    <a>
                      {collapseKeys.orderForm
                        ? collapseKeys.orderForm.some((o) => o === 'orderForm')
                          ? intl.get(`hzero.common.button.up`).d('收起')
                          : intl.get(`hzero.common.button.expand`).d('展开')
                        : intl.get(`hzero.common.button.up`).d('收起')}
                    </a>
                    <Icon
                      type={
                        collapseKeys.orderForm
                          ? collapseKeys.orderForm.some((o) => o === 'orderForm')
                            ? 'up'
                            : 'down'
                          : 'up'
                      }
                    />
                  </React.Fragment>
                }
              >
                {this.renderForm(headerInfo)}
              </Collapse.Panel>
            </Collapse>
            <Collapse
              className={classnames('form-collapse', 'table-line')}
              defaultActiveKey={['orderTable']}
              onChange={(arr) => this.onCollapseChange(arr, 'orderTable')}
            >
              <Collapse.Panel
                forceRender
                showArrow={false}
                key="orderTable"
                header={
                  <React.Fragment>
                    <h3>{intl.get(`${promptCode}.view.message.title.detail`).d('明细')}</h3>
                    <a>
                      {collapseKeys.orderTable
                        ? collapseKeys.orderTable.some((o) => o === 'orderTable')
                          ? intl.get(`hzero.common.button.up`).d('收起')
                          : intl.get(`hzero.common.button.expand`).d('展开')
                        : intl.get(`hzero.common.button.up`).d('收起')}
                    </a>
                    <Icon
                      type={
                        collapseKeys.orderTable
                          ? collapseKeys.orderTable.some((o) => o === 'orderTable')
                            ? 'up'
                            : 'down'
                          : 'up'
                      }
                    />
                  </React.Fragment>
                }
              >
                {customizeTable(
                  {
                    code: 'SFIN.ORDER_DETAIL.LINE',
                  },
                  <Table
                    bordered
                    rowKey="id"
                    columns={columns}
                    dataSource={dataSource}
                    pagination={pagination}
                    onChange={this.handleSearch}
                    scroll={{ x: this.scrollWidth(columns, 800) }}
                  />
                )}
              </Collapse.Panel>
            </Collapse>
          </Spin>
        </Content>
      </React.Fragment>
    );
  }
}
