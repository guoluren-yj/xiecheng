/* eslint-disable no-return-assign */
import React from 'react';
import { connect } from 'dva';
import { DataSet, Button, Modal, TextField } from 'choerodon-ui/pro';
import { Icon, Tag } from 'choerodon-ui';
import { Bind, Debounce } from 'lodash-decorators';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import qs from 'querystring';
import moment from 'moment';

import DocFlow from '_components/DocFlow';
import SearchBarTable from '_components/SearchBarTable';
import intl from 'utils/intl';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import { SMALL_ORDER } from '_utils/config';
import { queryMapIdpValue } from 'hzero-front/lib/services/api';
import getHelpText from '@/routes/oms/OrderLineManage/HelpText';
import { fetchApproveRecord, fetchAfsApproveRecord, fetchReceiptApproveRecord } from '@/services/oms/orderLineManageService';
import ViewFilter from '@/components/ViewFilter';
import { fetchData } from '@/services/oms/relevanceDrawService';
import c7nModal from '@/utils/c7nModal';
import DrawContent from '@/routes/oms/RelevanceDrawer/content';
import { getShowDoc } from '@/components/ShowDoc/index.ts';
import StatusDetail from './statusDetail';

import openRecords from './TimeRecord';
import { ds } from './ExtensionTable/ds';
import ExecuteStatusModal from './ExecuteStatusModal';

import {
  color,
  preemColor,
  approveColor,
  shipmentColor,
  receiveColor,
  afterColor,
  stateColor,
  invoiceColor,
  statusObj, // 同步状态
} from './colorRender';

import styles from './index.less';

const organizationId = getCurrentOrganizationId();
@withCustomize({
  unitCode: ['SMODR.ORDER.ENTRY.SELECT', 'SMODR.ORDER.ENTRY.BTNS'],
})
@formatterCollections({
  code: ['smodr.orderLine', 'smodr.common', 'smodr.payment', 'smodr.orderDetail', 'smodr.invoice', 'smodr.acceptOrder'],
})
@connect(({ orderLineManage, relevanceDrawer }) => ({
  orderLineManage,
  relevanceDrawer,
}))
export default class OrderLineDetail extends React.Component {
  constructor(props) {
    super(props);
    const { orderCode = null } = props;
    props.onRef(this);
    this.state = {
      orderCode,
      // 全部查看明细行跳转 || 详情页返回保留搜索框筛选条件
      detailValue: orderCode ? [orderCode] : this.getDetailInitQueryParam(),
      approveRecord: [],
      aggregation: false,
      showDocFlow: {},
    };
  }

  // 返回内容
  res = {};

  componentDidMount() {
    queryMapIdpValue({
      cancelStatusMeaning: 'S2FUL.CANCEL_STATUS', // 取消状态
      statementsStatusMeaning: 'S2FUL.STATEMENTS_STATUS', // 对账状态
      preemptionStatusMeaning: 'S2FUL.PREEMPT_STATUS', // 预占状态
      shipmentStatusMeaning: 'S2FUL.CONSIGNMENT_STATUS', // 配送状态
      receiveStatusMeaning: 'S2FUL.RECEIVE_STATUS', // 接收状态
      invoiceStatusMeaning: 'S2FUL.INVOICE_STATUS', // 开票状态
      approveStatusMeaning: 'S2FUL.APPROVAL_STATUS', // 审批状态
      afterSaleStatusMeaning: 'S2FUL.OMS_AFTER_SALE_STATUS', // 售后状态
    }).then(res => {
      this.res = res;
    });
    getShowDoc().then(res=>{
      this.setState({
        showDocFlow: res,
      });
    });
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.orderCode) {
      this.setState({ orderCode: nextProps.orderCode, detailValue: [nextProps.orderCode] }, () => {
        this.props.initDs.setQueryParameter('mergeQuery', nextProps.orderCode);
        this.props.initDs.setQueryParameter('mergeQueryList', null);
        this.props.initDs.query();
        // this.searchBarRef.setField(MergeFieldName, nextProps.orderCode);
      });
    }
  }

  searchBarRef;

  extenTable;

  exeModal;

  modalkey = Modal.key();

  @Bind()
  handleDrawRef(ref = {}) {
    this.Draw = ref;
  }

  getDetailInitQueryParam = () => {
    const detailDs = this.props.initDs;
    const param = detailDs.getQueryParameter('mergeQuery') || detailDs.getQueryParameter('mergeQueryList');
    if (param) {
      const splitVal = param?.split(/[,\s+]/).filter((v) => !!v);
      return splitVal;
    }
    return [];
  }

  @Bind()
  async fetchRecord(params, url, recordData) {
    const { batchNum, orderCode, approveType } = recordData?.toJSONData();
    if( approveType === 'EXTERNAL_APPROVAL') {
      openRecords({ params, url, recordData, approveRecord: [] });
      return;
    }
    const approveParam = { batchNum, orderCode, approveType };
    const res = getResponse(await fetchApproveRecord(approveParam));
    if (res && res.workflowApproveResponseMap) {
      const approveRecordList = Object?.values(res?.workflowApproveResponseMap)?.[0]?.reverse() || [];
      const approveRecordData = approveRecordList.map((i) => i?.historicTaskExtList?.reverse());
      const approveRecord = [];
      approveRecordData.forEach(i => {
        i.forEach(l => {
          approveRecord.push(l);
        });
      });
      this.setState({ approveRecord }, () => openRecords({ params, url, recordData, approveRecord }));
    } else {
      openRecords({ params, url, recordData, approveRecord: [] });
    }
  }

  @Bind()
  async fetchReceiptRecord(param, url, recordData) {
    const { approveType, receiptCode, ...params } = param;
    if(!approveType) {
      openRecords({ params: param, url, recordData, approveRecord: [] });
      return;
    }
    const approveParam = { receiptCode, approveType };
    const res = getResponse(await fetchReceiptApproveRecord(approveParam));
    if (res && res.workflowApproveResponseMap) {
      const approveRecordList = Object?.values(res?.workflowApproveResponseMap)?.[0]?.reverse() || [];
      const approveRecord = approveRecordList.reduce((pre, curr) => {
        const { historicTaskExtList = [] } = curr;
        const list = historicTaskExtList.reverse();
        pre.push(...list);
        return pre;
      }, []);;
      this.setState({ approveRecord }, () => openRecords({ params, url, recordData, approveRecord }));
    } else {
      openRecords({ params, url, recordData, approveRecord: [] });
    }
  }

  @Bind()
  async fetchAfsRecord(param, url, recordData) {
    const { approveType, afterSaleCode, ...params } = param;
    const approveParam = { afterSaleCode, approveType };
    const res = getResponse(await fetchAfsApproveRecord(approveParam));
    if (res && res.workflowApproveResponseMap) {
      const approveRecordList = Object?.values(res?.workflowApproveResponseMap)?.[0]?.reverse() || [];
      const approveRecordData = approveRecordList.map((i) => i?.historicTaskExtList?.reverse());
      const approveRecord = [];
      approveRecordData.forEach(i => {
        i.forEach(l => {
          approveRecord.push(l);
        });
      });
      this.setState({ approveRecord }, () => openRecords({ params, url, recordData, approveRecord }));
    } else {
      openRecords({ params, url, recordData, approveRecord: [] });
    }
  }

  // 查看历史记录
  @Bind()
  handleOpenModal(type = '', record = {}, recordData = undefined) {
    let params = {};
    let url = '';
    const {
      orderEntryId,
      afterSaleId,
      afterSaleCode,
      statementsEntryId,
      receiptEntryId,
      consignmentEntryId,
      invoiceReqId,
      approveType,
      receiptCode,
    } = record.toData();
    const historyType = type;
    const { approveRecord } = this.state;
    switch (historyType) {
      case 'shenpi':
        params = {
          orderEntryId,
          operationType: 'APPROVE',
        };
        url = `${SMALL_ORDER}/v1/${organizationId}/order-entry-records`;
        this.fetchRecord(params, url, recordData);
        return;
      case 'yuzhan':
        params = {
          orderEntryId,
          operationType: 'PREEMPT',
        };
        url = `${SMALL_ORDER}/v1/${organizationId}/order-entry-records`;
        break;
      case 'peisong':
        params = {
          consignmentEntryId,
          operationType: 'CONSIGNMENT',
        };
        url = `${SMALL_ORDER}/v1/${organizationId}/consignment-entry-records`;
        break;
      case 'jieshou':
        params = {
          receiptCode,
          approveType,
          receiptEntryId,
          operationType: 'RECEIPT',
        };
        url = `${SMALL_ORDER}/v1/${organizationId}/receipt-entry-records`;
        this.fetchReceiptRecord(params, url, recordData);
        return;
      case 'duizhang':
        params = {
          statementsEntryId,
          operationType: 'STATEMENT',
        };
        url = `${SMALL_ORDER}/v1/${organizationId}/statements-entry-records`;
        break;
      case 'shouhou':
        params = {
          afterSaleId,
          afterSaleCode,
          approveType,
          operationType: 'AFTER',
        };
        url = `${SMALL_ORDER}/v1/${organizationId}/after-sale-records`;
        this.fetchAfsRecord(params, url, recordData);
        return;
      case 'quxiao':
        params = {
          orderEntryId,
          operationType: 'CANCEL',
        };
        url = `${SMALL_ORDER}/v1/${organizationId}/order-entry-records`;
        break;
      case 'invoice':
        params = {
          invoiceRequestId: invoiceReqId,
          operationType: 'INVOICE',
        };
        url = `${SMALL_ORDER}/v1/${organizationId}/invoice-request-records`;
        break;
      default:
        break;
    }
    openRecords({ params, url, recordData, approveRecord });
  }

  // 跳转订单详情页
  @Bind()
  handleToDetail(record = {}) {
    const { push } = this.props;
    push({
      pathname: '/s2-mall/oms/order-line/order-detail',
      search: qs.stringify({
        orderId: record.get('orderId'),
        backPath: '/s2-mall/oms/order-line/list',
      }),
    });
  }

  @Bind()
  handRef(ref = {}) {
    this.extenTable = ref;
  }

  // 拓展信息
  @Bind()
  handleExtensionInfo(record = {}, type) {
    this.setState({ infoRecord: record });
    const orderEntryId = record.get('orderEntryId');
    const tableDs = new DataSet(ds(type, orderEntryId));
    // eslint-disable-next-line no-unused-expressions
    this.extenTable?.setState({ tableDs });
    this.setState({
      type,
      orderEntryId,
    });
    this.handleRelationShow(true);
  }

  @Bind()
  @Debounce(300)
  async openExtenDraw(record) {
    const orderEntryId = record.get('orderEntryId');
    const res = getResponse(await fetchData(orderEntryId));
    const modal = c7nModal({
      title: intl.get('smodr.orderLine.model.newExamine').d('关联单据'),
      children: <DrawContent data={res} />,
      style: { width: 380 },
      key: this.modalkey,
      footer: (
        <Button
          onClick={() => modal?.close()}
          color='primary'
        >
          {intl.get('smodr.orderLine.model.close').d('关闭')}
        </Button>
      ),
    });
  }

  @Bind()
  handleRelationShow(showFlag, row) {
    this.setState({ showRelation: showFlag, currentRow: row });
  }

  @Bind()
  openExeCuteDraw(record) {
    this.setState({});
    const exeModal = c7nModal({
      title: intl.get('smodr.orderLine.model.checkDoStatus').d('查看执行状态'),
      key: '1',
      children: <ExecuteStatusModal recordData={record} handleOpenModal={this.handleOpenModal} />,
      style: { width: 1000 },
      bodyStyle: { padding: 0 },
      footer: (
        <Button onClick={() => exeModal?.close()} color="primary">
          {intl.get('smodr.orderLine.model.close').d('关闭')}
        </Button>
      ),
    });
  }

  @Bind()
  handleQueryChange(val) {
    if (val) {
      let newVal = [];
      val.forEach((f) => {
        const splitVal = f?.split(/[,\s+]/).filter((v) => !!v);
        newVal = newVal.concat(splitVal);
      });
      this.setState({ detailValue: newVal }, () => {
        if (newVal.length === 1) {
          this.props.initDs.setQueryParameter('mergeQuery', newVal[0]);
          this.props.initDs.setQueryParameter('mergeQueryList', null);
        } else {
          this.props.initDs.setQueryParameter('mergeQuery', null);
          this.props.initDs.setQueryParameter('mergeQueryList', newVal.join(','));
        }
      });
    } else {
      this.setState({ detailValue: val });
      this.props.initDs.setQueryParameter('mergeQuery', null);
      this.props.initDs.setQueryParameter('mergeQueryList', null);
    }
    this.props.initDs.query();
  }

  openStatusDetail(record) {
    if (record.get('exportStatus') === 'no_synchronization_required') {
      return null;
    }
    Modal.open({
      title: intl.get('smodr.orderLine.title.exportStatus').d('状态明细'),
      destroyOnClose: true,
      drawer: true,
      style: { width: 1090 },
      okText: intl.get('hzero.common.button.close').d('关闭'),
      okCancel: false,
      children: <StatusDetail recordDs={record} />,
    });
  }

  render() {
    const { customizeTable } = this.props;
    const { orderCode, detailValue, aggregation, showDocFlow } = this.state;
    const doubleUnitFlag = ({ record }) => {
      return ((record.get('orderTypeCode') === 'MANUAL' || (record.get('cecFromCode') === 'CATA' && record.get('skuType') === 'CUSTOM'))) && record.get('dualFlag') === true;
    };
    let columns = [
      {
        name: 'exportStatus',
        type: 'string',
        width: 120,
        label: intl.get('smodr.orderLine.model.synchronizationStatus').d('同步状态'),
        renderer: ({ value, record }) => {
          const noSync = value === 'no_synchronization_required';
          return (
            <Tag
              style={{ border: 'none', cursor: noSync ? 'default' : 'pointer' }}
              color={statusObj(value).color}
              onClick={() => this.openStatusDetail(record)}
            >
              {statusObj(value).text}
              {!noSync && <Icon type='wysiwyg' style={{ fontSize: 14, marginLeft: 4, fontWeight: 'normal' }} />}
            </Tag>
          );
        },
      },
      {
        width: aggregation ? 100 : 190,
        name: 'operation',
        align: 'left',
        className: aggregation ? '' : styles['action-link-btns'],
        command: ({ record }) => [
          <Button
            color="primary"
            funcType="link"
            onClick={() =>
              this.setState({ infoRecord: record }, () => this.openExeCuteDraw(record))
            }
          >
            {intl.get('smodr.orderLine.model.checkDoStatus').d('查看执行状态')}
          </Button>,
          record.get('agreementBusinessType') !== 'RECEIVE' && (
            <Button
              color="primary"
              funcType="link"
              onClick={() =>
                this.setState({ infoRecord: record }, () => this.openExtenDraw(record))
              }
            >
              {intl.get('smodr.orderLine.model.newExamine').d('关联单据')}
            </Button>
          ),
          this.props?.remoteRender?.render('DOWNLOAD_RECEIPT_DOC_BUTTON', '', {
            record: record.toData(),
          }),
        ],
      },
      {
        name: 'orderInfo',
        title: intl.get('smodr.orderLine.view.orderInfo').d('订单信息'),
        minWidth: 300,
        children: [
          {
            width: 250,
            name: 'orderCodeLine',
            renderer: ({ value, record }) => <a onClick={() => this.handleToDetail(record)}>{value}</a>,
          },
          {
            name: 'orderMarkMeaning',
            hidden: true,
          },
          {
            width: 80,
            name: 'agreementBusinessTypeMeaning',
            hidden: true,
          },
        ],
      },
      {
        name: 'skuInfo',
        title: intl.get('smodr.orderLine.view.skuInfo').d('商品信息'),
        width: 150,
        children: [
          {
            width: 150,
            name: 'skuCode',
          },
          {
            width: 150,
            name: 'skuName',
          },
          {
            name: 'skuTypeMeaning',
          },
          {
            width: 100,
            name: 'originalQuantityMeaning',
            align: 'right',
            renderer: ({ record, text }) => {
              const flag = doubleUnitFlag({ record });
              if (flag) {
                return <span>{record.get('originalPackageQuantityMeaning')}</span>;
              } else {
                return <span>{text}</span>;
              }
            },
          },
          {
            width: 100,
            name: 'uom',
            hidden: true,
            renderer: ({ record, text }) => {
              const flag = doubleUnitFlag({ record });
              if (flag) {
                return <span>{record.get('customUom')}</span>;
              } else {
                return <span>{text}</span>;
              }
            },
          },
        ],
      },
      {
        name: 'priceInfo',
        title: intl.get('smodr.orderLine.view.priceInfo').d('金额信息'),
        width: 150,
        children: [
          {
            width: 120,
            name: 'unitPriceMeaning',
            align: 'right',
            renderer: ({ record, text }) => {
              const flag = doubleUnitFlag({ record });
              if (flag) {
                return <span>{record.get('packageUnitPriceMeaning')}</span>;
              } else {
                return <span>{text}</span>;
              }
            },
          },
          {
            width: 120,
            name: 'unitNakedPriceMeaning',
            align: 'right',
            hidden: true,
            renderer: ({ record, text }) => {
              const flag = doubleUnitFlag({ record });
              if (flag) {
                return <span>{record.get('packageUnitNakedPriceMeaning')}</span>;
              } else {
                return <span>{text}</span>;
              }
            },
          },
          {
            width: 120,
            name: 'entryAmountMeaning',
            align: 'right',
          },
          {
            width: 120,
            name: 'nakedPriceMeaning',
            align: 'right',
            hidden: true,
          },
          {
            width: 100,
            name: 'taxRateMeaning',
            align: 'right',
            hidden: true,
          },
          {
            width: 100,
            name: 'currencyName',
            hidden: true,
          },
          {
            name: 'per',
            width: 100,
          },
        ],
      },
      {
        name: 'executeInfo',
        title: intl.get('smodr.orderLine.view.executeInfo').d('执行信息'),
        width: 150,
        className: styles['execute-Info-column'],
        children: [
          {
            name: 'docFlow',
            width: 100,
            hidden: !showDocFlow.displayDocFlow,
            renderer: ({ record }) =>
              record.get('documentFlowFlag') ? (
                <DocFlow
                  tableName="s2ful_order_entry"
                  tablePk={record.get('orderEntryId')}
                  buttonType="button"
                />
              ) : (
                <span>-</span>
              ),
          },
          {
            width: 90,
            name: 'cancelStatusMeaning',
            renderer: ({ value, record }) => <Tag color={color(record)} style={{ border: 'none' }}>{value}</Tag>,
            help: () => getHelpText('cancelStatusMeaning', this.res),
          },
          {
            width: 90,
            name: 'preemptionStatusMeaning',
            renderer: ({ value, record }) => <Tag color={preemColor(record)} style={{ border: 'none' }}>{value}</Tag>,
            help: () => getHelpText('preemptionStatusMeaning', this.res),
          },
          {
            width: 90,
            name: 'approveStatusMeaning',
            renderer: ({ value, record }) => <Tag color={approveColor(record)} style={{ border: 'none' }}>{value}</Tag>,
            help: () => getHelpText('approveStatusMeaning', this.res),
          },
          {
            width: 90,
            name: 'shipmentStatusMeaning',
            renderer: ({ value, record }) => <Tag color={shipmentColor(record)} style={{ border: 'none' }}>{value}</Tag>,
            help: () => getHelpText('shipmentStatusMeaning', this.res),
          },
          {
            width: 90,
            name: 'receiveStatusMeaning',
            renderer: ({ value, record }) => <Tag color={receiveColor(record)} style={{ border: 'none' }}>{value}</Tag>,
            help: () => getHelpText('receiveStatusMeaning', this.res),
          },
          {
            width: 90,
            name: 'afterSaleStatusMeaning',
            renderer: ({ value, record }) => <Tag color={afterColor(record)} style={{ border: 'none' }}>{value}</Tag>,
            help: () => getHelpText('afterSaleStatusMeaning', this.res),
          },
          {
            width: 90,
            name: 'statementsStatusMeaning',
            renderer: ({ value, record }) => <Tag color={stateColor(record)} style={{ border: 'none' }}>{value}</Tag>,
            help: () => getHelpText('statementsStatusMeaning', this.res),
          },
          {
            width: 90,
            name: 'invoiceStatusMeaning',
            renderer: ({ value, record }) => <Tag color={invoiceColor(record)} style={{ border: 'none' }}>{value}</Tag>,
            help: () => getHelpText('invoiceStatusMeaning', this.res),
          },
        ],
      },
      {
        name: 'personInfo',
        title: intl.get('smodr.orderLine.view.personInfo').d('交易双方信息'),
        minWidth: 200,
        children: [
          {
            width: 200,
            name: 'purchaseCompanyName',
            renderer: ({ value, record }) => (
              <span>
                {record.get('agreementType') === 'SALE'
                  ? record.get('proxySupplierCompanyName')
                  : value}
              </span>
            ),
          },
          {
            width: 200,
            name: 'supplierCompanyName',
          },
        ],
      },
      {
        name: 'orderDetailInfo',
        title: intl.get('smodr.orderLine.view.orderDetailInfo').d('下单信息'),
        width: 190,
        children: [
          {
            width: 100,
            name: 'buyerName',
          },
          {
            width: 150,
            name: 'cecCreatedTime',
          },
        ],
      },
      {
        width: 100,
        name: 'buyerName',
      },
      {
        width: 100,
        name: 'unitCode',
      },
      {
        width: 100,
        name: 'unitName',
      },
      {
        name: 'ouName',
        width: 120,
        title: intl.get('smodr.orderDetail.model.ouName').d('业务实体'),
      },
      {
        name: 'purOrganizationName',
        width: 120,
        title: intl.get('smodr.orderDetail.model.purchaseOrg').d('采购组织'),
      },
      {
        name: 'sourceInfo',
        title: intl.get('smodr.orderLine.view.sourceInfo').d('来源信息'),
        width: 200,
        children: [
          {
            width: 150,
            name: 'orderSourceFromMeaning',
            // hidden: true,
          },
          {
            width: 150,
            name: 'sourceOrderCodeLine',
            // hidden: true,
          },
        ],
      },
    ];
    columns = this.props?.remoteRender?.process('SMODR_ORDER_MANAGE_DETAIL_COLUMN', columns, {
      initDs: this.props.initDs,
      doubleUnitFlag,
    });
    const resetQueryDs = () => {
      this.props.initDs.reset();
      this.props.initDs.setQueryParameter('mergeQuery', null);
      this.props.initDs.setQueryParameter('mergeQueryList', null);
      this.setState({ detailValue: null });
    };
    return (
      <React.Fragment>
        <div style={{ height: 'calc(100vh - 260px)' }}>
          {customizeTable(
            {
              code: 'SMODR.ORDER.ENTRY.SELECT',
            },
            <SearchBarTable
              style={{ maxHeight: `calc(100% - 22px)` }}
              dataSet={this.props.initDs}
              columns={columns}
              aggregation={aggregation}
              onAggregationChange={(_aggregation) => {
                this.setState({ aggregation: _aggregation });
              }}
              cacheState
              searchCode="SMODR.ORDER.ENTRY.QUERY"
              searchBarRef={(ref) => (this.searchBarRef = ref)}
              searchBarConfig={{
                onLoad: () => {
                  // this.searchBarRef.setField(MergeFieldName, orderCode);
                  if (orderCode) {
                    this.props.initDs.setQueryParameter('mergeQuery', orderCode);
                    this.props.initDs.setQueryParameter('mergeQueryList', null);
                    this.props.initDs.query();
                  }
                },
                fieldProps: {
                  cecCreatedTime: {
                    required: true,
                    defaultValue: () =>
                      [moment().subtract(6, 'month').startOf('day').format('YYYY-MM-DD HH:mm:ss'), moment(new Date()).endOf('day').format('YYYY-MM-DD HH:mm:ss')],
                  },
                },
                onClear: resetQueryDs,
                onReset: resetQueryDs,
                left: {
                  render: () => (
                    <TextField
                      multiple
                      valueChangeAction="blur"
                      value={detailValue}
                      style={{ width: '300px' }}
                      prefix={<Icon type="search" />}
                      placeholder={intl
                        .get('smodr.orderLine.view.searchDetailTipss')
                        .d('请输入商城订单编码-行号查询')}
                      onChange={(val) => this.handleQueryChange(val)}
                    />
                  ),
                },
                right: {
                  render: () => (
                    <ViewFilter
                      aggregation={aggregation}
                      onAggregationChange={(_aggregation) => {
                        this.setState({ aggregation: _aggregation });
                      }}
                    />
                  ),
                },
              }}
            />
          )}
        </div>
      </React.Fragment>
    );
  }
}
