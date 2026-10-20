/**
 * GroupMemberPanel - 小组成员
 * @date: 2018-11-27
 * @author: WH <heng.wei@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { Spin, Input, Form } from 'hzero-ui';
import { isUndefined } from 'lodash';
import EditTable from 'components/EditTable';
import intl from 'utils/intl';

const prefix = `sqam.common.model.8d`;
export default class RootCauseAnalysisPanel extends Component {
  componentDidMount() {
    const { onSearch } = this.props;
    onSearch('common8D/fetchRootReason');
  }

  render() {
    const { rootReasonList, rootReasonPagination, loading = {} } = this.props;
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
        title: intl.get(`${prefix}.rootCauseType`).d('原因类型'),
        dataIndex: 'rootCauseTypeCodeMeaning',
        width: 80,
      },
      {
        title: intl.get(`${prefix}.occurCause`).d('发生原因'),
        dataIndex: 'occurCause',
        width: 120,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`occurCause`, {
                initialValue: val,
              })(<Input.TextArea rows={2} style={{ resize: 'vertical' }} disabled />)}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`${prefix}.flowOutCause`).d('流出原因'),
        dataIndex: 'flowOutCause',
        width: 120,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`flowOutCause`, {
                initialValue: val,
              })(<Input.TextArea rows={2} style={{ resize: 'vertical' }} disabled />)}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`${prefix}.preventCause`).d('未预防的原因'),
        dataIndex: 'preventCause',
        width: 120,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`preventCause`, {
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
            rowKey="rootCauseId"
            dataSource={rootReasonList}
            columns={columns}
            pagination={rootReasonPagination}
          />
        </Spin>
      </React.Fragment>
    );
  }
}
