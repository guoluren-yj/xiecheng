/*
 * List - 送货单取消列表
 * @date: 2018-12-06 14:25:03
 * @author: FQL <qilin.feng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent, Fragment } from 'react';
import { Table, Tooltip } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { sum, isNumber } from 'lodash';

import intl from 'utils/intl';
import { dateTimeRender, dateRender } from 'utils/renderer';

const commonModelPrompt = 'sinv.common.model.common';

/**
 * List - 送货单取消列表
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
          .get(`sinv.deliveryCanceled.model.deliveryCanceled.cancelStatus`)
          .d('取消导入状态'),
        dataIndex: 'cancelSyncStatusMeaning',
        align: 'left',
        width: 120,
      },
      {
        title: intl.get(`sinv.deliveryClosed.model.closeSyncResponseMsg`).d('反馈信息'),
        dataIndex: 'cancelSyncResponseMsg',
        align: 'left',
        width: 200,
      },
      {
        title: intl.get(`sinv.common.model.common.cancelStatus`).d('取消状态'),
        dataIndex: 'cancelStatusMeaning',
        width: 120,
      },
      {
        title: intl.get(`sinv.common.model.common.asnNum`).d('送货单号'),
        dataIndex: 'asnNum',
        align: 'left',
        width: 150,
        render: (val, record) => (
          <a onClick={() => this.handleToDetail(record.asnHeaderId)}>{val}</a>
        ),
      },
      {
        title: intl.get(`sinv.common.model.common.asnTypeCode`).d('送货单类型'),
        dataIndex: 'asnTypeCodeMeaning',
        align: 'left',
        width: 120,
      },
      {
        title: intl.get(`entity.customer.tag`).d('客户'),
        dataIndex: 'companyName',
        align: 'left',
        width: 180,
      },
      {
        title: intl.get('entity.company.tag').d('公司'),
        dataIndex: 'supplierCompanyName',
        align: 'left',
        width: 120,
      },
      {
        title: intl.get(`sinv.common.model.common.creationDate`).d('创建日期'),
        dataIndex: 'creationDate',
        width: 150,
        align: 'left',
        render: dateRender,
      },
      {
        title: intl.get(`sinv.common.model.common.shipDate`).d('发货日期'),
        dataIndex: 'shipDate',
        width: 150,
        align: 'left',
        render: dateRender,
      },
      {
        title: intl.get(`sinv.common.model.common.expectedArriveTime`).d('预计到货时间'),
        dataIndex: 'expectedArriveDate',
        width: 150,
        align: 'left',
        render: dateTimeRender,
      },
      {
        title: intl.get(`sinv.purchaseReception.view.message.invOrganization`).d('收货组织'),
        dataIndex: 'organizationName',
        align: 'left',
        width: 120,
      },
      {
        title: intl.get(`sinv.common.model.common.shipToLocationAddress`).d('收货地点'),
        dataIndex: 'shipToLocationAddress',
        align: 'left',
        render: (val) => (
          <Tooltip title={val} placement="topLeft">
            {val}
          </Tooltip>
        ),
        width: 150,
      },
      {
        title: intl.get(`sinv.common.model.common.actualReceiverName`).d('送达方'),
        dataIndex: 'actualReceiverName',
        align: 'left',
        width: 150,
      },
      {
        title: intl.get(`${commonModelPrompt}.agentName`).d('采购员'),
        dataIndex: 'purchaseAgentName',
        align: 'left',
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
    ];
    const scrollX = sum(columns.map((n) => (isNumber(n.width) ? n.width : 0)));
    const scrollY = 'calc(100vh - 400px)';
    return (
      <Fragment>
        {customizeTable(
          {
            code: 'SINV.DELIVERY_CANCELLED.LIST',
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
