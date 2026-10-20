/**
 * 澄清通知入口页面表格
 * @date: 2019-08-14
 * @author: zhangyongxuan <yongxuan.zhang@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */

import { Table, Popover, Badge } from 'hzero-ui';
import querystring from 'querystring';
import { isNumber, sum } from 'lodash';
import { Bind } from 'lodash-decorators';
import React, { PureComponent } from 'react';
import { getActiveTabKey } from 'utils/menuTab';

import intl from 'utils/intl';
import { dateTimeRender } from 'utils/renderer';

import Styles from './index.less';

const PROMPT_CODE = 'ssrc.expertScoring';
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
    const { history, pathname, search } = this.props;
    const { clarifyNotifyId } = record;
    const { sourceFrom = '', sourceHeaderId = 0, quotationHeaderId = 0 } = querystring.parse(
      search.substr(1)
    );
    const searchString = querystring.stringify({
      sourceFrom,
      quotationHeaderId,
      clarifyNotifyId,
      sourceHeaderId,
      backPath: `${pathname}${search}`,
    });
    history.push({
      pathname: `${getActiveTabKey()}/review-clarification-detail`,
      search: searchString,
    });
  }

  /**
   * 跳转到澄清单回复详情
   * @param {*} record
   */
  @Bind()
  jumpToReplayDetail(record) {
    const { history, pathname, search } = this.props;
    const { sourceFrom = '', sourceHeaderId = 0, quotationHeaderId = 0 } = querystring.parse(
      search.substr(1)
    );
    const { clarifyNotifyId } = record;
    const searchString = querystring.stringify({
      sourceFrom,
      quotationHeaderId,
      clarifyNotifyId,
      sourceHeaderId,
      backPath: `${pathname}${search}`,
    });
    history.push({
      pathname: `${getActiveTabKey()}/review-clarification-replay-detail`,
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
    // const { bidStatus = [] } = this.props;
    const { remote } = this.props;

    const columns = [
      {
        title: intl.get(`${PROMPT_CODE}.model.expertScoring.clarifyNotifyNum`).d('澄清通知编号'),
        dataIndex: 'clarifyNotifyNum',
        width: 130,
        render: (val, record) => {
          // /ssrc/expert-scoring/review-clarification-detail
          return <a onClick={() => this.jumpToDetail(record)}>{val}</a>;
        },
      },
      {
        title: intl.get(`${PROMPT_CODE}.model.expertScoring.clarifyNotifyTitle`).d('标题'),
        dataIndex: 'clarifyNotifyTitle',
        width: 100,
      },
      {
        title: intl.get(`${PROMPT_CODE}.model.expertScoring.replyStatus`).d('回复状态'),
        dataIndex: 'replyStatusMeaning',
        width: 100,
        render: this.replayStatusRenderer,
        // '澄清单状态 (NEW/新建| PENDING/待回复 | ANSWERED/已回复 | DEADLINE/已超时),
        // render: (val, record) => {
        //   let item;
        //   switch (val) {
        //     case 'NEW':
        //       item = intl.get(`${PROMPT_CODE}.model.expertScoring.create`).d(`新建`);
        //       break;
        //     case 'PENDING':
        //       item = intl.get(`${PROMPT_CODE}.model.expertScoring.waittingReply`).d(`待回复`);
        //       break;
        //     case 'ANSWERED':
        //       item = (
        //         <a onClick={() => this.jumpToReplayDetail(record)}>
        //           {intl.get(`${PROMPT_CODE}.model.expertScoring.alreaReplaied`).d(`已回复`)}
        //         </a>
        //       );
        //       break;
        //     case 'DEADLINE':
        //       item = intl.get(`${PROMPT_CODE}.model.expertScoring.timeOutted`).d(`已超时`);
        //       break;

        //     default:
        //       item = '';
        //       break;
        //   }
        //   return item;
        // },
      },
      {
        title: intl.get('ssrc.common.company').d('公司'),
        dataIndex: 'companyName',
        width: 150,
        render: (val) => <Popover content={val}>{val}</Popover>,
      },
      {
        title: intl.get(`${PROMPT_CODE}.model.expertScoring.supplierCompanyName`).d('供应商'),
        dataIndex: 'supplierCompanyName',
        width: 150,
        render: (val) => <Popover content={val}>{val}</Popover>,
      },
      {
        title: intl.get(`${PROMPT_CODE}.model.expertScoring.submittedDate`).d('提交时间'),
        dataIndex: 'submittedDate',
        width: 150,
        render: dateTimeRender,
      },
      {
        title: intl.get(`${PROMPT_CODE}.model.expertScoring.replyEndDate`).d('回复截止时间'),
        dataIndex: 'replyEndDate',
        width: 150,
        render: dateTimeRender,
      },
    ];
    // 埋点
    const remoteColumns = remote
      ? remote.process(
          'SSRC_EXPERT_REVIEW_CLARIFICATION_PROCESS_QUESTION_TABLE_COLUMNS',
          columns,
          {}
        )
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
