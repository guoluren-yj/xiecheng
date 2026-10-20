/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
/*
 * @Description:
 * @Date: 2021-05-01 09:20:13
 * @author: zuoxiangyu <xiangyu.zuo@going-link.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2020, Hand
 */
import React, { Fragment, Component } from 'react';
import { Tag, Tooltip } from 'choerodon-ui';
import { Select } from 'hzero-ui';

import intl from 'utils/intl';
import DocFlow from '_components/DocFlow';
import ImageList from '@/routes/components/ImageList';
import { getCurrentOrganizationId } from 'utils/utils';
// import WithCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { CustModal } from '@/routes/components/C7nCustomModal';
import { dateTimeRender, yesOrNoRender } from 'utils/renderer';
import formatterCollections from 'utils/intl/formatterCollections';
import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';
import BtnApprovalCmp from '@/routes/components/BtnApprovalCmp';
import style from '../index.less';
import MutlTextFieldSearch from '@/routes/components/MutlTextFieldSearch';
import { showBigNumber, showSearchParams } from '@/routes/components/utils';
import { statusShow, progressView } from '../util';

const { Option } = Select;

// function getCustomize() {
//   const customizeList = [];
//   for (let i = 0; i < 11; i++) {
//     const index = String.fromCharCode(65 + i);
//     customizeList.push(
//       `SINV.RECEIPT_WORKBENCH_THING.COURSE.${index}`,
//       `SINV.RECEIPT_WORKBENCH_THING.COURSE_SEARCH`
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
   * 状态颜色渲染
   */

  colorRender = (_value, record) => {
    const value = record.get('rcvStatusCode');
    if (['20_SUBMITTED'].includes(value)) {
      // 绿色
      return (
        <div>
          <Tag
            color=" rgba(71,184,129,0.10)"
            style={{ color: '#47B881', height: '70px', lineHeight: '18px' }}
          >
            {record.get('rcvStatusCodeMeaning')}
          </Tag>
        </div>
      );
    } else if (['10_NEW'].includes(value)) {
      // 蓝色
      return (
        <div>
          <Tag color="rgba(252,160,0,0.10)" style={{ color: '#F88D10' }}>
            {record.get('rcvStatusCodeMeaning')}
          </Tag>
        </div>
      );
    } else {
      //  红色
      return (
        <div>
          <Tag color="rgba(245,99,73,0.10)" style={{ color: '#F56349' }}>
            {record.get('rcvStatusCodeMeaning')}
          </Tag>
        </div>
      );
    }
  };

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
    const { nodeFlag, courseTableDs, handleApprovalList, handleRevokeApprovalList } = this.props;
    console.log('nodeFlag', nodeFlag);
    const columns = {
      collect: [
        {
          name: 'rcvStatusCodeMeaning',
          width: 100,
          renderer: ({ record }) => statusShow(record),
        },
        {
          name: 'operate',
          width: 150,
          renderer: ({ record }) => {
            const btnProps = {
              record,
              isSupplier: false,
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
          renderer: ({ record }) => {
            return <ImageList imageDTO={record.get('attachmentUrlList').slice() || []} />;
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
      courseTableDs,
      courseAsnTableDs,
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
      ? `SINV.RECEIPT_WORKBENCH_THING.COURSE.${nodeConfigIndexAbc},SINV.RECEIPT_WORKBENCH_THING.COURSE_SEARCH`
      : `SINV.RECEIPT_WORKBENCH_THING.COURSE.ASN.${nodeConfigIndexAbc},SINV.RECEIPT_WORKBENCH_THING.COURSE_SEARCH`;
    const cousrseDs = !courseAsLine ? courseTableDs : courseAsnTableDs;
    const handleQuery = ({ params = {} }) => {
      this.setState({
        queryparams: { ...params, nodeConfigId, customizeUnitCode: customCode },
      });

      sreachBarQuery(
        {
          ...params,
          allSource:
            cousrseDs.queryDataSet?.current?.get('allSource') ||
            this.props.cacheTab.get('allSource'),
        },
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
              autoQuery={false}
              searchCode="SINV.RECEIPT_WORKBENCH_THING.COURSE_SEARCH"
              dataSet={cousrseDs}
              columns={columns}
              pagination={{ pageSizeOptions: ['10', '20', '50', '100', '200', '500', '1000'] }}
              boxSizing="wrapper"
              className={style.searchTable_css}
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
                        cacheTab={this.props.cacheTab}
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
                onReset: () => resetQueryDs(cousrseDs),
                onClear: () => resetQueryDs(cousrseDs, true),
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
        {!courseAsLine &&
          customizeTable(
            { code: `SINV.RECEIPT_WORKBENCH_THING.COURSE.${nodeConfigIndexAbc}` },
            <SearchBarTable
              cacheState
              className={style.searchTable_css}
              searchCode="SINV.RECEIPT_WORKBENCH_THING.COURSE_SEARCH"
              dataSet={cousrseDs}
              columns={columns}
              pagination={{ pageSizeOptions: ['10', '20', '50', '100', '200', '500', '1000'] }}
              boxSizing="wrapper"
              style={{ maxHeight: `calc(100vh - 250px)` }}
              virtual
              virtualCell
              autoQuery={false}
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
                        cacheTab={this.props.cacheTab}
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
                onReset: () => resetQueryDs(cousrseDs),
                onClear: () => resetQueryDs(cousrseDs, true),
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
