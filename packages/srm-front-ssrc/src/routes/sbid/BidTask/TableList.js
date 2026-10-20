/**
 * models - 报价作业列表数据
 * @date: 2019-05-27
 * @version: 1.0.0
 * @author: zoukang <kang.zou@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent } from 'react';
import { Table, Popover } from 'hzero-ui';
import querystring from 'querystring';
import { routerRedux } from 'dva/router';
import { isNumber, sum } from 'lodash';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
import { yesOrNoRender, valueMapMeaning, dateTimeRender } from 'utils/renderer';

/**
 * 数据列表
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Function} onChange - 分页查询
 * @reactProps {Boolean} loading - 数据加载完成标记
 * @reactProps {Array} dataSource - Table数据源
 * @reactProps {Object} pagination - 分页器
 * @reactProps {Number} pagination.current - 当前页码
 * @reactProps {Number} pagination.pageSize - 分页大小
 * @reactProps {Number} pagination.total - 数据总量
 * @return React.element
 */
export default class TableList extends PureComponent {
  /**
   * 编辑
   * @param {object} record - 数据对象
   */
  editOption(record) {
    this.props.onEdit(record);
  }

  /**
   * 删除
   * @param {object} record - 数据对象
   */
  deleteOption(record) {
    this.props.onDelete(record);
  }

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
   *跳转到明细页面
   *
   */
  @Bind()
  navigateDetail(record) {
    const { dispatch, backPath } = this.props;
    const search = querystring.stringify({
      bidTask: 'bidTask', // 判断招标书明细是否由招标作业跳转进入
    });
    dispatch(
      routerRedux.push({
        pathname: `/ssrc/bid-task/bid-detail/${record.bidHeaderId}`,
        search,
      })
    );
    backPath();
  }

  /**
   * 渲染操作
   */
  @Bind()
  actionRender(record) {
    const mean = (
      <a onClick={() => this.inquiryUpdate(record)}>
        {intl.get(`ssrc.bidTask.view.message.button.operation`).d('作业')}
      </a>
    );
    return mean;
  }

  /**
   * 渲染columns
   * @returns {*}
   */
  renderColumns() {
    const { bidStatus = [], operationRender } = this.props;

    const bidTaskColumns = [
      {
        title: intl.get('hzero.common.status').d('状态'),
        dataIndex: 'bidStatus',
        width: 100,
        fixed: 'left',
        render: val => valueMapMeaning(bidStatus, val),
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        dataIndex: 'operator',
        width: 80,
        fixed: 'left',
        render: (val, record) => this.actionRender(record),
      },
      {
        title: intl.get(`ssrc.bidTask.model.bidTask.bidNum`).d('招标书编号'),
        dataIndex: 'bidNum',
        width: 150,
        fixed: 'left',
        render: (val, record) => <a onClick={() => this.navigateDetail(record)}>{val}</a>,
      },
      {
        title: intl.get(`ssrc.bidTask.model.bidTask.bidTitle`).d('招标事项'),
        dataIndex: 'bidTitle',
        width: 120,
        fixed: 'left',
        render: val => <Popover content={val}>{val}</Popover>,
      },
      {
        title: intl.get('ssrc.common.company').d('公司'),
        dataIndex: 'companyName',
        width: 200,
        render: val => <Popover content={val}>{val}</Popover>,
      },
      {
        title: intl.get(`ssrc.bidTask.model.bidTask.createdUnitName`).d('创建人部门'),
        dataIndex: 'createdUnitName',
        width: 120,
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
        title: intl.get(`ssrc.bidTask.model.bidTask.preQualification`).d('资格预审'),
        dataIndex: 'preQualificationFlag',
        width: 100,
        render: yesOrNoRender,
      },
      {
        title: intl.get(`ssrc.bidTask.model.bidTask.round`).d('轮次'),
        dataIndex: 'roundNumber',
        width: 80,
        render: val => <Popover content={val}>{val}</Popover>,
      },
      {
        title: intl.get(`ssrc.bidTask.model.bidTask.version`).d('版本'),
        dataIndex: 'versionNumber',
        width: 80,
      },
      {
        title: intl.get(`ssrc.bidTask.model.bidTask.bidType`).d('招标类别'),
        dataIndex: 'bidTypeMeaning',
        width: 120,
        render: val => <Popover content={val}>{val}</Popover>,
      },
      {
        title: intl.get(`ssrc.bidTask.model.bidTask.sourcingApproach`).d('寻源方式'),
        dataIndex: 'sourceMethodMeaning',
        width: 120,
        render: val => <Popover content={val}>{val}</Popover>,
      },
      {
        title: intl.get(`ssrc.bidTask.model.bidTask.creationDate`).d('创建时间'),
        dataIndex: 'creationDate',
        width: 150,
        render: dateTimeRender,
      },
      {
        title: intl.get(`ssrc.bidTask.model.bidTask.tenderName`).d('招标员'),
        dataIndex: 'tenderName',
        width: 150,
        render: val => <Popover content={val}>{val}</Popover>,
      },
      {
        title: intl.get(`ssrc.bidTask.view.message.button.operationRender`).d('操作记录'),
        dataIndex: 'operationRecord',
        width: 100,
        render: (val, record) => (
          <a onClick={() => operationRender(record)}>
            {intl.get(`ssrc.bidTask.view.message.button.operationRender`).d('操作记录')}
          </a>
        ),
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
