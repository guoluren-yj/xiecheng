/*
 * ListTable - 交期审核列表信息
 * @date: 2018/08/07 14:56:50
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Tooltip } from 'hzero-ui';
import { sum, isNumber, isEqual } from 'lodash';
import moment from 'moment';
import BigNumber from 'bignumber.js';

import intl from 'utils/intl';
import DocFlow from '_components/DocFlow';
import { dateTimeRender, yesOrNoRender } from 'utils/renderer';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import EditTable from 'components/EditTable';

import styles from './index.less';
import urgentImg from '@/assets/icon-expedited.svg';
import abnormal from '@/assets/abnormal.svg';
import { formatAumont, getDynamicLabel } from '../components/utils';

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
      doubleUnitEnabled,
      handleToDetail = (e) => e,
      customizeTable = (e) => e,
    } = this.props;
    const columns = [
      {
        title: intl.get(`${commonModelPrompt}.displayPoNum`).d('订单号'),
        dataIndex: 'displayPoNum',
        width: 180,
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
        width: 110,
        fixed: 'left',
      },
      {
        title: intl.get(`entity.supplier.name`).d('供应商名称'),
        dataIndex: 'supplierName',
        width: 120,
        fixed: 'left',
      },
      {
        title: intl.get(`sodr.common.model.common.poLineId`).d('订单行号'),
        dataIndex: 'displayLineNum',
        width: 90,
      },
      {
        title: intl.get(`entity.item.code`).d('物料编码'),
        dataIndex: 'itemCode',
        width: 120,
      },
      {
        title: intl.get(`entity.item.name`).d('物料名称'),
        dataIndex: 'itemName',
        width: 150,
      },
      {
        title: intl.get(`sodr.deliveryDateReview.model.common.feedbackTime`).d('交期反馈时间'),
        dataIndex: 'feedbackDate',
        width: 150,
        render: dateTimeRender,
      },
      doubleUnitEnabled && {
        title: intl.get(`sodr.deliveryDateReview.model.common.quantity`).d('数量'),
        dataIndex: 'secondaryQuantity',
        align: 'center',
        width: 90,
        render: (val, record) => {
          if (
            !isEqual(
              new BigNumber(record.secondaryQuantity),
              new BigNumber(record.originalQuantity)
            )
          ) {
            return (
              <span
                style={{
                  backgroundColor: '#F563491A',
                  color: '#F56349',
                  height: '20px',
                  display: 'block',
                  margin: '-10px -8px',
                  textAlign: 'center',
                }}
              >
                {formatAumont(val)}
              </span>
            );
          }
          return formatAumont(val);
        },
      },
      {
        title: getDynamicLabel(doubleUnitEnabled, 'quantity'),
        dataIndex: 'quantity',
        align: 'center',
        width: 90,
        render: (val, record) => {
          if (
            !doubleUnitEnabled &&
            !isEqual(new BigNumber(record.quantity), new BigNumber(record.originalQuantity))
          ) {
            return (
              <span
                style={{
                  backgroundColor: '#F563491A',
                  color: '#F56349',
                  height: '20px',
                  display: 'block',
                  margin: '-10px -8px',
                  textAlign: 'center',
                }}
              >
                {formatAumont(val)}
              </span>
            );
          }
          return formatAumont(val);
        },
      },
      {
        title: intl.get(`${commonModelPrompt}.originalQuantity`).d('原需求数量'),
        dataIndex: 'originalQuantity',
        align: 'center',
        width: 90,
        render: (val) => formatAumont(val),
      },
      {
        title: intl.get(`${commonModelPrompt}.needByDate`).d('需求日期'),
        dataIndex: 'needByDate',
        width: 120,
        onCell: (record) => (record.dateEquallyFlag === 0 ? { className: 'active' } : {}),
        // render: (text) => (text ? moment(text).format(DEFAULT_DATE_FORMAT) : text),
        render: (text) => {
          const dom = text ? moment(text).format(DEFAULT_DATE_FORMAT) : null;
          const formatDom = dateTimeRender(dom) || null;
          return <>{formatDom}</>;
        },
      },
      {
        title: intl.get(`${commonModelPrompt}.promiseDeliveryDate`).d('承诺交货日期'),
        dataIndex: 'promiseDeliveryDate',
        width: 120,
        onCell: (record) => (record.dateEquallyFlag === 0 ? { className: 'active' } : {}),
        // render: text => (text ? moment(text).format(DEFAULT_DATE_FORMAT) : text),
        render: (text, record) => {
          const val = text ? moment(text).format(DEFAULT_DATE_FORMAT) : text;
          const formatDom = dateTimeRender(val) || null;
          if (text !== record.needByDate) {
            return (
              <span
                style={{
                  backgroundColor: '#F563491A',
                  color: '#F56349',
                  height: '20px',
                  display: 'block',
                  margin: '-10px -8px',
                  textAlign: 'center',
                }}
              >
                {formatDom}
              </span>
            );
          }
          return formatDom;
        },
      },
      {
        title: intl.get(`entity.order.type`).d('订单类型'),
        dataIndex: 'poTypeCodeMeaning',
        width: 120,
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
        title: intl.get(`sodr.deliveryDateReview.model.common.organizationName`).d('收货组织'),
        dataIndex: 'invOrganizationName',
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
      {
        width: 100,
        dataIndex: 'docFlow',
        title: intl.get(`sodr.common.model.common.docFlow`).d('单据流'),
        render: (_, record) => (
          <DocFlow tableName="sodr_po_line_location" tablePk={record.poLineLocationId} />
        ),
      },
    ].filter((i) => i);
    const scrollX = sum(columns.map((n) => (isNumber(n.width) ? n.width : 0))) + 300;
    return customizeTable(
      {
        code: 'SODR.DELIVERY_DATE_REVIEW.GRID_BY_DETAIL',
      },
      <EditTable
        rowSelection={rowSelection}
        loading={loading}
        rowKey="poLineLocationId"
        bordered
        scroll={{ x: scrollX, y: 'calc(100vh - 350px)' }}
        columns={columns}
        dataSource={dataSource}
        pagination={{ ...pagination, showQuickJumper: true }}
        onChange={(page) => searchPaging(page, 'detail', 1, undefined, true)}
      />
    );
  }
}
