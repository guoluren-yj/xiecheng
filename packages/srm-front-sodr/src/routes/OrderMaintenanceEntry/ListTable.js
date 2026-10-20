import React, { PureComponent } from 'react';
import { Table, Tooltip } from 'hzero-ui';
import { dateTimeRender } from 'utils/renderer';
import intl from 'utils/intl';

import styles from './index.less';
import urgentImg from '@/assets/icon-expedited.svg';
import abnormal from '@/assets/abnormal.svg';

const common = 'sodr.common.model.common';
export default class ListTable extends PureComponent {
  render() {
    const {
      loading,
      dataSource,
      pagination,
      onChange,
      onDetail,
      selectedRowKeys,
      onSelectRow,
      onModalVisible,
      customizeTable,
    } = this.props;
    const prefix = 'sodr.orderMaintenanceEntry.model.common';
    const columns = [
      {
        title: intl.get(`sodr.sendOrder.model.common.orderStatus`).d('订单状态'),
        dataIndex: 'statusCodeMeaning',
        width: 100,
      },
      {
        title: intl.get(`${prefix}.orderNumber`).d('订单号'),
        dataIndex: 'displayPoNum',
        sorter: true,
        width: 180,
        // render: (val, record) => <a onClick={() => onDetail(record)}>{val}</a>,
        render: (val, record) => (
          <div className={styles['row-agent-column']}>
            <a onClick={() => onDetail(record)}>{val}</a>
            {record.incorrectFlag === 1 ? (
              <Tooltip title={record.incorrectMsg}>
                <img src={abnormal} alt="img" />
              </Tooltip>
            ) : null}
            {record.urgentFlag === 1 ? (
              <Tooltip title={intl.get(`${prefix}.urgent`).d('订单加急')}>
                <img src={urgentImg} alt="img" />
              </Tooltip>
            ) : null}
          </div>
        ),
      },
      {
        title: intl.get(`entity.supplier.code`).d('供应商编码'),
        dataIndex: 'supplierCode',
        width: 100,
        sorter: true,
        render: (_, record) => {
          const { supplierCode, supplierCompanyCode } = record || {};
          return supplierCode || supplierCompanyCode;
        },
      },
      {
        title: intl.get(`entity.supplier.name`).d('供应商名称'),
        dataIndex: 'supplierName',
        width: 150,
        sorter: true,
        render: (_, record) => {
          const { supplierName, supplierCompanyName } = record || {};
          return supplierName || supplierCompanyName;
        },
      },
      {
        title: intl.get(`${common}.supplierSites`).d('供应商地点'),
        dataIndex: 'supplierSiteName',
        width: 150,
      },
      {
        title: intl.get(`${common}.releaseNum`).d('发放号'),
        dataIndex: 'displayReleaseNum',
        width: 90,
      },
      {
        title: intl.get(`${common}.creation`).d('创建时间'),
        dataIndex: 'creationDate',
        width: 150,
        sorter: true,
        render: dateTimeRender,
      },
      {
        title: intl.get(`entity.order.type`).d('订单类型'),
        dataIndex: 'poTypeCodeMeaning',
        width: 120,
      },
      {
        title: intl.get(`entity.company.tag`).d('公司'),
        dataIndex: 'companyName',
        sorter: true,
        width: 150,
      },
      {
        title: intl.get(`entity.business.tag`).d('业务实体'),
        dataIndex: 'ouName',
        sorter: true,
        width: 150,
      },
      {
        title: intl.get(`entity.organization.class.purchase`).d('采购组织'),
        dataIndex: 'purOrganizationName',
        sorter: true,
        width: 150,
      },
      {
        title: intl.get(`${common}.agentId`).d('采购员'),
        dataIndex: 'agentName',
        sorter: true,
        width: 100,
      },
      {
        title: intl.get(`${common}.shipToLocationAddress`).d('收货方地址'),
        dataIndex: 'shipToLocationAddress',
        width: 200,
      },
      {
        title: intl.get(`${common}.billToLocationAddress`).d('收单方地址'),
        dataIndex: 'billToLocationAddress',
        width: 200,
      },
      {
        title: intl.get(`${common}.sourceCode`).d('来源系统'),
        dataIndex: 'sourceCode',
        width: 120,
      },
      {
        title: intl.get(`${common}.sourcePlatform`).d('来源平台'),
        dataIndex: 'poSourcePlatformMeaning',
        width: 150,
      },
      {
        title: intl.get(`${common}.prSourcePlatformMeaning`).d('单据来源'),
        dataIndex: 'sourceBillTypeCodeMeaning',
        width: 150,
      },
      {
        title: intl.get(`sodr.common.view.button.operationRecord`).d('操作记录'),
        dataIndex: 'operationRecord',
        width: 100,
        render: (_, record) => {
          return (
            <a onClick={() => onModalVisible(true, record)}>
              {intl.get('sodr.common.view.button.operationRecord').d('操作记录')}
            </a>
          );
        },
      },
    ];
    return customizeTable(
      {
        code: 'SODR.ORDER_CREATE_LINE_LIST.LIST.GRID',
      },
      <Table
        bordered
        scroll={{
          x: columns.map((item) => item.width).reduce((sum, val) => sum + val),
          y: 'calc(100vh - 350px)',
        }}
        rowKey="poHeaderId"
        loading={loading}
        columns={columns}
        dataSource={dataSource}
        pagination={{ ...pagination, showQuickJumper: true }}
        rowSelection={{
          selectedRowKeys,
          onChange: onSelectRow,
        }}
        onChange={(page, _, sorter) => onChange(page, sorter, true)}
      />
    );
  }
}
