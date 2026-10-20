import React, { Component } from 'react';
import { Table, Tooltip } from 'hzero-ui';
import { sum, isNumber, isArray } from 'lodash';
import intl from 'utils/intl';
import { Bind } from 'lodash-decorators';
import { dateRender } from 'utils/renderer';

import abnormal from '@/assets/abnormal.svg';
import styles from './index.less';

/**
 * 验收单列表
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
      pagination,
      dataSource,
      onChange,
      handleJumpApproved,
      rowSelection,
      customizeTable,
    } = this.props;
    const columns = [
      {
        title: intl.get(`sinv.acceptance.view.message.acceptListNum`).d('验收单号'),
        dataIndex: 'acceptListNum',
        width: 140,
        render: (val, record) => (
          <div className={styles['row-agent-column']}>
            <a onClick={() => handleJumpApproved(record)}>{val}</a>
            {record.erpSyncStatus === 'FAIL' && (
              <Tooltip title={record.erpSyncResponseMsg}>
                <img src={abnormal} alt="img" />
              </Tooltip>
            )}
          </div>
        ),
      },
      {
        title: intl.get(`sinv.common.model.common.acceptanceTitle`).d('验收单标题'),
        dataIndex: 'title',
        width: 180,
      },
      {
        title: intl.get(`sinv.common.model.common.acceptanceStatus`).d('验收单状态'),
        dataIndex: 'statusCode',
        width: 100,
        render: (_, record) => record.statusCodeMeaning,
      },
      {
        title: intl.get(`sinv.common.model.common.acceptantType`).d('验收类型'),
        dataIndex: 'acceptListTypeId',
        width: 100,
        render: (_, record) => record.acceptListTypeName,
      },
      {
        title: intl.get(`sinv.common.model.common.sourceCodeMeaning`).d('验收单据来源'),
        dataIndex: 'sourceCode',
        width: 150,
        render: (_, record) => record.sourceCodeMeaning,
      },
      {
        title: intl.get(`sinv.common.model.common.companyName`).d('公司'),
        dataIndex: 'companyId',
        width: 150,
        render: (_, record) => record.companyName,
      },
      {
        title: intl.get(`sinv.common.model.common.supplierCompanyName`).d('供应商'),
        dataIndex: 'supplierCompanyId',
        width: 150,
        render: (_, record) => record.supplierCompanyName,
      },
      {
        title: intl.get(`sinv.common.model.common.acceptorName`).d('验收人'),
        dataIndex: 'acceptorNameList',
        width: 150,
        render: (val) => (isArray(val) ? val.join() : val),
      },
      {
        title: intl.get(`sinv.common.model.common.acceptDate`).d('验收日期'),
        dataIndex: 'acceptDate',
        width: 120,
        render: dateRender,
      },
      {
        title: intl.get(`sinv.common.model.common.erpSyncStatus`).d('导出状态'),
        dataIndex: 'erpSyncStatusMeaning',
        width: 150,
      },
      {
        title: intl.get(`sinv.common.model.common.erpSyncResponseMsg`).d('反馈信息'),
        dataIndex: 'erpSyncResponseMsg',
        width: 150,
      },
      {
        title: intl.get(`sinv.common.model.common.operationRecord`).d('操作记录'),
        dataIndex: 'operationRecord',
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
    const scrollX = sum(columns.map((n) => (isNumber(n.width) ? n.width : 0))) + 240;
    return customizeTable(
      {
        code: 'SINV.ACCEPTANCE_QUERY.LIST',
      },
      <Table
        bordered
        loading={loading}
        columns={columns}
        dataSource={dataSource}
        pagination={pagination}
        scroll={{ x: scrollX }}
        rowKey="acceptListHeaderId"
        rowSelection={rowSelection}
        onChange={(page) => onChange(page)}
      />
    );
  }
}
