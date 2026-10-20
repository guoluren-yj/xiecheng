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
import { dateTimeRender } from 'utils/renderer';
import intl from 'utils/intl';

const prefix = `sqam.common.model.8d`;
export default class ShortMeature extends Component {
  componentDidMount() {
    const { onSearch } = this.props;
    onSearch('common8D/fetchShortMeature');
  }

  render() {
    const { shortMeatureList, shortMeaturePagination, loading = {} } = this.props;
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
        title: intl.get(`${prefix}.measuresDesc`).d('措施详述'),
        dataIndex: 'measuresDesc',
        width: 210,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`measuresDesc`, {
                initialValue: val,
              })(<Input.TextArea rows={2} style={{ resize: 'vertical' }} disabled />)}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`${prefix}.measureCheck`).d('措施验证'),
        dataIndex: 'produceActionRemark',
        width: 210,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`produceActionRemark`, {
                initialValue: val,
              })(<Input.TextArea rows={2} style={{ resize: 'vertical' }} disabled />)}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`${prefix}.chargeName`).d('责任人'),
        dataIndex: 'produceChargeName',
        width: 100,
      },
      {
        title: intl.get(`${prefix}.finishDate`).d('完成时间'),
        dataIndex: 'produceEndDate',
        width: 100,
        render: dateTimeRender,
      },
    ];
    return (
      <React.Fragment>
        <Spin spinning={!isUndefined(loading.deletedMembers) && loading.deletedMembers}>
          <EditTable
            bordered
            rowKey="problemTeamId"
            dataSource={shortMeatureList}
            columns={columns}
            pagination={shortMeaturePagination}
          />
        </Spin>
      </React.Fragment>
    );
  }
}
