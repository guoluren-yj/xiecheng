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

const prefix = `sqam.common.model.8d`;
export default class StandardizingPanel extends Component {
  componentDidMount() {
    const { onSearch } = this.props;
    onSearch('common8D/fetchStandard');
  }

  render() {
    const { standardList, standardPagination, loading = {} } = this.props;
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
        title: intl.get(`${prefix}.standard`).d('标准化项'),
        dataIndex: 'standardCodeMeaning',
        width: 130,
      },
      {
        title: intl.get(`${prefix}.measureDesc`).d('措施详述'),
        dataIndex: 'standardActionDesc',
        width: 100,
      },
      {
        title: intl.get(`${prefix}.handleFlag`).d('是否已处理'),
        dataIndex: 'handleFlag',
        width: 130,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`handleFlag`, {
                initialValue: val,
              })(<Checkbox disabled />)}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`hzero.common.remark`).d('备注'),
        dataIndex: 'standardRemark',
        width: 200,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`standardRemark`, {
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
            rowKey="problemTeamId"
            dataSource={standardList}
            columns={columns}
            pagination={standardPagination}
          />
        </Spin>
      </React.Fragment>
    );
  }
}
