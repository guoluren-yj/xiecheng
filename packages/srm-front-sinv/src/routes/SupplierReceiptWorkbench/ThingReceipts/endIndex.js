import React, { Fragment, Component } from 'react';
import { Select } from 'choerodon-ui/pro';
import { Popover, Tag, Icon } from 'choerodon-ui';
import intl from 'utils/intl';
import { isNil } from 'lodash';
import ImageList from '@/routes/components/ImageList';
import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';
import formatterCollections from 'utils/intl/formatterCollections';
import { dateTimeRender, yesOrNoRender } from 'utils/renderer';
import { CustModal } from '@/routes/components/C7nCustomModal';
import { colorRender, printRender, operaClick, handleOpenRelation } from '../hook.js';
import MutlTextFieldSearch from '@/routes/components/MutlTextFieldSearch';
import style from '../index.less';
import { showBigNumber } from '@/routes/components/utils/index.js';
import { dateRangeTransform } from '@/utils/utils';
import { RenderChat } from '../../components/Chat/index';

const { Option } = Select;
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
    onRef(this);
    this.state = {
      queryparams: {},
    };
  }

  handleFieldChange = ({ value, name, record }) => {
    if (name === 'trxDataRange') {
      record.set('trxDate', dateRangeTransform(value, true));
    }
  };

  getColumns = () => {
    const { doubleUnitEnabled } = this.props;
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
        width: 180,
        renderer: ({ value, record }) =>
          value && <span>{`${value}-${record.get('fromDisplayTrxLineNum')}`}</span>,
      },
      {
        name: 'fromDisplayPoNum',
        width: 180,
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
        renderer: colorRender,
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
              <Tag onClick={() => operaClick(record)} color="green" style={{ border: 'none' }}>
                {value}
                <Icon
                  type="wysiwyg"
                  style={{ fontSize: '14px', margin: '0 0 2px 3px', fontWeight: 'normal' }}
                />
              </Tag>
            );
          } else if (importStatus === 'FAIL') {
            dom = (
              <Tag onClick={() => operaClick(record)} color="red" style={{ border: 'none' }}>
                {value}
                <Icon
                  type="wysiwyg"
                  style={{ fontSize: '14px', margin: '0 0 2px 3px', fontWeight: 'normal' }}
                />
              </Tag>
            );
          } else if (importStatus === 'IMPORTING') {
            dom = (
              <Tag onClick={() => operaClick(record)} color="yellow" style={{ border: 'none' }}>
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
          <a onClick={() => handleOpenRelation(record)}>
            {intl.get('sinv.receiptExecution.model.receipt.associatedNum').d('关联单据信息')}
          </a>
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
        name: 'creationDate',
        width: 120,
        renderer: ({ value }) => dateTimeRender(value),
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
        renderer: printRender,
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
    } = this.props;
    const { queryparams } = this.state;
    const customCode =
      viewType === 'flat'
        ? `SINV.RECEIPT_WORKBENCH_THING.END.HAN.${nodeConfigIndexAbc},SINV.SUPPLIER_RECEIPT_WORKBENCH_THING.END_SEARCH`
        : `SINV.SUPPLIER_RECEIPT_WORKBENCH_THING.END_SEARCH,SINV.RECEIPT_WORKBENCH_THING.END.DAN.${nodeConfigIndexAbc}`;
    const cousrseDs = viewType === 'flat' ? endTableDs : endAsnTableDs;
    const handleQuery = ({ params = {} }) => {
      this.setState({
        queryparams: { ...params, nodeConfigId, customizeUnitCode: customCode },
      });
      sreachBarQuery(
        {
          ...params,
          allSource: cousrseDs.queryDataSet?.current?.get('allSource') || '',
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
    return (
      <Fragment>
        {viewType === 'flat' &&
          customizeTable(
            { code: `SINV.RECEIPT_WORKBENCH_THING.END.HAN.${nodeConfigIndexAbc}` },
            <SearchBarTable
              virtual
              virtualCell
              cacheState
              searchCode="SINV.SUPPLIER_RECEIPT_WORKBENCH_THING.END_SEARCH"
              dataSet={endTableDs}
              columns={this.getColumns()}
              pagination={{ pageSizeOptions: ['10', '20', '50', '100', '200', '500', '1000'] }}
              boxSizing="wrapper"
              style={{ maxHeight: `calc(100vh - 250px)` }}
              searchBarConfig={{
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
                          .get('sinv.receiptWorkbench.view.receipt.supplierSearchTextQuery')
                          .d('请输入收货单号查询')}
                      />
                    </React.Fragment>
                  ),
                },
                onQuery: handleQuery,
                onReset: () => resetQueryDs(endTableDs),
                onClear: () => resetQueryDs(endTableDs, true),
                onFieldChange: this.handleFieldChange,
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
                          onClick={() => this.props.handleChangeStatus('wide')}
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
                          onClick={() => this.props.handleChangeStatus('flat')}
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
                fieldProps: {
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
              searchCode="SINV.SUPPLIER_RECEIPT_WORKBENCH_THING.END_SEARCH"
              dataSet={endAsnTableDs}
              columns={this.getReceiptColumns()}
              pagination={{ pageSizeOptions: ['10', '20', '50', '100', '200', '500', '1000'] }}
              boxSizing="wrapper"
              style={{ maxHeight: `calc(100vh - 250px)` }}
              searchBarConfig={{
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
                          .get('sinv.receiptWorkbench.view.receipt.supplierSearchTextQuery')
                          .d('请输入收货单号查询')}
                      />
                    </Fragment>
                  ),
                },
                onFieldChange: this.handleFieldChange,
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
                          onClick={() => this.props.handleChangeStatus('wide')}
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
                          onClick={() => this.props.handleChangeStatus('flat')}
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
                fieldProps: {
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
                },
              }}
            />
          )}
      </Fragment>
    );
  }
}
