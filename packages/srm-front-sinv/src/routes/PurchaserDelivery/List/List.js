/**
 * List - 采购方送货单列表
 * @date: 2018-12-07
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent } from 'react';
import { Table, Tooltip } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { sum, isNumber, isFunction } from 'lodash';
import intl from 'utils/intl';
import { dateRender, dateTimeRender } from 'utils/renderer';
// import leftPad = require('left-pad');

/**
 * 采购方送货单列表
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Function} handleOperationRecord 头操作记录
 * @return React.element
 */
export default class List extends PureComponent {
  /**
   * 头操作记录
   * @param {Number} { asnHeaderId }
   */
  @Bind()
  handleOperationRecord({ asnHeaderId }) {
    if (isFunction(this.props.onOperationRecord)) {
      this.props.onOperationRecord(asnHeaderId);
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

  /**
   * 跳转到详情页
   * @param {Number} { asnHeaderId }
   */
  @Bind()
  handleToDetail({ asnHeaderId }) {
    if (isFunction(this.props.onToDetail)) {
      this.props.onToDetail(asnHeaderId);
    }
  }

  render() {
    const {
      loading,
      dataSource = [],
      searchPaging,
      pagination = {},
      rowSelection,
      customizeTable,
    } = this.props;
    const columns = [
      {
        title: intl.get('hzero.common.status').d('状态'),
        dataIndex: 'asnStatusMeaning',
        fixed: 'left',
        width: 90,
      },
      {
        title: intl.get(`sinv.common.model.common.asnNum`).d('送货单号'),
        dataIndex: 'asnNum',
        fixed: 'left',
        width: 170,
        render: (value, record) => {
          const renderCount =
            record.unReadCount > 99 ? (
              <span style={{ marginLeft: 4, marginRight: 4, color: 'red' }}>(99+)</span>
            ) : (
              <span style={{ marginLeft: 4, marginRight: 4, color: 'red' }}>
                ({record.unReadCount})
              </span>
            );
          return (
            <div>
              <a onClick={() => this.handleToDetail(record)}>{value}</a>
              {record.unReadCount > 0 ? (
                <Tooltip
                  title={
                    intl.get(`sinv.common.model.common.unReadCount`).d(`未读消息:`) +
                    record.unReadCount
                  }
                >
                  {renderCount}
                </Tooltip>
              ) : null}
            </div>
          );
        },
      },
      {
        title: intl.get(`sinv.common.model.common.asnTypeCode`).d('送货单类型'),
        dataIndex: 'asnTypeCodeMeaning',
        width: 120,
      },
      {
        title: intl.get('entity.supplier.tag').d('供应商'),
        dataIndex: 'supplierCompanyName',
        width: 150,
      },
      {
        title: intl.get('entity.company.tag').d('公司'),
        dataIndex: 'companyName',
        width: 150,
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
        title: intl.get(`sinv.common.model.common.organizationName`).d('收货组织'),
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
        width: 100,
      },
      {
        title: intl.get(`sinv.common.model.common.createByName`).d('创建人'),
        dataIndex: 'createByName',
        width: 100,
      },
      {
        title: intl.get(`sinv.common.model.common.cancelStatus`).d('取消状态'),
        dataIndex: 'cancelStatusMeaning',
        width: 120,
      },
      {
        title: intl
          .get(`sinv.purchaserDelivery.model.purchaserDelivery.submitStatus`)
          .d('导入状态'),
        dataIndex: 'submitSyncStatusMeaning',
        width: 150,
        render: (value, record) => (
          <a onClick={() => this.handleExectRecord(record)}>
            {record.submitSyncStatus === 'FAIL' ? (
              <span style={{ color: 'red' }}>{record.submitSyncStatusMeaning}</span>
            ) : (
              <span>{record.submitSyncStatusMeaning}</span>
            )}
          </a>
        ),
      },
      {
        title: intl.get(`sinv.deliveryClosed.model.closeSyncResponseMsg`).d('反馈信息'),
        dataIndex: 'erpAsnNum',
        width: 150,
        render: (value, record) => (
          <Tooltip title={value}>
            <span>{record.erpAsnNum}</span>
          </Tooltip>
        ),
      },
      {
        title: intl.get('sinv.common.model.common.operationRecord').d('操作记录'),
        dataIndex: 'dataSourceCode',
        width: 100,
        render: (value, record) => (
          <a onClick={() => this.handleOperationRecord(record)}>
            {intl.get('sinv.common.model.common.operationRecord').d('操作记录')}
          </a>
        ),
      },
      {
        title: intl.get(`sinv.supplierDelivery.model.common.expressNum`).d('物流单号'),
        dataIndex: 'expressNum',
        width: 150,
      },
      // {
      //   title: intl.get(`sinv.common.model.common.trackAddress`).d('物流当前位置'),
      //   dataIndex: 'trackAddress',
      //   width: 150,
      // },
      // {
      //   title: intl.get(`sinv.common.model.common.estimateArriveTime`).d('物流预计送达时间'),
      //   dataIndex: 'estimateArriveTime',
      //   width: 150,
      // },
    ];
    const scrollX = sum(columns.map((n) => (isNumber(n.width) ? n.width : 0))) + 300;
    const scrollY = 'calc(100vh - 400px)';
    return customizeTable(
      {
        code: 'SINV.PURCHASER_DELIVERY_LIST.GRID',
      },
      <Table
        rowSelection={rowSelection}
        loading={loading}
        rowKey="asnHeaderId"
        bordered
        scroll={{
          x: scrollX,
          y: scrollY,
        }}
        columns={columns}
        dataSource={dataSource}
        pagination={pagination}
        onChange={searchPaging}
      />
    );
  }
}
