/*
 * List - 送货单关闭列表
 * @date: 2018-12-06 14:25:03
 * @author: FQL <qilin.feng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent, Fragment } from 'react';
import { Table } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { sum, isNumber } from 'lodash';

import intl from 'utils/intl';
import { dateTimeRender, dateRender } from 'utils/renderer';

/**
 * List - 送货关闭列表
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
export default class List extends PureComponent {
  @Bind()
  handleToDetail(asnHeaderId) {
    const { onHandleToDetail } = this.props;
    if (onHandleToDetail) {
      onHandleToDetail(asnHeaderId);
    }
  }

  @Bind()
  handleOperationRecord(asnHeaderId) {
    const { openOperationRecord } = this.props;
    if (openOperationRecord) {
      openOperationRecord(true, asnHeaderId);
    }
  }

  render() {
    const { dataSource, loading, rowSelection, pagination, onSearch, customizeTable } = this.props;
    const columns = [
      {
        title: intl
          .get(`sinv.deliveryClosed.model.deliveryClosed.closeSyncStatus`)
          .d('关闭导入状态'),
        dataIndex: 'closeSyncStatusMeaning',
        width: 120,
      },
      {
        title: intl.get(`sinv.deliveryClosed.model.closeSyncResponseMsg`).d('反馈信息'),
        dataIndex: 'closeSyncResponseMsg',
        width: 200,
      },
      {
        title: intl.get(`sinv.common.model.common.asnNum`).d('送货单号'),
        dataIndex: 'asnNum',
        width: 150,
        render: (val, record) => (
          <a onClick={() => this.handleToDetail(record.asnHeaderId)}>{val}</a>
        ),
      },
      {
        title: intl.get(`sinv.common.model.common.asnTypeCode`).d('送货单类型'),
        dataIndex: 'asnTypeCodeMeaning',
        width: 120,
      },
      {
        title: intl.get(`entity.company.tag`).d('公司'),
        dataIndex: 'companyName',
        width: 120,
      },
      {
        title: intl.get(`entity.supplier.tag`).d('供应商'),
        dataIndex: 'supplierCompanyName',
        width: 120,
      },
      {
        title: intl.get(`sinv.common.model.common.creationDate`).d('创建日期'),
        dataIndex: 'creationDate',
        width: 150,
        render: dateRender,
      },
      {
        title: intl.get(`sinv.common.model.common.shipDate`).d('发货日期'),
        dataIndex: 'shipDate',
        width: 150,
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
        width: 120,
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
        width: 120,
      },
      {
        title: intl.get(`sinv.common.model.common.operationRecord`).d('操作记录'),
        width: 100,
        dataIndex: 'operationRecord',
        render: (val, record) => {
          return (
            <a onClick={() => this.handleOperationRecord(record.asnHeaderId)}>
              {intl.get(`sinv.common.model.common.operationRecord`).d('操作记录')}
            </a>
          );
        },
      },
    ].map((item) => ({
      ...item,
      title: <div style={{ textAlign: (item.align && item.align) || 'left' }}>{item.title}</div>,
    }));
    const scrollX = sum(columns.map((n) => (isNumber(n.width) ? n.width : 0)));
    const scrollY = 'calc(100vh - 400px)';
    return (
      <Fragment>
        {customizeTable(
          {
            code: 'SODR.DELIVERY_CLOSED.LIST',
          },
          <Table
            bordered
            rowKey="asnHeaderId"
            columns={columns}
            loading={loading}
            rowSelection={rowSelection}
            dataSource={dataSource}
            pagination={pagination}
            onChange={onSearch}
            scroll={{
              x: scrollX,
              y: scrollY,
            }}
          />
        )}
      </Fragment>
    );
  }
}
