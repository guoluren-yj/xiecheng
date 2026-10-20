/*
 * @Description:
 * @Date: 2021-05-01 09:20:13
 * @author: zuoxiangyu <xiangyu.zuo@going-link.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2020, Hand
 */
import React, { Fragment, Component } from 'react';
import { DataSet, Table } from 'choerodon-ui/pro';
import { Icon, Spin } from 'choerodon-ui';
import { math } from 'choerodon-ui/dataset';
import { dateRender } from 'utils/renderer';
import { getResponse } from 'utils/utils';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { getPermissions } from '../../../../services/ReceipWorkbenchService';
import { tableDS } from './expIndexDS';
import { useDoubleUomConfig } from '@/routes/components/utils/index';

@useDoubleUomConfig()
@formatterCollections({
  code: [
    'sinv.common',
    'sinv.receiptWorkbench',
    'hzero.common',
    'entity.company',
    'sinv.receiptExecution',
  ],
})
class Process extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showMoreFlag: true, // 是否显示更多信息
      showButtonFlag: false, // 超过三条是否显示按钮
    };
  }

  tableDs = new DataSet(tableDS());

  async componentDidMount() {
    const {
      dataGather,
      node: { nodeConfigId },
    } = this.props;
    const { sourceHeaderNum, sourceLineNum } = dataGather;
    // 拿到permissionList
    this.tableDs.setQueryParameter('params', {
      size: 3,
      nodeConfigId,
      sourceHeaderNum,
      sourceLineNum,
    });
    const res = getResponse(await this.tableDs.query());
    if (res?.content?.length && res?.content?.length >= 3) {
      this.setState({
        showButtonFlag: true,
      });
    }
  }

  moreInfo = async () => {
    const {
      dataGather: { sourceHeaderNum, sourceLineNum },
      node: { nodeConfigId },
    } = this.props;
    this.tableDs.setQueryParameter('params', {
      nodeConfigId,
      sourceHeaderNum,
      sourceLineNum,
      size: 99,
    });
    const res = getResponse(await this.tableDs.query());
    if (res?.content?.length && res?.content?.length >= 3) {
      this.setState({
        showButtonFlag: true,
      });
    }
    this.setState({
      showMoreFlag: false,
    });
  };

  lessInfo = async () => {
    const {
      dataGather: { sourceHeaderNum, sourceLineNum },
      node: { nodeConfigId },
    } = this.props;
    this.tableDs.setQueryParameter('params', {
      nodeConfigId,
      sourceHeaderNum,
      sourceLineNum,
      size: 3,
    });
    const res = getResponse(await this.tableDs.query());
    if (res?.content?.length && res?.content?.length > 3) {
      this.setState({
        showButtonFlag: true,
      });
    }
    this.setState({
      showMoreFlag: true,
    });
  };

  /*
   * 待收货-流程-modal-列表数据
   */
  getColumns = () => {
    const { dataGather, doubleUnitEnabled } = this.props;
    const columns = [
      {
        name: 'displayTrxHeaderAndLineNum',
        width: 170,
        align: 'left',
        renderer: ({ value }) => {
          // const { sourcePage = 'three', commonToDetail } = this.props;
          if (value) {
            return (
              // <a
              //   onClick={() =>
              //     commonToDetail('TRX', record, {
              //       detailType: 'END',
              //       from: sourcePage,
              //       viewType: 'flat',
              //     })
              //   }
              // >
              value
              // </a>
            );
          }
        },
      },
      {
        name: 'rcvTypeName',
        width: 90,
        align: 'left',
        className: 'rcvTypeName',
      },
      doubleUnitEnabled && {
        name: 'secondaryQuantity',
        width: 140,
        align: 'right',
      },
      {
        name: 'quantity',
        width: 120,
        align: 'right',
      },
      {
        name: 'taxIncludedAmount',
        align: 'right',
        width: 120,
        renderer: ({ value }) => (dataGather.hidePriceFlag === 1 ? '***' : value),
      },
      {
        name: 'returnedFlag',
        width: 110,
        align: 'left',
        renderer: ({ value }) => {
          if (value === 0) {
            return intl.get('sinv.receiptExecution.model.receipt.aog').d('收货');
          } else if (value === 1) {
            return intl.get('sinv.receiptExecution.model.receipt.returnUps').d('退货');
          }
        },
      },
      {
        name: 'trxDate',
        width: 164,
        align: 'left',
        renderer: ({ value }) => dateRender(value),
      },
    ];
    return columns;
  };

  render() {
    const { node, index, arr } = this.props;
    const { showMoreFlag, showButtonFlag } = this.state;
    const tableProps = {
      virtual: false,
      showHeader: false,
      pagination: false,
      virtualCell: false,
      dataSet: this.tableDs,
      columns: this.getColumns(),
    };
    const { quantity, quantityPercent, nodeConfigName } = node;
    const _quantityPercent = math.isNaN(math.toFixed(math.multipliedBy(quantityPercent, 100), 0))
      ? 0
      : math.toFixed(math.multipliedBy(quantityPercent, 100), 0);
    const _quantity = math.isNaN(quantity) ? 0 : quantity;
    return (
      <div className="wrapper">
        <div className="node">
          <div className="name">{nodeConfigName}</div>
          <div className="percent">
            {_quantity} / {_quantityPercent}%
          </div>
          <div className="point">
            {quantityPercent === 1 ? (
              <Icon type="finished" className="finished" />
            ) : (
              <div className="circle">{index + 1}</div>
            )}
          </div>
          {index !== arr.length - 1 && (
            <div className={quantityPercent === 1 ? 'line finished' : 'line'} />
          )}
        </div>
        <div className="content">
          <Table {...tableProps} className="exp-table" />
          {showButtonFlag &&
            (showMoreFlag ? (
              <div className="more">
                <a onClick={this.moreInfo}>
                  {intl.get('sinv.receiptWorkbench.model.moreInfo').d('更多信息')}
                  <Icon type="expand_more" />
                </a>
              </div>
            ) : (
              <div className="less">
                <a onClick={this.lessInfo}>
                  {intl.get('sinv.receiptWorkbench.model.lessInfo').d('收起更多')}
                  <Icon type="expand_less" />
                </a>
              </div>
            ))}
          <div className="bottom-line" />
        </div>
      </div>
    );
  }
}
export default class Index extends Component {
  constructor(props) {
    super(props);
    const { Ref = (e) => e } = props;
    Ref(this);
    this.state = {
      nodeList: [],
      noDataFlag: true,
      nodeListLoading: false,
    };
  }

  tableDs = new DataSet(tableDS());

  /** ************************************************ 默认事件 *********************************************************** */

  async componentDidMount() {
    const { dataGather } = this.props;
    const {
      data: { sourceHeaderNum, sourceLineNum, strategyHeaderId, rcvTrxLineId, sourceOrderType },
    } = dataGather;
    const res = getResponse(
      await getPermissions({ sourceHeaderNum, sourceLineNum, strategyHeaderId, rcvTrxLineId })
    );
    if (res && !res.failed && res.length) {
      this.setState({ nodeListLoading: true });
      this.setState({
        nodeList: res,
        nodeListLoading: false,
      });
    } else {
      this.setState({
        nodeListLoading: false,
      });
    }
    // 取首个node判断是否有数据
    if (Array.isArray(res) && res.length) {
      const nodeConfigId = res[0]?.nodeConfigId;
      this.tableDs.setQueryParameter('params', {
        size: 3,
        nodeConfigId,
        sourceHeaderNum,
        sourceLineNum,
        rcvTrxLineId,
        sourceOrderType,
      });
      const firstRes = getResponse(await this.tableDs.query());
      if (firstRes?.content?.length) {
        this.setState({
          noDataFlag: false,
        });
      }
    }
  }

  toDetail = (type, record) => {
    const { commonToDetail = (e) => e } = this.props;
    if (type === 'PC') {
      commonToDetail('PC', record);
    } else if (type === 'ASN') {
      commonToDetail('ASN', record);
    } else if (type === 'ORDER') {
      commonToDetail('PO', record);
    }
  };

  /** ************************************************ 渲染 *********************************************************** */
  render() {
    const { nodeList, nodeListLoading, noDataFlag } = this.state;
    const {
      dataGather,
      onClose = (e) => e,
      commonToDetail,
      sourcePage,
      doubleUnitEnabled,
    } = this.props;
    const noDataRender = (
      <div className="no-data">
        {intl.get('hzero.common.components.noticeIcon.null').d('暂无数据')}
      </div>
    );
    return (
      <Fragment>
        {/* <Sidebar {...modalProps}> */}
        <Spin spinning={nodeListLoading}>
          <div className="exp-list">
            <div className="exp-item nodeConfigId center">
              {intl.get('sinv.receiptWorkbench.model.receipt.nodeConfigId').d('节点')}
            </div>
            <div className="exp-item displayTrxHeaderAndLineNum left">
              {intl
                .get('sinv.receiptExecution.model.receipt.orderTypeName.receiptTrxNums')
                .d('收货单号-行号')}
            </div>
            <div className="exp-item rcvTypeName left">
              {intl.get('sinv.receiptWorkbench.model.receipt.rcvTypeReName').d('收货类型')}
            </div>
            {doubleUnitEnabled ? (
              <div className="exp-item secondaryAmount right">
                {intl.get(`sinv.receiptWorkbench.model.receipt.amount`).d('数量')}
              </div>
            ) : null}

            <div className="exp-item amount right">
              {doubleUnitEnabled
                ? intl.get(`sinv.receiptWorkbench.model.receipt.amount`).d('数量')
                : intl.get(`sinv.receiptWorkbench.model.receipt.secondaryAmount`).d('基本数量')}
            </div>

            <div className="exp-item receiptsAmount right">
              {intl.get('sinv.receiptWorkbench.model.receipt.receiptsAmount').d('单据金额')}
            </div>
            <div className="exp-item returnedFlag left">
              {intl.get('sinv.receiptExecution.model.receipt.ReturnedThings').d('收货/退货')}
            </div>
            <div className="exp-item trxDate left">
              {intl.get('sinv.receiptExecution.model.receipt.trxDate').d('实际操作日期')}
            </div>
            {/* <div className="exp-item">
                {intl.get('sinv.receiptWorkbench.model.receipt.rcvStatusCodeMeaning').d('事务状态')}
              </div> */}
          </div>
          {!noDataFlag
            ? nodeList.map((node, index, arr) => {
                const processProps = {
                  arr,
                  node,
                  index,
                  sourcePage,
                  commonToDetail,
                  onCancel: onClose,
                  dataGather: { ...dataGather.toData() },
                  doubleUnitEnabled,
                };
                return <Process key={node.nodeConfigId} {...processProps} />;
              })
            : noDataRender}
        </Spin>
        {/* </Sidebar> */}
      </Fragment>
    );
  }
}
