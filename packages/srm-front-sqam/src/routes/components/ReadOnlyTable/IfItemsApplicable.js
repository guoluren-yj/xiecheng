/**
 * GroupMemberPanel - 小组成员
 * @date: 2018-11-27
 * @author: WH <heng.wei@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { Spin, Form, Select, Input } from 'hzero-ui';
import { isUndefined } from 'lodash';
import EditTable from 'components/EditTable';
import intl from 'utils/intl';
import Checkbox from 'components/Checkbox';

const prefix = `sqam.common.model.8d`;
export default class IfItemsApplicable extends Component {
  componentDidMount() {
    const { onSearch } = this.props;
    onSearch('common8D/fetchApplyItem');
  }

  render() {
    const { otherItem, applyItemList, applyItemPagination, loading = {} } = this.props;
    const columns = [
      {
        title: intl.get(`${prefix}.orderNum`).d('序号'),
        dataIndex: 'orderNum',
        width: 50,
        render: (val, record, index) => {
          return index + 1;
        },
      },
      {
        title: intl.get(`${prefix}.otherItem`).d('其他项目'),
        dataIndex: 'applicationItemCodeMeaning',
        width: 150,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`applicationItemCodeMeaning`, {
                initialValue: val,
              })(
                <Select disabled style={{ width: '100%' }}>
                  {otherItem.map((item) => (
                    <Select.Option value={item.value}>{item.meaning}</Select.Option>
                  ))}
                </Select>
              )}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`${prefix}.itemDesc`).d('项目说明'),
        dataIndex: 'itemDesc',
        width: 200,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`itemDesc`, {
                initialValue: val,
              })(<Input.TextArea rows={2} style={{ resize: 'vertical' }} disabled />)}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`${prefix}.handleFlag`).d('是否已处理'),
        dataIndex: 'handleFlag',
        width: 130,
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
        title: intl.get(`hzero.common.remark`).d('备注'),
        dataIndex: 'itemRemark',
        width: 200,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`itemRemark`, {
                initialValue: val,
              })(<Input.TextArea rows={2} style={{ resize: 'vertical' }} disabled />)}
            </Form.Item>
          ) : (
            val
          ),
      },
    ];
    return (
      <React.Fragment>
        <Spin spinning={!isUndefined(loading.deletedMembers) && loading.deletedMembers}>
          <EditTable
            bordered
            rowKey="applicableItemsId"
            dataSource={applyItemList}
            columns={columns}
            pagination={applyItemPagination}
          />
        </Spin>
      </React.Fragment>
    );
  }
}
