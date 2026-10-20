import React, { Fragment, PureComponent } from 'react';
import { Select, Tooltip } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import ImageList from '@/routes/components/ImageList';
import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';
import { CustModal } from '@/routes/components/C7nCustomModal';
import formatterCollections from 'utils/intl/formatterCollections';
import { dateTimeRender, yesOrNoRender } from 'utils/renderer';
import BtnApprovalCmp from '@/routes/components/BtnApprovalCmp';
import style from '../index.less';
import MutlTextFieldSearch from '@/routes/components/MutlTextFieldSearch';
import { rcvStatusRender, printRender } from '../hook.js';
import { showBigNumber } from '@/routes/components/utils';
import { progressView } from '../util';

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
export default class ReceiptExecution extends PureComponent {
  constructor(props) {
    super(props);
    const { onRef = (e) => e } = props;
    onRef(this);
    this.state = {
      queryparams: {},
    };
  }

  getColumns = () => {
    const { nodeFlag, courseTableDs, handleApprovalList, handleRevokeApprovalList } = this.props;
    const columns = {
      collect: [
        {
          name: 'rcvStatusCodeMeaning',
          width: 100,
          renderer: rcvStatusRender,
        },
        {
          name: 'operate',
          width: 150,
          renderer: ({ record }) => {
            const btnProps = {
              record,
              isSupplier: true,
              handleApprovalList,
              handleRevokeApprovalList,
            };
            return <BtnApprovalCmp props={btnProps} dataSet={courseTableDs} />;
          },
        },
        {
          name: 'displayTrxNum',
          width: 160,
          renderer: ({ record, value }) => {
            const { commonToDetail = (e) => e } = this.props;
            const unreadQuantity = record.get('unreadQuantity');
            const messageLogging = unreadQuantity > 99 ? '99+' : unreadQuantity;
            if (value) {
              if (unreadQuantity !== 0) {
                return (
                  <Tooltip
                    placement="topRight"
                    title={`${messageLogging}${intl
                      .get('sinv.receiptExecution.model.receipt.unreadMessage')
                      .d('条留言消息未读')}`}
                  >
                    <a
                      onClick={() =>
                        commonToDetail('TRX', record, {
                          detailType: 'COURSE',
                          from: 'two',
                          viewType: 'flat',
                        })
                      }
                    >
                      {value}
                      {<span style={{ color: 'red' }}>&#40;{messageLogging}&#41;</span>}
                    </a>
                  </Tooltip>
                );
              } else {
                return (
                  <a
                    onClick={() =>
                      commonToDetail('TRX', record, {
                        detailType: 'COURSE',
                        from: 'two',
                        viewType: 'flat',
                      })
                    }
                  >
                    {value}
                  </a>
                );
              }
            }
          },
        },
        {
          name: 'viewApproval',
          renderer: progressView,
          width: 150,
        },
      ],
      tactics: [
        {
          name: 'nodeConfigName',
          width: 100,
          renderer: ({ value }) => <div>{value || '-'}</div>,
        },
      ],
      node: [
        {
          name: 'rcvTypeName',
          width: 135,
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
          name: 'supplierName',
          width: 180,
          renderer: ({ record }) =>
            record.get('supplierId')
              ? record.get('supplierName')
              : record.get('supplierCompanyName'),
        },
        {
          name: 'companyName',
          width: 180,
        },
        {
          name: 'remark',
          width: 140,
        },
        {
          name: 'creationName',
          width: 140,
        },
        {
          name: 'creationDate',
          width: 140,
        },
      ],
    };
    if (nodeFlag) {
      return columns.collect.concat(columns.node);
    } else {
      return columns.collect.concat(columns.tactics, columns.node);
    }
  };

  /*
   * 事务-待收货-按行
   */
  getLineColumns = () => {
    const { nodeFlag, doubleUnitEnabled } = this.props;
    const columns = {
      collect: [
        {
          name: 'rcvStatusCodeMeaning',
          width: 100,
          renderer: rcvStatusRender,
        },
      ],
      tactics: [
        {
          name: 'nodeConfigName',
          width: 100,
          renderer: ({ value }) => <div>{value}</div>,
        },
      ],
      node: [
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
                      detailType: 'COURSE',
                      from: 'two',
                      courseAsLine: true,
                      viewType: 'flat',
                    })
                  }
                >
                  {record.get('displayTrxHeaderAndLineNum') || '-'}
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
          width: 160,
          renderer: ({ record }) => record.get('secondaryUomName'),
        },
        {
          name: 'uomName',
          width: 140,
          header: doubleUnitEnabled
            ? intl.get('sinv.receiptExecution.model.receipt.baseUomName').d('基本单位')
            : intl.get('sinv.receiptExecution.model.receipt.uomName').d('单位'),
        },
        {
          name: 'supplierName',
          width: 180,
          renderer: ({ record }) =>
            record.get('supplierId')
              ? record.get('supplierName')
              : record.get('supplierCompanyName'),
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
          width: 130,
          renderer: ({ value }) => showBigNumber(value),
        },
        {
          name: 'quantity',
          width: 110,
          renderer: ({ value }) => showBigNumber(value),
          header: doubleUnitEnabled
            ? intl.get('sinv.receiptExecution.model.receipt.exec.baseQuantity').d('执行基本数量')
            : intl.get('sinv.receiptExecution.model.receipt.exec.quantity').d('执行数量'),
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
          name: 'trxDate',
          width: 140,
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
          width: 150,
        },
        {
          name: 'productName',
          width: 120,
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
          name: 'dueDate',
          width: 150,
          renderer: ({ value }) => dateTimeRender(value),
        },
        {
          name: 'remark',
          width: 150,
        },
        {
          name: 'sinvLineAttachmentUuid',
        },
        {
          name: 'customSpecsJson',
          width: 120,
          renderer: ({ value }) => {
            return <CustModal dataSource={value ? JSON.parse(value) : []} />;
          },
        },
        {
          name: 'companyName',
          width: 140,
          renderer: ({ value }) => <div>{value}</div>,
        },
        {
          name: 'creationName',
          width: 140,
          renderer: ({ value }) => <div>{value}</div>,
        },
        {
          name: 'creationDate',
          width: 140,
        },
        {
          name: 'orderReturnedFlag',
          width: 100,
          renderer: ({ value }) => yesOrNoRender(+value),
        },
        {
          name: 'attachmentUrlList',
          width: 80,
          renderer: ({ record, value }) => {
            return value?.length ? (
              <ImageList imageDTO={record.get('attachmentUrlList').slice() || []} />
            ) : (
              <span>-</span>
            );
          },
        },
        {
          name: 'fromDisplayTrxNum',
          width: 150,
          renderer: ({ value, record }) => {
            if (value) {
              return <span>{`${value}-${record.get('fromDisplayTrxLineNum')}`}</span>;
            }
          },
        },
        {
          name: 'projectTaskId',
          width: 110,
          renderer: ({ record }) => {
            return record.get('projectTaskId');
          },
        },
        {
          name: 'strategyCode',
          width: 150,
        },
      ],
    };
    if (nodeFlag) {
      return columns.collect.concat(columns.node);
    } else {
      return columns.collect.concat(columns.tactics, columns.node);
    }
  };

  render() {
    const {
      courseTableDs,
      courseAsnTableDs,
      customizeTable,
      nodeConfigIndexAbc,
      selectedChange,
      batchMaintains,
      selectName,
      courseAsLine,
      sreachBarQuery,
      nodeConfigId,
    } = this.props;
    const { queryparams } = this.state;
    const columns = !courseAsLine ? this.getColumns() : this.getLineColumns();
    const customCode = !courseAsLine
      ? `SINV.RECEIPT_WORKBENCH_THING.COURSE.${nodeConfigIndexAbc},SINV.SUPPLIER_RECEIPT_WORKBENCH_THING.COURSE_SEARCH`
      : `SINV.RECEIPT_WORKBENCH_THING.COURSE.ASN.${nodeConfigIndexAbc},SINV.SUPPLIER_RECEIPT_WORKBENCH_THING.COURSE_SEARCH`;
    const cousrseDs = !courseAsLine ? courseTableDs : courseAsnTableDs;
    const handleQuery = ({ params = {} }) => {
      this.setState({
        queryparams: { ...params, nodeConfigId, customizeUnitCode: customCode },
      });
      sreachBarQuery(
        { ...params, allSource: cousrseDs.queryDataSet?.current?.get('allSource') || '' },
        'DOING'
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
        {courseAsLine &&
          customizeTable(
            { code: `SINV.RECEIPT_WORKBENCH_THING.COURSE.ASN.${nodeConfigIndexAbc}` },
            <SearchBarTable
              cacheState
              searchCode="SINV.SUPPLIER_RECEIPT_WORKBENCH_THING.COURSE_SEARCH"
              dataSet={cousrseDs}
              columns={columns}
              pagination={{ pageSizeOptions: ['10', '20', '50', '100', '200', '500', '1000'] }}
              boxSizing="wrapper"
              style={{ maxHeight: `calc(100vh - 250px)` }}
              virtual
              virtualCell
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
                      <MutlTextFieldSearch
                        queryparams={queryparams}
                        name="allSource"
                        dataSet={cousrseDs}
                        placeholder={intl
                          .get('sinv.receiptWorkbench.view.receipt.supplierSearchTextQuery')
                          .d('请输入收货单号查询')}
                      />
                    </Fragment>
                  ),
                },
                onQuery: handleQuery,
                onReset: () => resetQueryDs(cousrseDs),
                onClear: () => resetQueryDs(cousrseDs, true),
                right: {
                  render: () => (
                    <div className={style.addSearch}>
                      <div
                        className={!courseAsLine ? 'active' : 'change-table'}
                        onClick={() => this.props.handleChangeCourseStatus(false)}
                      >
                        <span>
                          {intl
                            .get('sinv.receiptExecution.model.receipt.aggregateTableView')
                            .d('按收货单')}
                        </span>
                      </div>
                      <div
                        className={courseAsLine ? 'active' : 'change-table'}
                        onClick={() => this.props.handleChangeCourseStatus(true)}
                      >
                        <span>
                          {intl
                            .get('sinv.receiptExecution.model.receipt.flatTableView')
                            .d('按收货行')}
                        </span>
                      </div>
                    </div>
                  ),
                },
              }}
            />
          )}
        {!courseAsLine &&
          customizeTable(
            { code: `SINV.RECEIPT_WORKBENCH_THING.COURSE.${nodeConfigIndexAbc}` },
            <SearchBarTable
              cacheState
              searchCode="SINV.SUPPLIER_RECEIPT_WORKBENCH_THING.COURSE_SEARCH"
              dataSet={cousrseDs}
              columns={columns}
              pagination={{ pageSizeOptions: ['10', '20', '50', '100', '200', '500', '1000'] }}
              boxSizing="wrapper"
              style={{ maxHeight: `calc(100vh - 250px)` }}
              virtual
              virtualCell
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
                      <MutlTextFieldSearch
                        queryparams={queryparams}
                        name="allSource"
                        dataSet={cousrseDs}
                        placeholder={intl
                          .get('sinv.receiptWorkbench.view.receipt.supplierSearchTextQuery')
                          .d('请输入收货单号查询')}
                      />
                    </Fragment>
                  ),
                },
                onQuery: handleQuery,
                onReset: () => resetQueryDs(cousrseDs),
                onClear: () => resetQueryDs(cousrseDs, true),
                right: {
                  render: () => (
                    <div className={style.addSearch}>
                      <div
                        className={!courseAsLine ? 'active' : 'change-table'}
                        onClick={() => this.props.handleChangeCourseStatus(false)}
                      >
                        <span>
                          {intl
                            .get('sinv.receiptExecution.model.receipt.aggregateTableView')
                            .d('按收货单')}
                        </span>
                      </div>
                      <div
                        className={courseAsLine ? 'active' : 'change-table'}
                        onClick={() => this.props.handleChangeCourseStatus(true)}
                      >
                        <span>
                          {intl
                            .get('sinv.receiptExecution.model.receipt.flatTableView')
                            .d('按收货行')}
                        </span>
                      </div>
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
