/*
 * Listable - 送货单审批列表
 * @date: 2018-12-05 10:20:58
 * @author: FQL <qilin.feng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent } from 'react';
import { Table } from 'hzero-ui';
import { sum, isNumber } from 'lodash';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import { dateTimeRender, dateRender } from 'utils/renderer';

// const modelPrompt = 'sinv.deliveryReview.model.deliveryReview';
/**
 * Listable - 送货单复审列表
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Function} onSearch - 分页查询
 * @reactProps {Boolean} loading - 数据加载完成标记
 * @reactProps {Array} dataSource - Table数据源
 * @reactProps {object} pagination - 分页器
 * @reactProps {Number} pagination.current - 当前页码
 * @reactProps {Number} pagination.pageSize - 分页大小
 * @reactProps {Number} pagination.total - 数据总量
 * @return React.element
 */
export default class ListTable extends PureComponent {
  @Bind()
  handleOperationRecord(asnHeaderId) {
    if (this.props.openOperationRecord) {
      this.props.openOperationRecord(true, asnHeaderId);
    }
  }

  @Bind()
  handleToDetail(asnHeaderId) {
    if (this.props.linkToDetail) {
      this.props.linkToDetail(asnHeaderId);
    }
  }

  render() {
    const {
      customizeTable,
      rowSelection,
      fetchListLoading,
      dataSource,
      pagination,
      handleToDetail,
      onSearch,
    } = this.props;
    const columns = [
      {
        title: intl.get(`sinv.common.model.common.asnNum`).d('送货单号'),
        dataIndex: 'asnNum',
        width: 150,
        render: (value, record) => (
          <a onClick={() => handleToDetail(record.asnHeaderId)}>{value}</a>
        ),
      },
      {
        title: intl.get(`sinv.common.model.common.asnTypeCode`).d('送货单类型'),
        dataIndex: 'asnTypeCodeMeaning',
        width: 150,
      },
      {
        title: intl.get(`sinv.common.model.common.asnStatus`).d('送货单状态'),
        dataIndex: 'asnStatusMeaning',
        width: 120,
      },
      {
        title: intl.get(`sinv.common.model.common.cancelStatus`).d('取消状态'),
        dataIndex: 'cancelStatusMeaning',
        width: 120,
      },
      {
        title: intl.get(`entity.supplier.tag`).d('供应商'),
        dataIndex: 'supplierCompanyName',
        width: 150,
      },
      {
        title: intl.get(`entity.company.tag`).d('公司'),
        dataIndex: 'companyName',
        width: 150,
      },
      {
        title: intl.get(`sinv.common.model.common.creationDate`).d('创建日期'),
        dataIndex: 'creationDate',
        width: 120,
        render: dateRender,
      },
      {
        title: intl.get(`sinv.common.model.common.shipDate`).d('发货日期'),
        dataIndex: 'shipDate',
        width: 120,
        render: dateRender,
      },
      {
        title: intl.get(`sinv.common.model.common.expectedArriveTime`).d('预计到货时间'),
        dataIndex: 'expectedArriveDate',
        width: 150,
        render: dateTimeRender,
      },
      {
        title: intl.get(`sinv.purchaseReception.view.message.invOrganization`).d('收货组织'),
        dataIndex: 'organizationName',
        width: 150,
      },
      {
        title: intl.get(`sinv.common.model.common.shipToLocationAddress`).d('收货地点'),
        dataIndex: 'shipToLocationAddress',
        width: 150,
      },
      {
        title: intl.get(`sinv.common.model.common.actualReceiverName`).d('送达方'),
        dataIndex: 'actualReceiverName',
        width: 150,
      },
      {
        title: intl.get(`sinv.common.model.common.agentName`).d('采购员'),
        dataIndex: 'purchaseAgentName',
        width: 90,
      },
      {
        title: intl.get(`sinv.common.model.common.operationRecord`).d('操作记录'),
        width: 120,
        dataIndex: 'operationRecord',
        render: (value, record) => (
          <div>
            <a onClick={() => this.handleOperationRecord(record.asnHeaderId)}>
              {intl.get(`sinv.common.model.common.operationRecord`).d('操作记录')}
            </a>
          </div>
        ),
      },
    ].map((item) => ({
      ...item,
      title: <div style={{ textAlign: (item.align && item.align) || 'left' }}>{item.title}</div>,
    }));
    const scrollX = sum(columns.map((n) => (isNumber(n.width) ? n.width : 0)));
    const scrollY = 'calc(100vh - 400px)';

    return customizeTable(
      {
        code: 'SINV.DELIVERY_APPROVED_LIST.GRID',
      },
      <Table
        bordered
        rowSelection={rowSelection}
        loading={fetchListLoading}
        rowKey="asnHeaderId"
        columns={columns}
        dataSource={dataSource}
        pagination={pagination}
        onChange={onSearch}
        scroll={{
          x: scrollX,
          y: scrollY,
        }}
      />
    );
  }
}
