/**
 * InvoiceDownloadList - 自动对账-发票下载
 * @date: 2019-3-26
 * @author: chenjing <jing.chen05@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { connect } from 'dva';
import { Form, Table, Row, Col, Modal } from 'hzero-ui';
import { isUndefined, isFunction } from 'lodash';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';

const FormItem = Form.Item;
const promptCode = 'sfin.payableInvoice';

@connect(({ autoAccount, loading }) => ({
  autoAccount,
  loading: loading.effects['autoAccount/fetchInvoiceDownloadList'],
}))
export default class InvoiceDownloadList extends Component {
  /**
   * state初始化
   * @param {objet} props - 组件props
   */
  constructor(props) {
    super(props);
    if (isFunction(props.onRef)) {
      props.onRef(this);
    }
    this.state = {};
  }

  /**
   * 发票下载查询
   * @param {object} page - 查询参数
   */
  @Bind()
  handleSearch(page = {}) {
    const { dispatch, data } = this.props;
    if (data) {
      dispatch({
        type: 'autoAccount/fetchInvoiceDownloadList',
        payload: {
          page,
          ecPlatform: data.ecPlatformCode,
          companyId: data.companyId,
          orderId: data.ecPoSubNum,
          ivcType: 3,
        },
      });
    }
  }

  @Bind()
  closeSearch() {
    const { dispatch } = this.props;
    dispatch({
      type: 'autoAccount/updateState',
      payload: {
        invoiceDownloadPagination: {},
        invoiceDownloadList: [], // 缓存的操作记录数据要清空
      },
    });
  }

  renderForm(data) {
    const formItemLayout = {
      labelCol: { span: 10 },
      wrapperCol: { span: 14 },
    };
    return (
      <Row gutter={12}>
        <Col span={24}>
          <Row>
            <Col span={8}>
              <FormItem
                {...formItemLayout}
                label={intl.get(`${promptCode}.model.payableInvoice.srmPoNum`).d('SRM订单号')}
              >
                {data.displayPoNum}
              </FormItem>
            </Col>

            <Col span={8}>
              <FormItem
                {...formItemLayout}
                label={intl.get(`${promptCode}.model.payableInvoice.ecPoSubNum`).d('子订单号')}
              >
                {data.ecPoSubNum}
              </FormItem>
            </Col>

            <Col span={8}>
              <FormItem
                {...formItemLayout}
                label={intl.get(`${promptCode}.model.payableInvoice.invoiceState`).d('开票方式')}
              >
                {data.invoiceStateMeaning}
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
      autoAccount: { invoiceDownloadList = [], invoiceDownloadPagination = {} },
      visible,
      hideModal,
      data,
    } = this.props;
    const columns = [
      {
        title: intl.get(`${promptCode}.model.payableInvoice.lineNum`).d('行号'),
        dataIndex: 'lineNum',
        width: 50,
      },
      {
        title: intl.get(`${promptCode}.model.payableInvoice.taxInvoiceCode`).d('发票代码'),
        dataIndex: 'ivcCode',
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.model.payableInvoice.taxInvoiceNum`).d('税务发票号'),
        dataIndex: 'ivcNo',
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.model.payableInvoice.invoiceDownloadLink`).d('发票下载地址'),
        dataIndex: 'fileUrl',
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
        onCancel={hideModal}
        footer={null}
        width={850}
        bodyStyle={{ minHeight: 300 }}
      >
        {!isUndefined(data) && this.renderForm(data)}
        <Table
          loading={loading}
          dataSource={(invoiceDownloadList || []).map((item, index) => ({
            lineNum: index + 1,
            ...item,
          }))}
          pagination={invoiceDownloadPagination}
          rowKey="ecinvoiceAclinesId"
          onChange={this.handleSearch}
          columns={columns}
          bordered
        />
      </Modal>
    );
  }
}
