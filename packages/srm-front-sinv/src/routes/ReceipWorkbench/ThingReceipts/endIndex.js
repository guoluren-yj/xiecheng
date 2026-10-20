/* eslint-disable no-dupe-keys */
import React, { Fragment, Component } from 'react';
import { Popover, Tag, Icon } from 'choerodon-ui';
import { Select } from 'hzero-ui';
import intl from 'utils/intl';
import { stringify } from 'querystring';
import { isNil } from 'lodash';
import DocFlow from '_components/DocFlow';
import ImageList from '@/routes/components/ImageList';
import { filterNullValueObject, getCurrentOrganizationId } from 'utils/utils';
// import WithCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { dateTimeRender, yesOrNoRender } from 'utils/renderer';
import formatterCollections from 'utils/intl/formatterCollections';
import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';

import { c7nModal, ColorRender } from '../util';
import ExpIndex from './components/expIndex';
import ImportModal from './components/importModal';
import { dateRangeTransform } from '@/utils/utils';
import { showBigNumber, showSearchParams } from '@/routes/components/utils';
import { CustModal } from '@/routes/components/C7nCustomModal';
import MutlTextFieldSearch from '@/routes/components/MutlTextFieldSearch';
import RelationIndex from '../components/AssociatedDocuments/relationIndex';
import { RenderChat } from '../../components/Chat/index';
import style from '../index.less';
import styles from './components/expIndex.less';

const { Option } = Select;

// function getCustomize() {
//   const customizeList = [];
//   for (let i = 0; i < 11; i++) {
//     const index = String.fromCharCode(65 + i);
//     customizeList.push(
//       `SINV.RECEIPT_WORKBENCH_THING.END.DAN.${index}`,
//       `SINV.RECEIPT_WORKBENCH_THING.END.HAN.${index}`,
//       `SINV.RECEIPT_WORKBENCH_THING.END_SEARCH`
//     );
//   }
//   return customizeList;
// }
// @WithCustomize({
//   unitCode: getCustomize(),
//   queryMethod: 'POST',
// })
@formatterCollections({
  code: [
    'sinv.receiptWorkbench',
    'sinv.receiptExecution',
    'hzero.common',
    'sinv.purchaserDelivery',
    'entity.company',
  ],
})
export default class ReceiptExecution extends Component {
  constructor(props) {
    super(props);
    const { onRef = (e) => e } = props;
    // this指向List
    onRef(this);
    this.state = {
      queryparams: {},
    };
  }

  /** ************************************************ 事件方法 *********************************************************** */

  /**
   * 切换视图
   */
  handleChangeStatus = (type) => {
    const { handleChangeStatus } = this.props;
    handleChangeStatus(type);
  };

  // 已收货-导出状态
  operaClick = (record) => {
    const { rcvTrxLineId, rcvTrxHeaderId } = record?.data || {};
    c7nModal({
      style: { width: 742 },
      okCancel: false,
      okText: intl.get('hzero.common.button.close').d('关闭'),
      title: intl.get(`sinv.common.view.title.detailStatus`).d('状态明细'),
      children: (
        <ImportModal
          id={rcvTrxLineId}
          headerId={rcvTrxHeaderId}
          fetchDataSource={() => this.fetchReceiveTransactionDetails}
        />
      ),
    });
  };

  /**
   * fetchReceiveTransactionDetails - 获取列表数据
   * @param {Object} payload - 查询参数
   */
  fetchReceiveTransactionDetails = (page = {}, id) => {
    const { dispatch } = this.props;
    return dispatch({
      type: 'purchaseReceiptRecord/queryReceiveTransactionDetails',
      payload: {
        page,
        rcvTrxLineId: id,
      },
    });
  };

  // 显示流程框
  setShow = (record) => {
    const { fromOrderTypeName = '-', sourceHeaderNum = '', sourceLineNum = '' } = record.get([
      'fromOrderTypeName',
      'sourceHeaderNum',
      'sourceLineNum',
    ]);
    c7nModal({
      style: { width: 1090 },
      okCancel: false,
      className: styles['exp-modal'],
      okText: intl.get('hzero.common.button.close').d('关闭'),
      title: (
        <span>
          {`${intl
            .get('sinv.receiptWorkbench.model.view.title.rcvTypeDetail')
            .d('收货状态详情')}【${fromOrderTypeName}】`}
          {`${sourceHeaderNum || ''}-${sourceHeaderNum ? sourceLineNum : ''}`}
        </span>
      ),
      children: <ExpIndex dataGather={record} />,
    });
  };

  /*
   *关联单据信息-打开
   */
  handleOk = (record) => {
    c7nModal({
      style: { width: '1090px', height: '100%' },
      okCancel: false,
      bodyStyle: { padding: 0 },
      contentStyle: { maxHeight: '100%' },
      okText: intl.get('hzero.common.button.close').d('关闭'),
      title: intl.get('sinv.receiptExecution.model.receipt.associatedNum').d('关联单据信息'),
      children: <RelationIndex dataGather={record} />,
    });
  };

  // 渲染是否打印
  printRender = (value, record) => {
    const printTimes = record.get('printTimes');
    const pointStyle = {
      width: '6px',
      height: '6px',
      backgroundColor: '#ccc',
      borderRadius: '50%',
      display: 'inline-block',
      marginRight: '5px',
    };
    const lightStyle = {
      backgroundColor: '#3AB445',
    };
    const printstyle = value ? { ...pointStyle, ...lightStyle } : pointStyle;
    const text = value
      ? `${intl.get('sinv.receiptWorkbench.model.view.printed').d('已打印')}(${printTimes})`
      : intl.get('sinv.receiptWorkbench.model.view.noPrinted').d('未打印');
    return (
      <div>
        <div style={printstyle} />
        {text}
      </div>
    );
  };

  handleFieldChange = ({ value, name, record }) => {
    if (name === 'trxDataRange') {
      record.set('trxDate', dateRangeTransform(value, true));
    }
  };

  /** ************************************************ 列表字段 *********************************************************** */
  /*
   * 事务-已收货-按收货行
   */
  getColumns = () => {
    const { doubleUnitEnabled, history } = this.props;
    const columns = [
      {
        name: 'nodeConfigName',
        width: 100,
      },
      {
        name: 'displayTrxNum',
        width: 180,
        renderer: ({ record, value }) => {
          const { commonToDetail = (e) => e } = this.props;
          if (value) {
            return (
              <a
                onClick={() =>
                  commonToDetail('TRX', record, {
                    detailType: 'END',
                    from: 'three',
                    viewType: 'flat',
                  })
                }
              >
                {`${value}-${record.get('displayTrxLineNum')}`}
              </a>
            );
          }
        },
      },
      {
        name: 'itemCode',
        width: 170,
      },
      {
        name: 'itemName',
        width: 170,
      },
      doubleUnitEnabled && {
        name: 'secondaryUomId',
        width: 150,
        renderer: ({ record }) => record.get('secondaryUomName'),
      },
      {
        name: 'uomName',
        width: 135,
        header: doubleUnitEnabled
          ? intl.get('sinv.receiptExecution.model.receipt.baseUomName').d('基本单位')
          : intl.get('sinv.receiptExecution.model.receipt.uomName').d('单位'),
      },
      {
        name: 'supplierName',
        width: 180,
        renderer: ({ record }) =>
          record.get('supplierId') ? record.get('supplierName') : record.get('supplierCompanyName'),
      },
      {
        name: 'returnedFlag',
        width: 100,
        align: 'left',
        renderer: ({ value }) => {
          if (value === 0) {
            return intl.get('sinv.receiptExecution.model.receipt.aog').d('收货');
          } else if (value === 1) {
            return intl.get('sinv.receiptExecution.model.receipt.returnUps').d('退货');
          }
        },
      },
      doubleUnitEnabled && {
        name: 'secondaryQuantity',
        width: 110,
        renderer: ({ value }) => showBigNumber(value),
      },
      {
        name: 'quantity',
        width: 110,
        renderer: ({ value }) => showBigNumber(value),
        header: doubleUnitEnabled
          ? intl.get('sinv.receiptExecution.model.receipt.billBaseQuantity').d('单据基本数量')
          : intl.get('sinv.receiptExecution.model.receipt.quantity').d('单据数量'),
      },
      {
        name: 'taxIncludedAmount',
        width: 110,
        renderer: ({ value, record }) =>
          record.get('hidePriceFlag') === 1
            ? '***'
            : showBigNumber(value, record.get('financialPrecision')),
      },
      {
        name: 'rcvTypeName',
        width: 135,
      },
      {
        name: 'trxDate',
        width: 120,
      },
      {
        name: 'invOrganizationName',
        width: 140,
      },
      {
        name: 'inventoryName',
        width: 140,
      },
      {
        name: 'locationName',
        width: 140,
      },
      {
        name: 'productNum',
        width: 120,
      },
      {
        name: 'productName',
        width: 120,
      },
      {
        name: 'fromDisplayTrxNum',
        width: 150,
        renderer: ({ value, record }) => {
          if (value) {
            return (
              <a
                onClick={() => {
                  const {
                    fromReturnedFlag,
                    fromRcvTrxHeaderId,
                    fromNodeConfigIndexAbc,
                  } = record.get([
                    'fromReturnedFlag',
                    'fromRcvTrxHeaderId',
                    'fromNodeConfigIndexAbc',
                  ]);
                  const params = filterNullValueObject({
                    from: 'three',
                    viewType: 'flat',
                    isFromTrx: true,
                    nodeConfigIndexAbc: fromNodeConfigIndexAbc,
                    type: 'END',
                  });
                  const url = fromReturnedFlag
                    ? `/sinv/receipt-workbench/return-detail/${fromRcvTrxHeaderId}`
                    : `/sinv/receipt-workbench/detail/${fromRcvTrxHeaderId}`;
                  history.push({
                    pathname: url,
                    search: stringify(params),
                  });
                }}
              >
                {`${value}-${record.get('fromDisplayTrxLineNum')}`}
              </a>
            );
          }
        },
      },
      {
        name: 'fromDisplayPoNum',
        width: 150,
        renderer: ({ value, record }) => {
          if (value) {
            return `${value}-${record.get('fromDisplayPoLineNum')}`;
          }
        },
      },
      {
        name: 'fromDisplayAsnNum',
        width: 150,
        renderer: ({ value, record }) => {
          if (value) {
            return `${value}-${record.get('fromDisplayAsnLineNum')}`;
          }
        },
      },
      {
        name: 'fromPcNum',
        width: 150,
        renderer: ({ value, record }) => {
          if (value) {
            return `${value}-${record.get('fromPcSubjectNum')}`;
          }
        },
      },
      {
        name: 'fromOrderTypeName',
        width: 135,
      },
      {
        name: 'sourceStatusCode',
        width: 120,
        renderer: ({ value, record }) => {
          return <ColorRender value={value} record={record} setShow={this.setShow} />;
        },
      },
      {
        name: 'companyName',
        width: 120,
      },
      {
        name: 'creationName',
        width: 120,
      },
      {
        name: 'billMatchedFlag',
        width: 100,
        renderer: ({ value, record }) => {
          const text = record.get('billMatchedFlagMeaning');
          if (Number(value) === 1) {
            return (
              <Tag color="green" style={{ border: 'none' }}>
                {text}
              </Tag>
            );
          } else if (Number(value) === 0) {
            return (
              <Tag color="gray" style={{ border: 'none' }}>
                {text}
              </Tag>
            );
          }
        },
      },
      {
        name: 'invoiceMatchedStatusMeaning',
        width: 120,
        renderer: ({ value, record }) => {
          const code = record.get('invoiceMatchedStatus');
          if (code === 'INVOICE_COMPLETE') {
            return (
              <Tag color="green" style={{ border: 'none' }}>
                {value}
              </Tag>
            );
          } else if (code === 'UNINVOICED') {
            return (
              <Tag color="gray" style={{ border: 'none' }}>
                {value}
              </Tag>
            );
          } else {
            return (
              <Tag color="green" style={{ border: 'none' }}>
                {value}
              </Tag>
            );
          }
        },
      },
      {
        name: 'paymentStatusMeaning',
        width: 120,
        renderer: ({ value, record }) => {
          const code = record.get('paymentStatus');
          if (code === 'PAID') {
            return (
              <Tag color="green" style={{ border: 'none' }}>
                {value}
              </Tag>
            );
          } else {
            return (
              <Tag color="gray" style={{ border: 'none' }}>
                {value}
              </Tag>
            );
          }
        },
      },
      {
        name: 'importStatusMeaning',
        width: 120,
        renderer: ({ record, value }) => {
          let dom = null;
          const importStatus = record.get('importStatus');
          if (importStatus === 'SUCCESS') {
            dom = (
              <Tag onClick={() => this.operaClick(record)} color="green" style={{ border: 'none' }}>
                {value}
                <Icon
                  type="wysiwyg"
                  style={{ fontSize: '14px', margin: '0 0 2px 3px', fontWeight: 'normal' }}
                />
              </Tag>
            );
          } else if (importStatus === 'FAIL') {
            dom = (
              <Tag onClick={() => this.operaClick(record)} color="red" style={{ border: 'none' }}>
                {value}
                <Icon
                  type="wysiwyg"
                  style={{ fontSize: '14px', margin: '0 0 2px 3px', fontWeight: 'normal' }}
                />
              </Tag>
            );
          } else if (importStatus === 'IMPORTING') {
            dom = (
              <Tag
                onClick={() => this.operaClick(record)}
                color="yellow"
                style={{ border: 'none' }}
              >
                {value}
                <Icon
                  type="wysiwyg"
                  style={{ fontSize: '14px', margin: '0 0 2px 3px', fontWeight: 'normal' }}
                />
              </Tag>
            );
          } else {
            dom = (
              <Tag color="gray" style={{ border: 'none' }}>
                {intl.get('sinv.receiptExecution.model.receipt.noSync').d('无需同步')}
              </Tag>
            );
          }
          return dom;
        },
      },
      {
        name: 'associatedNum',
        width: 135,
        renderer: ({ record }) => (
          <a onClick={() => this.handleOk(record)}>
            {intl.get('sinv.receiptExecution.model.receipt.associatedNum').d('关联单据信息')}
          </a>
        ),
      },
      {
        name: 'processDocuments',
        width: 80,
        renderer: ({ record }) => (
          <DocFlow
            tableName="sinv_rcv_trx_line"
            tablePk={record.get('rcvTrxLineId')}
            buttonType="button"
          />
        ),
      },
      {
        name: 'customSpecsJson',
        width: 120,
        renderer: ({ value }) => {
          return <CustModal dataSource={value ? JSON.parse(value) : []} />;
        },
      },
      {
        name: 'orderReturnedFlag',
        width: 100,
        renderer: ({ value }) => yesOrNoRender(+value),
      },
      {
        name: 'attachmentUrlList',
        width: 80,
        renderer: ({ record }) => {
          return <ImageList imageDTO={record.get('attachmentUrlList').slice() || []} />;
        },
      },
      {
        name: 'projectTaskId',
        width: 110,
        renderer: ({ record }) => {
          return record.get('projectTaskName');
        },
      },
      {
        name: 'strategyCode',
        width: 150,
      },
    ];
    return columns;
  };

  /*
   * 事务-已收货-按收货单
   */
  getReceiptColumns = () => {
    const columns = [
      {
        name: 'nodeConfigName',
        width: 100,
      },
      {
        name: 'displayTrxNum',
        width: 200,
        renderer: ({ record, value, dataSet }) => {
          const { commonToDetail = (e) => e } = this.props;
          if (value) {
            return (
              <RenderChat
                value={value}
                id={record?.get('rcvTrxHeaderId')}
                data={dataSet?.getState('chatList')}
                unreadQuantity={record?.get('unreadQuantity')}
              >
                <a
                  onClick={() =>
                    commonToDetail('TRX', record, {
                      detailType: 'END',
                      from: 'three',
                      viewType: 'wide',
                    })
                  }
                >
                  {value}
                </a>
              </RenderChat>
            );
          }
        },
      },
      {
        name: 'rcvTypeName',
        width: 135,
      },
      {
        name: 'returnedFlag',
        width: 120,
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
        name: 'totalQuantity',
        width: 140,
        align: 'left',
      },
      {
        name: 'totalTaxIncludedAmount',
        width: 140,
        align: 'left',
        renderer: ({ value, record }) => (record?.get('hidePriceFlag') !== 1 ? value : '***'),
      },
      {
        name: 'printFlag',
        width: 140,
        align: 'left',
        renderer: ({ value, record }) => <div>{this.printRender(value, record)}</div>,
      },
      {
        name: 'companyName',
        width: 150,
      },
      {
        name: 'supplierName',
        width: 180,
        renderer: ({ record }) =>
          record.get('supplierId') ? record.get('supplierName') : record.get('supplierCompanyName'),
      },
      {
        name: 'creationName',
        width: 120,
      },
      {
        name: 'creationDate',
        width: 120,
        renderer: ({ value }) => dateTimeRender(value),
      },
    ];
    return columns;
  };

  /** ************************************************ 渲染 *********************************************************** */
  render() {
    const {
      endTableDs,
      endAsnTableDs,
      viewType,
      nodeConfigId,
      customizeTable,
      nodeConfigIndexAbc,
      selectedChange,
      selectName,
      batchMaintains,
      sreachBarQuery,
      isFromSupplierParams,
      // origin,
    } = this.props;
    const customCode =
      viewType === 'flat'
        ? `SINV.RECEIPT_WORKBENCH_THING.END.HAN.${nodeConfigIndexAbc},SINV.RECEIPT_WORKBENCH_THING.END_SEARCH`
        : `SINV.RECEIPT_WORKBENCH_THING.END_SEARCH,SINV.RECEIPT_WORKBENCH_THING.END.DAN.${nodeConfigIndexAbc}`;
    const { queryparams } = this.state;
    const handleQuery = ({ params = {} }) => {
      this.setState({
        queryparams: { ...params, nodeConfigId, customizeUnitCode: customCode },
      });
      sreachBarQuery(
        {
          ...params,
          allSource:
            viewType === 'flat'
              ? endTableDs.queryDataSet?.current?.get('allSource')
              : viewType === 'wide'
              ? endAsnTableDs.queryDataSet?.current?.get('allSource')
              : '',
        },
        'FINISHED'
      );
    };
    const resetQueryDs = (ds, flag) => {
      // eslint-disable-next-line no-unused-expressions
      ds.queryDataSet?.current.reset();
      // setResetFlag(true);
      if (flag) {
        ds.query();
      }
    };
    const flatTempKey1 = {
      tempKey: {
        lovPara: { tenantId: getCurrentOrganizationId() },
      },
    };
    const flatTempKey2 = {
      tempKey: {
        lovPara: { tenantId: getCurrentOrganizationId() },
        defaultValue: () => {
          return {
            displaySupplierName: isFromSupplierParams.displaySupplierName,
            tempKey: isFromSupplierParams.tempKey,
          };
        },
      },
    };
    const flatTempKey = isNil(isFromSupplierParams.tempKey) ? flatTempKey1 : flatTempKey2;
    return (
      <Fragment>
        {viewType === 'flat' &&
          customizeTable(
            { code: `SINV.RECEIPT_WORKBENCH_THING.END.HAN.${nodeConfigIndexAbc}` },
            <SearchBarTable
              virtual
              virtualCell
              cacheState
              className={style.searchTable_css}
              searchCode="SINV.RECEIPT_WORKBENCH_THING.END_SEARCH"
              dataSet={endTableDs}
              columns={this.getColumns()}
              pagination={{ pageSizeOptions: ['10', '20', '50', '100', '200', '500', '1000'] }}
              boxSizing="wrapper"
              style={{ maxHeight: `calc(100vh - 250px)` }}
              autoQuery={false}
              searchBarConfig={{
                onFieldChange: this.handleFieldChange,
                fieldProps: {
                  ...flatTempKey,
                  companyId: { lovPara: { tenantId: getCurrentOrganizationId() } },
                  agentId: { lovPara: { tenantId: getCurrentOrganizationId() } },
                  invOrganizationId: { lovPara: { tenantId: getCurrentOrganizationId() } },
                  inventoryId: { lovPara: { tenantId: getCurrentOrganizationId() } },
                  locatorId: { lovPara: { tenantId: getCurrentOrganizationId() } },
                  rcvTrxTypeId: {
                    defaultValue: () => {
                      return isFromSupplierParams.rcvTrxTypeId
                        ? {
                            rcvTrxTypeId: isFromSupplierParams.rcvTrxTypeId,
                            rcvTrxTypeName: isFromSupplierParams.rcvTrxTypeName,
                          }
                        : null;
                    },
                  },
                  finishedDate: {
                    defaultValue: () => isFromSupplierParams.finishedDate,
                  },
                  itemCode: { lovPara: { tenantId: getCurrentOrganizationId() } },
                  trxDate: {
                    defaultValue: ({ record }) =>
                      dateRangeTransform(
                        isNil(record.get('trxDataRange'))
                          ? 'IN_THREE_MONTH'
                          : record.get('trxDataRange')
                      ),
                    dynamicProps: {
                      disabled: ({ record }) => record.get('trxDataRange'),
                    },
                  },
                  ...showSearchParams(isFromSupplierParams),
                },
                left: {
                  render: () => (
                    <React.Fragment>
                      <Select
                        allowClear
                        onChange={(record) => {
                          selectedChange(record);
                        }}
                        defaultValue={selectName}
                        className={style['node-select']}
                        placeholder={intl
                          .get('sinv.receiptWorkbench.view.receipt.nodeText')
                          .d('选择节点')}
                      >
                        {batchMaintains.map((n) => (
                          <Option
                            key={n.nodeConfigName}
                            value={`${n.nodeConfigIndexAbc}${n.nodeConfigId}`}
                            className={style.option}
                          >
                            {n.nodeConfigName}
                          </Option>
                        ))}
                      </Select>
                      <div className={style.divider} />
                      {/* 多数据查询框 */}
                      <MutlTextFieldSearch
                        queryparams={queryparams}
                        name="allSource"
                        dataSet={endTableDs}
                        placeholder={intl
                          .get('sinv.receiptWorkbench.view.receipt.searchPrecise')
                          .d('请输入来源订单、送货单、协议、收货单精确查询')}
                        tooltipText={intl
                          .get('sinv.receiptWorkbench.view.receipt.tooltipText')
                          .d(
                            '综合查询框只支持如左单号的精确匹配查询，若需模糊查询具体单号，可在下方筛选器对应查询条件字段中搜索查询'
                          )}
                      />
                    </React.Fragment>
                  ),
                },
                onQuery: handleQuery,
                onReset: () => resetQueryDs(endTableDs),
                onClear: () => resetQueryDs(endTableDs, true),
                right: {
                  render: () => (
                    <div className={style.addSearch}>
                      <Popover
                        content={intl
                          .get('sinv.receiptExecution.model.receipt.aggregateTableView')
                          .d('按收货单')}
                      >
                        <div
                          className={viewType !== 'flat' ? 'active' : 'change-table'}
                          onClick={() => this.handleChangeStatus('wide')}
                        >
                          <span>
                            {intl
                              .get('sinv.receiptExecution.model.receipt.aggregateTableView')
                              .d('按收货单')}
                          </span>
                        </div>
                      </Popover>
                      <Popover
                        content={intl
                          .get('sinv.receiptExecution.model.receipt.flatTableView')
                          .d('按收货行')}
                      >
                        <div
                          className={viewType === 'flat' ? 'active' : 'change-table'}
                          onClick={() => this.handleChangeStatus('flat')}
                        >
                          <span>
                            {intl
                              .get('sinv.receiptExecution.model.receipt.flatTableView')
                              .d('按收货行')}
                          </span>
                        </div>
                      </Popover>
                    </div>
                  ),
                },
              }}
            />
          )}
        {viewType === 'wide' &&
          customizeTable(
            { code: `SINV.RECEIPT_WORKBENCH_THING.END.DAN.${nodeConfigIndexAbc}` },
            <SearchBarTable
              virtual
              virtualCell
              cacheState
              autoQuery={false}
              className={style.searchTable_css}
              searchCode="SINV.RECEIPT_WORKBENCH_THING.END_SEARCH"
              dataSet={endAsnTableDs}
              columns={this.getReceiptColumns()}
              pagination={{ pageSizeOptions: ['10', '20', '50', '100', '200', '500', '1000'] }}
              boxSizing="wrapper"
              style={{ maxHeight: `calc(100vh - 250px)` }}
              searchBarConfig={{
                onFieldChange: this.handleFieldChange,
                fieldProps: {
                  companyId: { lovPara: { tenantId: getCurrentOrganizationId() } },
                  agentId: { lovPara: { tenantId: getCurrentOrganizationId() } },
                  invOrganizationId: { lovPara: { tenantId: getCurrentOrganizationId() } },
                  inventoryId: { lovPara: { tenantId: getCurrentOrganizationId() } },
                  locatorId: { lovPara: { tenantId: getCurrentOrganizationId() } },
                  tempKey: { lovPara: { tenantId: getCurrentOrganizationId() } },
                  itemCode: { lovPara: { tenantId: getCurrentOrganizationId() } },
                  trxDate: {
                    defaultValue: ({ record }) =>
                      dateRangeTransform(
                        isNil(record.get('trxDataRange'))
                          ? 'IN_THREE_MONTH'
                          : record.get('trxDataRange')
                      ),
                    dynamicProps: {
                      disabled: ({ record }) => record.get('trxDataRange'),
                    },
                  },
                  ...showSearchParams(isFromSupplierParams),
                },
                left: {
                  render: () => (
                    <Fragment>
                      <Select
                        allowClear
                        onChange={(record) => {
                          selectedChange(record);
                        }}
                        defaultValue={selectName}
                        className={style['node-select']}
                        placeholder={intl
                          .get('sinv.receiptWorkbench.view.receipt.nodeText')
                          .d('选择节点')}
                      >
                        {batchMaintains.map((n) => (
                          <Option
                            key={n.nodeConfigName}
                            value={`${n.nodeConfigIndexAbc}${n.nodeConfigId}`}
                            className={style.option}
                          >
                            {n.nodeConfigName}
                          </Option>
                        ))}
                      </Select>
                      <div className={style.divider} />
                      {/* 多数据查询框 */}
                      <MutlTextFieldSearch
                        queryparams={queryparams}
                        name="allSource"
                        dataSet={endAsnTableDs}
                        placeholder={intl
                          .get('sinv.receiptWorkbench.view.receipt.searchPrecise')
                          .d('请输入来源订单、送货单、协议、收货单精确查询')}
                        tooltipText={intl
                          .get('sinv.receiptWorkbench.view.receipt.tooltipText')
                          .d(
                            '综合查询框只支持如左单号的精确匹配查询，若需模糊查询具体单号，可在下方筛选器对应查询条件字段中搜索查询'
                          )}
                      />
                    </Fragment>
                  ),
                },
                onQuery: handleQuery,
                onReset: () => resetQueryDs(endAsnTableDs),
                onClear: () => resetQueryDs(endAsnTableDs, true),
                right: {
                  render: () => (
                    <div className={style.addSearch}>
                      <Popover
                        content={intl
                          .get('sinv.receiptExecution.model.receipt.aggregateTableView')
                          .d('按收货单')}
                      >
                        <div
                          className={viewType !== 'flat' ? 'active' : 'change-table'}
                          onClick={() => this.handleChangeStatus('wide')}
                        >
                          <span>
                            {intl
                              .get('sinv.receiptExecution.model.receipt.aggregateTableView')
                              .d('按收货单')}
                          </span>
                        </div>
                      </Popover>
                      <Popover
                        content={intl
                          .get('sinv.receiptExecution.model.receipt.flatTableView')
                          .d('按收货行')}
                      >
                        <div
                          className={viewType === 'flat' ? 'active' : 'change-table'}
                          onClick={() => this.handleChangeStatus('flat')}
                        >
                          <span>
                            {intl
                              .get('sinv.receiptExecution.model.receipt.flatTableView')
                              .d('按收货行')}
                          </span>
                        </div>
                      </Popover>
                    </div>
                  ),
                },
              }}
            />
          )}
      </Fragment>
    );
  }
}
