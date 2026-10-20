/*
 * ListTable - 我发出的订单查询列表信息
 * @date: 2018/08/07 14:56:50
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Table, Tooltip } from 'hzero-ui';
import { sum, isNumber, isArray } from 'lodash';
import moment from 'moment';
import intl from 'utils/intl';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import { dateTimeRender, yesOrNoRender } from 'utils/renderer';
import styles from './index.less';

import urgentImg from '@/assets/icon-expedited.svg';
import abnormal from '@/assets/abnormal.svg';

/**
 * 我发出的订单查询列表信息
 * @extends {Component} - React.Component
 * @reactProps {Function} showEditModal 显示编辑模态框
 * @reactProps {Object} form 表单
 * @return React.element
 */
const commonModelPrompt = 'sodr.common.model.common';
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
      {
        title: intl.get(`entity.order.status`).d('订单状态'),
        dataIndex: 'statusCodeMeaning',
        align: 'left',
        width: 90,
        fixed: 'left',
      },
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
                  record.unreadCount +
                  intl.get(`${commonModelPrompt}.unreadCount`).d(`条留言板消息未读`)
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
        title: intl.get(`${commonModelPrompt}.latestVersion`).d('版本'),
        dataIndex: 'versionNum',
        width: 70,
        align: 'left',
      },
      {
        title: intl.get(`${commonModelPrompt}.releaseNum`).d('发放号'),
        dataIndex: 'releaseNum',
        width: 90,
        align: 'left',
      },
      {
        title: intl.get(`hzero.common.date.creationDate`).d('创建日期'),
        dataIndex: 'erpCreationDate',
        sorter: true,
        width: 150,
        align: 'left',
        render: (val, record) => {
          const { sourceCode, erpCreationDate, creationDate } = record;
          // 判断来源平台是不是SRM
          if (sourceCode !== 'SRM') {
            const formatErpCreationDate =
              erpCreationDate && moment(erpCreationDate).format(DEFAULT_DATETIME_FORMAT);
            return dateTimeRender(formatErpCreationDate);
          } else {
            const formatCreationDate =
              creationDate && moment(creationDate).format(DEFAULT_DATETIME_FORMAT);
            return dateTimeRender(formatCreationDate);
          }
        },
      },
      {
        title: intl.get(`hzero.common.date.release`).d('发布日期'),
        dataIndex: 'releasedDate',
        align: 'left',
        width: 150,
        render: dateTimeRender,
        sorter: true,
      },
      {
        title: intl.get(`entity.order.type`).d('订单类型'),
        dataIndex: 'poTypeCodeMeaning',
        width: 90,
        align: 'left',
      },
      {
        title: intl.get(`entity.customer.tag`).d('客户'),
        dataIndex: 'companyName',
        width: 150,
        align: 'left',
      },
      {
        title: intl.get(`entity.business.tag`).d('业务实体'),
        dataIndex: 'orgName',
        sorter: true,
        width: 150,
        align: 'left',
      },
      {
        title: intl.get(`${commonModelPrompt}.supplierSites`).d('供应商地点'),
        dataIndex: 'supplierSiteName',
        width: 150,
        align: 'left',
      },
      {
        title: intl.get(`${commonModelPrompt}.purOrganizationId`).d('采购组织'),
        dataIndex: 'purOrganizationName',
        sorter: true,
        width: 150,
        align: 'left',
      },
      {
        title: intl.get(`${commonModelPrompt}.agentId`).d('采购员'),
        dataIndex: 'agentName',
        sorter: true,
        width: 100,
        align: 'left',
      },
      {
        title: intl.get(`${commonModelPrompt}.erpContractNum`).d('合同编号'),
        dataIndex: 'erpContractNum',
        width: 160,
      },
      {
        title: intl.get(`${commonModelPrompt}.urgentDate`).d('加急时间'),
        dataIndex: 'urgentDate',
        width: 150,
        render: dateTimeRender,
        align: 'left',
      },
      {
        title: intl.get(`${commonModelPrompt}.sourceCode`).d('来源系统'),
        dataIndex: 'externalSystemCode',
        width: 100,
        align: 'left',
      },
      {
        title: intl.get(`${commonModelPrompt}der.orderRemark`).d('订单摘要'),
        dataIndex: 'remark',
        align: 'left',
        width: 100,
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
        code: 'SODR.CONFIRM_ORDER_LIST.GRID',
      },
      <Table
        rowSelection={rowSelection}
        loading={loading}
        rowKey="poHeaderId"
        bordered
        scroll={{ x: scrollX, y: 'calc(100vh - 350px)' }}
        columns={columns}
        dataSource={isArray(dataSource) ? dataSource : []}
        pagination={{ ...pagination, showQuickJumper: true }}
        onChange={(page, _, sorter) => searchPaging(page, sorter, true)}
      />
    );
  }
}
