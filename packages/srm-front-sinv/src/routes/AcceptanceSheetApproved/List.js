import React, { Component } from 'react';
import { Table } from 'hzero-ui';
import { sum, isNumber, isArray } from 'lodash';
import intl from 'utils/intl';
import { Bind } from 'lodash-decorators';
import { dateRender } from 'utils/renderer';

/**
 * 接收事务入口界面
 *
 * @export
 * @class List - 列表组价
 * @extends {Component} - React.Component
 * @reactProps {boolean} loading - 数据加载状态
 * @reactProps {object} tableData - 列表数据源
 * @reactProps {object} pagination - 列表分页信息
 * @reactProps {object} rowSelection - 选择行对象
 * @reactProps {function} onChange - 分页查询
 * @returns React.element
 */
export default class List extends Component {
  @Bind()
  handleOperationRecord(id) {
    const { openOperationRecord } = this.props;
    if (openOperationRecord) {
      openOperationRecord(true, id);
    }
  }

  render() {
    const {
      loading,
      dataSource,
      pagination,
      rowSelection,
      onChange,
      handleJumpApproved,
    } = this.props;
    const columns = [
      {
        title: intl.get(`sinv.acceptance.view.message.acceptListNum`).d('验收单号'),
        dataIndex: 'acceptListNum',
        width: 180,
        render: (val, record) => <a onClick={() => handleJumpApproved(record)}>{val}</a>,
      },
      {
        title: intl.get(`sinv.common.model.common.acceptanceTitle`).d('验收单标题'),
        dataIndex: 'title',
        width: 180,
      },
      {
        title: intl.get(`sinv.common.model.common.acceptanceType`).d('验收类型'),
        dataIndex: 'acceptListTypeName',
        width: 100,
      },
      {
        title: intl.get(`sinv.common.model.common.sourceCodeMeaning`).d('验收单据来源'),
        dataIndex: 'sourceCodeMeaning',
        width: 100,
      },
      {
        title: intl.get(`sinv.common.model.common.companyName`).d('公司'),
        dataIndex: 'companyName',
        width: 150,
      },
      {
        title: intl.get(`sinv.common.model.common.supplierCompanyName`).d('供应商'),
        dataIndex: 'supplierCompanyName',
        width: 150,
      },
      {
        title: intl.get(`sinv.common.model.common.acceptorName`).d('验收人'),
        dataIndex: 'acceptorNameList',
        width: 120,
        render: val => (isArray(val) ? val.join() : val),
      },
      {
        title: intl.get(`sinv.common.model.common.acceptDate`).d('验收日期'),
        dataIndex: 'acceptDate',
        width: 120,
        render: dateRender,
      },
      {
        title: intl.get(`sinv.common.model.common.operationRecord`).d('操作记录'),
        width: 120,
        render: (value, record) => (
          <div>
            <a onClick={() => this.handleOperationRecord(record.acceptListHeaderId)}>
              {intl.get(`sinv.common.model.common.operationRecord`).d('操作记录')}
            </a>
          </div>
        ),
      },
    ];
    const scrollX = sum(columns.map(n => (isNumber(n.width) ? n.width : 0))) + 240;
    return (
      <Table
        bordered
        loading={loading}
        columns={columns}
        dataSource={dataSource}
        pagination={pagination}
        rowSelection={rowSelection}
        scroll={{ x: scrollX }}
        rowKey="acceptListHeaderId"
        onChange={page => onChange(page)}
      />
    );
  }
}
