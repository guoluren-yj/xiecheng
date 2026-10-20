import React from 'react';
import { Table, Tabs } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';

import RelevanceDrawer from '../../RelevanceDrawer';

const { TabPane } = Tabs;
export default class ExtensionInfoTable extends React.Component {
  @Bind()
  handleRef(ref = {}) {
    this.Draw = ref;
  }

  render() {
    const {
      extensionInfoData = [],
      loading,
      type,
      handleOpenModal,
      handleToDetail,
      handleToDelivery,
      handleToAccept,
      handleToStatement,
      handleExtensionInfo,
      record: infoRecord,
    } = this.props;
    const yuzhanColumns = [
      {
        title: intl.get('smodr.frightLine.model.orderCode').d('商城订单编码'),
        width: 200,
        dataIndex: 'orderCode',
        render: (val, record) => <a onClick={() => handleToDetail(record)}>{val}</a>,
      },
      {
        title: intl.get('smodr.frightLine.model.freightRowNum').d('运费行号'),
        width: 100,
        dataIndex: 'freightRowNum',
      },
      {
        title: intl.get('smodr.frightLine.model.cecFromMeaningType').d('运费类型'),
        width: 100,
        dataIndex: 'freightTypeMeaning',
      },
      {
        title: intl.get('smodr.frightLine.model.freightRuleCode').d('运费规则编码'),
        width: 120,
        dataIndex: 'freightRuleCode',
      },
      {
        title: intl.get('smodr.frightLine.model.quantity').d('数量'),
        width: 100,
        dataIndex: 'quantity',
      },
      {
        title: intl.get('smodr.frightLine.model.aggregatePreemptionStatusMeaning').d('预占状态'),
        width: 120,
        dataIndex: 'preemptionStatusMeaning',
      },
      {
        title: intl.get('smodr.frightLine.model.preemptDateTime').d('更新日期时间'),
        width: 150,
        dataIndex: 'preemptDateTime',
      },
      {
        title: intl.get('smodr.frightLine.model.action').d('操作'),
        width: 400,
        render: (_, record) => (
          <span className="action-link">
            <a onClick={() => handleToDetail(record)}>
              {intl.get('smodr.frightLine.model.checkDetail').d('查看订单详情')}
            </a>
            <a onClick={() => this.Draw.openDraw()}>
              {intl.get('smodr.frightLine.model.examine').d('查看关联单据')}
            </a>
            {/* <a disabled>{intl.get('smodr.frightLine.model.request').d('发起请求')}</a> */}
            <a onClick={() => handleOpenModal('yuzhan')}>
              {intl.get('smodr.frightLine.model.history').d('操作记录')}
            </a>
          </span>
        ),
      },
    ];
    const shenpiColumns = [
      {
        title: intl.get('smodr.frightLine.model.orderCode').d('商城订单编码'),
        width: 200,
        dataIndex: 'orderCode',
        render: (val, record) => <a onClick={() => handleToDetail(record)}>{val}</a>,
      },
      {
        title: intl.get('smodr.frightLine.model.freightRowNum').d('运费行号'),
        width: 100,
        dataIndex: 'freightRowNum',
      },
      {
        title: intl.get('smodr.frightLine.model.cecFromMeaningType').d('运费类型'),
        width: 100,
        dataIndex: 'freightTypeMeaning',
      },
      // {
      //   title: '运费规则类型',
      //   width: 120,
      //   dataIndex: 'freightRuleCode',
      // },
      {
        title: intl.get('smodr.frightLine.model.quantity').d('数量'),
        width: 120,
        dataIndex: 'orderEntryOriginalQuantityMeaning',
      },
      {
        title: intl.get('smodr.frightLine.model.aggregateApproveStatusMeaning').d('审批状态'),
        width: 120,
        dataIndex: 'approveStatusMeaning',
      },
      {
        title: intl.get('smodr.frightLine.model.approveDateTime').d('更新日期时间'),
        width: 150,
        dataIndex: 'approveDateTime',
      },
      {
        title: intl.get('smodr.frightLine.model.action').d('操作'),
        width: 300,
        render: (_, record) => (
          <span className="action-link">
            <a onClick={() => handleToDetail(record)}>
              {intl.get('smodr.frightLine.model.checkDetail').d('查看订单详情')}
            </a>
            <a onClick={() => handleOpenModal('shenpi')}>
              {intl.get('smodr.frightLine.model.history').d('操作记录')}
            </a>
          </span>
        ),
      },
    ];
    const peisongColumns = [
      {
        title: intl.get('smodr.frightLine.model.orderCode').d('商城订单编码'),
        width: 200,
        dataIndex: 'orderCode',
        render: (val, record) => <a onClick={() => handleToDetail(record)}>{val}</a>,
      },
      {
        title: intl.get('smodr.frightLine.model.freightRowNum').d('运费行号'),
        width: 100,
        dataIndex: 'freightRowNum',
      },
      {
        title: intl.get('smodr.frightLine.model.cecFromMeaningType').d('运费类型'),
        width: 100,
        dataIndex: 'freightTypeMeaning',
      },
      {
        title: intl.get('smodr.frightLine.model.freightRuleCode').d('运费规则编码'),
        width: 120,
        dataIndex: 'freightRuleCode',
      },
      {
        title: intl.get('smodr.frightLine.model.quantity').d('数量'),
        width: 120,
        dataIndex: 'consignmentOriginalQuantityMeaning',
      },
      {
        title: intl.get('smodr.frightLine.model.cancelQuantity').d('取消数量'),
        width: 120,
        dataIndex: 'consignmentCancelQuantityMeaning',
        render: (val) => <sapn>{val || ''}</sapn>,
      },
      {
        title: intl.get('smodr.frightLine.model.consignmentCode').d('商城配送单编码'),
        width: 120,
        dataIndex: 'consignmentCode',
        render: (val, record) =>
          val ? <a onClick={() => handleToDelivery(record)}>{val}</a> : <sapn>-</sapn>,
      },
      {
        title: intl.get('smodr.frightLine.model.ecConsignmentCode').d('电商配送单编码'),
        width: 120,
        dataIndex: 'ecConsignmentCode',
        render: (val) => <sapn>{val || ''}</sapn>,
      },
      {
        title: intl.get('smodr.frightLine.model.consignmentStatusMeaning').d('配送状态'),
        width: 120,
        dataIndex: 'consignmentStatusMeaning',
      },
      {
        title: intl.get('smodr.frightLine.model.validityStatusMeaning').d('有效性'),
        width: 100,
        dataIndex: 'validityStatusMeaning',
        render: (val) => <span>{val || '-'}</span>,
      },
      {
        title: intl.get('smodr.frightLine.model.shippedTime').d('配送时间'),
        width: 150,
        dataIndex: 'shippedTime',
        render: (val) => <span>{val || '-'}</span>,
      },
      {
        title: intl.get('smodr.frightLine.model.completedTime').d('妥投时间'),
        width: 150,
        dataIndex: 'completedTime',
        render: (val) => <span>{val || '-'}</span>,
      },
      {
        title: intl.get('smodr.frightLine.model.action').d('操作'),
        width: 300,
        render: (_, record) => (
          <span className="action-link">
            <a onClick={() => handleToDetail(record)}>
              {intl.get('smodr.frightLine.model.checkDetail').d('查看订单详情')}
            </a>
            <a onClick={() => this.Draw.openDraw()}>
              {intl.get('smodr.frightLine.model.examine').d('查看关联单据')}
            </a>
            <a onClick={() => handleOpenModal('peisong')}>
              {intl.get('smodr.frightLine.model.history').d('操作记录')}
            </a>
          </span>
        ),
      },
    ];
    const jieshouColumns = [
      {
        title: intl.get('smodr.frightLine.model.orderCode').d('商城订单编码'),
        width: 200,
        dataIndex: 'orderCode',
        render: (val, record) => <a onClick={() => handleToDetail(record)}>{val}</a>,
      },
      {
        title: intl.get('smodr.frightLine.model.freightRowNum').d('运费行号'),
        width: 100,
        dataIndex: 'freightRowNum',
      },
      {
        title: intl.get('smodr.frightLine.model.cecFromMeaningType').d('运费类型'),
        width: 100,
        dataIndex: 'freightTypeMeaning',
      },
      {
        title: intl.get('smodr.frightLine.model.freightRuleCode').d('运费规则编码'),
        width: 120,
        dataIndex: 'freightRuleCode',
      },
      {
        title: intl.get('smodr.frightLine.model.quantity').d('数量'),
        width: 120,
        dataIndex: 'quantity',
      },
      {
        title: intl.get('smodr.frightLine.model.consignmentCode').d('商城配送单编码'),
        width: 120,
        dataIndex: 'consignmentCode',
        render: (val, record) =>
          val ? <a onClick={() => handleToDelivery(record)}>{val}</a> : <sapn>-</sapn>,
      },
      {
        title: intl.get('smodr.frightLine.model.receiptCode').d('商城接收单编码'),
        width: 120,
        dataIndex: 'receiptCode',
        render: (val, record) =>
          val ? <a onClick={() => handleToAccept(record)}>{val}</a> : <sapn>-</sapn>,
      },
      {
        title: intl.get('smodr.frightLine.model.receiptStatusMeaning').d('接收状态'),
        width: 100,
        dataIndex: 'receiptStatusMeaning',
      },
      {
        title: intl.get('smodr.frightLine.model.validityStatusMeaning').d('有效性'),
        width: 100,
        dataIndex: 'validityStatusMeaning',
        render: (val) => <span>{val || '-'}</span>,
      },
      {
        title: intl.get('smodr.frightLine.model.receiptedTime').d('接收时间'),
        width: 150,
        dataIndex: 'receiptedTime',
        render: (val) => <span>{val || '-'}</span>,
      },
      {
        title: intl.get('smodr.frightLine.model.relevanceInfo').d('关联单据信息'),
        width: 300,
        render: (_, record) => (
          <span className="action-link">
            <a onClick={() => handleToDetail(record)}>
              {intl.get('smodr.frightLine.model.checkDetail').d('查看订单详情')}
            </a>
            <a onClick={() => this.Draw.openDraw()}>
              {intl.get('smodr.frightLine.model.examine').d('查看关联单据')}
            </a>
            <a onClick={() => handleOpenModal('jieshou')}>
              {intl.get('smodr.frightLine.model.history').d('操作记录')}
            </a>
          </span>
        ),
      },
    ];
    const duizhangColumns = [
      {
        title: intl.get('smodr.frightLine.model.orderCode').d('商城订单编码'),
        width: 200,
        dataIndex: 'orderCode',
        render: (val, record) => <a onClick={() => handleToDetail(record)}>{val}</a>,
      },
      {
        title: intl.get('smodr.frightLine.model.freightRowNum').d('运费行号'),
        width: 100,
        dataIndex: 'freightRowNum',
      },
      {
        title: intl.get('smodr.frightLine.model.cecFromMeaningType').d('运费类型'),
        width: 100,
        dataIndex: 'freightTypeMeaning',
      },
      {
        title: intl.get('smodr.frightLine.model.freightRuleCode').d('运费规则编码'),
        width: 120,
        dataIndex: 'freightRuleCode',
      },
      // {
      //   title: '商品类型',
      //   width: 100,
      //   dataIndex: 'skuTypeMeaning',
      // },
      {
        title: intl.get('smodr.frightLine.model.quantity').d('数量'),
        width: 120,
        dataIndex: 'quantity',
      },
      {
        title: intl.get('smodr.frightLine.model.consignmentCode').d('商城配送单编码'),
        width: 120,
        dataIndex: 'consignmentCode',
        render: (val, record) =>
          val ? <a onClick={() => handleToDelivery(record)}>{val}</a> : <sapn>-</sapn>,
      },
      {
        title: intl.get('smodr.frightLine.model.receiptCode').d('商城接收单编码'),
        width: 120,
        dataIndex: 'receiptCode',
        render: (val, record) =>
          val ? <a onClick={() => handleToAccept(record)}>{val}</a> : <sapn>-</sapn>,
      },
      {
        title: intl.get('smodr.frightLine.model.statementsCode').d('商城对账单编码'),
        width: 120,
        dataIndex: 'statementsCode',
        render: (val, record) =>
          val ? <a onClick={() => handleToStatement(record)}>{val}</a> : <sapn>-</sapn>,
      },
      {
        title: intl.get('smodr.frightLine.model.statementsStatusMeaning').d('对账状态'),
        width: 120,
        dataIndex: 'statementsStatusMeaning',
      },
      {
        title: intl.get('smodr.frightLine.model.validityStatusMeaning').d('有效性'),
        width: 120,
        dataIndex: 'validityStatusMeaning',
        render: (val) => <span>{val || '-'}</span>,
      },
      {
        title: intl.get('smodr.frightLine.model.statementsTime').d('对账时间'),
        width: 150,
        dataIndex: 'statementsTime',
        render: (val) => <span>{val || '-'}</span>,
      },
      {
        title: intl.get('smodr.frightLine.model.action').d('操作'),
        width: 300,
        render: (_, record) => (
          <span className="action-link">
            <a onClick={() => handleToDetail(record)}>
              {intl.get('smodr.frightLine.model.checkDetail').d('查看订单详情')}
            </a>
            <a onClick={() => this.Draw.openDraw()}>
              {intl.get('smodr.frightLine.model.examine').d('查看关联单据')}
            </a>
            <a onClick={() => handleOpenModal('duizhang')}>
              {intl.get('smodr.frightLine.model.history').d('操作记录')}
            </a>
          </span>
        ),
      },
    ];
    const quxiaoColumns = [
      {
        title: intl.get('smodr.frightLine.model.orderCode').d('商城订单编码'),
        width: 200,
        dataIndex: 'orderCode',
        render: (val, record) => <a onClick={() => handleToDetail(record)}>{val}</a>,
      },
      {
        title: intl.get('smodr.frightLine.model.freightRowNum').d('运费行号'),
        width: 100,
        dataIndex: 'freightRowNum',
      },
      {
        title: intl.get('smodr.frightLine.model.cecFromMeaningType').d('运费类型'),
        width: 100,
        dataIndex: 'freightTypeMeaning',
      },
      {
        title: intl.get('smodr.frightLine.model.quantity').d('数量'),
        width: 120,
        dataIndex: 'cancelQuantityMeaning',
      },
      {
        title: intl.get('smodr.frightLine.model.cancelStatusMeaning').d('取消状态'),
        width: 120,
        dataIndex: 'cancelStatusMeaning',
      },
      {
        title: intl.get('smodr.frightLine.model.approveDateTime').d('更新日期和时间'),
        width: 150,
        dataIndex: 'lastUpdateDate',
        render: (val) => <span>{val || '-'}</span>,
      },
      {
        title: intl.get('smodr.frightLine.model.action').d('操作'),
        width: 300,
        render: () => (
          <span className="action-link">
            <a onClick={() => this.Draw.openDraw()}>
              {intl.get('smodr.frightLine.model.examine').d('查看关联单据')}
            </a>
            <a onClick={() => handleOpenModal('quxiao')}>
              {intl.get('smodr.frightLine.model.history').d('操作记录')}
            </a>
          </span>
        ),
      },
    ];
    return (
      <React.Fragment>
        <Tabs onChange={(key) => handleExtensionInfo(infoRecord, key)} activeKey={type}>
          <TabPane tab={intl.get('smodr.orderDetail.model.quxiao').d('取消信息')} key="cancel">
            <Table
              bordered
              rowKey="id"
              pagination={false}
              columns={quxiaoColumns}
              dataSource={extensionInfoData}
              loading={loading}
            />
          </TabPane>
          <TabPane tab={intl.get('smodr.orderDetail.model.yuzhan').d('预占信息')} key="preemption">
            <Table
              bordered
              columns={yuzhanColumns}
              dataSource={extensionInfoData}
              loading={loading}
            />
          </TabPane>
          <TabPane tab={intl.get('smodr.orderDetail.model.shenpi').d('审批信息')} key="approve">
            <Table
              bordered
              columns={shenpiColumns}
              dataSource={extensionInfoData}
              loading={loading}
            />
          </TabPane>
          <TabPane tab={intl.get('smodr.orderDetail.model.peisong').d('配送信息')} key="shipment">
            <Table
              bordered
              columns={peisongColumns}
              dataSource={extensionInfoData}
              loading={loading}
            />
          </TabPane>
          <TabPane tab={intl.get('smodr.orderDetail.model.jieshou').d('接收信息')} key="receive">
            <Table
              bordered
              columns={jieshouColumns}
              dataSource={extensionInfoData}
              loading={loading}
            />
          </TabPane>
          <TabPane
            tab={intl.get('smodr.orderDetail.model.duizhang').d('对账信息')}
            key="statements"
          >
            <Table
              bordered
              columns={duizhangColumns}
              dataSource={extensionInfoData}
              loading={loading}
            />
          </TabPane>
          <RelevanceDrawer onRef={this.handleRef} />
        </Tabs>
        {/* {(() => {
          switch (type) {
            case 'preemption': {
              return (
                <>
                  <div style={{ fontSize: '16px', margin: '18px 0' }}>
                    {intl.get('smodr.frightLine.title.preemption').d('运费行-预占信息')}
                  </div>
                  <Table
                    bordered
                    loading={loading}
                    rowKey="id"
                    columns={yuzhanColumns}
                    dataSource={extensionInfoData}
                    pagination={false}
                  />
                </>
              );
            }
            case 'shipment': {
              return (
                <>
                  <div style={{ fontSize: '16px', margin: '18px 0' }}>
                    {intl.get('smodr.frightLine.title.shipment').d('运费行-配送信息')}
                  </div>
                  <Table
                    bordered
                    loading={loading}
                    rowKey="id"
                    columns={peisongColumns}
                    dataSource={extensionInfoData}
                    pagination={false}
                  />
                </>
              );
            }
            case 'receive': {
              return (
                <>
                  <div style={{ fontSize: '16px', margin: '18px 0' }}>
                    {intl.get('smodr.frightLine.title.receive').d('运费行-接收信息')}
                  </div>
                  <Table
                    bordered
                    loading={loading}
                    rowKey="id"
                    columns={jieshouColumns}
                    dataSource={extensionInfoData}
                    pagination={false}
                  />
                </>
              );
            }
            case 'statements': {
              return (
                <>
                  <div style={{ fontSize: '16px', margin: '18px 0' }}>
                    {intl.get('smodr.frightLine.title.statements').d('运费行-对账信息')}
                  </div>
                  <Table
                    bordered
                    loading={loading}
                    rowKey="id"
                    columns={duizhangColumns}
                    dataSource={extensionInfoData}
                    pagination={false}
                  />
                </>
              );
            }
            case 'approve': {
              return (
                <>
                  <div style={{ fontSize: '16px', margin: '18px 0' }}>
                    {intl.get('smodr.frightLine.title.approve').d('运费行-审批信息')}
                  </div>
                  <Table
                    bordered
                    loading={loading}
                    rowKey="id"
                    columns={shenpiColumns}
                    dataSource={extensionInfoData}
                    pagination={false}
                  />
                </>
              );
            }
            default: {
              return <div>1</div>;
            }
          }
        })()}
        <RelevanceDrawer onRef={this.handleRef} /> */}
      </React.Fragment>
    );
  }
}
