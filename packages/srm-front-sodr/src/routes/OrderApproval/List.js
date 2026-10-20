/*
 * ListTable - 订单审批查询列表信息
 * @date: 2018/08/07 14:56:50
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Table, Tooltip } from 'hzero-ui';
import { isNumber, sum } from 'lodash';

import intl from 'utils/intl';
import { dateTimeRender } from 'utils/renderer';

import styles from './index.less';
import urgentImg from '@/assets/icon-expedited.svg';
import abnormal from '@/assets/abnormal.svg';

/**
 * 订单审批查询列表信息
 * @extends {Component} - React.Component
 * @reactProps {Function} showEditModal 显示编辑模态框
 * @reactProps {Object} form 表单
 * @return React.element
 */
const commonModelPrompt = 'sodr.orderApproval.model.common';
export default class ListTable extends Component {
  render() {
    const {
      loading,
      customizeTable,
      dataSource = [],
      searchPaging,
      pagination = {},
      rowSelection,
      handleToDetail = (e) => e,
    } = this.props;
    const columns = [
      // {
      //   title: intl.get(`${modelPrompt}.statusCode`).d('订单状态'),
      //   dataIndex: 'statusCodeMeaning',
      //   align: 'center',
      //   width: 90,
      //   fixed: 'left',
      //   render: (value, record) => (
      //     <span className={record.urgentFlag === 1 ? styles['row-urgent'] : null}>{value}</span>
      //   ),
      // },
      {
        title: intl.get(`sodr.common.model.common.displayStatusMeaning`).d('状态'),
        dataIndex: 'statusCode',
        fixed: 'left',
        width: 100,
        render: (__, record) => record.statusCodeMeaning,
      },
      {
        title: intl.get(`sodr.common.model.common.poNum`).d('订单号'),
        dataIndex: 'displayPoNum',
        width: 150,
        fixed: 'left',
        render: (value, record) => (
          <div className={styles['row-agent-column']}>
            <a onClick={() => handleToDetail(record.poHeaderId)}>{value}</a>
            {record.incorrectFlag === 1 || record.approvedSyncStatus === 'FAIL' ? (
              <Tooltip
                title={`${record.incorrectMsg || ''}${record.approvedSyncResponseMsg || ''}`}
              >
                <img src={abnormal} alt="img" />
              </Tooltip>
            ) : null}
            {record.urgentFlag === 1 ? (
              <Tooltip title={intl.get(`${commonModelPrompt}.urgent`).d('订单加急')}>
                <img src={urgentImg} alt="img" />
              </Tooltip>
            ) : null}
          </div>
        ),
      },
      {
        title: intl.get(`entity.supplier.code`).d('供应商编码'),
        dataIndex: 'supplierCode',
        fixed: 'left',
        width: 110,
      },
      {
        title: intl.get(`entity.supplier.name`).d('供应商名称'),
        dataIndex: 'supplierName',
        width: 120,
        fixed: 'left',
      },
      {
        title: intl.get(`${commonModelPrompt}.supplierSites`).d('供应商地点'),
        dataIndex: 'supplierSiteName',
        width: 150,
      },
      {
        title: intl.get(`${commonModelPrompt}.releaseNum`).d('发放号'),
        dataIndex: 'releaseNum',
        width: 90,
      },
      {
        title: intl.get(`sodr.sendOrder.model.common.creationTime`).d('创建时间'),
        dataIndex: 'erpCreationDate',
        width: 150,
        render: dateTimeRender,
      },
      {
        title: intl.get(`entity.order.type`).d('订单类型'),
        dataIndex: 'poTypeCodeMeaning',
        width: 90,
      },
      {
        title: intl.get(`entity.company.tag`).d('公司'),
        dataIndex: 'companyName',
        width: 150,
      },
      {
        title: intl.get(`entity.business.tag`).d('业务实体'),
        dataIndex: 'orgName',
        width: 150,
      },
      {
        title: intl.get(`${commonModelPrompt}.purOrganizationId`).d('采购组织'),
        dataIndex: 'purOrganizationName',
        width: 150,
      },
      {
        title: intl.get(`${commonModelPrompt}.agentId`).d('采购员'),
        dataIndex: 'agentName',
        width: 100,
      },
      {
        title: intl.get(`${commonModelPrompt}.shipToLocationAddress`).d('收货方地址'),
        dataIndex: 'shipToLocationAddress',
        width: 150,
      },
      {
        title: intl.get(`${commonModelPrompt}.billToLocationAddress`).d('收单方地址'),
        dataIndex: 'billToLocationAddress',
        width: 150,
      },
      {
        title: intl.get(`${commonModelPrompt}.sourceCode`).d('来源系统'),
        dataIndex: 'poSourcePlatformMeaning',
        width: 150,
      },
    ];
    const scrollX = sum(columns.map((n) => (isNumber(n.width) ? n.width : 0))) + 300;
    return customizeTable(
      {
        code: 'SODR.ORDER_APPROVAL.LIST.GRID',
      },
      <Table
        rowSelection={rowSelection}
        loading={loading}
        rowKey="poHeaderId"
        bordered
        scroll={{ x: scrollX, y: 'calc(100vh - 350px)' }}
        columns={columns}
        dataSource={dataSource}
        pagination={{ ...pagination, showQuickJumper: true }}
        onChange={(page) => searchPaging(page, true)}
      />
    );
  }
}
