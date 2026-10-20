/**
 * GroupMemberPanel - 小组成员
 * @date: 2018-11-27
 * @author: WH <heng.wei@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { Spin, Form, Input } from 'hzero-ui';
import { isUndefined } from 'lodash';
import EditTable from 'components/EditTable';
import intl from 'utils/intl';
import Checkbox from 'components/Checkbox';
import { dateTimeRender } from 'utils/renderer';
import { thousandBitSeparator } from '@/routes/utils.js';

const prefix = `sqam.common.model.8d`;
export default class ContinueSupplyPanel extends Component {
  componentDidMount() {
    const { onSearch } = this.props;
    onSearch('common8D/fetchContinueSupplier');
  }

  render() {
    const { continueSupplierList, continueSupplierPagination, loading = {} } = this.props;
    const columns = [
      {
        title: intl.get(`${prefix}.inventoryCode`).d('库存分布'),
        dataIndex: 'inventoryCodeMeaning',
        width: 140,
      },
      {
        title: intl.get(`${prefix}.effectFlag`).d('是否影响'),
        dataIndex: 'effectFlag',
        width: 60,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`effectFlag`, {
                initialValue: val,
              })(<Checkbox disabled />)}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`${prefix}.doubtfulQuantity`).d('可疑数量'),
        dataIndex: 'doubtfulQuantity',
        width: 100,
        render: (text) => thousandBitSeparator(Number(text)),
      },
      {
        title: intl.get(`${prefix}.badQuantity`).d('不良品数量'),
        dataIndex: 'badQuantity',
        width: 100,
        render: (text) => thousandBitSeparator(Number(text)),
      },
      {
        title: intl.get(`${prefix}.handleMeasure`).d('处理措施'),
        dataIndex: 'measures',
        width: 200,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`measures`, {
                initialValue: val,
              })(<Input.TextArea rows={2} style={{ resize: 'vertical' }} disabled />)}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`${prefix}.chargeName`).d('责任人'),
        dataIndex: 'supplyChargeName',
        width: 100,
      },
      {
        title: intl.get(`${prefix}.finishDate`).d('完成时间'),
        dataIndex: 'suppliyEndDate',
        width: 100,
        render: dateTimeRender,
      },
      {
        title: intl.get(`hzero.entity.remark`).d('备注'),
        dataIndex: 'supplyActionRemark',
        width: 100,
      },
    ];
    return (
      <React.Fragment>
        <Spin spinning={!isUndefined(loading.deletedMembers) && loading.deletedMembers}>
          <EditTable
            bordered
            rowKey="supplyActionId"
            dataSource={continueSupplierList}
            columns={columns}
            pagination={continueSupplierPagination}
          />
        </Spin>
      </React.Fragment>
    );
  }
}
