/**
 * 澄清通知入口页面表格
 * @date: 2019-08-14
 * @author: zhangyongxuan <yongxuan.zhang@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent } from 'react';
import { Table, Popover } from 'hzero-ui';
import { isNumber, sum } from 'lodash';
import { Bind } from 'lodash-decorators';
import querystring from 'querystring';

import intl from 'utils/intl';
import { getActiveTabKey } from 'utils/menuTab';
import { dateTimeRender } from 'utils/renderer';

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
  constructor(props) {
    super(props);
    this.activeTabKey = getActiveTabKey();
  }

  /**
   * 跳转到澄清单详情
   * @param {*} record
   */
  @Bind()
  jumpToDetail(record) {
    const {
      history,
      pathname,
      search,
      quotationHeaderId,
      sourceHeaderId,
      sourceFrom,
      activeKey,
    } = this.props;
    const { clarifyNotifyId, clarifyNotifyType, supplierCompanyId, supplierTenantId } = record;

    if (clarifyNotifyType === 'PRICE') {
      const searchString = querystring.stringify({
        activeKey,
        clarifyNotifyId,
        quotationHeaderId,
        sourceFrom,
        supplierCompanyId,
        supplierTenantId,
        backPath: `${pathname}${search}`,
      });

      history.push({
        pathname: `${this.activeTabKey}/price-clarification-replay-detail`,
        search: searchString,
      });
      return;
    }

    const searchString = querystring.stringify({
      activeKey,
      sourceHeaderId,
      quotationHeaderId,
      clarifyNotifyId,
      sourceFrom,
      backPath: `${pathname}${search}`,
    });
    history.push({
      pathname: `${this.activeTabKey}/review-clarification-detail`,
      search: searchString,
    });
  }

  /**
   * 跳转到澄清单回复详情
   * @param {*} record
   */
  @Bind()
  jumpToReplayDetail(record) {
    const { history, pathname, search, sourceFrom, activeKey } = this.props;
    const { clarifyNotifyId, sourceHeaderId, quotationHeaderId } = record;
    const searchString = querystring.stringify({
      activeKey,
      quotationHeaderId,
      sourceHeaderId,
      clarifyNotifyId,
      sourceFrom,
      backPath: `${pathname}${search}`,
    });
    history.push({
      pathname: `${this.activeTabKey}/review-clarification-replay-detail`,
      search: searchString,
    });
  }

  /**
   * 跳转到澄清单回复
   * @param {*} record
   */
  @Bind()
  jumpToReplay(record) {
    const { history, pathname, search, sourceFrom, activeKey } = this.props;
    const {
      clarifyNotifyId,
      quotationHeaderId,
      sourceHeaderId,
      supplierTenantId,
      supplierCompanyId,
    } = record;
    const searchString = querystring.stringify({
      activeKey,
      clarifyNotifyId,
      quotationHeaderId,
      sourceFrom,
      supplierTenantId,
      supplierCompanyId,
      sourceHeaderId,
      bidHeaderId: sourceHeaderId,
      backPath: `${pathname}${search}`,
    });
    history.push({
      pathname: `${this.activeTabKey}/review-clarification-pending-reply`,
      search: searchString,
    });
  }

  // 价格澄清维护
  @Bind()
  directionPriceReplyUpdate(record) {
    const { history, pathname, search, sourceFrom, activeKey } = this.props;
    const {
      clarifyNotifyId,
      quotationHeaderId,
      sourceHeaderId,
      supplierTenantId,
      supplierCompanyId,
    } = record;
    const searchString = querystring.stringify({
      clarifyNotifyId,
      quotationHeaderId,
      sourceFrom,
      sourceHeaderId,
      supplierCompanyId,
      supplierTenantId,
      activeKey,
      backPath: `${pathname}${search}`,
    });

    history.push({
      pathname: `${this.activeTabKey}/price-clarification-replay-update`,
      search: searchString,
    });
  }

  // 价格澄清明细
  @Bind()
  directionPriceReplyDetail(record) {
    const { history, pathname, search, sourceFrom, activeKey } = this.props;
    const {
      clarifyNotifyId,
      quotationHeaderId,
      sourceHeaderId,
      supplierCompanyId,
      supplierTenantId,
    } = record;
    const searchString = querystring.stringify({
      clarifyNotifyId,
      supplierCompanyId,
      supplierTenantId,
      quotationHeaderId,
      sourceFrom,
      sourceHeaderId,
      activeKey,
      backPath: `${pathname}${search}`,
    });

    history.push({
      pathname: `${this.activeTabKey}/price-clarification-replay-detail`,
      search: searchString,
    });
  }

  // render operation column -
  // '澄清单状态 (NEW/新建| PENDING/待回复 | ANSWERED/已回复 | DEADLINE/已超时),
  renderOperations(_, record = {}) {
    const { clarifyNotifyType = null, replyStatus = null } = record || {};
    if (clarifyNotifyType !== 'PRICE') {
      let item = null;
      switch (replyStatus) {
        case 'NEW':
          item = (
            <a onClick={() => this.jumpToReplay(record)}>
              {intl.get('hzero.common.button.create').d('新建')}
            </a>
          );
          break;
        case 'PENDING':
          item = (
            <a onClick={() => this.jumpToReplay(record)}>
              {intl.get(`ssrc.supplierQuotation.model.supQuo.waitReply`).d('待回复')}
            </a>
          );
          break;
        case 'ANSWERED':
          item = (
            <a onClick={() => this.jumpToReplayDetail(record)}>
              {intl.get(`ssrc.supplierQuotation.model.supQuo.alreadyReply`).d('已回复')}
            </a>
          );
          break;
        case 'DEADLINE':
          item = (
            <a onClick={() => this.jumpToReplayDetail(record)}>
              {intl.get(`ssrc.supplierQuotation.model.supQuo.alTimeOut`).d('已超时')}
            </a>
          );
          break;

        default:
          item = '';
          break;
      }
      return item;
    }

    let operation = null;
    if (replyStatus === 'PENDING') {
      operation = (
        <a onClick={() => this.directionPriceReplyUpdate(record)}>
          {intl.get(`ssrc.supplierQuotation.model.supQuo.replyPriceNotification`).d('回复')}
        </a>
      );
    }
    if (replyStatus === 'ANSWERED') {
      operation = (
        <a onClick={() => this.directionPriceReplyDetail(record)}>
          {intl.get(`ssrc.supplierQuotation.model.supQuo.viewRPNotification`).d('查看回复详情')}
        </a>
      );
    }

    return operation;
  }

  /**
   * 渲染columns
   * @returns {*}
   */
  renderColumns() {
    // const { bidStatus = [] } = this.props;

    const columns = [
      {
        title: intl.get(`ssrc.supplierQuotation.model.supQuo.claNotNum`).d('澄清通知编号'),
        dataIndex: 'clarifyNotifyNum',
        render: (val, record) => {
          return <a onClick={() => this.jumpToDetail(record)}>{val}</a>;
        },
      },
      {
        title: intl.get(`ssrc.supplierQuotation.model.supQuo.title`).d('标题'),
        dataIndex: 'clarifyNotifyTitle',
        width: 100,
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
        title: intl.get(`ssrc.supplierQuotation.model.supQuo.clarificationType`).d('澄清类型'),
        dataIndex: 'clarifyNotifyTypeMeaning',
        width: 120,
      },
      {
        title: intl.get(`ssrc.supplierQuotation.model.supQuo.replyStatus`).d('回复状态'),
        dataIndex: 'replyStatusMeaning',
        width: 120,
      },
      {
        title: intl.get('ssrc.common.company').d('公司'),
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
        title: intl.get(`ssrc.common.supplier`).d('供应商'),
        dataIndex: 'supplierCompanyName',
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
        title: intl.get(`ssrc.supplierQuotation.model.supQuo.questionSubmitDate`).d('提交时间'),
        dataIndex: 'submittedDate',
        width: 150,
        render: dateTimeRender,
      },
      {
        title: intl.get(`ssrc.supplierQuotation.model.supQuo.replyDeadline`).d('回复截止时间'),
        dataIndex: 'replyEndDate',
        width: 150,
        render: dateTimeRender,
      },
      {
        title: intl.get('hzero.common.action').d('操作'),
        dataIndex: 'operations',
        width: 120,
        render: (_, record) => this.renderOperations(_, record),
      },
    ];
    return columns;
  }

  render() {
    const { isLoading, dataSource, pagination, onChange } = this.props;
    const scrollX = sum(this.renderColumns().map((n) => (isNumber(n.width) ? n.width : 0)));

    return (
      <Table
        bordered
        rowKey="clarifyNotifyId"
        loading={isLoading}
        columns={this.renderColumns()}
        scroll={{ x: scrollX }}
        dataSource={dataSource}
        pagination={pagination}
        onChange={(page) => onChange(page)}
      />
    );
  }
}
