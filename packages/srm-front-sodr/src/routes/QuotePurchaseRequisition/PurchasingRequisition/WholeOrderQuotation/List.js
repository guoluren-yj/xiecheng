/*
 * ListTable - 调查表审批列表
 * @date: 2018/08/07 14:56:50
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Table, Tooltip } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { sum, isNumber } from 'lodash';

import intl from 'utils/intl';
import { dateRender, yesOrNoRender } from 'utils/renderer';
import urgentImg from '@/assets/icon-expedited.svg';
import abnormal from '@/assets/abnormal.svg';
import styles from './index.less';

/**
 * 整单引用列表
 * @extends {Component} - React.Component
 * @reactProps {Function} showEditModal 显示编辑模态框
 * @reactProps {Object} form 表单
 * @return React.element
 */
export default class List extends Component {
  /**
   * 显示编辑模态框
   * @param {obj} record 当前行数据
   */
  @Bind()
  showEditModal(record) {
    this.props.editLine(record);
  }

  @Bind()
  handleToDetail(prHeaderId) {
    if (this.props.handleToDetail) {
      this.props.handleToDetail(prHeaderId);
    }
  }

  render() {
    const {
      loading,
      dataSource,
      searchPaging,
      pagination,
      rowSelection,
      customizeTable,
    } = this.props;
    const columns = [
      {
        title: intl.get(`sodr.common.model.common.displayPrNum`).d('采购申请编号'),
        dataIndex: 'prNum',
        width: 150,
        fixed: 'left',
        render: (val, record) => (
          <div className={styles['row-agent-column']}>
            <a onClick={() => this.handleToDetail(record.prHeaderId)}>{val}</a>
            {record.incorrectFlag === 1 ? (
              <Tooltip title={record.incorrectMsg}>
                <img src={abnormal} alt="img" />
              </Tooltip>
            ) : null}
            {record.urgentFlag === 1 ? (
              <Tooltip
                title={intl.get(`sodr.orderMaintenanceEntry.model.common.urgent`).d('订单加急')}
              >
                <img src={urgentImg} alt="img" />
              </Tooltip>
            ) : null}
          </div>
        ),
      },
      {
        title: intl.get(`sodr.common.model.common.title`).d('标题'),
        dataIndex: 'title',
        fixed: 'left',
        width: 100,
      },
      {
        title: intl.get(`sodr.common.model.common.requestDate`).d('申请日期'),
        dataIndex: 'requestDate',
        width: 150,
        render: dateRender,
        align: 'left',
      },
      {
        title: intl.get(`entity.company.tag`).d('公司'),
        dataIndex: 'companyName',
        width: 150,
      },
      {
        title: intl.get(`entity.business.tag`).d('业务实体'),
        dataIndex: 'ouName',
        width: 150,
      },
      {
        title: intl.get(`entity.organization.class.purchase`).d('采购组织'),
        dataIndex: 'organizationName',
        width: 120,
      },
      // {
      //   title: intl.get(`entity.supplier.tag`).d('供应商'),
      //   dataIndex: 'supplierName',
      //   width: 150,
      // },
      {
        title: intl.get(`sodr.common.model.common.purchaser`).d('采购员'),
        dataIndex: 'purchaseAgentName',
        width: 150,
      },
      {
        title: intl.get(`sodr.common.model.common.requestBy`).d('申请人'),
        dataIndex: 'requestedName',
        width: 100,
      },
      // {
      //   title: intl.get(`sodr.common.model.common.requestDate`).d('申请日期'),
      //   dataIndex: 'requestDate',
      //   width: 150,
      // },
      {
        title: intl.get(`sodr.common.model.common.prSourcePlatformMeaning`).d('单据来源'),
        dataIndex: 'prSourcePlatformMeaning',
        width: 150,
      },
      {
        title: intl.get('sodr.common.model.common.proposalSupplierName').d('建议供应商'),
        dataIndex: 'ecSupplierCompanyName',
        width: 120,
      },
      {
        title: intl.get(`sodr.quotePurchaseRequisition.view.message.urgentFlag`).d('是否加急'),
        dataIndex: 'urgentFlag',
        width: 120,
        render: (val) => yesOrNoRender(val),
      },
      {
        title: intl.get(`sodr.quotePurchaseRequisition.view.message.urgentDate`).d('加急时间'),
        dataIndex: 'urgentDate',
        width: 150,
      },
      // {
      //   title: intl.get(`sodr.common.model.common.unitPriceBatchs`).d('价格批量'),
      //   dataIndex: 'unitPriceBatch',
      //   width: 120,
      // },
    ];
    const scrollX = sum(columns.map((item) => (isNumber(item.width) ? item.width : 0))) + 200;
    return customizeTable(
      {
        code: 'SODR.PURCHASE_REQUISITION_LIST.ALL',
      },
      <Table
        bordered
        scroll={{ x: scrollX, y: 'calc(100vh - 390px)' }}
        rowKey="prHeaderId"
        loading={loading}
        columns={columns}
        dataSource={dataSource}
        pagination={{ ...pagination, showQuickJumper: true }}
        onChange={(page) => searchPaging(page, false)}
        rowSelection={rowSelection}
      />
    );
  }
}
