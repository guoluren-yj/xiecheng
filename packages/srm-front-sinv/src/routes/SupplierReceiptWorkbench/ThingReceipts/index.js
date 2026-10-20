import React, { Component, Fragment } from 'react';
import { isNil } from 'lodash';
import intl from 'utils/intl';
import { Select } from 'choerodon-ui/pro';
import ImageList from '@/routes/components/ImageList';
import formatterCollections from 'utils/intl/formatterCollections';
import { dateTimeRender, yesOrNoRender } from 'utils/renderer';
import C7nPrecisionInputNumber from '@/components/Precision/C7nPrecisionInputNumber';
import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';
import { CustModal } from '@/routes/components/C7nCustomModal';
import { colorRender } from '../hook.js';
import MutlTextFieldSearch from '@/routes/components/MutlTextFieldSearch';
import style from '../index.less';
import { showBigNumber } from '@/routes/components/utils/index.js';

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
    this.state = {};
  }

  getColumns = () => {
    const { nodeFlag, doubleUnitEnabled } = this.props;
    const columns = {
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
            record.get('upStreamSuFlag') === 0,
          renderer: ({ record }) => record.get('secondaryUomName'),
        },
        {
          name: 'uomName',
          width: 100,
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
        doubleUnitEnabled && {
          name: 'secondaryQuantity',
          width: 120,
          min: 0,
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
          renderer: ({ value }) => showBigNumber(value),
        },
        {
          name: 'quantity',
          width: 120,
          editor: (record) =>
            record.get('subjectType') === 'QUANTITY' && (
              <C7nPrecisionInputNumber
                name="quantity"
                record={record}
                precision={!isNil(record.get('uomPrecision')) ? record.get('uomPrecision') : 10}
              />
            ),
          renderer: ({ value }) => showBigNumber(value),
          header: doubleUnitEnabled
            ? intl.get('sinv.receiptExecution.model.receipt.exec.baseQuantity').d('执行基本数量')
            : intl.get('sinv.receiptExecution.model.receipt.exec.quantity').d('执行数量'),
        },
        {
          name: 'leftQuantity',
          width: 100,
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
          renderer: colorRender,
        },
        {
          name: 'companyName',
          width: 140,
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
              return <span>{`${value}-${record.get('fromDisplayTrxLineNum')}`}</span>;
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
    if (nodeFlag) {
      return columns.node;
    } else {
      return columns.collect.concat(columns.node);
    }
  };

  render() {
    const {
      selectName,
      waitTableDs,
      customizeTable,
      nodeConfigIndexAbc,
      batchMaintains,
      selectedChange = (e) => e,
      multipleSearch = (e) => e,
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
            // showAllPageSelectionButton
            searchCode="SINV.SUPPLIER_RECEIPT_WORKBENCH_THING.WAIT_SEARCH"
            dataSet={waitTableDs}
            columns={this.getColumns()}
            pagination={{ pageSizeOptions: ['10', '20', '50', '100', '200', '500', '1000'] }}
            boxSizing="wrapper"
            style={{ maxHeight: `calc(100vh - 250px)` }}
            cacheState
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
            }}
          />
        )}
      </Fragment>
    );
  }
}
