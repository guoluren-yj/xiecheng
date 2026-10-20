/**
 * inquiryHall - 寻源大厅/核价 - 汇率编辑Modal
 * @date: 20120-3-9
 * @author: wangtao <tao.wang13@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2020, Hand
 */

import React, { Component } from 'react';
import { Modal, Form, Button, InputNumber } from 'hzero-ui';
import { isEmpty } from 'lodash';

import { tableScrollWidth } from 'utils/utils';
import intl from 'utils/intl';
import EditTable from 'components/EditTable';

export default class ExchangeEditModal extends Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  componentDidMount() {}

  renderColumns() {
    const columns = [
      {
        title: intl.get('ssrc.common.supplierName').d('供应商名称'),
        dataIndex: 'supplierCompanyName',
        width: 280,
      },
      {
        title: intl.get('ssrc.inquiryHall.model.inquiryHall.quotationCurrency').d('报价币种'),
        dataIndex: 'quotationCurrencyCode',
        width: 100,
      },
      {
        title: intl.get('ssrc.inquiryHall.model.inquiryHall.currentCoCurrency').d('本币币种'),
        dataIndex: 'baseCurrencyCode',
        width: 100,
      },
      {
        title: intl.get('ssrc.common.exchangeRate').d('汇率'),
        dataIndex: 'exchangeRate',
        width: 150,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('exchangeRate', {
                initialValue: val,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('ssrc.common.exchangeRate').d('汇率'),
                    }),
                  },
                ],
              })(<InputNumber style={{ width: '100%' }} precision={8} defaultValue={1} min={0} />)}
            </Form.Item>
          ) : (
            val
          ),
      },
    ];

    return columns;
  }

  render() {
    const {
      exchangeEditModalVisible = false,
      cancelExchangeEdit = () => {},
      saveExchangeEdit,
      quoteExchangeMainData,
      querySupplierExchangeEditLoading,
      exchangeEditSupplierList = [],
      querySupplierExchangeEdit,
      saveExchangeEditLoading,
    } = this.props;

    const columns = this.renderColumns();
    const scrollX = tableScrollWidth(columns) || 0;

    return (
      <Modal
        title={intl.get('ssrc.inquiryHall.view.button.exchangeEdit').d('汇率编辑')}
        visible={exchangeEditModalVisible}
        onCancel={cancelExchangeEdit}
        footer={null}
        width="60%"
      >
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
          <Button
            onClick={quoteExchangeMainData}
            disabled={isEmpty(exchangeEditSupplierList)}
            style={{ marginRight: '8px' }}
          >
            {intl.get('ssrc.inquiryHall.view.button.quoExchangeData').d('引用汇率主数据')}
          </Button>
          <Button
            type="primary"
            onClick={saveExchangeEdit}
            disabled={isEmpty(exchangeEditSupplierList)}
            loading={saveExchangeEditLoading}
          >
            {intl.get('hzero.common.btn.save').d('保存')}
          </Button>
        </div>

        <EditTable
          bordered
          rowKey="quotationHeaderId"
          loading={querySupplierExchangeEditLoading}
          columns={columns}
          scroll={{ x: scrollX }}
          dataSource={exchangeEditSupplierList}
          pagination={false}
          onChange={page => querySupplierExchangeEdit(page)}
        />
      </Modal>
    );
  }
}
