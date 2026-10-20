/*
 * List - 订单签署列表
 * @date: 2018/11/20 10:45:04
 * @author: FQL <qilin.feng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent } from 'react';
import { Table, Form, Tooltip } from 'hzero-ui';
import { isNumber, sum } from 'lodash';

import intl from 'utils/intl';
import { dateTimeRender, yesOrNoRender } from 'utils/renderer';

import styles from './index.less';
import urgentImg from '@/assets/icon-expedited.svg';
import abnormal from '@/assets/abnormal.svg';
/**
 * 我发出的订单查询列表信息
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Function} showEditModal 显示编辑模态框
 * @reactProps {Object} form 表单
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
export default class ListTable extends PureComponent {
  render() {
    const {
      loading,
      customizeTable,
      dataSource = [],
      searchPaging = (e) => e,
      pagination = {},
      // rowSelection,
      handleToDetail = (e) => e,
    } = this.props;
    const columns = [
      {
        title: intl.get(`sodr.common.model.common.displayPoNum`).d('订单号'),
        dataIndex: 'displayPoNum',
        sorter: true,
        width: 180,
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
              <Tooltip title={intl.get(`sodr.common.model.common.urgent`).d('订单加急')}>
                <img src={urgentImg} alt="img" />
              </Tooltip>
            ) : null}
          </div>
        ),
      },
      {
        title: intl.get(`entity.supplier.code`).d('供应商编码'),
        dataIndex: 'supplierCode',
        sorter: true,
        width: 100,
        fixed: 'left',
      },
      {
        title: intl.get(`entity.supplier.name`).d('供应商名称'),
        dataIndex: 'supplierName',
        sorter: true,
        width: 170,
        fixed: 'left',
      },
      {
        title: intl.get(`sodr.common.model.common.supplierSite`).d('供应商地点'),
        width: 150,
        dataIndex: 'supplierSiteName',
      },
      {
        title: intl.get(`sodr.common.model.common.releaseNum`).d('发放号'),
        dataIndex: 'releaseNum',
        width: 90,
      },
      {
        title: intl.get('sodr.common.model.common.creationTime').d('创建时间'),
        dataIndex: 'erpCreationDate',
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
        title: intl.get(`sodr.common.model.common.shipToLocationAddress`).d('收货方地址'),
        dataIndex: 'shipToLocationAddress',
        width: 100,
      },
      {
        title: intl.get(`sodr.common.model.common.billToLocationAddress`).d('收单方地址'),
        dataIndex: 'billToLocationAddress',
        width: 100,
      },
      {
        title: intl.get(`sodr.common.model.common.urgentDate`).d('加急时间'),
        dataIndex: 'urgentDate',
        sorter: true,
        width: 150,
        render: dateTimeRender,
      },
      {
        title: intl.get(`sodr.common.model.common.sourceCode`).d('来源系统'),
        dataIndex: 'externalSystemCode',
        width: 100,
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
    const scrollX = sum(columns.map((n) => (isNumber(n.width) ? n.width : 0))) + 200;
    return customizeTable(
      {
        code: 'SODR.ORDER_SIGN.GRID',
      },
      <Table
        // rowSelection={rowSelection}
        rowSelection={null} // 订单签署暂时不需要批量操作
        loading={loading}
        rowKey="poHeaderId"
        bordered
        scroll={{ x: scrollX, y: 'calc(100vh - 350px)' }}
        columns={columns}
        dataSource={dataSource}
        pagination={pagination}
        onChange={(page, _, sorter) => searchPaging(page, sorter, true)}
      />
    );
  }
}
