/* eslint-disable no-dupe-keys */
/*
 * @Description:
 * @Date: 2021-05-01 09:20:13
 * @author: zuoxiangyu <xiangyu.zuo@going-link.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2020, Hand
 */
import React, { Component, Fragment } from 'react';
import { Select } from 'hzero-ui';
import { isNil } from 'lodash';
import { stringify } from 'querystring';
import ImageList from '@/routes/components/ImageList';

import intl from 'utils/intl';
import { filterNullValueObject, getCurrentOrganizationId } from 'utils/utils';
// import WithCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { dateTimeRender, yesOrNoRender } from 'utils/renderer';
import formatterCollections from 'utils/intl/formatterCollections';
import C7nPrecisionInputNumber from '@/components/Precision/C7nPrecisionInputNumber';
import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';

import DocFlow from '_components/DocFlow';
import ExpIndex from './components/expIndex';
import { CustModal } from '@/routes/components/C7nCustomModal';
import { c7nModal, ColorRender } from '../util';
import style from '../index.less';
import styles from './components/expIndex.less';
import MutlTextFieldSearch from '@/routes/components/MutlTextFieldSearch';
import { showBigNumber, showSearchParams } from '@/routes/components/utils';

const { Option } = Select;
@formatterCollections({
  code: [
    'sinv.receiptExecution',
    'sinv.receiptWorkbench',
    'hzero.common',
    'entity.company',
    'sinv.common',
  ],
})
export default class ReceiptExecution extends Component {
  constructor(props) {
    super(props);
    const { onRef = (e) => e } = props;
    onRef(this);
    this.state = {};
  }

  // 显示流程框
  setShow = (record) => {
    const { fromOrderTypeName = '-', sourceHeaderNum = '-', sourceLineNum = '-' } = record.get([
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

  getColumns = () => {
    const { nodeFlag, doubleUnitEnabled, history, docManageRemote } = this.props;
    const preColumns = {
      collect: [
        {
          name: 'nodeConfigName',
          width: 100,
        },
      ],
      node: [
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
          width: 170,
          editor: (record) =>
            record.get('itemId') &&
            record.get('firstNodeFlag') === 1 &&
            doubleUnitEnabled === 2 &&
            record.get('upStreamSuFlag') === 0 &&
            record.get('poSourcePlatform') !== 'CATALOGUE' &&
            record.get('poSourcePlatform') !== 'E-COMMERCE',
          // 当前节点是第一个事务节点、上游模块（订单、协议）未开启双单位、物流开启双单位的情况下，该字段可编辑
          renderer: ({ record }) => record.get('secondaryUomName'),
        },
        {
          name: 'uomName',
          width: 100,
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
        doubleUnitEnabled && {
          name: 'secondaryQuantity',
          width: 120,
          editor: (record) =>
            record.get('subjectType') === 'QUANTITY' && (
              <C7nPrecisionInputNumber
                name="secondaryQuantity"
                record={record}
                precision={
                  !isNil(record.get('secondaryUomPrecision'))
                    ? record.get('secondaryUomPrecision')
                    : 10
                }
              />
            ),
          renderer: ({ value }) => showBigNumber(value),
        },
        doubleUnitEnabled && {
          name: 'secondaryLeftQuantity',
          width: 100,
          renderer: ({ value, record }) =>
            record.get('limitlessReceiptFlag') === 1 &&
            record.get('subjectType') === 'QUANTITY' &&
            value === 0
              ? '-'
              : showBigNumber(value),
        },
        {
          name: 'quantity',
          width: 100,
          header: doubleUnitEnabled
            ? intl.get('sinv.receiptExecution.model.receipt.exec.baseQuantity').d('执行基本数量')
            : intl.get('sinv.receiptExecution.model.receipt.exec.quantity').d('执行数量'),
          editor: (record) =>
            record.get('subjectType') === 'QUANTITY' && (
              <C7nPrecisionInputNumber
                name="quantity"
                record={record}
                precision={!isNil(record.get('uomPrecision')) ? record.get('uomPrecision') : 10}
              />
            ),
          renderer: ({ value }) => showBigNumber(value),
        },
        {
          name: 'leftQuantity',
          width: 130,
          renderer: ({ value, record }) =>
            record.get('limitlessReceiptFlag') === 1 &&
            record.get('subjectType') === 'QUANTITY' &&
            value === 0
              ? '-'
              : showBigNumber(value),
          header: doubleUnitEnabled
            ? intl.get('sinv.receiptExecution.model.receipt.baseLeftQuantity').d('可执行基本数量')
            : intl.get('sinv.receiptExecution.model.receipt.leftQuantity').d('可执行数量'),
        },
        {
          name: 'taxIncludedAmount',
          width: 140,
          editor: (record) =>
            record.get('subjectType') === 'AMOUNT' && (
              <C7nPrecisionInputNumber
                name="quantity"
                record={record}
                precision={
                  !isNil(record.get('financialPrecision')) ? record.get('financialPrecision') : 10
                }
              />
            ),
          renderer: ({ value, record }) =>
            record.get('hidePriceFlag') === 1
              ? '***'
              : record.get('limitlessReceiptFlag') === 1 &&
                record.get('subjectType') === 'QUANTITY' &&
                value === 0
              ? '-'
              : showBigNumber(value, record.get('financialPrecision')),
        },
        {
          name: 'leftTaxAmount',
          width: 140,
          renderer: ({ value, record }) =>
            record.get('hidePriceFlag') === 1
              ? '***'
              : record.get('limitlessReceiptFlag') === 1 &&
                record.get('subjectType') === 'QUANTITY' &&
                value === 0
              ? '-'
              : showBigNumber(value, record.get('financialPrecision')),
        },
        {
          name: 'trxDate',
          width: 130,
          editor: true,
        },
        {
          name: 'invOrganizationName',
          width: 120,
        },
        {
          name: 'inventoryId',
          width: 110,
          editor: true,
        },
        {
          name: 'locatorId',
          width: 110,
          editor: true,
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
          width: 100,
        },
        {
          name: 'purchaseAgentName',
          width: 120,
        },
        {
          name: 'creationName',
          width: 120,
        },
        {
          name: 'dueDate',
          width: 100,
          renderer: ({ value }) => dateTimeRender(value),
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
                      from: 'one',
                      viewType: 'flat',
                      isFromTrx: true,
                      nodeConfigIndexAbc: fromNodeConfigIndexAbc,
                      isFromTrx: true,
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
          name: 'fromPcNum',
          width: 150,
          renderer: ({ value, record }) => {
            // const { commonToDetail = e => e } = this.props;
            if (value) {
              return `${value}-${record.get('fromPcSubjectNum')}`;
            }
          },
        },
        {
          name: 'strategyCode',
          width: 150,
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
          name: 'authReceiveUserIdMeaning',
          width: 80,
        },
        {
          name: 'projectTaskId',
          width: 110,
          renderer: ({ record }) => {
            return record.get('projectTaskName');
          },
        },
      ],
    };
    const columns = docManageRemote
      ? docManageRemote.process('SINV_PRLIST_REMOTE_PROCESS_THING_RECEIPT_COLUMNS', preColumns, {
          that: this,
        })
      : preColumns;
    if (nodeFlag) {
      return columns.node;
    } else {
      return columns.collect.concat(columns.node);
    }
  };

  /** ************************************************ 渲染 *********************************************************** */

  render() {
    const {
      selectName,
      waitTableDs,
      customizeTable,
      nodeConfigIndexAbc,
      batchMaintains,
      selectedChange = (e) => e,
      multipleSearch = (e) => e,
      isFromSupplierParams,
    } = this.props;
    const handleQuery = ({ params = {} }) => {
      multipleSearch(params);
    };
    const resetQueryDs = (flag) => {
      // eslint-disable-next-line no-unused-expressions
      waitTableDs.queryDataSet?.current.reset();
      // setResetFlag(true);
      if (flag) {
        waitTableDs.query();
      }
    };
    return (
      <Fragment>
        {customizeTable(
          { code: `SINV.RECEIPT_WORKBENCH_THING.WAIT.${nodeConfigIndexAbc}` },
          <SearchBarTable
            virtual
            virtualCell
            searchBarRef={(ref) => {
              this.searchQueryRef = ref;
            }}
            className={style.searchTable_css}
            // showAllPageSelectionButton
            searchCode="SINV.RECEIPT_WORKBENCH_THING.WAIT_SEARCH"
            dataSet={waitTableDs}
            columns={this.getColumns()}
            pagination={{ pageSizeOptions: ['10', '20', '50', '100', '200', '500', '1000'] }}
            boxSizing="wrapper"
            style={{ maxHeight: `calc(100vh - 245px)` }}
            cacheState
            autoQuery={false}
            // queryFieldsLimit={3}
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
                      placeholder={intl
                        .get('sinv.receiptWorkbench.view.receipt.nodeText')
                        .d('选择节点')}
                      className={style['node-select']}
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
                      name="allSource"
                      dataSet={waitTableDs}
                      placeholder={intl
                        .get(
                          'sinv.receiptWorkbench.view.receipt.searchOrderAndDeliveryAndAgreement'
                        )
                        .d('请输入来源订单、送货单、协议查询')}
                    />
                  </React.Fragment>
                ),
              },
              onQuery: handleQuery,
              onReset: () => resetQueryDs(),
              onClear: () => resetQueryDs(true),
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
                ...showSearchParams(isFromSupplierParams),
              },
            }}
          />
        )}
      </Fragment>
    );
  }
}
