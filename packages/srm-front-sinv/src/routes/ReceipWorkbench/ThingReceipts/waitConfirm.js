/*
 * @Description:
 * @Date: 2021-05-01 09:20:13
 * @author: zuoxiangyu <xiangyu.zuo@going-link.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2020, Hand
 */
import React, { Fragment, Component } from 'react';
import { Select } from 'hzero-ui';

import intl from 'utils/intl';
import DocFlow from '_components/DocFlow';
import ImageList from '@/routes/components/ImageList';
import { getCurrentOrganizationId } from 'utils/utils';
// import WithCustomize from 'srm-front-cuz/lib/c7nCustomize';
import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';

import { showBigNumber, showSearchParams } from '@/routes/components/utils';
import { CustModal } from '@/routes/components/C7nCustomModal';
import { dateTimeRender, yesOrNoRender } from 'utils/renderer';
import formatterCollections from 'utils/intl/formatterCollections';
import MutlTextFieldSearch from '@/routes/components/MutlTextFieldSearch';
import { RenderChat } from '../../components/Chat/index';
import { statusShow } from '../util';
import style from '../index.less';

const { Option } = Select;

// function getCustomize() {
//   const customizeList = [];
//   for (let i = 0; i < 11; i++) {
//     const index = String.fromCharCode(65 + i);
//     customizeList.push(
//       `SINV.RECEIPT_WORKBENCH_THING.CONFIRM.COURSE.${index}`,
//       `SINV.RECEIPT_WORKBENCH_THING.CONFIRM.ASN.${index}`,
//       `SINV.RECEIPT_WORKBENCH_THING.CONFIRM.SEARCH`
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
    // const { onRef = (e) => e } = props;
    // this指向List
    // onRef(this);
    this.state = {
      queryparams: {},
    };
  }

  /*
   *收货中-切换按行或按单
   */
  handleChangeCourseStatus = (type) => {
    const { handleChangeCourseStatus } = this.props;
    handleChangeCourseStatus(type);
  };

  /** ************************************************ 路由跳转 *********************************************************** */

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

  /** ************************************************ 列表字段 *********************************************************** */
  /*
   * 事务-待收货-按单
   */
  getColumns = () => {
    const { nodeFlag } = this.props;
    const columns = {
      collect: [
        {
          name: 'rcvStatusCodeMeaning',
          width: 100,
          renderer: ({ record }) => statusShow(record),
        },
        {
          name: 'displayTrxNum',
          width: 160,
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
                      commonToDetail('FIVE', record, {
                        detailType: 'COURSE',
                        from: 'five',
                        viewType: 'flat',
                      })
                    }
                  >
                    {value}
                  </a>
                </RenderChat>
              );
              // if (unreadQuantity !== 0) {
              //   return (
              //     <Tooltip
              //       placement="topRight"
              //       title={`${messageLogging}${intl
              //         .get('sinv.receiptExecution.model.receipt.unreadMessage')
              //         .d('条留言消息未读')}`}
              //     >
              //       <a
              //         onClick={() =>
              //           commonToDetail('FIVE', record, {
              //             detailType: 'COURSE',
              //             from: 'five',
              //             viewType: 'flat',
              //           })
              //         }
              //       >
              //         {value}
              //         {<span style={{ color: 'red' }}>&#40;{messageLogging}&#41;</span>}
              //       </a>
              //     </Tooltip>
              //   );
              // } else {
              //   return (
              //     <a
              //       onClick={() =>
              //         commonToDetail('FIVE', record, {
              //           detailType: 'COURSE',
              //           from: 'five',
              //           viewType: 'flat',
              //         })
              //       }
              //     >
              //       {value}
              //     </a>
              //   );
              // }
            }
          },
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
          renderer: ({ value, record }) => <div>{this.printRender(value, record)}</div>,
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
          renderer: ({ record }) => statusShow(record),
        },
      ],
      tactics: [
        {
          name: 'nodeConfigName',
          width: 70,
          renderer: ({ value }) => <div>{value || '-'}</div>,
        },
      ],
      node: [
        {
          name: 'displayTrxNum',
          width: 160,
          renderer: ({ record, value }) => {
            const { commonToDetail = (e) => e } = this.props;
            if (value) {
              return (
                <a
                  onClick={() =>
                    commonToDetail('FIVE', record, {
                      detailType: 'COURSE',
                      from: 'five',
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
            ? intl.get('sinv.receiptExecution.model.receipt.uomBaseName').d('基本单位')
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
          width: 140,
          renderer: ({ value }) => showBigNumber(value),
          header: doubleUnitEnabled
            ? intl.get('sinv.receiptExecution.model.receipt.exec.baseQuantity').d('执行基本数量')
            : intl.get('sinv.receiptExecution.model.receipt.exec.quantity').d('执行数量'),
        },
        {
          name: 'taxIncludedAmount',
          width: 140,
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
            return record.get('projectTaskName');
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

  /** ************************************************ 渲染 *********************************************************** */
  render() {
    const {
      nodeConfigId,
      waitConfirmTableDs,
      waitConfirmAsnTableDs,
      customizeTable,
      nodeConfigIndexAbc,
      selectedChange,
      batchMaintains,
      selectName,
      courseAsLine,
      sreachBarQuery,
      origin,
      isFromSupplierParams,
    } = this.props;
    const { queryparams } = this.state;
    const columns = !courseAsLine ? this.getColumns() : this.getLineColumns();
    const customCode = !courseAsLine
      ? `SINV.RECEIPT_WORKBENCH_THING.CONFIRM.COURSE.${nodeConfigIndexAbc},SINV.RECEIPT_WORKBENCH_THING.CONFIRM.SEARCH`
      : `SINV.RECEIPT_WORKBENCH_THING.CONFIRM.ASN.${nodeConfigIndexAbc},SINV.RECEIPT_WORKBENCH_THING.CONFIRM.SEARCH`;
    const cousrseDs = !courseAsLine ? waitConfirmTableDs : waitConfirmAsnTableDs;
    const handleQuery = ({ params = {} }) => {
      this.setState({
        queryparams: { ...params, nodeConfigId, customizeUnitCode: customCode },
      });
      sreachBarQuery(
        { ...params, allSource: cousrseDs.queryDataSet?.current?.get('allSource') || '' },
        'CONFIRM'
      );
    };
    return (
      <Fragment>
        {courseAsLine &&
          customizeTable(
            { code: `SINV.RECEIPT_WORKBENCH_THING.CONFIRM.ASN.${nodeConfigIndexAbc}` },
            <SearchBarTable
              autoQuery={false}
              cacheState
              className={style.searchTable_css}
              searchCode="SINV.RECEIPT_WORKBENCH_THING.CONFIRM.SEARCH"
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
                      {/* 多数据查询框 */}
                      <MutlTextFieldSearch
                        queryparams={queryparams}
                        name="allSource"
                        dataSet={cousrseDs}
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
                right: {
                  render: () => (
                    <div className={style.addSearch}>
                      <div
                        className={!courseAsLine ? 'active' : 'change-table'}
                        onClick={() => this.handleChangeCourseStatus(false)}
                      >
                        <span>
                          {intl
                            .get('sinv.receiptExecution.model.receipt.aggregateTableView')
                            .d('按收货单')}
                        </span>
                      </div>
                      <div
                        className={courseAsLine ? 'active' : 'change-table'}
                        onClick={() => this.handleChangeCourseStatus(true)}
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
                fieldProps: {
                  companyId: { lovPara: { tenantId: getCurrentOrganizationId() } },
                  agentId: { lovPara: { tenantId: getCurrentOrganizationId() } },
                  invOrganizationId: { lovPara: { tenantId: getCurrentOrganizationId() } },
                  inventoryId: { lovPara: { tenantId: getCurrentOrganizationId() } },
                  locatorId: { lovPara: { tenantId: getCurrentOrganizationId() } },
                  tempKey: { lovPara: { tenantId: getCurrentOrganizationId() } },
                  rcvTrxTypeId: { lovPara: { tenantId: getCurrentOrganizationId() } },
                  purOrganizationId: { lovPara: { tenantId: getCurrentOrganizationId() } },
                  itemCode: { lovPara: { tenantId: getCurrentOrganizationId() } },
                  rcvStatusCode: {
                    defaultValue: () => (origin === '1' ? '30_REJECTED' : ''),
                  },
                },
              }}
            />
          )}
        {!courseAsLine &&
          customizeTable(
            { code: `SINV.RECEIPT_WORKBENCH_THING.CONFIRM.COURSE.${nodeConfigIndexAbc}` },
            <SearchBarTable
              cacheState
              searchCode="SINV.RECEIPT_WORKBENCH_THING.CONFIRM.SEARCH"
              dataSet={cousrseDs}
              columns={columns}
              className={style.searchTable_css}
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
                      {/* 多数据查询框 */}
                      <MutlTextFieldSearch
                        queryparams={queryparams}
                        name="allSource"
                        dataSet={cousrseDs}
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
                right: {
                  render: () => (
                    <div className={style.addSearch}>
                      <div
                        className={!courseAsLine ? 'active' : 'change-table'}
                        onClick={() => this.handleChangeCourseStatus(false)}
                      >
                        <span>
                          {intl
                            .get('sinv.receiptExecution.model.receipt.aggregateTableView')
                            .d('按收货单')}
                        </span>
                      </div>
                      <div
                        className={courseAsLine ? 'active' : 'change-table'}
                        onClick={() => this.handleChangeCourseStatus(true)}
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
                fieldProps: {
                  companyId: { lovPara: { tenantId: getCurrentOrganizationId() } },
                  agentId: { lovPara: { tenantId: getCurrentOrganizationId() } },
                  invOrganizationId: { lovPara: { tenantId: getCurrentOrganizationId() } },
                  inventoryId: { lovPara: { tenantId: getCurrentOrganizationId() } },
                  locatorId: { lovPara: { tenantId: getCurrentOrganizationId() } },
                  tempKey: { lovPara: { tenantId: getCurrentOrganizationId() } },
                  rcvTrxTypeId: { lovPara: { tenantId: getCurrentOrganizationId() } },
                  purOrganizationId: { lovPara: { tenantId: getCurrentOrganizationId() } },
                  itemCode: { lovPara: { tenantId: getCurrentOrganizationId() } },
                  rcvStatusCode: {
                    defaultValue: () => (origin === '1' ? '30_REJECTED' : ''),
                  },
                  ...showSearchParams(isFromSupplierParams),
                },
              }}
            />
          )}
      </Fragment>
    );
  }
}
