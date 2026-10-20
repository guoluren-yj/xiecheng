import React, { PureComponent } from 'react';
import { Table, Tooltip } from 'hzero-ui';

import intl from 'utils/intl';
import { dateTimeRender, dateRender, yesOrNoRender } from 'utils/renderer';
import urgentImg from '@/assets/icon-expedited.svg';
import abnormal from '@/assets/abnormal.svg';
import styles from './index.less';

import { thousandBitSeparator } from '@/routes/utils.js';

const commonPrompt = 'sprm.common.model.common';
const modelPrompt = 'sprm.purchaseRequisitionInquiry.model.common';
// 需求查询列表页-整单查询-表格行-个性化
const hcuzCode = 'SPRM.PURCHASE_REQUISITION_INQUIRY.LIST.WHOLE';

export default class ListTable extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { dataSource, pagination, selectedRowKeys, onSelectRow, customizeTable } = this.props;
    const { loading, onChange, onDetail, onHide, evaluate = (e) => e } = this.props;
    const columns = [
      {
        title: intl.get('hzero.common.status').d('状态'),
        dataIndex: 'prStatusMeaning',
        width: 80,
        sorter: true,
      },
      {
        title: intl.get(`${commonPrompt}.prNum`).d('采购申请编号'),
        dataIndex: 'displayPrNum',
        width: 160,
        sorter: true,
        render: (val, record) => (
          <div className={styles['row-agent-column']}>
            <a onClick={() => onDetail(record)} style={{ paddingRight: '8px' }}>
              {val}
            </a>
            {record.incorrectFlag === 1 ? (
              <Tooltip title={record.incorrectMsg}>
                <img src={abnormal} alt="img" />
              </Tooltip>
            ) : null}
            {record.syncStatus === 'SYNC_FAILURE' ? (
              <Tooltip title={record.syncResponseMsg}>
                <img src={abnormal} alt="img" />
              </Tooltip>
            ) : null}
            {record.urgentFlag === 1 ? (
              <Tooltip
                title={intl.get(`sodr.orderMaintenanceEntry.model.common.urgent`).d('申请加急')}
              >
                <img src={urgentImg} alt="img" />
              </Tooltip>
            ) : null}
          </div>
        ),
      },
      {
        title: intl.get(`${commonPrompt}.title`).d('标题'),
        width: 150,
        dataIndex: 'title',
      },
      {
        title: intl.get(`${commonPrompt}.sqType`).d('申请类型'),
        dataIndex: 'prTypeName',
        width: 150,
      },
      {
        title: intl.get(`${commonPrompt}.requestDate`).d('申请日期'),
        dataIndex: 'requestDate',
        width: 180,
        sorter: true,
        render: dateRender,
      },
      {
        title: intl.get('entity.roles.creator').d('创建人'),
        dataIndex: 'createByName',
        width: 120,
        render: (text) => <Tooltip title={text}>{text}</Tooltip>,
      },
      {
        title: intl.get(`${commonPrompt}.creationTime`).d('创建时间'),
        dataIndex: 'creationDate',
        render: dateTimeRender,
        sorter: true,
        width: 150,
      },
      {
        title: intl.get(`${commonPrompt}.unitName`).d('所属部门'),
        dataIndex: 'unitName',
        // render: dateTimeRender,
        sorter: true,
        width: 150,
      },
      // {
      //   title: intl.get(`${commonPrompt}.companyTeam`).d('公司组织'),
      //   dataIndex: 'parentUnitName',
      //   width: 150,
      // },
      // {
      //   title: intl.get(`${commonPrompt}.moneyPart`).d('费用挂靠部门'),
      //   dataIndex: 'expenseUnitName',
      //   width: 150,
      // },
      {
        title: intl.get(`entity.company.tag`).d('公司'),
        dataIndex: 'companyName',
        sorter: true,
        width: 120,
      },
      {
        title: intl.get('entity.organization.class.purchase').d('采购组织'),
        dataIndex: 'purchaseOrgName',
        width: 120,
        sorter: true,
      },
      {
        title: intl.get(`${commonPrompt}.purchaseAgentName`).d('采购员'),
        dataIndex: 'purchaseAgentName',
        sorter: true,
        width: 120,
      },
      {
        title: intl.get(`${commonPrompt}.amount`).d('申请总额'),
        dataIndex: 'amount',
        width: 120,
        render: (val, record) =>
          record.headerPriceHiddenFlag === 1
            ? record.amountMeaning
            : thousandBitSeparator(val, record.financialPrecision),
      },
      {
        title: intl.get(`${commonPrompt}.xyNum`).d('协议编号'),
        dataIndex: 'pcNum',
        width: 150,
      },
      // {
      //   title: intl.get(`${commonPrompt}.kpBody`).d('开票主体'),
      //   dataIndex: 'invoiceTitle',
      //   width: 150,
      // },
      {
        title: intl.get(`${commonPrompt}.prSourcePlatform`).d('单据来源'),
        dataIndex: 'prSourcePlatformMeaning',
        width: 150,
      },
      {
        title: intl.get(`${commonPrompt}.applyExplain`).d('申请说明'),
        dataIndex: 'remark',
        width: 200,
        render: (text) => <Tooltip title={text}>{text}</Tooltip>,
        onCell: () => ({
          style: {
            overflow: 'hidden',
            maxWidth: 200,
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          },
          onClick: (e) => {
            const { target } = e;
            if (target.style.whiteSpace === 'normal') {
              target.style.whiteSpace = 'nowrap';
            } else {
              target.style.whiteSpace = 'normal';
            }
          },
        }),
      },
      {
        title: intl.get(`${commonPrompt}.prApplyNum`).d('SRM申请编号'),
        dataIndex: 'prNum',
        width: 150,
        render: (value, record) =>
          record.syncStatus === 'SYNC_SUCCESS' ? <text>{value}</text> : null,
      },
      {
        title: intl.get(`${commonPrompt}.urgentFlag`).d('是否加急'),
        dataIndex: 'urgentFlag',
        width: 100,
        render: (val) => yesOrNoRender(val),
      },
      {
        title: intl.get(`${commonPrompt}.urgentDate`).d('加急时间'),
        dataIndex: 'urgentDate',
        render: dateTimeRender,
        width: 180,
      },
      {
        title: intl.get(`${commonPrompt}.changedFlag`).d('变更中'),
        dataIndex: 'changedFlag',
        width: 150,
        render: yesOrNoRender,
      },
      {
        title: intl.get(`${modelPrompt}.closedStatus`).d('关闭状态'),
        dataIndex: 'closeStatusMeaning',
        width: 100,
      },
      {
        title: intl.get(`${modelPrompt}.cancelledStatus`).d('取消状态'),
        dataIndex: 'cancelStatusMeaning',
        width: 100,
      },
      {
        title: intl.get(`${modelPrompt}.mallParentOrderNum`).d('商城父订单号'),
        dataIndex: 'mallParentOrderNum',
        width: 120,
      },
      {
        title: intl.get('hzero.common.button.operating').d('操作记录'),
        dataIndex: 'operationRecord',
        render: (_, record) => (
          <a onClick={() => onHide(record)}>
            {intl.get('hzero.common.button.operating').d('操作记录')}
          </a>
        ),
        width: 100,
      },
      {
        title: intl.get(`${modelPrompt}.evaluate`).d('评价'),
        dataIndex: 'evaluate',
        render: (_, record) =>
          record.prStatusCode === 'APPROVED' &&
          (record.evaluateFlag === 0 ? (
            <a onClick={() => evaluate(record)}>{intl.get(`${modelPrompt}.evaluate`).d('评价')}</a>
          ) : (
            <a onClick={() => evaluate(record)}>
              {intl.get(`${modelPrompt}.evaluateOk`).d('已评价')}
            </a>
          )),
        width: 100,
      },
      {
        title: intl.get(`spfm.configServer.model.order.recordFlag`).d('变更记录'),
        dataIndex: 'updateOperatorRecord',
        width: 100,
        render: (_, record) => (
          // record.changedFlag === 1 ?
          <a onClick={() => onHide(record, true)}>
            {intl.get(`sprm.purchaseRequisitionInquiry.model.common.changeLog`).d('变更日志')}
          </a>
          // ) : null,
        ),
      },
    ];
    return customizeTable(
      { code: hcuzCode },
      <Table
        bordered
        rowKey="prHeaderId"
        loading={loading}
        columns={columns}
        dataSource={dataSource}
        pagination={pagination}
        rowSelection={{
          selectedRowKeys,
          onChange: (rowKeys) => onSelectRow({ selectedRowKeys: rowKeys }),
        }}
        scroll={{
          x: columns.map((item) => item.width).reduce((sum, val) => sum + val),
          y: 450,
        }}
        onChange={onChange}
      />
    );
  }
}
