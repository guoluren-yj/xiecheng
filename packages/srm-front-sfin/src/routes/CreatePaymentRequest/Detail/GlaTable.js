/**
 * GlaTable - 发票行
 * @date: 2019-12-12
 * @author: zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */
import React, { Component } from 'react';
import { Form, InputNumber } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import { dateRender, dateTimeRender } from 'utils/renderer';
import EditTable from 'components/EditTable';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { thousandBitSeparator, precisionNum } from '@/routes/utils';
import './index.less';

// import Styles from './index.less';
// import { handleSearchHeader } from '@/services/createPaymentRequestServices';

// const FormItem = Form.Item;
const promptCode = 'sfin.supplierChargeEntry';

@Form.create({ fieldNameProp: null })
@withCustomize({
  unitCode: ['SFIN.PAYMENT_REQUEST_CREATE_DETAIL.LINE'],
})
export default class RowTable extends Component {
  state = {};

  /**
   * 计算table列宽度
   * @param {Array} columns 列
   * @param {Number} fixWidth 固定列宽度
   */
  @Bind()
  scrollWidth(columns, fixWidth) {
    const total = columns.reduce(
      (prev, current) => prev + (current.className ? 0 : current.width ? current.width : 0),
      0
    );
    return total + fixWidth + 1;
  }

  @Bind()
  changeList(text, values, record) {
    const { updateState } = this.props;
    updateState(text, values, record);
  }

  render() {
    const {
      onSearch,
      loading,
      dataSource = [],
      pagination = {},
      selectedRows = [],
      onToDetail,
      onSelectedRowChange = (e) => e,
      handleInput = (e) => e,
      customizeTable,
      className,
      // validateSelect = e => e,
    } = this.props;
    const selectedRowKeys = selectedRows.map((n) => n.paymentLineId);
    const rowSelection = { selectedRowKeys, onChange: onSelectedRowChange };
    const columns = [
      {
        title: intl.get(`${promptCode}.invoiceNum`).d('SRM发票号'),
        dataIndex: 'invoiceNum',
        // width: 170,
        // fixed: 'left',
      },
      {
        title: intl.get(`${promptCode}.taxIncludedAmount`).d('发票总额'),
        dataIndex: 'taxIncludedAmount',
        width: 110,
        // fixed: 'left',
        render: (text, record) => thousandBitSeparator(text, record.amountPrecision),
      },
      {
        title: intl.get(`${promptCode}.taxAmount`).d('发票税额'),
        dataIndex: 'taxAmount',
        width: 110,
        // fixed: 'left',
        render: (text, record) => thousandBitSeparator(text, record.amountPrecision),
      },
      {
        title: intl.get(`${promptCode}.laveAmount`).d('剩余可付金额'),
        dataIndex: 'laveAmount',
        width: 130,
        // fixed: 'left',
        render: (text, record) => thousandBitSeparator(text, record.amountPrecision),
      },
      {
        title: intl.get(`${promptCode}.paymentAmount`).d('本次付款金额'),
        dataIndex: 'paymentAmount',
        width: 200,
        // fixed: 'left', // fixed导致输入框卡顿 解除定位即可解决此问题
        render: (_, record) => (
          <Form.Item>
            {record.$form.getFieldDecorator(`paymentAmount`, {
              initialValue: record.paymentAmount === 0 ? record.laveAmount : record.paymentAmount,
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`${promptCode}.model.paymentAmount`).d('本次付款金额'),
                  }),
                },
                {
                  validator: (rule, value, callback) => {
                    const { laveAmount = null } = record;
                    if (
                      (+laveAmount > 0 && record.$form.getFieldValue('paymentAmount') < 0) ||
                      (+laveAmount < 0 && record.$form.getFieldValue('paymentAmount') > 0)
                    ) {
                      callback(
                        new Error(
                          intl
                            .get(`${promptCode}.model.message.absoluteValue`)
                            .d('本次付款金额需小于剩余可付金额的绝对值')
                        )
                      );
                    } else if (
                      (+laveAmount > 0 &&
                        +laveAmount < record.$form.getFieldValue('paymentAmount')) ||
                      (+laveAmount < 0 && +laveAmount > record.$form.getFieldValue('paymentAmount'))
                    ) {
                      callback(
                        new Error(
                          intl
                            .get(`${promptCode}.model.message.absoluteValue`)
                            .d('本次付款金额需小于剩余可付金额的绝对值')
                        )
                      );
                    } else if (
                      laveAmount !== 0 &&
                      record.$form.getFieldValue('paymentAmount') === 0
                    ) {
                      callback(
                        new Error(
                          intl
                            .get(`${promptCode}.model.message.paymentAmountNot`)
                            .d('本次付款金额的值不能为0')
                        )
                      );
                    } else {
                      callback();
                    }
                  },
                },
              ],
            })(
              <InputNumber
                // eslint-disable-next-line no-shadow

                precision={precisionNum(_, record, 'paymentAmount')}
                allowThousandth
                // {...precisionParams(_, true)}
                onChange={(text, values) => {
                  handleInput(text, values, record);
                }}
              />
            )}
          </Form.Item>
        ),
      },
      {
        title: intl.get(`${promptCode}.paymentAmounted`).d('已付款金额'),
        dataIndex: 'paymentAmounted',
        width: 120,
        render: (text, record) => thousandBitSeparator(text, record.amountPrecision),
      },
      {
        title: intl.get(`${promptCode}.cancelVerificationAmount`).d('已核销金额'),
        dataIndex: 'cancelVerificationAmount',
        width: 120,
        render: (text, record) => thousandBitSeparator(text, record.amountPrecision),
      },
      {
        title: intl.get(`${promptCode}.validateStatusCodeMeaning`).d('查验状态'),
        dataIndex: 'validateStatusCodeMeaning',
        width: 130,
      },
      {
        title: intl.get(`${promptCode}.taxInvoiceDateIssued`).d('开票日期'),
        dataIndex: 'taxInvoiceDateIssued',
        width: 150,
        render: dateRender,
      },
      {
        title: intl.get(`${promptCode}.headerCreationDate`).d('创建日期'),
        dataIndex: 'headerCreationDate',
        width: 150,
        render: dateTimeRender,
      },
      {
        title: intl.get(`${promptCode}.action`).d('操作'),
        dataIndex: 'action',
        width: 120,
        align: 'center',
        render: (_, record) =>
          record._status !== 'create' && (
            <a onClick={() => onToDetail(record)}>
              {intl.get(`${promptCode}.view.button.cancelAfterVerification`).d('核销')}
            </a>
          ),
      },
    ];
    return (
      <React.Fragment>
        {customizeTable(
          {
            code: 'SFIN.PAYMENT_REQUEST_CREATE_DETAIL.LINE', // 单元编码，必传
          },
          <EditTable
            bordered
            loading={loading}
            className={className || ''}
            rowSelection={rowSelection}
            rowKey="paymentLineId"
            columns={columns}
            dataSource={dataSource}
            pagination={pagination}
            onChange={onSearch}
            scroll={{ x: this.scrollWidth(columns, 200) }}
          />
        )}
      </React.Fragment>
    );
  }
}
