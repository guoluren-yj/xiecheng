/**
 * SupplierClassificationTable - 供应商分类
 * @date: 2018-9-6
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent, Fragment } from 'react';
import { Table } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import { createPagination } from 'utils/utils';
import { dateRender, enableRender } from 'utils/renderer';
import formatterCollections from 'utils/intl/formatterCollections';

// const promptCode = 'sslm.commonApplication';

/**
 * 申请单供应商分类表
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Object} form 表单
 * @return React.element
 */
@formatterCollections({ code: ['sslm.commonApplication'] })
export default class SupplierClassificationTable extends PureComponent {
  /**
   * 分页函数
   * @param {Number} [pagination.page = 0] - 数据页码
   * @param {Number} [pagination.size = 10] - 分页大小
   */
  @Bind()
  handleTableChange(pagination) {
    const {
      tableProps: { onTableChange },
    } = this.props;
    onTableChange(pagination);
  }

  render() {
    const {
      tableProps: { dataSource = {}, loading = false },
    } = this.props;
    const { content = [] } = dataSource;
    const columns = [
      {
        title: intl.get('sslm.commonApplication.model.coApp.categoryCode').d('分类编码'),
        width: 200,
        dataIndex: 'categoryCode',
      },
      {
        title: intl.get('sslm.commonApplication.model.coApp.categoryDescription').d('分类描述'),
        width: 200,
        dataIndex: 'categoryDescription',
      },
      {
        title: intl.get('sslm.commonApplication.model.coApp.evaluationLevel').d('分类评级'),
        width: 100,
        dataIndex: 'evaluationLevel',
      },
      {
        title: intl.get('sslm.commonApplication.model.coApp.evaluationScore').d('分类评分'),
        width: 100,
        dataIndex: 'evaluationScore',
      },
      {
        title: intl.get('hzero.common.status').d('状态'),
        width: 100,
        dataIndex: 'enabledFlag',
        render: enableRender,
      },
      {
        title: intl.get('sslm.commonApplication.model.coApp.alterReason').d('变更理由'),
        width: 200,
        dataIndex: 'alterReason',
      },
      {
        title: intl.get('sslm.commonApplication.model.coApp.alterDate').d('变更时间'),
        width: 120,
        dataIndex: 'alterDate',
        render: dateRender,
      },
      {
        title: intl.get('sslm.commonApplication.model.coApp.alterUserName').d('变更人'),
        width: 100,
        dataIndex: 'alterUserId',
        render: (_, record) => record.realName || record.loginName,
      },
    ];
    return (
      <Fragment>
        <Table
          loading={loading}
          rowKey="categoryAssignId"
          bordered
          columns={columns}
          dataSource={content}
          pagination={createPagination(dataSource)}
          onChange={this.handleTableChange}
        />
      </Fragment>
    );
  }
}
