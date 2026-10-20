/**
 * InvoiceDownloadList - 自动对账-发票下载
 * @date: 2019-3-26
 * @author: chenjing <jing.chen05@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { connect } from 'dva';
import { Form, Table, Row, Col, Tooltip, Modal } from 'hzero-ui';
import { isUndefined, isFunction } from 'lodash';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';

const FormItem = Form.Item;
const promptCode = 'sfin.payableInvoice';

@connect(({ invoice, loading }) => ({
  invoice,
  loading: loading.effects['invoice/fetchInvoiceDownloadList'],
}))
export default class InvoiceDownloadList extends Component {
  /**
   * state初始化
   * @param {objet} props - 组件props
   */
  constructor(props) {
    super(props);
    if (isFunction(props.bindRef)) {
      props.bindRef(this);
    }
    this.state = {};
  }

  /**
   * 发票下载查询
   * @param {object} page - 查询参数
   */
  @Bind()
  handleSearch(page = {}) {
    const { dispatch, invoiceData } = this.props;
    if (invoiceData) {
      dispatch({
        type: 'invoice/fetchInvoiceDownloadList',
        payload: {
          page,
          invoiceHeaderId: invoiceData.invoiceHeaderId,
        },
      });
    }
  }

  @Bind()
  closeSearch() {
    const { dispatch } = this.props;
    dispatch({
      type: 'invoice/updateState',
      payload: {
        invoiceDownloadPagination: {},
        invoiceDownloadList: [], // 缓存的操作记录数据要清空
      },
    });
  }

  renderForm(invoiceData) {
    const formItemLayout = {
      labelCol: { span: 10 },
      wrapperCol: { span: 14 },
    };
    const {
      invoiceNum, // SRM发票号
      companyName, // 公司
      supplierName, // 供应商
    } = invoiceData;
    return (
      <Row gutter={12}>
        <Col span={24}>
          <Row>
            <Col span={8}>
              <FormItem
                {...formItemLayout}
                label={intl.get(`${promptCode}.model.invoiceBill.invoiceNum`).d('SRM发票号')}
              >
                {invoiceNum && (
                  <Tooltip placement="top" title={invoiceNum}>
                    {invoiceNum.length > 20 ? `${invoiceNum.substr(0, 20)}...` : invoiceNum}
                  </Tooltip>
                )}
              </FormItem>
            </Col>

            <Col span={8}>
              <FormItem
                {...formItemLayout}
                label={intl.get(`${promptCode}.model.invoiceBill.company`).d('公司')}
              >
                {' '}
                {companyName && (
                  <Tooltip placement="top" title={companyName}>
                    {companyName.length > 12 ? `${companyName.substr(0, 12)}...` : companyName}
                  </Tooltip>
                )}
              </FormItem>
            </Col>

            <Col span={8}>
              <FormItem
                {...formItemLayout}
                label={intl.get(`${promptCode}.model.invoiceBill.supplierName`).d('供应商')}
              >
                {supplierName && (
                  <Tooltip placement="top" title={supplierName}>
                    {supplierName.length > 12 ? `${supplierName.substr(0, 12)}...` : supplierName}
                  </Tooltip>
                )}
              </FormItem>
            </Col>
          </Row>
        </Col>
      </Row>
    );
  }

  render() {
    const {
      loading,
      invoice: { invoiceDownloadList = [], invoiceDownloadPagination = {} },
      visible,
      hideDownloadModal,
      invoiceData,
    } = this.props;
    const columns = [
      {
        title: intl.get(`${promptCode}.model.payableInvoice.lineNum`).d('行号'),
        dataIndex: 'lineNum',
        width: 50,
      },
      {
        title: intl.get(`${promptCode}.model.payableInvoice.taxInvoiceCode`).d('发票代码'),
        dataIndex: 'taxInvoiceCode',
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.model.payableInvoice.taxInvoiceNum`).d('税务发票号'),
        dataIndex: 'taxInvoiceNum',
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.model.payableInvoice.invoiceDownloadLink`).d('发票下载地址'),
        dataIndex: 'invoiceDownloadLink',
        width: 150,
        render: (val) => (
          <a href={val} target="_blank" rel="noopener noreferrer">
            {val}
          </a>
        ),
      },
    ];
    return (
      <Modal
        title={intl.get(`${promptCode}.model.payableInvoice.invoiceDownload`).d('发票下载')}
        visible={visible}
        onCancel={hideDownloadModal}
        footer={null}
        width={850}
        bodyStyle={{ minHeight: 300 }}
      >
        {!isUndefined(invoiceData) && this.renderForm(invoiceData)}
        <Table
          loading={loading}
          dataSource={(invoiceDownloadList || []).map((item, index) => ({
            lineNum: index + 1,
            ...item,
          }))}
          pagination={invoiceDownloadPagination}
          rowKey="invoiceDownloadLinkId"
          onChange={this.handleSearch}
          columns={columns}
          bordered
        />
      </Modal>
    );
  }
}
