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
  /**
   * 跳转到澄清单详情
   * @param {*} record
   */
  @Bind()
  jumpToDetail(record) {
    const { history, pathname, search, quotationHeaderId, sourceHeaderId, sourceFrom } = this.props;
    const { clarifyNotifyId, replyStatus } = record;
    const searchString = querystring.stringify({
      quotationHeaderId,
      sourceHeaderId,
      clarifyNotifyId,
      sourceFrom,
      backPath: `${pathname}${search}`,
    });
    const routerPrefix = pathname.split('/')[2];
    const pathRouterDetail =
      routerPrefix === 'expert-scoring'
        ? '/ssrc/expert-scoring/bid-review-clarification-detail'
        : '/ssrc/bid-hall/review-clarification-detail';
    const pathRouterCreate =
      routerPrefix === 'expert-scoring'
        ? '/ssrc/expert-scoring/bid-review-clarification-create'
        : '/ssrc/bid-hall/review-create';
    if (replyStatus !== 'NEW') {
      history.push({
        pathname: pathRouterDetail,
        search: searchString,
      });
    } else {
      history.push({
        pathname: pathRouterCreate,
        search: searchString,
      });
    }
  }

  /**
   * 跳转到澄清单回复详情
   * @param {*} record
   */
  @Bind()
  jumpToReplayDetail(record) {
    const { history, pathname, search, quotationHeaderId, sourceHeaderId, sourceFrom } = this.props;
    const { clarifyNotifyId } = record;
    const searchString = querystring.stringify({
      quotationHeaderId,
      sourceHeaderId,
      sourceFrom,
      clarifyNotifyId,
      backPath: `${pathname}${search}`,
    });
    const routerPrefix = pathname.split('/')[2];
    const pathRouterName =
      routerPrefix === 'expert-scoring'
        ? '/ssrc/expert-scoring/bid-review-clarification-replay-detail'
        : '/ssrc/bid-hall/review-clarification-replay-detail';
    history.push({
      pathname: pathRouterName,
      search: searchString,
    });
  }

  /**
   * 跳转到澄清单回复
   * @param {*} record
   */
  @Bind()
  jumpToReplay(record) {
    const { history, pathname, search, sourceFrom } = this.props;
    const { clarifyNotifyId, quotationHeaderId, sourceHeaderId } = record;
    const searchString = querystring.stringify({
      sourceFrom,
      clarifyNotifyId,
      quotationHeaderId,
      sourceHeaderId,
      backPath: `${pathname}${search}`,
    });
    const routerPrefix = pathname.split('/')[2];
    const pathRouterName =
      routerPrefix === 'expert-scoring'
        ? '/ssrc/expert-scoring/clarification-replay'
        : '/ssrc/bid-hall/clarification-replay';
    history.push({
      pathname: pathRouterName,
      search: searchString,
    });
  }

  /**
   * 渲染columns
   * @returns {*}
   */
  renderColumns() {
    // const { bidStatus = [] } = this.props;

    const columns = [
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.clarifyNoticeNum`).d('澄清通知编号'),
        dataIndex: 'clarifyNotifyNum',
        render: (val, record) => {
          // /ssrc/expert-scoring/review-clarification-detail
          return <a onClick={() => this.jumpToDetail(record)}>{val}</a>;
        },
      },
      {
        title: intl.get('hzero.common.button.title').d('标题'),
        dataIndex: 'clarifyNotifyTitle',
        width: 100,
        render: value =>
          value ? (
            <Popover placement="topLeft" content={value}>
              {value}
            </Popover>
          ) : (
            ''
          ),
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.replyStatus`).d('回复状态'),
        dataIndex: 'replyStatus',
        width: 150,
        // '澄清单状态 (NEW/新建| PENDING/待回复 | ANSWERED/已回复 | DEADLINE/已超时),
        render: (val, record) => {
          let item;
          switch (val) {
            case 'NEW':
              item = intl.get(`ssrc.bidHall.model.bidHall.newCreate`).d('新建');
              break;
            case 'PENDING':
              item = intl.get(`ssrc.bidHall.model.bidHall.waittingReplay`).d('待回复');
              break;
            case 'ANSWERED':
              item = (
                <a onClick={() => this.jumpToReplayDetail(record)}>
                  {intl.get(`ssrc.bidHall.model.bidHall.alreadyReplay`).d('已回复')}
                </a>
              );
              break;
            case 'DEADLINE':
              item = intl.get(`ssrc.bidHall.model.bidHall.timeOut`).d('已超时');
              break;

            default:
              item = '';
              break;
          }
          return item;
        },
      },
      {
        title: intl.get('ssrc.common.company').d('公司'),
        dataIndex: 'companyName',
        width: 120,
        render: value =>
          value ? (
            <Popover placement="topLeft" content={value}>
              {value}
            </Popover>
          ) : (
            ''
          ),
      },
      {
        title: intl.get('ssrc.common.supplier').d('供应商'),
        dataIndex: 'supplierCompanyName',
        width: 150,
        render: value =>
          value ? (
            <Popover placement="topLeft" content={value}>
              {value}
            </Popover>
          ) : (
            ''
          ),
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.submittedDate`).d('提交时间'),
        dataIndex: 'submittedDate',
        width: 150,
        render: dateTimeRender,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.replyEndDate`).d('回复截止时间'),
        dataIndex: 'replyEndDate',
        width: 150,
        render: dateTimeRender,
      },
    ];
    return columns;
  }

  render() {
    const { isLoading, dataSource, pagination, onChange } = this.props;
    const scrollX = sum(this.renderColumns().map(n => (isNumber(n.width) ? n.width : 0)));

    return (
      <Table
        bordered
        rowKey="clarifyNotifyId"
        loading={isLoading}
        columns={this.renderColumns()}
        scroll={{ x: scrollX }}
        dataSource={dataSource}
        pagination={pagination}
        onChange={page => onChange(page)}
      />
    );
  }
}
