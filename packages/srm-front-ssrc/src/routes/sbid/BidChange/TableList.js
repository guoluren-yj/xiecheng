/**
 * routes - 招标变更/数据列表/表格
 * @date: 2020-02-06
 * @version: 1.0.0
 * @author: zoukang <kang.zou@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent } from 'react';
import { Table, Popover } from 'hzero-ui';
import { isNumber, sum } from 'lodash';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
import { dateTimeRender } from 'utils/renderer';

export default class TableList extends PureComponent {
  /**
   *跳转到维护页面
   *
   */
  @Bind()
  preBid(record) {
    const { onPreBid } = this.props;
    onPreBid(record);
  }

  /**
   *跳转到维护页面
   *
   */
  @Bind()
  inquiryUpdate(record) {
    const { onInquiryUpdate } = this.props;
    onInquiryUpdate(record);
  }

  /**
   * 渲染columns
   * @returns {*}
   */
  renderColumns() {
    const { navigateDetail } = this.props;

    const bidTaskColumns = [
      {
        title: intl.get('hzero.common.status').d('状态'),
        dataIndex: 'bidStatusMeaning',
        width: 100,
        fixed: 'left',
      },
      {
        title: intl.get(`ssrc.bidTask.model.bidTask.bidNum`).d('招标书编号'),
        dataIndex: 'bidNum',
        width: 150,
        fixed: 'left',
        render: (val, record) => <a onClick={() => navigateDetail(record)}>{val}</a>,
      },
      {
        title: intl.get(`ssrc.bidTask.model.bidTask.bidTitle`).d('招标事项'),
        dataIndex: 'bidTitle',
        width: 150,
        fixed: 'left',
        render: val => <Popover content={val}>{val}</Popover>,
      },
      {
        title: intl.get('ssrc.common.company').d('公司'),
        dataIndex: 'companyName',
        // width: 200,
        render: val => <Popover content={val}>{val}</Popover>,
      },
      {
        title: intl.get(`ssrc.bidTask.model.bidTask.applicationDeadline`).d('资格预审截止时间'),
        dataIndex: 'prequalEndDate',
        width: 150,
        render: dateTimeRender,
      },
      {
        title: intl.get(`ssrc.bidTask.model.bidTask.quotationStartTime`).d('投标开始时间'),
        dataIndex: 'quotationStartDate',
        width: 150,
        render: dateTimeRender,
      },
      {
        title: intl.get(`ssrc.bidTask.model.bidTask.QuotationDeadLine`).d('投标截止时间'),
        dataIndex: 'quotationEndDate',
        width: 150,
        render: dateTimeRender,
      },
      {
        title: intl.get(`ssrc.bidTask.model.bidTask.bidOpenDate`).d('开标时间'),
        dataIndex: 'bidOpenDate',
        width: 150,
        render: dateTimeRender,
      },
      {
        title: intl.get(`ssrc.bidTask.model.bidTask.tenderName`).d('招标员'),
        dataIndex: 'tenderName',
        width: 150,
        render: val => <Popover content={val}>{val}</Popover>,
      },
    ];

    return bidTaskColumns;
  }

  render() {
    const { loading, dataSource, pagination, onChange } = this.props;
    const scrollX = sum(this.renderColumns().map(n => (isNumber(n.width) ? n.width : 0)));

    return (
      <Table
        bordered
        rowKey="bidHeaderId"
        loading={loading}
        columns={this.renderColumns()}
        scroll={{ x: scrollX }}
        dataSource={dataSource}
        pagination={pagination}
        onChange={page => onChange(page)}
      />
    );
  }
}
