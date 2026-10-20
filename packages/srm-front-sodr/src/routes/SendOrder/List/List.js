/*
 * List - 我发出的订单查询列表信息
 * @date: 2018/08/07 14:56:50
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent, Fragment } from 'react';
import { Table, Form, Tooltip } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { sum, isNumber } from 'lodash';
import moment from 'moment';
import { connect } from 'dva';

import intl from 'utils/intl';
import { dateTimeRender, yesOrNoRender } from 'utils/renderer';

import IMChatDraggable from '_components/IMChatDraggable';
import styles from '../index.less';
import urgentImg from '@/assets/icon-expedited.svg';
import abnormal from '@/assets/abnormal.svg';
import yanqiImg from '@/assets/yanqi.svg';

/**
 * 我发出的订单查询列表信息
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Function} handleToDetail 跳转到详情页
 * @reactProps {Object} form 表单
 * @return React.element
 */

const modelPrompt = 'sodr.sendOrder.model.common';
@connect(({ sendOrder }) => ({
  sendOrder,
}))
@Form.create({ fieldNameProp: null })
export default class List extends PureComponent {
  /**
   * 跳转到详情页
   * @param {Number} { poHeaderId }
   */
  @Bind()
  handleToDetail({ poHeaderId, poSourcePlatform }) {
    if (this.props.handleToDetail) {
      this.props.handleToDetail(poHeaderId, poSourcePlatform);
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
      // sendOrder,
      sendOrder: { listSort },
    } = this.props;

    const columns = [
      {
        title: intl.get(`${modelPrompt}.orderStatus`).d('订单状态'),
        dataIndex: 'statusCodeMeaning',
        width: 90,
        fixed: 'left',
        align: 'right',
        render: (value, record) => {
          const getIMRequestBody = {
            ...record,
            unreadCount: record.unreadCount === undefined ? 0 : record.unreadCount,
            ouName: record.orgName,
          };
          return [
            'PUBLISHED',
            'PART_FEED_BACK',
            // 'DELIVERY_DATE_REVIEW',
            'DELIVERY_DATE_REJECT',
            'CANCELTOBECOMFIRMED',
            'CLOSETOBECOMFIRMED',
          ].includes(record.statusCode) ? (
            // 已发布、部分反馈、订单反馈审核拒绝、取消待确认、关闭待确认的订单发送“订单确认卡片”
            <div className={styles['im-chat-draggable']}>
              <IMChatDraggable
                cardCode="PO_CONFIRM_DETAIL"
                icon="baseline-drag_indicator"
                tooltip=""
                requestBody={getIMRequestBody}
                dragText={`${intl.get('sodr.sendOrder.view.order').d('订单')} ${
                  record.displayPoNum
                }`}
              >
                {value}
              </IMChatDraggable>
            </div>
          ) : (
            <div className={styles['im-chat-draggable']}>
              <IMChatDraggable
                cardCode="PO_RECEIVE_DETAIL"
                icon="baseline-drag_indicator"
                tooltip=""
                requestBody={getIMRequestBody}
                dragText={`${intl.get('sodr.sendOrder.view.order').d('订单')} ${
                  record.displayPoNum
                }`}
              >
                {value}
              </IMChatDraggable>
            </div>
          );
        },
      },
      {
        title: intl.get(`${modelPrompt}.orderNum`).d('订单号'),
        dataIndex: 'displayPoNum',
        width: 180,
        fixed: 'left',
        sorter: true,
        sortOrder:
          listSort?.columnKey === 'displayPoNum' && listSort?.order === 'asc'
            ? 'ascend'
            : listSort?.columnKey === 'displayPoNum' && listSort?.order === 'desc'
            ? 'descend'
            : false,
        render: (value, record) => (
          <div className={styles['row-agent-column']}>
            <a onClick={() => this.handleToDetail(record)}>{value}</a>
            {/* {record.incorrectFlag === 1 || record.approvedSyncStatus === 'FAIL' ? (
              <Tooltip
                title={`${record.incorrectMsg || ''}${record.approvedSyncResponseMsg || ''}`}
              >
                <img src={abnormal} alt="img" />
              </Tooltip>
            ) : null} */}
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
            {record.urgentFlag === 1 ? (
              <Tooltip title={intl.get(`${modelPrompt}.urgent`).d('订单加急')}>
                <img src={urgentImg} alt="img" />
              </Tooltip>
            ) : null}
            {record.beyondQuantity > 0 ? (
              <Tooltip
                title={intl.get(`${modelPrompt}.overdue.tips`).d(`订单超期，请及时安排送货！`)}
              >
                <img src={yanqiImg} alt="img" />
              </Tooltip>
            ) : null}
            {record.unreadCount > 0 ? (
              <Tooltip
                title={
                  record.unreadCount + intl.get(`${modelPrompt}.unreadCount`).d(`条留言板消息未读`)
                }
              >
                <div style={{ marginLeft: 4, marginRight: 4 }}>
                  <span style={{ color: 'red' }}>({record.unreadCount})</span>
                </div>
              </Tooltip>
            ) : null}
            {record.changeSyncStatus === 'FAIL' ? (
              <Tooltip title={record.changeSyncResponseMsg}>
                <img src={abnormal} alt="img" />
              </Tooltip>
            ) : null}
          </div>
        ),
      },
      {
        title: intl.get(`entity.supplier.code`).d('供应商编码'),
        dataIndex: 'supplierCode',
        width: 120,
        sorter: true,
        fixed: 'left',
        render: (value, record) => record.supplierCode || record.supplierCompanyCode,
      },
      {
        title: intl.get(`entity.supplier.name`).d('供应商名称'),
        dataIndex: 'supplierName',
        width: 150,
        sorter: true,
        fixed: 'left',
        render: (value, record) => record.supplierName || record.supplierCompanyName,
      },
      {
        title: intl.get(`${modelPrompt}.supplierSites`).d('供应商地点'),
        dataIndex: 'supplierSiteName',
        width: 150,
      },
      {
        title: intl.get(`${modelPrompt}.releaseNum`).d('发放号'),
        dataIndex: 'releaseNum',
        width: 90,
      },
      {
        title: intl.get(`${modelPrompt}.creationTime`).d('创建时间'),
        dataIndex: 'creationDate',
        width: 150,
        sorter: true,
        render: dateTimeRender,
      },
      {
        title: intl.get(`${modelPrompt}.releaseTime`).d('发布时间'),
        dataIndex: 'releasedDate',
        width: 150,
        sorter: true,
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
        title: intl.get(`sodr.common.model.common.purchaseOrgId`).d('采购组织'),
        dataIndex: 'purOrganizationName',
        sorter: true,
        width: 120,
      },
      {
        title: intl.get(`${modelPrompt}.purchaseAgent`).d('采购员'),
        dataIndex: 'agentName',
        sorter: true,
        width: 100,
      },
      {
        title: intl.get(`${modelPrompt}.srmPoNum`).d('SRM订单号'),
        dataIndex: 'poNum',
        width: 100,
      },
      {
        title: intl.get(`${modelPrompt}.contractNum`).d('合同编号'),
        dataIndex: 'erpContractNum',
        width: 160,
      },
      {
        title: intl.get(`${modelPrompt}.shipToLocationAddress`).d('收货方地址'),
        dataIndex: 'shipToLocationAddress',
        width: 150,
      },
      {
        title: intl.get(`${modelPrompt}.billToLocationAddress`).d('收单方地址'),
        dataIndex: 'billToLocationAddress',
        width: 150,
      },
      {
        title: intl.get(`${modelPrompt}.urgentTime`).d('加急时间'),
        dataIndex: 'urgentDate',
        width: 150,
        render: dateTimeRender,
      },
      {
        title: intl.get(`${modelPrompt}.sourceSystem`).d('来源系统'),
        dataIndex: 'poSourcePlatformMeaning',
        width: 100,
      },
      {
        title: intl.get(`${modelPrompt}.cooperationSupplierFlag`).d('供应商参与协同标识'),
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
    const scrollX = sum(columns.map((n) => (isNumber(n.width) ? n.width : 0))) + 300;
    return (
      <Fragment>
        {customizeTable(
          {
            code: 'SODR.SEND_ORDER_LIST.GRID_BY_LINE',
          },
          <Table
            resizable
            rowSelection={rowSelection}
            loading={loading}
            rowKey="poHeaderId"
            bordered
            scroll={{ x: scrollX, y: 'calc(100vh - 400px)' }}
            columns={columns}
            dataSource={dataSource}
            pagination={{ ...pagination, showQuickJumper: true }}
            onChange={(page, _, sorter) => searchPaging(page, {}, false, '', sorter)}
          />
        )}
      </Fragment>
    );
  }
}
