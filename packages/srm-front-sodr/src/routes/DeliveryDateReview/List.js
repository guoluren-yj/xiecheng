/*
 * ListTable - 交期审核列表信息
 * @date: 2018/08/07 14:56:50
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Table, Tooltip } from 'hzero-ui';
import { sum, isNumber } from 'lodash';

import intl from 'utils/intl';
import { dateTimeRender, yesOrNoRender } from 'utils/renderer';

import styles from './index.less';
import urgentImg from '@/assets/icon-expedited.svg';
import abnormal from '@/assets/abnormal.svg';

/**
 * 交期审核列表信息
 * @extends {Component} - React.Component
 * @reactProps {Function} showEditModal 显示编辑模态框
 * @reactProps {Object} form 表单
 * @return React.element
 */
const commonModelPrompt = 'sodr.deliveryDateReview.model.common';
export default class ListTable extends Component {
  render() {
    const {
      loading,
      dataSource = [],
      searchPaging,
      pagination = {},
      rowSelection,
      customizeTable,
      handleToDetail = (e) => e,
    } = this.props;
    const columns = [
      {
        title: intl.get(`${commonModelPrompt}.displayPoNum`).d('订单号'),
        dataIndex: 'displayPoNum',
        width: 180,
        sorter: true,
        fixed: 'left',
        render: (value, record) => (
          <div className={styles['row-agent-column']}>
            <a onClick={() => handleToDetail(record.poHeaderId)}>{value}</a>
            {record.incorrectFlag === 1 ? (
              <Tooltip title={record.incorrectMsg}>
                <img src={abnormal} alt="img" />
              </Tooltip>
            ) : null}
            {record.urgentFlag === 1 ? (
              <Tooltip title={intl.get(`${commonModelPrompt}.urgent`).d('订单加急')}>
                <img src={urgentImg} alt="img" />
              </Tooltip>
            ) : null}
            {record.unreadCount > 0 ? (
              <Tooltip
                title={
                  intl.get(`${commonModelPrompt}.unreadCount`).d(`未读消息:`) + record.unreadCount
                }
              >
                <div style={{ marginLeft: 4, marginRight: 4 }}>
                  <span style={{ color: 'red' }}>({record.unreadCount})</span>
                </div>
              </Tooltip>
            ) : null}
          </div>
        ),
      },
      {
        title: intl.get(`entity.supplier.code`).d('供应商编码'),
        dataIndex: 'supplierCode',
        sorter: true,
        width: 110,
        fixed: 'left',
      },
      {
        title: intl.get(`entity.supplier.name`).d('供应商名称'),
        dataIndex: 'supplierName',
        sorter: true,
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
        title: intl.get(`${commonModelPrompt}.feedbackTime`).d('交期反馈时间'),
        dataIndex: 'feedbackDate',
        sorter: true,
        width: 150,
        render: dateTimeRender,
      },
      {
        title: intl.get(`sodr.common.model.common.releaseTime`).d('发布时间'),
        dataIndex: 'releasedDate',
        width: 150,
        render: dateTimeRender,
        sorter: true,
      },
      {
        title: intl.get(`entity.order.type`).d('订单类型'),
        dataIndex: 'poTypeCodeMeaning',
        width: 90,
      },
      {
        title: intl.get(`entity.company.tag`).d('公司'),
        dataIndex: 'companyName',
        sorter: true,
        width: 150,
      },
      {
        title: intl.get(`entity.business.tag`).d('业务实体'),
        dataIndex: 'orgName',
        sorter: true,
        width: 150,
      },
      {
        title: intl.get(`${commonModelPrompt}.purOrganizationId`).d('采购组织'),
        dataIndex: 'purOrganizationName',
        sorter: true,
        width: 150,
      },
      {
        title: intl.get(`${commonModelPrompt}.agentId`).d('采购员'),
        dataIndex: 'agentName',
        sorter: true,
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
        title: intl.get(`${commonModelPrompt}.urgentDate`).d('加急时间'),
        dataIndex: 'urgentDate',
        sorter: true,
        width: 150,
        render: dateTimeRender,
      },
      {
        title: intl.get(`${commonModelPrompt}.sourceCode`).d('来源系统'),
        dataIndex: 'externalSystemCode',
        width: 120,
      },
      {
        title: intl.get(`sodr.common.model.common.electricSignFlag`).d('电签标志'),
        dataIndex: 'electricSignFlag',
        width: 100,
        align: 'left',
        render: yesOrNoRender,
      },
      {
        title: intl.get(`sodr.common.model.common.electricSignStatus`).d('电签状态'),
        dataIndex: 'electricSignStatus',
        align: 'left',
        width: 100,
      },
    ];
    const scrollX = sum(columns.map((n) => (isNumber(n.width) ? n.width : 0))) + 300;
    return customizeTable(
      {
        code: 'SODR.DELIVERY_DATE_REVIEW.GRID',
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
        onChange={(page, _, sorter) => searchPaging(page, 'list', '', sorter, true)}
      />
    );
  }
}
