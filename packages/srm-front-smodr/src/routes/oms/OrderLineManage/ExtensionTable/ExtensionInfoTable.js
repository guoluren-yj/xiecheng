import React from 'react';
import { Bind } from 'lodash-decorators';
import { Tabs } from 'choerodon-ui';
import { DataSet, Table, Icon, Button } from 'choerodon-ui/pro';
import classnames from 'classnames';

import intl from 'utils/intl';

import { ds } from './ds';
import styles from './index.less';
import {
  color,
  preemColor,
  approveColor,
  shipmentColor,
  receiveColor,
  afterColor,
  stateColor,
} from './colorRender';

const { TabPane } = Tabs;
export default class ExtensionInfoTable extends React.Component {
  constructor(props) {
    super(props);
    const { orderEntryId, type } = props;
    const tableDs = new DataSet(ds(this.props?.type, this.props?.orderEntryId));
    this.state = { orderEntryId, type, tableDs };
    props.onRef(this);
  }

  getDrivedStateFromProps(nextProps, prevState) {
    const { orderEntryId, type } = nextProps;
    if (orderEntryId !== prevState.orderEntryId || type !== prevState.type) {
      const tableDs = new DataSet(ds(type, orderEntryId));
      return {
        orderEntryId,
        type,
        tableDs,
      };
    }
    return null;
  }

  @Bind()
  handleRef(ref = {}) {
    this.Draw = ref;
  }

  @Bind()
  handleExtension(infoRecord, key) {
    this.props.handleExtensionInfo(infoRecord, key);
    // const tableDs = new DataSet(ds(key, this.state?.orderEntryId));
    // this.setState({ tableDs });
  }

  render() {
    const {
      type,
      handleOpenModal,
      handleToDetail,
      handleToDelivery,
      handleToAccept,
      handleToStatement,
      handleToAfterSale,
      handleRelationShow,
      infoRecord,
      showRelation,
      currentRow,
    } = this.props;
    const { tableDs } = this.state;
    const yuzhanColumns = [
      {
        width: 120,
        name: 'preemptionStatusMeaning',
        renderer: ({ value, record }) => <span style={preemColor(record)}>{value}</span>,
      },
      {
        width: 100,
        name: 'operation',
        renderer: ({ record }) => (
          <span className="action-link">
            {/* <span>{intl.get('smodr.orderLine.model.newExamine').d('关联单据')}</span> */}
            <Button
              color="primary"
              funcType="link"
              onClick={() => handleOpenModal('yuzhan', record)}
            >
              {intl.get('smodr.orderLine.model.history').d('操作记录')}
            </Button>
          </span>
        ),
      },
      {
        width: 200,
        name: 'orderCode',
        renderer: ({ value, record }) => (
          <Button color="primary" funcType="link" onClick={() => handleToDetail(record)}>
            {value}
          </Button>
        ),
      },
      {
        width: 150,
        name: 'skuCode',
      },
      {
        // width: 100,
        name: 'skuName',
      },
      {
        width: 100,
        name: 'viewQuantityMeaning',
        align: 'right',
      },
      {
        width: 150,
        name: 'preemptDateTime',
      },
    ];
    const shenpiColumns = [
      {
        width: 120,
        name: 'approveStatusMeaning',
        renderer: ({ value, record }) => <span style={approveColor(record)}>{value}</span>,
      },
      {
        width: 100,
        name: 'operation',
        renderer: ({ record }) => (
          <span className="action-link">
            {/* <span>{intl.get('smodr.orderLine.model.newExamine').d('关联单据')}</span> */}
            <Button
              color="primary"
              funcType="link"
              onClick={() => handleOpenModal('shenpi', record)}
            >
              {intl.get('smodr.orderLine.model.history').d('操作记录')}
            </Button>
          </span>
        ),
      },
      {
        width: 200,
        name: 'orderCode',
        renderer: ({ value, record }) => (
          <Button color="primary" funcType="link" onClick={() => handleToDetail(record)}>
            {value}
          </Button>
        ),
      },
      {
        width: 150,
        name: 'skuCode',
      },
      {
        // width: 100,
        name: 'skuName',
      },
      {
        name: 'viewQuantityMeaning',
        align: 'right',
      },
      {
        width: 150,
        name: 'rejectedReason',
      },
      {
        width: 150,
        name: 'approveDateTime',
      },
    ];
    const peisongColumns = [
      {
        width: 150,
        name: 'consignmentStatusMeaning',
        renderer: ({ value, record }) => <span style={shipmentColor(record)}>{value}</span>,
      },
      {
        width: 100,
        name: 'operation',
        renderer: ({ record }) => (
          <span className="action-link">
            {/* <span>{intl.get('smodr.orderLine.model.newExamine').d('关联单据')}</span> */}
            <Button
              color="primary"
              funcType="link"
              onClick={() => handleOpenModal('peisong', record)}
            >
              {intl.get('smodr.orderLine.model.history').d('操作记录')}
            </Button>
          </span>
        ),
      },
      {
        width: 200,
        name: 'consignmentCode',
        renderer: ({ value, record }) => (
          <Button color="primary" funcType="link" onClick={() => handleToDelivery(record)}>
            {value}
          </Button>
        ),
      },
      {
        width: 150,
        name: 'skuCode',
      },
      {
        // width: 100,
        name: 'skuName',
      },
      {
        width: 100,
        name: 'viewQuantityMeaning',
        align: 'right',
      },
      {
        width: 100,
        name: 'consignmentCancelQuantityMeaning',
        align: 'right',
      },
      {
        width: 150,
        name: 'shippedTime',
      },
      {
        width: 150,
        name: 'completedTime',
      },
    ];
    const jieshouColumns = [
      {
        width: 100,
        name: 'receiptStatusMeaning',
        renderer: ({ value, record }) => <span style={receiveColor(record)}>{value}</span>,
      },
      {
        width: 100,
        name: 'operation',
        renderer: ({ record }) => (
          <span className="action-link">
            {/* <span>{intl.get('smodr.orderLine.model.newExamine').d('关联单据')}</span> */}
            <Button
              color="primary"
              funcType="link"
              onClick={() => handleOpenModal('jieshou', record)}
            >
              {intl.get('smodr.orderLine.model.history').d('操作记录')}
            </Button>
          </span>
        ),
      },
      {
        width: 200,
        name: 'receiptCode',
        renderer: ({ value, record }) => (
          <Button color="primary" funcType="link" onClick={() => handleToAccept(record)}>
            {value}
          </Button>
        ),
      },
      {
        width: 150,
        name: 'skuCode',
      },
      {
        // width: 100,
        name: 'skuName',
      },
      {
        width: 120,
        name: 'viewQuantityMeaning',
        align: 'right',
      },
      {
        width: 150,
        name: 'receiptedTime',
      },
    ];
    const duizhangColumns = [
      {
        width: 100,
        name: 'statementsStatusMeaning',
        renderer: ({ value, record }) => <span style={stateColor(record)}>{value}</span>,
      },
      {
        width: 100,
        name: 'operation',
        renderer: ({ record }) => (
          <span className="action-link">
            {/* <span>{intl.get('smodr.orderLine.model.newExamine').d('关联单据')}</span> */}
            <Button
              color="primary"
              funcType="link"
              onClick={() => handleOpenModal('duizhang', record)}
            >
              {intl.get('smodr.orderLine.model.history').d('操作记录')}
            </Button>
          </span>
        ),
      },
      {
        width: 200,
        name: 'statementsCode',
        renderer: ({ value, record }) => (
          <Button color="primary" funcType="link" onClick={() => handleToStatement(record)}>
            {value}
          </Button>
        ),
      },
      {
        width: 200,
        name: 'skuCode',
      },
      {
        // width: 150,
        name: 'skuName',
      },
      {
        width: 100,
        name: 'viewQuantityMeaning',
        align: 'right',
      },
      {
        width: 120,
        name: 'lastUpdateDate',
      },
    ];
    const shouhouColumns = [
      {
        width: 120,
        name: 'afterSaleStatusMeaning',
        renderer: ({ value, record }) => <span style={afterColor(record)}>{value}</span>,
      },
      {
        width: 100,
        name: 'operation',
        renderer: ({ record }) => (
          <span className="action-link">
            {/* <span>{intl.get('smodr.orderLine.model.newExamine').d('关联单据')}</span> */}
            <Button
              color="primary"
              funcType="link"
              onClick={() => handleOpenModal('shouhou', record)}
            >
              {intl.get('smodr.orderLine.model.history').d('操作记录')}
            </Button>
          </span>
        ),
      },
      {
        width: 200,
        name: 'afterSaleCode',
        renderer: ({ value, record }) => (
          <Button color="primary" funcType="link" onClick={() => handleToAfterSale(record)}>
            {value}
          </Button>
        ),
      },
      {
        width: 150,
        name: 'skuCode',
      },
      {
        // width: 150,
        name: 'skuName',
      },
      {
        width: 80,
        name: 'viewQuantityMeaning',
        align: 'right',
      },
      {
        width: 100,
        name: 'afterSaleTypeMeaning',
      },
      {
        width: 150,
        name: 'afterSaleTime',
      },
    ];
    const quxiaoColumns = [
      {
        width: 80,
        name: 'cancelStatusMeaning',
        renderer: ({ value, record }) => <span style={color(record)}>{value}</span>,
      },
      {
        width: 100,
        name: 'operation',
        renderer: ({ record }) => (
          <span className="action-link">
            {/* <span>{intl.get('smodr.orderLine.model.newExamine').d('关联单据')}</span> */}
            <Button
              color="primary"
              funcType="link"
              onClick={() => handleOpenModal('quxiao', record)}
            >
              {intl.get('smodr.orderLine.model.history').d('操作记录')}
            </Button>
          </span>
        ),
      },
      {
        width: 200,
        name: 'orderCode',
        renderer: ({ value, record }) => (
          <Button color="primary" funcType="link" onClick={() => handleToDetail(record)}>
            {value}
          </Button>
        ),
      },
      {
        width: 150,
        name: 'skuCode',
      },
      {
        // width: 100,
        name: 'skuName',
      },
      {
        width: 120,
        name: 'viewQuantityMeaning',
        align: 'right',
      },
      {
        width: 120,
        name: 'cancelReason',
      },
      {
        width: 150,
        name: 'lastUpdateDate',
      },
    ];
    return (
      <div
        className={classnames(styles.relModal, {
          [styles.relModalHeight]: showRelation,
        })}
      >
        <div
          className={styles.anchorIcon}
          onClick={() => handleRelationShow(!showRelation, currentRow)}
        >
          <Icon
            type="baseline-arrow_drop_down"
            style={{ marginTop: -10 }}
            className={classnames({ [styles.anchorIconLeft]: !showRelation })}
          />
        </div>
        <div className={classnames({ [styles.modalContentWrap]: showRelation })}>
          <div
            className={classnames(styles.modalContent, {
              [styles.modalContentBottom]: showRelation,
            })}
          >
            <Tabs onChange={(key) => this.handleExtension(infoRecord, key)} activeKey={type}>
              <TabPane tab={intl.get('smodr.orderDetail.model.quxiao').d('取消信息')} key="quxiao">
                <Table dataSet={tableDs} columns={quxiaoColumns} />
              </TabPane>
              <TabPane tab={intl.get('smodr.orderDetail.model.yuzhan').d('预占信息')} key="yuzhan">
                <Table dataSet={tableDs} columns={yuzhanColumns} />
              </TabPane>
              <TabPane tab={intl.get('smodr.orderDetail.model.shenpi').d('审批信息')} key="shenpi">
                <Table dataSet={tableDs} columns={shenpiColumns} />
              </TabPane>
              <TabPane
                tab={intl.get('smodr.orderDetail.model.peisong').d('配送信息')}
                key="peisong"
              >
                <Table dataSet={tableDs} columns={peisongColumns} />
              </TabPane>
              <TabPane
                tab={intl.get('smodr.orderDetail.model.jieshou').d('接收信息')}
                key="jieshou"
              >
                <Table dataSet={tableDs} columns={jieshouColumns} />
              </TabPane>
              <TabPane
                tab={intl.get('smodr.orderDetail.model.shouhou').d('售后信息')}
                key="shouhou"
              >
                <Table dataSet={tableDs} columns={shouhouColumns} />
              </TabPane>
              <TabPane
                tab={intl.get('smodr.orderDetail.model.duizhang').d('对账信息')}
                key="duizhang"
              >
                <Table dataSet={tableDs} columns={duizhangColumns} />
              </TabPane>
            </Tabs>
          </div>
        </div>
      </div>
    );
  }
}
