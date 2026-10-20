/**
 * TendePlanQuery -寻源计划查询 表格table页面
 * @date: 2018-4-16
 * @author YP <peng.yang05@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Table, Popover } from 'hzero-ui';
import moment from 'moment';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
// import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
import { numberSeparatorRender } from '@/utils/renderer';

const promptCode = 'ssrc.tenderPlan.model.tenderPlan';

export default class TableList extends Component {
  render() {
    const { onFetchPlans, list, loading, pagination, customizeTable } = this.props;
    const columns = [
      {
        title: intl.get(`${promptCode}.bidPlanLineNum`).d('计划单号'),
        dataIndex: 'bidPlanLineNum',
        width: 150,
      },
      {
        title: intl.get(`${promptCode}.planLineName`).d('计划名称'),
        dataIndex: 'bidPlanLineName',
        width: 150,
        render: (value) =>
          value ? (
            <Popover placement="topLeft" content={value}>
              {value}
            </Popover>
          ) : (
            ''
          ),
      },
      {
        title: intl.get(`${promptCode}.businessCategoryMeaning`).d('业务类别'),
        dataIndex: 'businessCategoryMeaning',
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.projectNum`).d('项目编码'),
        dataIndex: 'projectNum',
        width: 150,
      },
      {
        title: intl.get(`${promptCode}.projectName`).d('项目名称'),
        dataIndex: 'projectName',
        width: 150,
        render: (value) =>
          value ? (
            <Popover placement="topLeft" content={value}>
              {value}
            </Popover>
          ) : (
            ''
          ),
      },
      {
        title: intl.get(`${promptCode}.company`).d('公司'),
        dataIndex: 'companyName',
        width: 150,
        render: (value) =>
          value ? (
            <Popover placement="topLeft" content={value}>
              {value}
            </Popover>
          ) : (
            ''
          ),
      },
      {
        title: intl.get(`${promptCode}.ouCode`).d('业务实体编码'),
        dataIndex: 'ouCode',
        width: 120,
      },
      {
        title: intl.get(`${promptCode}.theOUName`).d('业务实体名称'),
        dataIndex: 'ouName',
        width: 150,
        render: (value) =>
          value ? (
            <Popover placement="topLeft" content={value}>
              {value}
            </Popover>
          ) : (
            ''
          ),
      },
      {
        title: intl.get(`${promptCode}.year`).d('年度'),
        dataIndex: 'year',
        width: 60,
      },
      {
        title: intl.get(`${promptCode}.projectUserName`).d('项目负责人'),
        dataIndex: 'projectUserName',
        width: 150,
      },
      {
        title: intl.get(`${promptCode}.bidMethod`).d('寻源方式'),
        dataIndex: 'bidMethodMeaning',
        width: 120,
      },
      {
        title: intl.get(`${promptCode}.startDate`).d('寻源开始日期'),
        dataIndex: 'startDate',
        width: 120,
        render: (value) => value && moment(value).format(DEFAULT_DATE_FORMAT),
      },
      {
        title: intl.get(`${promptCode}.endDate`).d('寻源完成日期'),
        dataIndex: 'endDate',
        width: 120,
        render: (value) => value && moment(value).format(DEFAULT_DATE_FORMAT),
      },
      {
        title: intl.get(`${promptCode}.bidDay`).d('寻源天数'),
        dataIndex: 'bidDay',
        width: 90,
      },
      {
        title: intl.get(`${promptCode}.currencyType`).d('币种'),
        dataIndex: 'currencyCode',
        width: 90,
      },
      {
        title: intl.get(`${promptCode}.budgetAmountWithRMB`).d('预算金额(元)'),
        dataIndex: 'budgetAmount',
        align: 'right',
        width: 140,
        render: numberSeparatorRender,
      },
      {
        title: intl.get(`${promptCode}.createdByName`).d('创建人'),
        dataIndex: 'createdByName',
        width: 120,
      },
      {
        title: intl.get('hzero.common.remark').d('备注'),
        dataIndex: 'remark',
        width: 120,
        render: (value) =>
          value ? (
            <Popover placement="topLeft" content={value}>
              {value}
            </Popover>
          ) : (
            ''
          ),
      },
    ];
    return customizeTable(
      {
        code: 'SSRC.PLAN_QUERY_LIST.LIST_V2',
      },
      <Table
        pagination={pagination}
        dataSource={list}
        columns={columns}
        scroll={{ x: 2000 }}
        loading={loading}
        bordered
        onChange={(page) => onFetchPlans(page)}
      />
    );
  }
}
