/*
 * ListTable - 我收到的计划单
 * @date: 2019/12/11 15:04:50
 * @author: LC <chao.li03@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent, Fragment } from 'react';
import { Table, Form } from 'hzero-ui';
import { isNumber, sum } from 'lodash';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import { dateRender } from 'utils/renderer';

/**
 * 计划单维护列表
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Function} showEditModal 显示编辑模态框
 * @reactProps {Object} form 表单
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
export default class ListTable extends PureComponent {
  /**
   * 跳转详情
   */
  @Bind()
  onJumpDetail(record) {
    const { onJumpDetail } = this.props;
    onJumpDetail(record);
  }

  /**
   * 操作记录
   */
  @Bind()
  handleOperating(record) {
    const { handleOperating } = this.props;
    handleOperating(true, record);
  }

  render() {
    const { loading, dataSource = [], onSearch, pagination = {}, rowSelection } = this.props;

    const columns = [
      {
        title: intl.get(`sodr.common.model.common.orderSeq`).d('序号'),
        dataIndex: 'serialNum',
        width: 60,
      },
      {
        title: intl.get(`hzero.common.status`).d('状态'),
        dataIndex: 'planStatusMeaning',
        width: 100,
      },
      {
        title: intl.get(`sodr.common.model.common.planNum`).d('计划单号'),
        dataIndex: 'planNum',
        width: 180,
        render: (val, record) => <a onClick={() => this.onJumpDetail(record)}>{val}</a>,
      },
      {
        title: intl.get(`entity.supplier.tag`).d('供应商'),
        dataIndex: 'supplierCompanyName',
        width: 150,
      },
      {
        title: intl.get(`sodr.common.model.common.planningCycle`).d('计划周期'),
        dataIndex: 'planningCycleMeaning',
        width: 90,
      },
      {
        title: intl.get(`sodr.common.model.common.plannedStartDate`).d('计划起始日'),
        dataIndex: 'planStartDate',
        width: 180,
        render: dateRender,
      },
      {
        title: intl.get(`entity.item.companyId`).d('公司'),
        dataIndex: 'companyName',
        width: 160,
      },
      {
        title: intl.get(`entity.organization.class.inventory`).d('库存组织'),
        dataIndex: 'invOrganizationName',
        width: 160,
      },
      {
        title: intl.get(`sodr.common.model.common.agentId`).d('采购员'),
        dataIndex: 'agentName',
        width: 100,
      },
      {
        title: intl.get(`hzero.common.date.creationDate`).d('创建日期'),
        dataIndex: 'creationDate',
        width: 150,
        render: dateRender,
      },
      {
        title: intl.get(`hzero.common.button.operating`).d('操作记录'),
        dataIndex: 'operating',
        width: 130,
        render: (__, record) => (
          <a onClick={() => this.handleOperating(record)}>
            {intl.get(`hzero.common.button.operating`).d('操作记录')}
          </a>
        ),
      },
    ];
    const scrollX = sum(columns.map(n => (isNumber(n.width) ? n.width : 0)));
    return (
      <Fragment>
        <Table
          loading={loading}
          rowSelection={rowSelection}
          rowKey="planHeaderId"
          bordered
          scroll={{ x: scrollX }}
          columns={columns}
          dataSource={dataSource}
          pagination={pagination}
          onChange={page => onSearch(page)}
        />
      </Fragment>
    );
  }
}
