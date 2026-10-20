import React, { Component, Fragment } from 'react';
import { Table, Tooltip } from 'hzero-ui';
import { isNumber, sum } from 'lodash';
import { dateRender } from 'utils/renderer';
import abnormal from '@/assets/abnormal.svg';
import intl from 'utils/intl';
import { formatAumont } from '../../components/utils';

import styles from '../index.less';

export default class List extends Component {
  render() {
    const { loading, dataSource = [], onSearch, pagination = {}, rowSelection } = this.props;
    const columns = [
      {
        title: intl.get(`sodr.common.model.common.orderSeq`).d('序号'),
        dataIndex: 'serialNum',
        width: 60,
        fixed: 'left',
      },
      {
        title: intl.get(`sodr.common.model.common.itemCode`).d('物料编码'),
        dataIndex: 'itemCode',
        width: 150,
        fixed: 'left',
      },
      {
        title: intl.get(`sodr.common.model.common.itemName`).d('物料名称'),
        dataIndex: 'itemName',
        width: 150,
        fixed: 'left',
      },
      {
        title: intl.get(`sodr.common.model.common.supplierCode`).d('供应商编码'),
        dataIndex: 'supplierCompanyCode',
        width: 150,
        fixed: 'left',
      },
      {
        title: intl.get(`sodr.common.model.common.supplierName`).d('供应商名称'),
        dataIndex: 'supplierCompanyName',
        width: 150,
        fixed: 'left',
      },
      {
        title: intl.get(`sodr.common.model.common.orderSource`).d('订单来源'),
        dataIndex: 'poSourcePlatformMeaning',
        width: 150,
      },
      {
        title: intl.get(`entity.order.type`).d('订单类型'),
        dataIndex: 'orderTypeName',
        width: 150,
      },
      {
        title: intl.get(`sodr.common.model.common.displayPoNum`).d('订单号'),
        dataIndex: 'displayPoNum',
        width: 180,
        render: (val, record) => (
          <div className={styles['row-agent-column']}>
            <span>{val}</span>
            {record.createSyncStatus === 'FAIL' ? (
              <Tooltip title={record.createSyncResponseMsg}>
                <img src={abnormal} alt="img" />
              </Tooltip>
            ) : null}
            {record.deliverySyncStatus === 'FAIL' ? (
              <Tooltip
                title={
                  intl
                    .get(`sodr.common.view.message.orderFeedbackMsg`)
                    .d('ERP订单承诺交货日期同步失败：失败原因') +
                  (record.deliverySyncResponseMsg || '')
                }
              >
                <img src={abnormal} alt="img" />
              </Tooltip>
            ) : null}
          </div>
        ),
      },
      {
        title: intl.get(`sodr.common.model.common.releaseNum`).d('发放号'),
        dataIndex: 'releaseNum',
        width: 180,
      },
      {
        title: intl.get(`sodr.common.model.common.poLineId`).d('订单行号'),
        dataIndex: 'lineNum',
        width: 100,
      },
      {
        title: intl.get(`sodr.common.model.common.orderDisplayLineLocationNum`).d('订单发运号'),
        dataIndex: 'lineLocationNum',
        width: 150,
      },
      {
        title: intl.get(`sodr.common.model.common.latestVersionNum`).d('版本号'),
        dataIndex: 'versionNum',
        width: 80,
      },
      {
        title: intl.get(`sodr.common.model.common.needQuantity`).d('需求数量'),
        dataIndex: 'quantity',
        width: 100,
        render: (val) => formatAumont(val),
      },
      {
        title: intl.get(`sodr.common.model.common.readyPlanQuantity`).d('可计划数量'),
        dataIndex: 'planQuantity',
        width: 100,
      },
      {
        title: intl.get(`sodr.common.model.common.plannedQuantity`).d('已计划数量'),
        dataIndex: 'plannedQuantity',
        width: 130,
      },
      {
        title: intl.get(`sodr.common.model.common.netReceivedQuantitys`).d('净接收数量'),
        dataIndex: 'netReceivedQuantity',
        width: 100,
      },
      {
        title: intl.get(`sodr.common.model.common.quantityInDelivery`).d('送货中数量'),
        dataIndex: 'sendingQuantity',
        width: 100,
      },
      {
        title: intl.get(`sodr.common.model.common.uomNames`).d('单位'),
        dataIndex: 'uomName',
        width: 100,
      },
      {
        title: intl.get(`sodr.common.model.common.needByDate`).d('需求日期'),
        dataIndex: 'needByDate',
        width: 150,
        render: dateRender,
      },
      {
        title: intl.get(`sodr.common.model.common.agentId`).d('采购员'),
        dataIndex: 'purchaseAgentName',
        width: 100,
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
    ];
    const scrollX = sum(columns.map((n) => (isNumber(n.width) ? n.width : 0)));
    return (
      <Fragment>
        <Table
          rowSelection={rowSelection}
          loading={loading}
          rowKey="poLineLocationId"
          bordered
          scroll={{ x: scrollX }}
          columns={columns}
          dataSource={dataSource}
          pagination={pagination}
          onChange={(page) => onSearch(page)}
        />
      </Fragment>
    );
  }
}
