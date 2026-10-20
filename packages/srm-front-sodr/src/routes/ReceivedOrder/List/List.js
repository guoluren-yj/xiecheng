/*
 * List - 我发出的订单查询列表信息
 * @date: 2018/08/07 14:56:50
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component, Fragment } from 'react';
import { Table, Tooltip } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import moment from 'moment';

import intl from 'utils/intl';
import { dateTimeRender, yesOrNoRender } from 'utils/renderer';

import styles from '../index.less';

import urgentImg from '@/assets/icon-expedited.svg';
import abnormal from '@/assets/abnormal.svg';
import yanqiImg from '@/assets/yanqi.svg';

/**
 * 我发出的订单查询列表信息
 * @extends {Component} - React.Component
 * @reactProps {Function} showEditModal 显示编辑模态框
 * @reactProps {Object} form 表单
 * @return React.element
 */
export default class List extends Component {
  /**
   * 跳转详情
   * @param {number} { poHeaderId }
   */
  @Bind()
  handleToDetail({ poHeaderId }) {
    if (this.props.handleToDetail) {
      this.props.handleToDetail(poHeaderId);
    }
  }

  @Bind()
  Time(dayOne, dayTwo) {
    return moment(dayOne).diff(moment(dayTwo), 'days');
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
        title: intl.get(`entity.order.status`).d('订单状态'),
        dataIndex: 'statusCodeMeaning',
        width: 90,
        fixed: 'left',
      },
      {
        title: intl.get(`sodr.common.model.common.displayPoNum`).d('订单号'),
        dataIndex: 'displayPoNum',
        sorter: true,
        width: 210,
        fixed: 'left',
        render: (value, record) => (
          <div className={styles['row-agent-column']}>
            <a onClick={() => this.handleToDetail(record)}>{value}</a>
            {record.incorrectFlag === 1 || record.deliverySyncStatus === 'FAIL' ? (
              <Tooltip
                title={
                  record.incorrectFlag === 1
                    ? record.incorrectMsg
                    : intl
                        .get(`sodr.common.view.message.detailFeedbackMsg`)
                        .d('承诺交期回传失败，请重新同步')
                }
              >
                <img src={abnormal} alt="img" />
              </Tooltip>
            ) : null}
            {record.urgentFlag === 1 ? (
              <Tooltip title={intl.get(`sodr.common.model.common.urgent`).d('订单加急')}>
                <img src={urgentImg} alt="img" />
              </Tooltip>
            ) : null}
            {record.beyondQuantity > 0 ? (
              <Tooltip
                title={intl
                  .get(`sodr.common.model.common.overdue.tips`)
                  .d(`订单超期,请及时安排送货！`)}
              >
                <img src={yanqiImg} alt="img" />
              </Tooltip>
            ) : null}
            {record.unreadCount > 0 ? (
              <Tooltip
                title={
                  record.unreadCount +
                  intl.get(`sodr.common.model.common.unreadCount`).d(`条留言板消息未读`)
                }
              >
                <span style={{ marginLeft: 4, color: 'red' }}>({record.unreadCount})</span>
              </Tooltip>
            ) : null}
          </div>
        ),
      },
      {
        title: intl.get(`sodr.common.model.common.latestVersion`).d('版本'),
        dataIndex: 'versionNum',
        width: 60,
      },
      {
        title: intl.get(`sodr.common.model.common.releaseNum`).d('发放号'),
        dataIndex: 'releaseNum',
        width: 90,
      },
      {
        title: intl.get(`hzero.common.date.creation`).d('创建时间'),
        dataIndex: 'creationDate',
        width: 170,
        sorter: true,
        render: dateTimeRender,
      },
      {
        title: intl.get(`hzero.common.date.release`).d('发布日期'),
        dataIndex: 'releasedDate',
        sorter: true,
        width: 150,
        render: dateTimeRender,
      },
      {
        title: intl.get(`entity.order.type`).d('订单类型'),
        dataIndex: 'poTypeCodeMeaning',
        width: 90,
      },
      {
        title: intl.get(`entity.customer.tag`).d('客户'),
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
        title: intl.get(`sodr.common.model.common.supplierSites`).d('供应商地点'),
        dataIndex: 'supplierSiteName',
        width: 150,
      },
      {
        title: intl.get(`sodr.common.model.common.purOrganizationId`).d('采购组织'),
        dataIndex: 'purOrganizationName',
        sorter: true,
        width: 150,
      },
      {
        title: intl.get(`sodr.common.model.common.agentId`).d('采购员'),
        dataIndex: 'agentName',
        sorter: true,
        width: 100,
      },
      {
        title: intl.get(`sodr.common.model.common.erpContractNum`).d('合同编号'),
        dataIndex: 'erpContractNum',
        width: 160,
      },
      {
        title: intl.get(`sodr.common.model.common.shipToLocationAddress`).d('收货方地址'),
        dataIndex: 'shipToLocationAddress',
        width: 150,
      },
      {
        title: intl.get(`sodr.common.model.common.billToLocationAddress`).d('收单方地址'),
        dataIndex: 'billToLocationAddress',
        width: 150,
      },
      {
        title: intl.get(`sodr.common.model.common.urgentDate`).d('加急时间'),
        dataIndex: 'urgentDate',
        width: 150,
        render: dateTimeRender,
      },
      {
        title: intl.get(`sodr.common.model.common.sourceCode`).d('来源系统'),
        dataIndex: 'poSourcePlatformMeaning',
        width: 100,
      },
      {
        title: intl.get(`sodr.common.model.common.orderRemark`).d('订单摘要'),
        dataIndex: 'remark',
      },
      {
        title: intl.get(`sodr.common.model.common.cooperationSupplierFlag`).d('供应商参与协同标识'),
        dataIndex: 'cooperationSupplierFlag',
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
    return (
      <Fragment>
        {customizeTable(
          {
            code: 'SODR.RECEIVED_ORDER_LIST.GRID_BY_LINE',
          },
          <Table
            rowSelection={rowSelection}
            loading={loading}
            rowKey="poHeaderId"
            bordered
            scroll={{
              x: columns.map((item) => item.width).reduce((sum, val) => sum + val),
              y: 'calc(100vh - 350px)',
            }}
            columns={columns}
            dataSource={dataSource}
            pagination={{ ...pagination, showQuickJumper: true }}
            onChange={(page, _, sorter) => searchPaging(page, {}, false, '', sorter, true)}
          />
        )}
      </Fragment>
    );
  }
}
