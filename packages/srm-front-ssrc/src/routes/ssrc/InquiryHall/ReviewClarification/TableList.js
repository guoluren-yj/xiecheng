/**
 * 澄清通知入口页面表格
 * @date: 2019-08-14
 * @author: zhangyongxuan <yongxuan.zhang@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent } from 'react';
import { Table, Popover, Badge } from 'hzero-ui';
import { isNumber, sum } from 'lodash';
import { Bind } from 'lodash-decorators';
import querystring from 'querystring';

import intl from 'utils/intl';
import { getActiveTabKey, openTab } from 'utils/menuTab';
import { dateTimeRender } from 'utils/renderer';

import Styles from './index.less';

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
    const {
      history,
      pathname,
      search,
      quotationHeaderId,
      sourceHeaderId,
      sourceFrom,
      clarifyNotifyType = '',
      issueFrom = '',
      isReadOnly = 'N',
    } = this.props;
    const { clarifyNotifyId, replyStatus } = record;
    const searchString = querystring.stringify({
      quotationHeaderId: record.quotationHeaderId || quotationHeaderId,
      clarifyNotifyType,
      sourceHeaderId,
      clarifyNotifyId,
      sourceFrom,
      issueFrom,
      backPath: `${pathname}${search}`,
    });
    const routerPrefix = pathname.split('/')[2];
    const activeTabMenu = getActiveTabKey();

    const pathRouterDetail =
      routerPrefix !== 'inquiry-hall'
        ? `${activeTabMenu}/${
            clarifyNotifyType === 'SOURCE' ? 'source' : 'rfx'
          }-review-clarification-detail`
        : `${activeTabMenu}/review-clarification-detail`;
    const pathRouterCreate =
      routerPrefix !== 'inquiry-hall'
        ? `${activeTabMenu}/${
            clarifyNotifyType === 'SOURCE' ? 'source' : 'rfx'
          }-review-clarification-create`
        : `${activeTabMenu}/${clarifyNotifyType ? 'rfx-' : ''}review-clarification-create`;

    if (isReadOnly === 'Y') {
      const basePath = `/ssrc/new-${
        activeTabMenu.indexOf('new-bid-hall') > -1 ? 'bid' : 'inquiry'
      }-hall`;
      openTab({
        key: `${basePath}/rfx-review-clarification-detail`,
        path: `${basePath}/rfx-review-clarification-detail`,
        // title: intl.get(`ssrc.inquiryHall.view.message.button.reviewClarify`).d('评审澄清'),
        title: 'srm.common.tab.title.ssrc.reviewClarify',
        closable: true,
        search: searchString,
      });
      return;
    }

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
    const {
      history,
      pathname,
      search,
      quotationHeaderId,
      sourceHeaderId,
      sourceFrom,
      isReadOnly = 'N',
    } = this.props;
    const { clarifyNotifyId, quotationHeaderId: headerId } = record;
    const searchString = querystring.stringify({
      quotationHeaderId: headerId || quotationHeaderId,
      sourceHeaderId,
      sourceFrom,
      clarifyNotifyId,
      backPath: `${pathname}${search}`,
    });
    const routerPrefix = pathname.split('/')[2];
    const activeTabMenu = getActiveTabKey();
    const pathRouterName =
      routerPrefix === 'expert-scoring'
        ? `${activeTabMenu}/rfx-review-clarification-replay-detail`
        : `${activeTabMenu}/review-replay-detail`;

    if (isReadOnly === 'Y') {
      const basePath = `/ssrc/new-${
        getActiveTabKey().indexOf('new-bid-hall') > -1 ? 'bid' : 'inquiry'
      }-hall`;
      openTab({
        key: `${basePath}/review-replay-detail`,
        path: `${basePath}/review-replay-detail`,
        // title: intl.get(`ssrc.inquiryHall.view.message.button.reviewClarify`).d('评审澄清'),
        title: 'srm.common.tab.title.ssrc.reviewClarify',
        closable: true,
        search: searchString,
      });
      return;
    }

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
    const activeTabMenu = getActiveTabKey();
    const pathRouterName = `${activeTabMenu}/clarification-replay`;
    history.push({
      pathname: pathRouterName,
      search: searchString,
    });
  }

  // 状态
  replayStatusRenderer = (value = null, record = {}) => {
    if (!value) {
      return null;
    }

    let textField = value;
    const { replyStatus = null } = record;

    if (replyStatus === 'ANSWERED') {
      textField = (
        <Badge count={record.unreadFlag && 1} className={Styles['badge-item']}>
          <a onClick={() => this.jumpToReplayDetail(record)}>{value}</a>
        </Badge>
      );
    }

    return <>{textField}</>;
  };

  /**
   * 渲染columns
   * @returns {*}
   */
  renderColumns() {
    const { remote } = this.props;
    // const { bidStatus = [] } = this.props;
    const columns = [
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.clarifyNotifyNum`).d('澄清通知编号'),
        dataIndex: 'clarifyNotifyNum',
        render: (val, record) => {
          // /ssrc/expert-scoring/review-clarification-detail
          return <a onClick={() => this.jumpToDetail(record)}>{val}</a>;
        },
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.clarifyNotifyTitle`).d('标题'),
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
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.replyStatus`).d('回复状态'),
        dataIndex: 'replyStatusMeaning',
        width: 150,
        render: this.replayStatusRenderer,
      },
      {
        title: intl.get('ssrc.common.company').d('公司'),
        dataIndex: 'companyName',
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
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierCompanyName`).d('供应商'),
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
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.submittedDate`).d('提交时间'),
        dataIndex: 'submittedDate',
        width: 150,
        render: dateTimeRender,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.replyEndDate`).d('回复截止时间'),
        dataIndex: 'replyEndDate',
        width: 150,
        render: dateTimeRender,
      },
    ];

    // 埋点
    const remoteColumns = remote
      ? remote.process('SSRC_REVIEW_CLARIFICATION_PROCESS_QUESTION_TABLE_COLUMNS', columns, {})
      : columns;

    return remoteColumns;
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
