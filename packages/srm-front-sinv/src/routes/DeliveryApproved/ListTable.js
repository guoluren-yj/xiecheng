/*
 * Listable - 送货单审批列表
 * @date: 2018-12-05 10:20:58
 * @author: FQL <qilin.feng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent } from 'react';
import { sum, isNumber, isFunction } from 'lodash';
import { Table } from 'hzero-ui';
import { Tooltip } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import { dateTimeRender, dateRender } from 'utils/renderer';

// const modelPrompt = 'sinv.deliveryApproved.model.deliveryApproved';
/**
 * Listable - 送货单审批列表
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
    const { openOperationRecord } = this.props;
    if (openOperationRecord) {
      openOperationRecord(true, asnHeaderId);
    }
  }

  /**
   * 导入
   * @param {Number} { asnHeaderId }
   */
  @Bind()
  handleExectRecord(record) {
    if (isFunction(this.props.handleExectRecord)) {
      this.props.handleExectRecord(record);
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
        title: intl.get(`sinv.common.model.common.purchaseAgentName`).d('采购员'),
        dataIndex: 'purchaseAgentName',
        width: 90,
      },
      {
        title: intl
          .get(`sinv.purchaserDelivery.model.purchaserDelivery.submitStatus`)
          .d('导入状态'),
        dataIndex: 'submitSyncStatusMeaning',
        width: 150,
        render: (value, record) => {
          return record.submitSyncStatus === 'FAIL' ? (
            <span style={{ color: 'red' }}>{record.submitSyncStatusMeaning}</span>
          ) : (
            <span>{record.submitSyncStatusMeaning}</span>
          );
        },
      },
      {
        title: intl.get(`sinv.deliveryClosed.model.closeSyncResponseMsg`).d('反馈信息'),
        dataIndex: 'submitSyncResponseMsg',
        width: 150,
        render: (value, record) => (
          <Tooltip title={value}>
            <span>{record.submitSyncResponseMsg}</span>
          </Tooltip>
        ),
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
    ];
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
