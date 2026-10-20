/**
 * SiteInvestigate - 供应商生命周期配置 - 现场考察
 * @date: 2018-9-6
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { withRouter } from 'react-router-dom';
import { Table } from 'hzero-ui';
import queryString from 'querystring';
import { openTab } from 'utils/menuTab';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import { dateTimeRender } from 'utils/renderer';
import formatterCollections from 'utils/intl/formatterCollections';

/**
 * 现场考察
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Object} form 表单
 * @return React.element
 */
@withRouter
@formatterCollections({
  code: ['sslm.commonApplication', 'sslm.common', 'sslm.siteInvestigateReport'],
})
export default class SiteInvestigateTable extends PureComponent {
  /**
   * 跳转详情页
   */
  @Bind()
  handleJumpDetail(record) {
    const { evalHeaderId, evalType } = record;
    openTab({
      key: '/sslm/include/site-investigate-report/result/detail',
      title: intl.get('sslm.siteInvestigateReport.view.filled.detailTitle').d('现场考察报告明细'),
      search: queryString.stringify({
        evalType,
        evalHeaderId,
        openTab: 1,
      }),
    });
  }

  /**
   * 列表查询
   */
  @Bind()
  handleQueryList(page = {}) {
    const { handleonChange = e => e } = this.props;
    handleonChange(page);
  }

  render() {
    const { dataSource = [], managePagination = {}, queryLoading } = this.props;
    const columns = [
      {
        title: intl.get('hzero.common.status').d('状态'),
        dataIndex: 'evalStatusMeaning',
        width: 100,
      },
      {
        title: intl.get('sslm.siteInvestigateReport.modal.mange.code').d('考察报告编码'),
        dataIndex: 'evalNum',
        width: 150,
        render: (value, record) => <a onClick={() => this.handleJumpDetail(record)}>{value}</a>,
      },
      {
        title: intl.get('sslm.siteInvestigateReport.modal.mange.describe').d('考察报告描述'),
        dataIndex: 'evalDescription',
        width: 200,
      },
      {
        title: intl.get('sslm.siteInvestigateReport.modal.mange.company').d('公司'),
        dataIndex: 'companyName',
        width: 200,
      },
      {
        title: intl.get('sslm.siteInvestigateReport.modal.mange.resultsFlagMeaning').d('考察结果'),
        dataIndex: 'resultsFlagMeaning',
        width: 100,
      },
      {
        title: intl.get('sslm.siteInvestigateReport.modal.mange.creationDate').d('创建时间'),
        dataIndex: 'creationDate',
        width: 160,
        render: dateTimeRender,
      },
      {
        title: intl.get('sslm.siteInvestigateReport.modal.mange.createdBy').d('创建人'),
        dataIndex: 'realName',
        width: 120,
      },
    ];

    return (
      <Table
        rowKey="evalHeaderId"
        bordered
        loading={queryLoading}
        columns={columns}
        dataSource={dataSource}
        rowSelection={null}
        pagination={managePagination}
        onChange={this.handleQueryList}
      />
    );
  }
}
