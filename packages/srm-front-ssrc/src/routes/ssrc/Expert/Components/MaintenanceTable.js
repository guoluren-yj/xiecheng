/**
 * MaintenanceTable.js - 专家信息表格
 * @date: 2019-01-21
 * @author: YKK <kaikai.yang@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */

import React, { Component } from 'react';
import { Table } from 'hzero-ui';
import { withRouter } from 'dva/router';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import { enableRender } from 'utils/renderer';
import { isFunction } from 'lodash';

import { phoneRender } from '@/utils/renderer';

const promptCode = 'ssrc.expert';

@withRouter
export default class MaintenanceTable extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  @Bind()
  linkDetail(expertId) {
    const { history, type } = this.props;
    if (type === 'maintenace') {
      history.push(`/ssrc/expert-maintenace/detail/${expertId}`);
    } else if (type === 'query') {
      history.push(`/ssrc/expert-query/detail/${expertId}`);
    }
  }

  render() {
    const {
      loading,
      onTableChange,
      rowSelection,
      expertList: { content = [] },
      expertPagination = {},
      remote,
      onQueryAll,
      customizeTable,
      customizeUnitCode = '',
    } = this.props;
    const columns = [
      // 该列被【山鹰DPP】二开，请勿修改dataIndex
      {
        title: intl.get(`${promptCode}.model.expert.subAccount`).d('子账户'),
        dataIndex: 'loginName',
        width: 100,
        render: (value, record) => {
          const { expertId } = record;
          return <a onClick={() => this.linkDetail(expertId)}>{value}</a>;
        },
      },
      {
        title: intl.get(`${promptCode}.model.expert.expertsName`).d('专家姓名'),
        dataIndex: 'expertName',
        width: 150,
      },
      {
        title: intl.get(`${promptCode}.model.expert.expertLevel`).d('专家级别'),
        dataIndex: 'expertLevelMeaning',
        width: 150,
      },
      {
        title: intl.get(`${promptCode}.model.expert.expertType`).d('专家类型'),
        dataIndex: 'expertTypeMeaning',
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.model.expert.expertCategory`).d('专家类别'),
        dataIndex: 'expertCategoryMeaning',
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.model.expert.mobilephone`).d('移动电话'),
        dataIndex: 'mobilephone',
        render: (_, record) => phoneRender(record.internationalTelCodeMeaning, record.mobilephone),
      },
      {
        title: intl.get(`${promptCode}.model.expert.registeredDate`).d('注册日期'),
        dataIndex: 'registeredDate',
        width: 150,
        render: (text, record) =>
          record.registeredDate ? record.registeredDate.substring(0, 10) : '',
      },
      {
        title: intl.get(`${promptCode}.model.expert.enabledFlag`).d('启用'),
        dataIndex: 'enabledFlag',
        width: 100,
        render: enableRender,
      },
    ];

    const processProps = {
      expertPagination,
      queryAll: onQueryAll,
    };

    return (
      <React.Fragment>
        {isFunction(customizeTable) ? (
          customizeTable(
            {
              code: customizeUnitCode,
            },
            <Table
              bordered
              loading={loading}
              rowKey="expertId"
              columns={
                remote
                  ? remote.process('SSRC_EXPERT_QUERY_PROCESS_TABLE_COLUMNS', columns, processProps)
                  : columns
              }
              rowSelection={rowSelection}
              dataSource={content}
              pagination={expertPagination}
              onChange={onTableChange}
            />
          )
        ) : (
          <Table
            bordered
            loading={loading}
            rowKey="expertId"
            columns={
              remote
                ? remote.process('SSRC_EXPERT_QUERY_PROCESS_TABLE_COLUMNS', columns, processProps)
                : columns
            }
            dataSource={content}
            rowSelection={rowSelection}
            pagination={expertPagination}
            onChange={onTableChange}
          />
        )}
      </React.Fragment>
    );
  }
}
